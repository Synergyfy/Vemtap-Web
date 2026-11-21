import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  Logger,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AddOn, AddOnType } from '../entities/addon.entity';
import {
  BusinessAddOn,
  BusinessAddOnStatus,
} from '../entities/business-addon.entity';
import { Business } from '../../businesses/entities/business.entity';
import { PaymentsService } from '../../payments/payments.service';
import {
  Payment,
  PaymentPurpose,
  PaymentStatus,
} from '../../payments/entities/payment.entity';
import { CreateAddonDto } from '../dto/addons/create-addon.dto';
import { UpdateAddonDto } from '../dto/addons/update-addon.dto';
import { PurchaseAddonDto } from '../dto/addons/purchase-addon.dto';
import { StartLocationCheckoutDto } from '../dto/addons/location-checkout.dto';
import { SettingsService } from '../../settings/settings.service';
import { BundleDiscountsService } from './bundle-discounts.service';

export interface AddOnCapability {
  name: string;
  type: AddOnType;
  targetCapability?: string;
  additionalLimit: number;
  expiresAt: Date;
  isActive: boolean;
}

export interface AddOnCapabilityMap {
  [capability: string]: number;
}

const CACHE_KEY_ADDONS_PUBLIC = 'addons:public:list';
const CACHE_KEY_ADDONS_ADMIN = 'addons:admin:list';
const CACHE_TTL = 3600000; // 1 hour

@Injectable()
export class AddonsService implements OnModuleInit {
  private readonly logger = new Logger(AddonsService.name);

  constructor(
    @InjectRepository(AddOn)
    private readonly addonRepository: Repository<AddOn>,
    @InjectRepository(BusinessAddOn)
    private readonly businessAddonRepository: Repository<BusinessAddOn>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly paymentsService: PaymentsService,
    private readonly settingsService: SettingsService,
    private readonly bundleDiscountsService: BundleDiscountsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  onModuleInit() {
    // Paystack webhooks for standalone location add-on checkouts are routed here.
    // The handler only acts on its own metadata, so renewal charges with the
    // ADDON purpose are left untouched.
    this.paymentsService.registerPurposeHandler(
      PaymentPurpose.ADDON,
      (payment) => this.completeLocationCheckout(payment).then(() => undefined),
    );
  }

  private async invalidateCache() {
    await this.cacheManager.del(CACHE_KEY_ADDONS_PUBLIC);
    await this.cacheManager.del(CACHE_KEY_ADDONS_ADMIN);
  }

  async create(createAddonDto: CreateAddonDto): Promise<AddOn> {
    if (createAddonDto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    const addon = new AddOn();
    addon.name = createAddonDto.name;
    addon.description = createAddonDto.description ?? '';
    addon.type = createAddonDto.type;
    addon.price = createAddonDto.price;
    addon.durationDays = createAddonDto.durationDays ?? 30;
    addon.currency = createAddonDto.currency ?? 'NGN';
    addon.isActive = createAddonDto.isActive ?? true;
    addon.targetCapability = createAddonDto.targetCapability ?? '';
    addon.additionalLimit = createAddonDto.additionalLimit ?? null;
    addon.serviceDetails = (createAddonDto.serviceDetails as any) ?? null;
    addon.isOneTime = createAddonDto.isOneTime ?? false;
    addon.isRecurring = createAddonDto.isRecurring ?? false;
    addon.imageUrl = createAddonDto.imageUrl ?? '';

    const saved = await this.addonRepository.save(addon);
    await this.invalidateCache();
    return saved;
  }

  async findAll(onlyActive: boolean = false): Promise<AddOn[]> {
    if (onlyActive) {
      const cached = await this.cacheManager.get<AddOn[]>(
        CACHE_KEY_ADDONS_PUBLIC,
      );
      if (cached) return cached;
    }

    const where = onlyActive ? { isActive: true } : {};
    const addons = await this.addonRepository.find({
      where,
      order: { price: 'ASC' },
    });

    if (onlyActive) {
      await this.cacheManager.set(CACHE_KEY_ADDONS_PUBLIC, addons, CACHE_TTL);
    }

    return addons;
  }

  async findAllDiscounts() {
    return this.bundleDiscountsService.getActiveDiscounts();
  }

  async findOne(id: string): Promise<AddOn> {
    const addon = await this.addonRepository.findOne({ where: { id } });
    if (!addon) {
      throw new NotFoundException(`Add-on with ID ${id} not found`);
    }
    return addon;
  }

  async update(id: string, updateAddonDto: UpdateAddonDto): Promise<AddOn> {
    if (updateAddonDto.price !== undefined && updateAddonDto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    const addon = await this.findOne(id);
    Object.assign(addon, updateAddonDto);
    const saved = await this.addonRepository.save(addon);
    await this.invalidateCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const addon = await this.findOne(id);
    addon.isActive = false;
    await this.addonRepository.save(addon);
    await this.invalidateCache();
  }

  async findAllAdmin(): Promise<AddOn[]> {
    const cached = await this.cacheManager.get<AddOn[]>(CACHE_KEY_ADDONS_ADMIN);
    if (cached) return cached;

    const addons = await this.addonRepository.find({
      order: { createdAt: 'DESC' },
    });

    await this.cacheManager.set(CACHE_KEY_ADDONS_ADMIN, addons, CACHE_TTL);
    return addons;
  }

  async getAdminStats(): Promise<{
    totalAddons: number;
    activeAddons: number;
    resourceAddons: number;
    serviceAddons: number;
    totalPurchases: number;
    activePurchases: number;
  }> {
    const allAddons = await this.addonRepository.find();
    const allPurchases = await this.businessAddonRepository.find({
      where: { status: In([BusinessAddOnStatus.ACTIVE]) },
    });

    return {
      totalAddons: allAddons.length,
      activeAddons: allAddons.filter((a) => a.isActive).length,
      resourceAddons: allAddons.filter((a) => a.type === AddOnType.RESOURCE)
        .length,
      serviceAddons: allAddons.filter((a) => a.type === AddOnType.SERVICE)
        .length,
      totalPurchases: await this.businessAddonRepository.count(),
      activePurchases: allPurchases.length,
    };
  }

  async purchaseAddons(
    dto: PurchaseAddonDto,
    businessId: string,
    userId: string,
  ): Promise<BusinessAddOn[]> {
    const { addonIds, quantities, paymentReference, quantity = 1 } = dto;

    if (!addonIds || addonIds.length === 0) {
      throw new BadRequestException('At least one add-on ID is required');
    }

    const addons = await this.addonRepository.findBy({
      id: In(addonIds),
      isActive: true,
    });

    if (addons.length !== addonIds.length) {
      throw new NotFoundException('One or more add-ons not found or inactive');
    }

    if (paymentReference) {
      const paymentData =
        await this.paymentsService.verifyTransaction(paymentReference);
      if (!paymentData || paymentData.status !== 'success') {
        throw new BadRequestException('Payment verification failed');
      }
    }

    const totalQuantity = addons.reduce(
      (sum, _, i) => sum + (quantities?.[i] ?? quantity),
      0,
    );
    const activeDiscounts =
      await this.bundleDiscountsService.getActiveDiscounts();
    let discountPercent = 0;

    if (activeDiscounts.length > 0) {
      const applicableTier = activeDiscounts
        .filter(
          (tier) =>
            totalQuantity >= tier.minQuantity &&
            (!tier.maxQuantity || totalQuantity <= tier.maxQuantity),
        )
        .sort((a, b) => b.discountPercent - a.discountPercent)[0];

      if (applicableTier) {
        discountPercent = applicableTier.discountPercent;
      }
    }

    const results: BusinessAddOn[] = [];
    for (let i = 0; i < addons.length; i++) {
      const addon = addons[i];
      const qty = quantities?.[i] ?? quantity;

      const basePrice = Number(addon.price) * qty;
      const discountAmount = (basePrice * discountPercent) / 100;
      const finalPrice = basePrice - discountAmount;

      const purchasedAt = new Date();
      let expiresAt: Date;
      if (addon.isOneTime) {
        expiresAt = new Date('2099-12-31');
      } else {
        expiresAt = new Date(purchasedAt);
        expiresAt.setDate(expiresAt.getDate() + (addon.durationDays || 30));
      }

      const businessAddon = this.businessAddonRepository.create({
        addonId: addon.id,
        businessId,
        status: BusinessAddOnStatus.ACTIVE,
        purchasedAt,
        expiresAt,
        quantity: qty,
        totalPaid: finalPrice,
        paymentReference,
        metadata: {
          addonType: addon.type,
          targetCapability: addon.targetCapability,
          additionalLimit: addon.additionalLimit,
          appliedDiscountPercent: discountPercent,
        },
      });

      const saved = await this.businessAddonRepository.save(businessAddon);
      results.push(saved);
    }

    if (paymentReference) {
      const totalAmount = results.reduce(
        (sum, b) => sum + Number(b.totalPaid),
        0,
      );
      await this.paymentsService.recordPayment({
        reference: paymentReference,
        amount: totalAmount,
        purpose: PaymentPurpose.ADDON,
        status: PaymentStatus.SUCCESS,
        metadata: {
          addonIds,
          businessAddonIds: results.map((r) => r.id),
          quantities: quantities || [quantity],
        },
        businessId,
        userId,
      });
    }

    return results;
  }

  /**
   * Standalone location checkout. The price, currency, and number of slots per
   * purchase all come from the admin-configured add-on — the client only says
   * how many locations it wants.
   */
  async startLocationCheckout(
    user: { id: string; email?: string | null; businessId?: string | null },
    dto: StartLocationCheckoutDto,
  ) {
    if (!user.businessId) {
      throw new ForbiddenException('Locations are bought by a business account');
    }

    const addon = await this.findOne(dto.addonId);
    if (!addon.isActive || !this.isLocationAddon(addon)) {
      throw new BadRequestException('This location add-on is not available');
    }

    const locationsPerPurchase = Number(addon.additionalLimit) || 0;
    const price = Number(addon.price) || 0;
    if (locationsPerPurchase <= 0 || price <= 0) {
      throw new BadRequestException('This location add-on is not configured');
    }
    if (dto.locations % locationsPerPurchase !== 0) {
      throw new BadRequestException(
        `Choose a multiple of ${locationsPerPurchase} location${locationsPerPurchase === 1 ? '' : 's'}`,
      );
    }

    const rawMax = (addon as any).maxPurchasable ?? (addon as any).metadata?.maxPurchasable;
    const maxPurchasable = Number(rawMax);
    if (Number.isFinite(maxPurchasable) && maxPurchasable > 0) {
      const activeAddons = await this.getActiveBusinessAddons(user.businessId);
      const purchased = activeAddons.reduce(
        (sum, businessAddon) => sum + this.locationSlotsForBusinessAddon(businessAddon),
        0,
      );
      if (purchased + dto.locations > maxPurchasable) {
        throw new BadRequestException(
          `You can buy at most ${Math.max(0, maxPurchasable - purchased)} more locations`,
        );
      }
    }

    const quantity = dto.locations / locationsPerPurchase;
    const amount = price * quantity;
    const reference = `LOC-${randomUUID()}`;
    const metadata = {
      kind: 'location_purchase',
      addonId: addon.id,
      addonName: addon.name,
      quantity,
      locations: dto.locations,
      locationsPerPurchase,
      pricePerPurchase: price,
    };

    const business = await this.businessRepository.findOne({
      where: { id: user.businessId },
      relations: ['owner'],
    });
    const email =
      business?.officialEmail || business?.owner?.email || user.email;
    if (!email) {
      throw new BadRequestException(
        'Business owner email is required to initialize payment',
      );
    }

    await this.paymentsService.recordPayment({
      reference,
      amount,
      purpose: PaymentPurpose.ADDON,
      status: PaymentStatus.PENDING,
      metadata,
      userId: user.id,
      businessId: user.businessId,
    });

    const checkout = await this.paymentsService.initializeTransaction({
      email,
      amount: Math.round(amount * 100),
      reference,
      currency: addon.currency || 'NGN',
      metadata: { ...metadata, purpose: PaymentPurpose.ADDON },
      callbackUrl: dto.callbackUrl,
    });
    if (!checkout) {
      throw new ServiceUnavailableException(
        'Could not start the card payment; try again',
      );
    }

    return {
      reference,
      amount,
      currency: addon.currency || 'NGN',
      locations: dto.locations,
      authorizationUrl: checkout.authorization_url,
      accessCode: checkout.access_code,
    };
  }

  /** Check a Paystack return for a location purchase (safe to repeat). */
  async confirmLocationCheckout(
    businessId: string | null | undefined,
    reference: string,
  ) {
    const payment = await this.paymentsService.findByReference(reference);
    if (
      !payment ||
      !businessId ||
      payment.purpose !== PaymentPurpose.ADDON ||
      payment.businessId !== businessId ||
      (payment.metadata as { kind?: string } | null)?.kind !==
        'location_purchase'
    ) {
      throw new NotFoundException('Location purchase not found');
    }

    const completed = await this.completeLocationCheckout(payment);
    const metadata = (payment.metadata ?? {}) as { locations?: number };
    return {
      reference,
      status: completed ? ('completed' as const) : ('pending' as const),
      locations: metadata.locations ?? 0,
    };
  }

  /**
   * Award a paid location checkout exactly once. The pending -> success flip is
   * the lock shared by the return confirmation and the Paystack webhook.
   */
  async completeLocationCheckout(payment: Payment): Promise<boolean> {
    if (payment.status === PaymentStatus.SUCCESS) return true;

    const metadata = (payment.metadata ?? {}) as {
      kind?: string;
      addonId?: string;
      quantity?: number;
      locations?: number;
      locationsPerPurchase?: number;
      targetCapability?: string;
      additionalLimit?: number;
    };
    if (metadata.kind !== 'location_purchase' || !metadata.addonId) {
      return false;
    }

    const verified = await this.paymentsService.verifyTransaction(
      payment.reference,
    );
    const paidKobo = Number(verified?.amount ?? 0);
    if (
      verified?.status !== 'success' ||
      paidKobo < Math.round(Number(payment.amount) * 100)
    ) {
      return false;
    }

    const won = await this.paymentsService.claimPending(payment.reference);
    if (!won) return true;

    const addon = await this.findOne(metadata.addonId);
    const quantity = Math.max(1, Number(metadata.quantity) || 1);
    const purchasedAt = new Date();
    const expiresAt = addon.isOneTime
      ? new Date('2099-12-31')
      : new Date(purchasedAt.getTime() + (addon.durationDays || 30) * 86_400_000);

    await this.businessAddonRepository.save(
      this.businessAddonRepository.create({
        addonId: addon.id,
        businessId: payment.businessId,
        status: BusinessAddOnStatus.ACTIVE,
        purchasedAt,
        expiresAt,
        quantity,
        totalPaid: Number(payment.amount),
        paymentReference: payment.reference,
        metadata: {
          addonType: addon.type,
          targetCapability: addon.targetCapability,
          additionalLimit: addon.additionalLimit,
          ...metadata,
        },
      }),
    );

    return true;
  }

  private isLocationAddon(addon: AddOn): boolean {
    const value = (addon.targetCapability || '').trim().toLowerCase();
    return (
      addon.type === AddOnType.RESOURCE &&
      (value === 'branches' ||
        value === 'branchlimit' ||
        value === 'locations' ||
        value === 'locationlimit')
    );
  }

  private locationSlotsForBusinessAddon(businessAddon: BusinessAddOn): number {
    const addon = businessAddon.addon;
    if (!addon || !this.isLocationAddon(addon)) return 0;
    const rawLimit = Number(
      businessAddon.metadata?.additionalLimit ?? addon.additionalLimit ?? 0,
    );
    const quantity = Math.max(1, Number(businessAddon.quantity) || 1);
    return Math.max(0, Number.isFinite(rawLimit) ? rawLimit : 0) * quantity;
  }

  async purchasePlanWithAddons(
    addons: AddOn[],
    addonQuantities: number[] | undefined,
    businessId: string,
    userId: string,
    paymentReference: string,
    paymentData: any,
  ): Promise<BusinessAddOn[]> {
    const results: BusinessAddOn[] = [];

    for (let i = 0; i < addons.length; i++) {
      const addon = addons[i];
      const qty = addonQuantities?.[i] ?? 1;
      const purchasedAt = new Date();
      let expiresAt: Date;
      if (addon.isOneTime) {
        expiresAt = new Date('2099-12-31');
      } else {
        expiresAt = new Date(purchasedAt);
        expiresAt.setDate(expiresAt.getDate() + (addon.durationDays || 30));
      }

      const businessAddon = this.businessAddonRepository.create({
        addonId: addon.id,
        businessId,
        status: BusinessAddOnStatus.ACTIVE,
        purchasedAt,
        expiresAt,
        quantity: qty,
        totalPaid: addon.price * qty,
        paymentReference,
        paystackAuthorizationCode:
          paymentData?.authorization?.authorization_code || null,
        metadata: {
          addonType: addon.type,
          bundledWithPlan: true,
          targetCapability: addon.targetCapability,
          additionalLimit: addon.additionalLimit,
        },
      });

      const saved = await this.businessAddonRepository.save(businessAddon);
      results.push(saved);
    }

    return results;
  }

  async getBusinessAddons(businessId: string): Promise<BusinessAddOn[]> {
    return this.businessAddonRepository.find({
      where: { businessId },
      relations: ['addon'],
      order: { purchasedAt: 'DESC' },
    });
  }

  async getActiveBusinessAddons(businessId: string): Promise<BusinessAddOn[]> {
    const now = new Date();
    return this.businessAddonRepository.find({
      where: {
        businessId,
        status: BusinessAddOnStatus.ACTIVE,
        expiresAt: MoreThanOrEqual(now),
      },
      relations: ['addon'],
      order: { purchasedAt: 'DESC' },
    });
  }

  async getAddonCapabilities(businessId: string): Promise<AddOnCapabilityMap> {
    const activeAddons = await this.getActiveBusinessAddons(businessId);

    const map: AddOnCapabilityMap = {};
    for (const ba of activeAddons) {
      const targetCapability =
        ba.metadata?.targetCapability ?? ba.addon.targetCapability;
      const additionalLimit =
        ba.metadata?.additionalLimit ?? ba.addon.additionalLimit ?? 0;

      if (targetCapability) {
        if (ba.addon.type === AddOnType.RESOURCE) {
          const addonLimit = additionalLimit * ba.quantity;
          map[targetCapability] = (map[targetCapability] || 0) + addonLimit;
        } else if (ba.addon.type === AddOnType.SERVICE) {
          // Service add-ons act as boolean toggles (if you have it, you have it)
          map[targetCapability] = (map[targetCapability] || 0) + 1;
        }
      }
    }
    return map;
  }

  async getServiceAddons(businessId: string): Promise<BusinessAddOn[]> {
    const active = await this.getActiveBusinessAddons(businessId);
    return active.filter((ba) => ba.addon.type === AddOnType.SERVICE);
  }

  async cancelAddon(
    businessAddonId: string,
    businessId: string,
  ): Promise<BusinessAddOn> {
    const ba = await this.businessAddonRepository.findOne({
      where: { id: businessAddonId, businessId },
      relations: ['addon'],
    });

    if (!ba) {
      throw new NotFoundException('Purchased add-on not found');
    }

    if (!ba.addon.isRecurring) {
      throw new BadRequestException(
        'Only recurring service add-ons can be canceled',
      );
    }

    ba.status = BusinessAddOnStatus.CANCELED;
    return this.businessAddonRepository.save(ba);
  }

  async validateAddons(addonIds: string[]): Promise<AddOn[]> {
    if (!addonIds || addonIds.length === 0) {
      return [];
    }

    const cleanIds = addonIds.filter(
      (id) => typeof id === 'string' && id.trim().length > 0,
    );

    if (cleanIds.length === 0) {
      return [];
    }

    const addons = await this.addonRepository.findBy({
      id: In(cleanIds),
      isActive: true,
    });

    if (addons.length !== cleanIds.length) {
      throw new BadRequestException(
        'One or more add-ons not found or inactive',
      );
    }

    return addons;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processAddonsExpirationsAndRenewals() {
    this.logger.log('Processing add-on expirations and renewals...');

    const now = new Date();
    const expired = await this.businessAddonRepository.find({
      where: {
        status: BusinessAddOnStatus.ACTIVE,
        expiresAt: LessThanOrEqual(now),
      },
      relations: ['addon', 'business', 'business.owner'],
    });

    this.logger.log(`Found ${expired.length} expired add-ons to process.`);

    for (const ba of expired) {
      if (!ba.addon.isRecurring) {
        ba.status = BusinessAddOnStatus.EXPIRED;
        await this.businessAddonRepository.save(ba);
        continue;
      }

      if (!ba.paystackAuthorizationCode) {
        this.logger.warn(
          `Recurring Add-on ${ba.id} has no auth code. Expiring...`,
        );
        ba.status = BusinessAddOnStatus.EXPIRED;
        await this.businessAddonRepository.save(ba);
        continue;
      }

      const amount = Number(ba.addon.price) * ba.quantity;
      if (amount <= 0) {
        ba.expiresAt = new Date(now);
        ba.expiresAt.setDate(
          ba.expiresAt.getDate() + (ba.addon.durationDays || 30),
        );
        await this.businessAddonRepository.save(ba);
        continue;
      }

      const ownerEmail =
        ba.business?.officialEmail ||
        ba.business?.owner?.email ||
        'billing@latap.com';
      const charge: any = await this.paymentsService.chargeAuthorization(
        amount,
        ownerEmail,
        ba.paystackAuthorizationCode,
      );

      if (charge && charge.status === 'success') {
        this.logger.log(`Successfully renewed add-on ${ba.id}.`);
        await this.paymentsService.recordPayment({
          reference: charge.reference,
          amount: amount,
          purpose: PaymentPurpose.ADDON,
          status: PaymentStatus.SUCCESS,
          metadata: { businessAddonId: ba.id, renewal: true },
          businessId: ba.businessId,
          userId: ba.business?.ownerId,
        });

        ba.expiresAt = new Date(now);
        ba.expiresAt.setDate(
          ba.expiresAt.getDate() + (ba.addon.durationDays || 30),
        );
        await this.businessAddonRepository.save(ba);
      } else {
        this.logger.error(`Failed to renew add-on ${ba.id}. Expiring.`);
        ba.status = BusinessAddOnStatus.EXPIRED;
        await this.businessAddonRepository.save(ba);
      }
    }
  }
}
