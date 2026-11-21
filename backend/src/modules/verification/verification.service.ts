import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { BytidClient } from './bytid/bytid.client';
import type {
  BytidCacCheck,
  BytidDocumentCheck,
  BytidIdentityCheck,
  BytidWebhookEvent,
} from './bytid/bytid.types';
import {
  IdentityDocumentType,
  VerificationCheck,
  VerificationCheckKind,
  VerificationCheckStatus,
} from './entities/verification-check.entity';
import {
  Business,
  BusinessVerificationStatus,
} from '../businesses/entities/business.entity';
import { User } from '../users/entities/user.entity';
import {
  ConfirmBusinessDto,
  ManualReviewDto,
  PreviewBusinessDto,
  UnregisteredBusinessDto,
  VerifyBusinessDto,
  VerifyIdentityDto,
  VerifyRepresentativeDto,
} from './dto/verify.dto';
import {
  businessNameMatches,
  maskIdNumber,
  ownerListedOnCac,
  personNameMatches,
} from './verification-rules';
import { NotificationsService } from '../notifications/notifications.service';
import { PushNotificationService } from '../notifications/push-notification.service';

/** Uploaded evidence must be one of our own hosted files. */
const ALLOWED_DOCUMENT_HOSTS = ['res.cloudinary.com'];
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

/**
 * bytID's sandbox always returns ADAEZE TEST OKAFOR. Since the key decides the
 * environment, the server sends that record's names for the supplied-field
 * comparison; the app never asks for a DOB or a name it would have to guess.
 */
const SANDBOX_PERSON = { firstName: 'Adaeze', lastName: 'Okafor' };

type ComparisonPerson = { firstName: string; lastName: string };

export interface CheckView {
  id: string;
  kind: VerificationCheckKind;
  idType: IdentityDocumentType;
  status: VerificationCheckStatus;
  maskedId: string | null;
  recordName: string | null;
  reasons: string[];
  faceMatch: { status: string; score: number | null } | null;
  /** `test` = sandbox result; the app must never present it as live verification. */
  environment?: 'test' | 'live' | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

/** Minimal, frontend-safe registry fields used only to prefill the CAC form. */
export interface BusinessPreview {
  legalName: string | null;
  registrationNumber: string | null;
  status: string | null;
  registrationDate: string | null;
  companyType: string | null;
  /** Counts only: directors / beneficial owners' personal details are not sent to the app. */
  representativeCount: number;
  ownersPublished: boolean;
}

/**
 * Business verification on bytID: who runs the account (ID + selfie) and the
 * business itself (CAC). Both passing with matching names verifies the
 * business on the spot; anything uncertain waits for a person at VEMTAP.
 */
/** Selfie sessions are referenced per business so status checks stay scoped. */
function livenessPrefix(businessId: string): string {
  return `liv_${businessId.replace(/-/g, '')}_`;
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly bytid: BytidClient,
    @InjectRepository(VerificationCheck)
    private readonly checkRepo: Repository<VerificationCheck>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly moduleRef: ModuleRef,
    private readonly config: ConfigService,
  ) {}

  // ─── selfie ──────────────────────────────────────────────────────────

  async startLiveness(businessId: string, redirectUrl?: string) {
    await this.business(businessId);
    const session = await this.bytid.createLivenessSession(
      `${livenessPrefix(businessId)}${uuidv4().replace(/-/g, '')}`,
      this.livenessRedirect(redirectUrl),
    );
    return {
      sessionId: session.id,
      url: session.url,
      status: session.status,
      expiresAt: session.expires_at ?? null,
    };
  }

  /**
   * bytID only redirects to https. An https URL from the client is used as
   * is; an app link (vemtap://…) goes through our https return page
   * (`GET /verification/liveness/return`), which needs `API_PUBLIC_URL`.
   * Without it there is no redirect: the person closes the page and the app
   * asks for the session status instead.
   */
  private livenessRedirect(requested?: string): string | undefined {
    if (requested?.startsWith('https://')) return requested;
    const base = this.config
      .get<string>('API_PUBLIC_URL')
      ?.trim()
      .replace(/\/+$/, '');
    if (!requested || !base?.startsWith('https://')) return undefined;
    return `${base}/api/v1/verification/liveness/return`;
  }

  /** Whether a selfie session finished and can be used with an ID check. */
  async livenessStatus(businessId: string, sessionId: string) {
    const session = await this.bytid.getLivenessSession(sessionId);
    if (!session.reference?.startsWith(livenessPrefix(businessId))) {
      throw new NotFoundException('Selfie check not found');
    }
    return {
      sessionId: session.id,
      status: session.status,
      usableForFaceMatch: session.usable_for_face_match,
      reasons: session.reasons ?? [],
      expiresAt: session.expires_at ?? null,
    };
  }

  // ─── identity ────────────────────────────────────────────────────────

  /**
   * Names bytID should compare against the registry record. In sandbox the
   * provider always returns its fixed test person, so we supply that person
   * rather than making the account holder fail a synthetic name check. In live
   * mode the submitted name (falling back to the account name) is authoritative.
   */
  private comparisonPerson(
    dto: VerifyIdentityDto,
    user: User,
  ): ComparisonPerson {
    if (this.bytid.sandbox) return { ...SANDBOX_PERSON };
    const firstName = (dto.firstName || user.firstName || '').trim();
    const lastName = (dto.lastName || user.lastName || '').trim();
    if (!firstName || !lastName) {
      throw new BadRequestException(
        'Add your first and last name before verifying your identity',
      );
    }
    return { firstName, lastName };
  }

  /** Restore the names used for this attempt when a webhook completes it. */
  private storedComparison(
    check: VerificationCheck,
    user: User,
  ): ComparisonPerson {
    const saved = (check.nameMatch as { compared?: ComparisonPerson } | null)
      ?.compared;
    if (saved?.firstName && saved?.lastName) return saved;
    return {
      firstName: (user.firstName ?? '').trim(),
      lastName: (user.lastName ?? '').trim(),
    };
  }

  async verifyIdentity(
    businessId: string,
    userId: string,
    dto: VerifyIdentityDto,
  ) {
    const [business, user] = await Promise.all([
      this.business(businessId),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');

    const compared = this.comparisonPerson(dto, user);
    const check = await this.checkRepo.save(
      this.checkRepo.create({
        businessId,
        userId,
        kind: VerificationCheckKind.IDENTITY,
        idType: dto.idType as IdentityDocumentType,
        idNumberMasked: maskIdNumber(dto.idNumber),
        reference: `ver_${uuidv4()}`,
        livenessSessionId: dto.livenessSessionId ?? null,
        documentUrls: dto.documentUrl ? [dto.documentUrl] : null,
        status: VerificationCheckStatus.PENDING,
        // Kept for async/webhook completion without asking the user again.
        nameMatch: {
          submittedName: [compared.firstName, compared.lastName].join(' '),
          compared,
        },
      }),
    );
    await this.markInProgress(business);

    try {
      if (dto.idType === 'passport') {
        const image = await this.fetchDocument(dto.documentUrl!);
        const result = await this.bytid.verifyDocument({
          reference: check.reference,
          front_image: image,
          document_type: 'passport',
          liveness_session_id: dto.livenessSessionId,
        });
        this.applyDocumentResult(check, result, user, compared);
      } else {
        const result = await this.bytid.verifyIdentity(dto.idType, {
          reference: check.reference,
          id_number: dto.idNumber!.replace(/\s+/g, ''),
          first_name: compared.firstName,
          last_name: compared.lastName,
          // BVN is a record lookup; bytID rejects a selfie on this endpoint.
          ...(dto.idType !== 'bvn' && {
            liveness_session_id: dto.livenessSessionId!,
          }),
        });
        this.applyIdentityResult(check, result, user, compared);
      }
    } catch (error) {
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = check.reasons?.length
        ? check.reasons
        : ['provider_error'];
      await this.checkRepo.save(check);
      throw error;
    }

    await this.checkRepo.save(check);
    await this.evaluate(businessId);
    return this.view(check);
  }

  applyIdentityResult(
    check: VerificationCheck,
    result: BytidIdentityCheck,
    user: User,
    compared: ComparisonPerson = this.storedComparison(check, user),
  ) {
    check.providerCheckId = result.id;
    check.environment = result.environment === 'test' ? 'test' : 'live';
    if (result.status === 'not_found') {
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = ['id_not_found'];
      return;
    }
    if (result.status === 'failed') {
      // The registry was unreachable: nothing to judge yet.
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = ['registry_unavailable'];
      throw new ServiceUnavailableException(
        'The ID registry is not responding right now. Please try again shortly.',
      );
    }

    const recordName =
      result.data?.full_name ??
      [
        result.data?.first_name,
        result.data?.middle_name,
        result.data?.last_name,
      ]
        .filter(Boolean)
        .join(' ');
    const nameMatched = personNameMatches(compared, result.data ?? undefined);
    check.nameMatch = {
      recordName: recordName || null,
      accountName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      submittedName: [compared.firstName, compared.lastName].join(' '),
      matched: nameMatched,
      fieldMatches: result.field_matches,
      sandbox: result.environment === 'test',
    };
    check.faceMatch = result.face_match
      ? { status: result.face_match.status, score: result.face_match.score }
      : null;

    const reasons: string[] = [];
    // BVN is a record-only lookup, so a missing face match is expected.
    if (
      check.idType !== IdentityDocumentType.BVN &&
      result.face_match?.status !== 'matched'
    ) {
      reasons.push(
        result.face_match?.status === 'not_matched'
          ? 'face_not_matched'
          : 'face_unavailable',
      );
    }
    if (!nameMatched) reasons.push('name_mismatch');
    // Only judge fields we actually send. Date of birth is no longer collected,
    // so a provider null/false there must not fail an otherwise good check.
    const fieldsWeSend: Array<'first_name' | 'last_name'> = [
      'first_name',
      'last_name',
    ];
    if (
      result.field_matches &&
      fieldsWeSend.some((field) => result.field_matches?.[field] === false)
    ) {
      reasons.push('details_mismatch');
    }
    check.reasons = reasons;
    check.status = reasons.length
      ? VerificationCheckStatus.NEEDS_REVIEW
      : VerificationCheckStatus.VERIFIED;
  }

  applyDocumentResult(
    check: VerificationCheck,
    result: BytidDocumentCheck,
    user: User,
    compared: ComparisonPerson = this.storedComparison(check, user),
  ) {
    check.providerCheckId = result.id;
    check.environment = this.bytid.sandbox ? 'test' : 'live';
    check.idNumberMasked =
      maskIdNumber(result.extracted?.id_number ?? result.id_number) ??
      check.idNumberMasked;
    const nameMatched = personNameMatches(
      compared,
      result.extracted ?? undefined,
    );
    const recordName = [
      result.extracted?.first_name,
      result.extracted?.middle_name,
      result.extracted?.last_name,
    ]
      .filter(Boolean)
      .join(' ');
    check.nameMatch = {
      recordName: recordName || null,
      accountName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      submittedName: [compared.firstName, compared.lastName].join(' '),
      matched: nameMatched,
      sandbox: this.bytid.sandbox,
    };
    const face = result.checks?.face_match;
    if (face && typeof face === 'object') {
      check.faceMatch = {
        status: face.status ?? 'unknown',
        score: face.score ?? null,
      };
    }
    const reasons = [...(result.reasons ?? [])];
    if (!nameMatched) reasons.push('name_mismatch');
    check.reasons = reasons;
    check.status =
      result.status === 'rejected'
        ? VerificationCheckStatus.FAILED
        : result.status === 'verified' && nameMatched
          ? VerificationCheckStatus.VERIFIED
          : VerificationCheckStatus.NEEDS_REVIEW;
  }

  /** Download an uploaded passport photo as base64 for bytID. */
  private async fetchDocument(url: string): Promise<string> {
    const host = new URL(url).hostname;
    if (!ALLOWED_DOCUMENT_HOSTS.includes(host)) {
      throw new BadRequestException(
        'Upload the document with POST /uploads first',
      );
    }
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 20_000,
      maxContentLength: MAX_DOCUMENT_BYTES,
    });
    return Buffer.from(response.data).toString('base64');
  }

  // ─── business ────────────────────────────────────────────────────────

  private cacNumber(value: string): string {
    return value.toUpperCase().replace(/[\s-]+/g, '');
  }

  /** Only the fields the form needs; never directors' personal details. */
  private previewOf(result: BytidCacCheck, fallbackNumber: string): BusinessPreview {
    const people = [
      ...(result.data?.directors ?? []),
      ...(result.data?.beneficial_owners ?? []),
    ];
    return {
      legalName: result.data?.legal_name ?? null,
      registrationNumber:
        result.data?.registration_number ?? result.id_number ?? fallbackNumber,
      status: result.data?.status ?? null,
      registrationDate: result.data?.registration_date ?? null,
      companyType: result.data?.company_type ?? null,
      representativeCount: people.length,
      ownersPublished: people.length > 0,
    };
  }

  /**
   * Registry lookup for autofill only. A successful lookup is NOT verification
   * of the business or of ownership: the returned check stays pending until
   * the owner confirms the details and a separate representative check runs.
   */
  async previewBusiness(
    businessId: string,
    userId: string,
    dto: PreviewBusinessDto,
  ) {
    const business = await this.business(businessId);
    const number = this.cacNumber(dto.registrationNumber);
    const check = await this.checkRepo.save(
      this.checkRepo.create({
        businessId,
        userId,
        kind: VerificationCheckKind.BUSINESS,
        idType: IdentityDocumentType.CAC,
        idNumberMasked: number,
        reference: `ver_${uuidv4()}`,
        status: VerificationCheckStatus.PENDING,
        nameMatch: { preview: true },
      }),
    );

    try {
      const result = await this.bytid.lookupCac({
        reference: check.reference,
        id_number: number,
      });
      check.providerCheckId = result.id;
      check.environment = result.environment === 'test' ? 'test' : 'live';
      const preview = this.previewOf(result, number);
      check.nameMatch = { ...preview, preview: true };
      if (result.status === 'not_found') {
        check.status = VerificationCheckStatus.FAILED;
        check.reasons = ['cac_not_found'];
      } else if (result.status === 'failed') {
        check.status = VerificationCheckStatus.FAILED;
        check.reasons = ['registry_unavailable'];
        throw new ServiceUnavailableException(
          'The CAC registry is not responding right now. Please try again shortly.',
        );
      }
      await this.checkRepo.save(check);
      return { ...this.view(check), preview };
    } catch (error) {
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = check.reasons?.length
        ? check.reasons
        : ['provider_error'];
      await this.checkRepo.save(check);
      throw error;
    }
  }

  /** Confirm autofilled details (or submit without a preview) and check CAC. */
  async verifyBusiness(
    businessId: string,
    userId: string,
    dto: ConfirmBusinessDto,
  ) {
    const business = await this.business(businessId);
    const number = this.cacNumber(dto.registrationNumber);
    let check: VerificationCheck;

    if (dto.previewId) {
      if (dto.confirmed !== true) {
        throw new BadRequestException(
          'Confirm the registry details before using them',
        );
      }
      const preview = await this.checkRepo.findOne({
        where: { id: dto.previewId, businessId },
      });
      if (
        !preview ||
        preview.kind !== VerificationCheckKind.BUSINESS ||
        preview.idType !== IdentityDocumentType.CAC ||
        preview.status !== VerificationCheckStatus.PENDING ||
        !(preview.nameMatch as Record<string, unknown> | null)?.preview ||
        preview.idNumberMasked !== number
      ) {
        throw new BadRequestException('Registry lookup expired. Look it up again.');
      }
      check = preview;
    } else {
      check = await this.checkRepo.save(
        this.checkRepo.create({
          businessId,
          userId,
          kind: VerificationCheckKind.BUSINESS,
          idType: IdentityDocumentType.CAC,
          idNumberMasked: number,
          reference: `ver_${uuidv4()}`,
          status: VerificationCheckStatus.PENDING,
        }),
      );
    }
    await this.markInProgress(business);

    try {
      // Prefer the full check by provider id: the verifications list omits
      // identity/registry data, and reusing the id avoids a second charge.
      let result = check.providerCheckId
        ? await this.bytid
            .getVerification<BytidCacCheck>(check.providerCheckId)
            .catch(() => null)
        : null;
      if (!result?.data) {
        result = await this.bytid.lookupCac({
          reference: check.reference,
          id_number: number,
        });
      }
      this.applyCacResult(check, result, business);
    } catch (error) {
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = check.reasons?.length
        ? check.reasons
        : ['provider_error'];
      await this.checkRepo.save(check);
      throw error;
    }

    await this.checkRepo.save(check);
    await this.evaluate(businessId);
    return this.view(check);
  }

  /**
   * CAC name/status only. Ownership is deliberately decided by
   * `verifyRepresentative`, never by a successful registry lookup.
   */
  applyCacResult(
    check: VerificationCheck,
    result: BytidCacCheck,
    business: Business,
  ) {
    check.providerCheckId = result.id;
    check.environment = result.environment === 'test' ? 'test' : 'live';
    if (result.status === 'not_found') {
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = ['cac_not_found'];
      return;
    }
    if (result.status === 'failed') {
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = ['registry_unavailable'];
      throw new ServiceUnavailableException(
        'The CAC registry is not responding right now. Please try again shortly.',
      );
    }
    const nameMatched = businessNameMatches(
      business.name,
      result.data?.legal_name,
    );
    const active = !result.data?.status || /^active$/i.test(result.data.status);
    check.nameMatch = {
      recordName: result.data?.legal_name ?? null,
      businessName: business.name,
      matched: nameMatched,
      companyStatus: result.data?.status ?? null,
      ...this.previewOf(result, check.idNumberMasked ?? ''),
      preview: false,
    };
    const reasons: string[] = [];
    if (!nameMatched) reasons.push('business_name_mismatch');
    if (!active) reasons.push('company_not_active');
    check.reasons = reasons;
    check.status = reasons.length
      ? VerificationCheckStatus.NEEDS_REVIEW
      : VerificationCheckStatus.VERIFIED;
  }

  /**
   * Ownership is a separate, explicit check: the submitted representative must
   * be a director or beneficial owner on the CAC record. BN records that do not
   * publish people go to a human reviewer; they never pass automatically.
   */
  async verifyRepresentative(
    businessId: string,
    userId: string,
    dto: VerifyRepresentativeDto,
  ) {
    await this.business(businessId);
    const name = dto.representativeName.trim().replace(/\s+/g, ' ');
    const parts = name.split(' ');
    if (parts.length < 2) {
      throw new BadRequestException(
        "Enter the representative's first and last name",
      );
    }

    const cacCheck = dto.previewId
      ? await this.checkRepo.findOne({
          where: { id: dto.previewId, businessId },
        })
      : await this.latest(businessId, VerificationCheckKind.BUSINESS);
    if (
      !cacCheck ||
      cacCheck.idType !== IdentityDocumentType.CAC ||
      !cacCheck.providerCheckId
    ) {
      throw new BadRequestException('Look up the CAC registration first');
    }

    const check = await this.checkRepo.save(
      this.checkRepo.create({
        businessId,
        userId,
        kind: VerificationCheckKind.REPRESENTATIVE,
        idType: IdentityDocumentType.CAC,
        idNumberMasked: cacCheck.idNumberMasked,
        reference: `ver_${uuidv4()}`,
        status: VerificationCheckStatus.PENDING,
        nameMatch: { submittedName: name },
      }),
    );

    try {
      let result = await this.bytid
        .getVerification<BytidCacCheck>(cacCheck.providerCheckId)
        .catch(() => null);
      if (!result?.data) {
        result = await this.bytid.findByReference<BytidCacCheck>(
          cacCheck.reference,
        );
      }
      check.providerCheckId = result.id;
      check.environment = result.environment === 'test' ? 'test' : 'live';
      if (result.status === 'not_found') {
        check.status = VerificationCheckStatus.FAILED;
        check.reasons = ['cac_not_found'];
      } else if (result.status === 'failed') {
        check.status = VerificationCheckStatus.FAILED;
        check.reasons = ['registry_unavailable'];
        throw new ServiceUnavailableException(
          'The CAC registry is not responding right now. Please try again shortly.',
        );
      } else {
        const people = [
          ...(result.data?.directors ?? []),
          ...(result.data?.beneficial_owners ?? []),
        ];
        const matched =
          people.length > 0 &&
          ownerListedOnCac(
            { firstName: parts[0], lastName: parts.slice(1).join(' ') },
            people,
          );
        check.nameMatch = {
          submittedName: name,
          matched,
          recordName: result.data?.legal_name ?? null,
          peopleCount: people.length,
        };
        check.status = matched
          ? VerificationCheckStatus.VERIFIED
          : VerificationCheckStatus.NEEDS_REVIEW;
        check.reasons = matched
          ? []
          : [
              people.length === 0
                ? 'representative_not_listed'
                : 'representative_mismatch',
            ];
      }
    } catch (error) {
      check.status = VerificationCheckStatus.FAILED;
      check.reasons = check.reasons?.length
        ? check.reasons
        : ['provider_error'];
      await this.checkRepo.save(check);
      throw error;
    }

    await this.checkRepo.save(check);
    await this.evaluate(businessId);
    return this.view(check);
  }

  /** A business without CAC registration: always reviewed by a person. */
  async submitUnregistered(
    businessId: string,
    userId: string,
    dto: UnregisteredBusinessDto,
  ) {
    const business = await this.business(businessId);
    for (const url of dto.documentUrls ?? []) {
      if (!ALLOWED_DOCUMENT_HOSTS.includes(new URL(url).hostname)) {
        throw new BadRequestException(
          'Upload documents with POST /uploads first',
        );
      }
    }
    const check = await this.checkRepo.save(
      this.checkRepo.create({
        businessId,
        userId,
        kind: VerificationCheckKind.BUSINESS,
        idType: IdentityDocumentType.UNREGISTERED,
        reference: `ver_${uuidv4()}`,
        status: VerificationCheckStatus.NEEDS_REVIEW,
        reasons: ['unregistered_business'],
        note: dto.note ?? null,
        documentUrls: dto.documentUrls ?? null,
      }),
    );
    await this.markInProgress(business);
    await this.evaluate(businessId);
    return this.view(check);
  }

  /** The owner asks a person to look at a check that did not pass. */
  async requestManualReview(businessId: string, dto: ManualReviewDto) {
    let check = dto.checkId
      ? await this.checkRepo.findOne({ where: { id: dto.checkId, businessId } })
      : null;
    if (!check && !dto.checkId) {
      const [identity, business, representative] = await Promise.all([
        this.latest(businessId, VerificationCheckKind.IDENTITY),
        this.latest(businessId, VerificationCheckKind.BUSINESS),
        this.latest(businessId, VerificationCheckKind.REPRESENTATIVE),
      ]);
      check = [representative, business, identity].find(
        (candidate) =>
          candidate &&
          candidate.status !== VerificationCheckStatus.VERIFIED &&
          candidate.status !== VerificationCheckStatus.NEEDS_REVIEW,
      ) ?? null;
    }
    if (!check) throw new NotFoundException('No verification to review');
    if (check.status === VerificationCheckStatus.VERIFIED) {
      throw new BadRequestException('This check already passed');
    }
    check.status = VerificationCheckStatus.NEEDS_REVIEW;
    check.note = dto.note ?? check.note;
    check.reasons = [
      ...new Set([...(check.reasons ?? []), 'manual_review_requested']),
    ];
    await this.checkRepo.save(check);
    await this.evaluate(businessId);
    return this.view(check);
  }

  // ─── status ──────────────────────────────────────────────────────────

  async status(businessId: string) {
    const business = await this.business(businessId);
    const [identity, businessCheck, representative] = await Promise.all([
      this.latest(businessId, VerificationCheckKind.IDENTITY),
      this.latest(businessId, VerificationCheckKind.BUSINESS),
      this.latest(businessId, VerificationCheckKind.REPRESENTATIVE),
    ]);
    const identityOk = identity?.status === VerificationCheckStatus.VERIFIED;
    const businessOk =
      businessCheck?.status === VerificationCheckStatus.VERIFIED;
    const representativeOk =
      representative?.status === VerificationCheckStatus.VERIFIED;
    const nextStep =
      business.verificationStatus === BusinessVerificationStatus.VERIFIED
        ? 'done'
        : business.verificationStatus ===
            BusinessVerificationStatus.NEEDS_REVIEW
          ? 'review'
          : !identityOk
            ? 'identity'
            : !businessOk || !representativeOk
              ? 'business'
              : 'review';
    return {
      status: business.verificationStatus,
      isVerified: business.isVerified,
      verifiedAt: business.verifiedAt?.toISOString() ?? null,
      nextStep,
      identity: identity ? this.view(identity) : null,
      business: businessCheck ? this.view(businessCheck) : null,
      representative: representative ? this.view(representative) : null,
    };
  }

  /**
   * Recompute the business's verification from its latest checks. Identity
   * and business both passing verifies it; a check waiting for review puts
   * the business in review. An admin decision is not undone by later failed
   * attempts.
   */
  async evaluate(businessId: string): Promise<BusinessVerificationStatus> {
    const business = await this.business(businessId);
    const [identity, businessCheck, representative] = await Promise.all([
      this.latest(businessId, VerificationCheckKind.IDENTITY),
      this.latest(businessId, VerificationCheckKind.BUSINESS),
      this.latest(businessId, VerificationCheckKind.REPRESENTATIVE),
    ]);
    const statuses = [
      identity?.status,
      businessCheck?.status,
      representative?.status,
    ];
    // An unregistered business is never auto-verified; a human decides.
    const ownershipProven =
      businessCheck?.idType === IdentityDocumentType.UNREGISTERED
        ? false
        : representative?.status === VerificationCheckStatus.VERIFIED;

    let next: BusinessVerificationStatus;
    if (
      statuses.every((s) => s === VerificationCheckStatus.VERIFIED) &&
      ownershipProven
    ) {
      next = BusinessVerificationStatus.VERIFIED;
    } else if (
      business.verificationStatus === BusinessVerificationStatus.VERIFIED
    ) {
      return business.verificationStatus;
    } else if (statuses.includes(VerificationCheckStatus.NEEDS_REVIEW)) {
      next = BusinessVerificationStatus.NEEDS_REVIEW;
    } else if (
      business.verificationStatus === BusinessVerificationStatus.REJECTED
    ) {
      // Stays rejected until a new attempt passes or needs review.
      return business.verificationStatus;
    } else {
      next = statuses.some(Boolean)
        ? BusinessVerificationStatus.IN_PROGRESS
        : BusinessVerificationStatus.UNVERIFIED;
    }

    if (next !== business.verificationStatus) {
      const becameVerified = next === BusinessVerificationStatus.VERIFIED;
      await this.businessRepo.update(businessId, {
        verificationStatus: next,
        ...(becameVerified && { isVerified: true, verifiedAt: new Date() }),
      });
      if (becameVerified) {
        await this.notifyOwner(
          business,
          'Your business is verified',
          `${business.name} now shows the verified badge.`,
          'success',
        );
      }
    }
    return next;
  }

  // ─── admin ───────────────────────────────────────────────────────────

  async adminDetail(businessId: string) {
    const business = await this.business(businessId);
    const checks = await this.checkRepo.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return {
      businessId,
      businessName: business.name,
      status: business.verificationStatus,
      isVerified: business.isVerified,
      verifiedAt: business.verifiedAt?.toISOString() ?? null,
      checks: checks.map((check) => ({
        ...this.view(check),
        nameMatch: check.nameMatch,
        documentUrls: check.documentUrls ?? [],
        note: check.note,
        userId: check.userId,
      })),
    };
  }

  async adminDecide(
    businessId: string,
    adminId: string,
    decision: 'approve' | 'reject',
    note?: string,
  ) {
    const business = await this.business(businessId);
    const approve = decision === 'approve';
    const pending = await this.checkRepo.find({
      where: { businessId, status: VerificationCheckStatus.NEEDS_REVIEW },
    });
    for (const check of pending) {
      check.status = approve
        ? VerificationCheckStatus.VERIFIED
        : VerificationCheckStatus.FAILED;
      check.reviewedById = adminId;
      check.reviewedAt = new Date();
      check.reviewNote = note ?? null;
    }
    if (pending.length) await this.checkRepo.save(pending);

    await this.businessRepo.update(businessId, {
      verificationStatus: approve
        ? BusinessVerificationStatus.VERIFIED
        : BusinessVerificationStatus.REJECTED,
      isVerified: approve,
      verifiedAt: approve ? new Date() : null,
    });
    await this.notifyOwner(
      business,
      approve ? 'Your business is verified' : 'Verification needs another look',
      approve
        ? `${business.name} now shows the verified badge.`
        : `We couldn't verify ${business.name}${note ? `: ${note}` : '.'} You can update your details and try again.`,
      approve ? 'success' : 'warning',
    );
    return this.adminDetail(businessId);
  }

  // ─── webhooks ────────────────────────────────────────────────────────

  /**
   * bytID tells us when an asynchronous check finishes. Checks run inline
   * already, so this mainly catches document checks bytID completes later.
   * Applying the same result twice is harmless, which makes retries safe.
   */
  async handleWebhook(event: BytidWebhookEvent): Promise<void> {
    if (
      event.type !== 'document.completed' &&
      event.type !== 'verification.completed'
    )
      return;
    const providerId = event.data?.id;
    const reference = event.data?.reference;
    const check = await this.checkRepo.findOne({
      where: providerId
        ? [
            { providerCheckId: providerId },
            ...(reference ? [{ reference }] : []),
          ]
        : { reference },
    });
    if (!check || check.status !== VerificationCheckStatus.PENDING) return;
    const user = check.userId
      ? await this.userRepo.findOne({ where: { id: check.userId } })
      : null;
    if (!user) return;

    if (event.type === 'document.completed' && providerId) {
      this.applyDocumentResult(
        check,
        await this.bytid.getDocumentCheck(providerId),
        user,
      );
    } else if (check.kind === VerificationCheckKind.IDENTITY) {
      this.applyIdentityResult(
        check,
        await this.bytid.findByReference<BytidIdentityCheck>(check.reference),
        user,
      );
    } else if (check.kind === VerificationCheckKind.BUSINESS) {
      const business = await this.business(check.businessId);
      this.applyCacResult(
        check,
        await this.bytid.findByReference<BytidCacCheck>(check.reference),
        business,
      );
    }
    await this.checkRepo.save(check);
    await this.evaluate(check.businessId);
  }

  // ─── helpers ─────────────────────────────────────────────────────────

  private async business(businessId: string): Promise<Business> {
    if (!businessId) throw new BadRequestException('Business context required');
    const business = await this.businessRepo.findOne({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  private async markInProgress(business: Business) {
    if (
      business.verificationStatus === BusinessVerificationStatus.UNVERIFIED ||
      !business.verificationStatus
    ) {
      await this.businessRepo.update(business.id, {
        verificationStatus: BusinessVerificationStatus.IN_PROGRESS,
      });
      business.verificationStatus = BusinessVerificationStatus.IN_PROGRESS;
    }
  }

  private latest(businessId: string, kind: VerificationCheckKind) {
    return this.checkRepo.findOne({
      where: { businessId, kind },
      order: { createdAt: 'DESC' },
    });
  }

  view(check: VerificationCheck): CheckView {
    return {
      id: check.id,
      kind: check.kind,
      idType: check.idType,
      status: check.status,
      maskedId: check.idNumberMasked,
      recordName:
        (check.nameMatch?.recordName as string | null | undefined) ?? null,
      reasons: check.reasons ?? [],
      faceMatch: check.faceMatch,
      environment:
        check.environment === 'test'
          ? 'test'
          : check.environment === 'live'
            ? 'live'
            : null,
      createdAt: (check.createdAt ?? new Date()).toISOString(),
      reviewedAt: check.reviewedAt?.toISOString() ?? null,
      reviewNote: check.reviewNote,
    };
  }

  private async notifyOwner(
    business: Business,
    title: string,
    message: string,
    type: string,
  ) {
    if (!business.ownerId) return;
    const data = {
      type: 'verification',
      category: 'account',
      url: '/business/verification',
    };
    try {
      await this.moduleRef
        .get(NotificationsService, { strict: false })
        .create(
          business.ownerId,
          title,
          message,
          type,
          '/business/verification',
          data,
        );
      await this.moduleRef
        .get(PushNotificationService, { strict: false })
        .sendNotification(business.ownerId, title, message, data);
    } catch (err) {
      this.logger.warn(
        `Verification notice to ${business.ownerId} failed: ${(err as Error).message}`,
      );
    }
  }
}
