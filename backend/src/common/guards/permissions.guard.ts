import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * A side-menu page permission also satisfies the legacy API permission that
 * protects that page's endpoints. This keeps the old `@Permissions(...)` guards
 * working without forcing the invite screens to grant whole legacy sections.
 */
const PAGE_PERMISSION_ALIASES: Record<string, string[]> = {
  'page:overview': ['dashboard'],
  'page:messages-inapp': ['messages'],
  'page:messages-sms': ['messages'],
  'page:messages-email': ['messages'],
  'page:business-catalog': ['inventory', 'catalogue'],
  'page:business-services': ['inventory', 'catalogue'],
  'page:business-deals': ['marketing', 'inventory', 'discovery'],
  'page:business-customers': ['visitors', 'customer-experience'],
  'page:business-loyalty': ['visitors', 'marketing', 'pos'],
  'page:business-staff': ['staff'],
  'page:business-locations': ['settings'],
  'page:business-profile': ['settings'],
  'page:business-referrals': ['discovery'],
  'page:pos-home': ['pos'],
  'page:pos-sale': ['pos'],
  'page:orders-all': ['pos'],
  'page:orders-bookings': ['engagement', 'pos'],
  'page:pos-transactions': ['pos'],
  'page:pos-settings': ['pos', 'settings'],
  'page:store-ordering-dashboard': ['qrthrive', 'dashboard'],
  'page:store-ordering-qr': ['qrthrive'],
  'page:store-ordering-settings': ['qrthrive', 'settings'],
  'page:cluster-system': ['discovery', 'qrthrive'],
  'page:more-marketing': ['marketing', 'discovery', 'engagement'],
  'page:more-analytics': ['analytics', 'dashboard'],
  'page:more-subscription': ['settings'],
  'page:more-addons': ['settings'],
  'page:more-notifications': ['messages'],
  'page:more-verification': ['settings', 'verification'],
  'page:more-support': ['settings', 'support'],
  'page:more-settings': ['settings'],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Owners and Admins bypass permission checks
    if (
      user.role === UserRole.OWNER ||
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN
    ) {
      return true;
    }

    // Check if user has ANY of the required permissions for this endpoint,
    // either directly or through a granted side-menu page.
    const effectivePermissions = new Set(user.permissions || []);
    (user.permissions || []).forEach((permission) => {
      (PAGE_PERMISSION_ALIASES[permission] || []).forEach((alias) =>
        effectivePermissions.add(alias),
      );
    });
    return requiredPermissions.some((permission) =>
      effectivePermissions.has(permission),
    );
  }
}
