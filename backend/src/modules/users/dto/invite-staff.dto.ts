import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  Matches,
} from 'class-validator';

export enum StaffPermission {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  POS = 'pos',
  VISITORS = 'visitors',
  MESSAGES = 'messages',
  ENGAGEMENT = 'engagement',
  CUSTOMER_EXPERIENCE = 'customer-experience',
  MARKETING = 'marketing',
  DISCOVERY = 'discovery',
  ANALYTICS = 'analytics',
  STAFF = 'staff',
  SETTINGS = 'settings',
  QRTHRIVE = 'qrthrive',
  // Sales (pos) sub-permissions
  POS_SALES_DASHBOARD = 'pos:sales-dashboard',
  POS_HOME = 'pos:pos-home',
  POS_ORDERS = 'pos:orders',
  POS_SETTINGS = 'pos:settings',
  POS_HELP = 'pos:help',
  // Inventory sub-permissions
  INVENTORY_OVERVIEW = 'inventory:overview',
  INVENTORY_CATALOGUE = 'inventory:catalogue',
  INVENTORY_INVENTORY = 'inventory:inventory',
  // Visitors (customers) sub-permissions
  VISITORS_OVERVIEW = 'visitors:overview',
  VISITORS_CUSTOMER_LIST = 'visitors:customer-list',
  VISITORS_LOYALTY = 'visitors:loyalty',
  VISITORS_VISITORS = 'visitors:visitors',
  // Discovery sub-permissions
  DISCOVERY_GET_CUSTOMERS = 'discovery:get-customers',
  DISCOVERY_BUSINESS_PARTNERSHIP = 'discovery:business-partnership',
  // Analytics sub-permissions
  ANALYTICS_OVERVIEW = 'analytics:overview',
  ANALYTICS_AI_REPORTS = 'analytics:ai-reports',
  ANALYTICS_SALES_REPORTS = 'analytics:sales-reports',
  ANALYTICS_INVENTORY_REPORTS = 'analytics:inventory-reports',
  ANALYTICS_CUSTOMERS = 'analytics:customers',
  ANALYTICS_DISCOVERY = 'analytics:discovery',
  ANALYTICS_FOOTFALL = 'analytics:footfall',
  ANALYTICS_MARKETING = 'analytics:marketing',
  ANALYTICS_PEAK_TIMES = 'analytics:peak-times',
  // Settings sub-permissions
  SETTINGS_PROFILE = 'settings:profile',
  SETTINGS_SUBSCRIPTION = 'settings:subscription',
  SETTINGS_SUPPORT = 'settings:support',
  SETTINGS_COMPLIANCE = 'settings:compliance',
  // One permission per business side-menu page. These are what the invite and
  // permission editor write; the legacy values above still grant the same pages.
  PAGE_OVERVIEW = 'page:overview',
  PAGE_MESSAGES_INAPP = 'page:messages-inapp',
  PAGE_MESSAGES_SMS = 'page:messages-sms',
  PAGE_MESSAGES_EMAIL = 'page:messages-email',
  PAGE_BUSINESS_CATALOG = 'page:business-catalog',
  PAGE_BUSINESS_SERVICES = 'page:business-services',
  PAGE_BUSINESS_DEALS = 'page:business-deals',
  PAGE_BUSINESS_CUSTOMERS = 'page:business-customers',
  PAGE_BUSINESS_LOYALTY = 'page:business-loyalty',
  PAGE_BUSINESS_STAFF = 'page:business-staff',
  PAGE_BUSINESS_LOCATIONS = 'page:business-locations',
  PAGE_BUSINESS_PROFILE = 'page:business-profile',
  PAGE_BUSINESS_REFERRALS = 'page:business-referrals',
  PAGE_POS_HOME = 'page:pos-home',
  PAGE_POS_SALE = 'page:pos-sale',
  PAGE_ORDERS_ALL = 'page:orders-all',
  PAGE_ORDERS_BOOKINGS = 'page:orders-bookings',
  PAGE_POS_TRANSACTIONS = 'page:pos-transactions',
  PAGE_POS_SETTINGS = 'page:pos-settings',
  PAGE_STORE_ORDERING_DASHBOARD = 'page:store-ordering-dashboard',
  PAGE_STORE_ORDERING_QR = 'page:store-ordering-qr',
  PAGE_STORE_ORDERING_SETTINGS = 'page:store-ordering-settings',
  PAGE_CLUSTER_SYSTEM = 'page:cluster-system',
  PAGE_MORE_MARKETING = 'page:more-marketing',
  PAGE_MORE_ANALYTICS = 'page:more-analytics',
  PAGE_MORE_SUBSCRIPTION = 'page:more-subscription',
  PAGE_MORE_ADDONS = 'page:more-addons',
  PAGE_MORE_NOTIFICATIONS = 'page:more-notifications',
  PAGE_MORE_VERIFICATION = 'page:more-verification',
  PAGE_MORE_SUPPORT = 'page:more-support',
  PAGE_MORE_SETTINGS = 'page:more-settings',
}

export class InviteStaffDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'staff@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+2348012345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Cashier' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'Sales Associate', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({
    enum: StaffPermission,
    isArray: true,
    example: [StaffPermission.DASHBOARD, StaffPermission.VISITORS],
    required: false,
  })
  @IsArray()
  @IsEnum(StaffPermission, { each: true })
  @IsOptional()
  permissions?: StaffPermission[];

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({
    example: '482913',
    required: false,
    description:
      'Sign-in PIN the owner sets for the new member; emailed to them. A random one is generated when omitted.',
  })
  @Matches(/^\d{6}$/, { message: 'pin must be 6 digits' })
  @IsOptional()
  pin?: string;
}
