import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsDesktop } from './hooks/useIsDesktop';
import { PosSettingsProvider } from './context/PosSettingsContext';
import { PosOfflineProvider, usePosOffline } from './context/PosOfflineContext';
import type { DesktopNavKey } from './components/ui/DesktopChrome';
import type { AccountTarget } from './components/AccountRows';
import { AuthProvider, useAuth } from './context/AuthContext';
import { hasApiConfig } from './lib/api';
import { BusinessBranchProvider, BranchSwitchOverlay } from './context/BusinessBranchContext';
import { CartProvider } from './context/CartContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { LocationProvider } from './context/LocationContext';
import { ClaimsProvider, useClaims, type ClaimRecord } from './context/ClaimsContext';
import { OrdersProvider } from './context/OrdersContext';
import { ClaimSelfConfirmSheet } from './components/sheets/ClaimSelfConfirmSheet';
import { ClaimSelfConfirmModal } from './components/desktop/dialogs/ClaimSelfConfirmModal';
import { ProductDetailScreen } from './scripts/ProductDetailScreen';
import { CheckoutScreen } from './scripts/CheckoutScreen';
import { OrderPlacedScreen } from './scripts/OrderPlacedScreen';
import { ContactsProvider, useContacts } from './context/ContactsContext';
import { CampaignsProvider } from './context/CampaignsContext';
import { AccountDeletionProvider } from './context/AccountDeletionContext';
import type { SubmittedOrder } from './context/OrdersContext';
import { useCart } from './context/CartContext';
import {
  URBAN_BUSINESS,
  SPA_BUSINESS,
  businessPath,
  businessSubPath,
  resolveBusinessPath,
  productPath,
  servicePath,
  type BusinessProfileRef,
} from './scripts/businessData';
import { CustomerInviteJoinScreen } from './scripts/CustomerInviteJoinScreen';
import { findProduct, type CatalogueProduct } from './scripts/catalogueData';
import { findSpaService, type SpaCatalogueService } from './scripts/spaBookingData';
import { ServiceDetailScreen } from './scripts/ServiceDetailScreen';
import { SpaBookingScheduleScreen } from './scripts/SpaBookingScheduleScreen';
import { BookingCheckoutScreen } from './scripts/BookingCheckoutScreen';
import { BookingConfirmedScreen } from './scripts/BookingConfirmedScreen';
import { WelcomeScreen } from './scripts/WelcomeScreen';
import { DiscoverDealsScreen } from './scripts/DiscoverDealsScreen';
import { StartVemtapScreen } from './scripts/StartVemtapScreen';
import { AccountScreen } from './scripts/AccountScreen';
import { SettingsScreen } from './scripts/SettingsScreen';
import { AdminReferralScreen } from './scripts/admin/AdminReferralScreen';
import { SupportLegalScreen } from './scripts/SupportLegalScreen';
import { EditProfileScreen } from './scripts/EditProfileScreen';
import { RewardsScreen } from './scripts/RewardsScreen';
import { SavingsScreen } from './scripts/SavingsScreen';
import { SavedItemsScreen } from './scripts/SavedItemsScreen';
import { CustomerReferralsScreen } from './scripts/CustomerReferralsScreen';
import { BusinessReferralsScreen } from './scripts/BusinessReferralsScreen';
import { OnboardingWelcomeScreen } from './scripts/OnboardingWelcomeScreen';
import { GoogleProfileConfirmScreen, type GoogleConfirmDetails } from './scripts/GoogleProfileConfirmScreen';
import {
  clearProvisionalReferralCode,
  getProvisionalReferralCode,
  normaliseReferralCode,
  readReferralCodeFromUrl,
  setProvisionalReferralCode,
} from './scripts/referralData';
import { ActivityScreen } from './scripts/ActivityScreen';
import { NotificationsScreen } from './scripts/NotificationsScreen';
import { HelpCentreScreen } from './scripts/HelpCentreScreen';
import { AccountSettingsScreen } from './scripts/AccountSettingsScreen';
import { DashboardScreen } from './scripts/DashboardScreen';
import { MyDealsScreen } from './scripts/MyDealsScreen';
import { MessagesScreen } from './scripts/MessagesScreen';
import { ConversationScreen } from './scripts/ConversationScreen';
import { OrdersScreen } from './scripts/OrdersScreen';
import { OrderDetailScreen } from './scripts/OrderDetailScreen';
import { BookingDetailScreen } from './scripts/BookingDetailScreen';
import { AuthCodeScreen } from './scripts/AuthCodeScreen';
import { SignInScreen } from './scripts/SignInScreen';
import { VerifyEmailScreen } from './scripts/VerifyEmailScreen';
import { ProfileSetupScreen } from './scripts/ProfileSetupScreen';
import { LocationPermissionScreen } from './scripts/LocationPermissionScreen';
import { ManualLocationScreen } from './scripts/ManualLocationScreen';
import { ConfirmLocationScreen } from './scripts/ConfirmLocationScreen';
import { DiscoveringScreen } from './scripts/DiscoveringScreen';
import { DesktopWelcomeScreen } from './scripts/desktop/DesktopWelcomeScreen';
import { DesktopDiscoverDealsScreen } from './scripts/desktop/DesktopDiscoverDealsScreen';
import { DesktopStartVemtapScreen } from './scripts/desktop/DesktopStartVemtapScreen';
import { DesktopAuthCodeScreen } from './scripts/desktop/DesktopAuthCodeScreen';
import { DesktopSignInScreen } from './scripts/desktop/DesktopSignInScreen';
import { DesktopVerifyEmailScreen } from './scripts/desktop/DesktopVerifyEmailScreen';
import { DesktopProfileSetupScreen } from './scripts/desktop/DesktopProfileSetupScreen';
import { DesktopLocationPermissionScreen } from './scripts/desktop/DesktopLocationPermissionScreen';
import { DesktopManualLocationScreen } from './scripts/desktop/DesktopManualLocationScreen';
import { DesktopConfirmLocationScreen } from './scripts/desktop/DesktopConfirmLocationScreen';
import { DesktopAccountScreen } from './scripts/desktop/DesktopAccountScreen';
import { DesktopSavedItemsScreen } from './scripts/desktop/DesktopSavedItemsScreen';
import { DesktopCustomerReferralsScreen } from './scripts/desktop/DesktopCustomerReferralsScreen';
import { DesktopBusinessReferralsScreen } from './scripts/desktop/DesktopBusinessReferralsScreen';
import { DesktopOnboardingWelcomeScreen } from './scripts/desktop/DesktopOnboardingWelcomeScreen';
import { DesktopGoogleProfileConfirmScreen } from './scripts/desktop/DesktopGoogleProfileConfirmScreen';
import { DesktopBusinessHubScreen } from './scripts/desktop/DesktopBusinessHubScreen';
import { DesktopBusinessMoreScreen } from './scripts/desktop/DesktopBusinessMoreScreen';
import { DesktopBoostHubScreen } from './scripts/desktop/DesktopBoostHubScreen';
import { DesktopBoostMetricsScreen } from './scripts/desktop/DesktopBoostMetricsScreen';
import { DesktopBoostWalletScreen } from './scripts/desktop/DesktopBoostWalletScreen';
import { DesktopSegmentsHubScreen } from './scripts/desktop/DesktopSegmentsHubScreen';
import { DesktopSegmentActionsScreen } from './scripts/desktop/DesktopSegmentActionsScreen';
import { DesktopSegmentCreateScreen } from './scripts/desktop/DesktopSegmentCreateScreen';
import { DesktopSegmentDetailScreen } from './scripts/desktop/DesktopSegmentDetailScreen';
import { DesktopHowToClaimScreen } from './scripts/desktop/DesktopHowToClaimScreen';
import { DesktopClaimSuccessScreen } from './scripts/desktop/DesktopClaimSuccessScreen';
import { DesktopGiftSentScreen } from './scripts/desktop/DesktopGiftSentScreen';
import { DesktopClaimedDealScreen } from './scripts/desktop/DesktopClaimedDealScreen';
import { DesktopMerchantChatScreen } from './scripts/desktop/DesktopMerchantChatScreen';
import { DesktopDealTermsScreen } from './scripts/desktop/DesktopDealTermsScreen';
import { DesktopStorefrontMenuScreen } from './scripts/desktop/DesktopStorefrontMenuScreen';
import { DesktopCheckoutScreen } from './scripts/desktop/DesktopCheckoutScreen';
import { DesktopOrderPlacedScreen } from './scripts/desktop/DesktopOrderPlacedScreen';
import { ContactBusinessModal } from './components/desktop/dialogs/ContactBusinessModal';
import { ClaimedTermsModal } from './components/desktop/dialogs/ClaimedTermsModal';
import { DesktopSettingsScreen } from './scripts/desktop/DesktopSettingsScreen';
import { DesktopSupportLegalScreen } from './scripts/desktop/DesktopSupportLegalScreen';
import { DesktopEditProfileScreen } from './scripts/desktop/DesktopEditProfileScreen';
import { DesktopPrivacyScreen } from './scripts/desktop/DesktopPrivacyScreen';
import { DesktopAddressesScreen } from './scripts/desktop/DesktopAddressesScreen';
import { DesktopPreferencesScreen } from './scripts/desktop/DesktopPreferencesScreen';
import { DesktopTermsScreen } from './scripts/desktop/DesktopTermsScreen';
import { DesktopRewardsScreen } from './scripts/desktop/DesktopRewardsScreen';
import { DesktopSavingsScreen } from './scripts/desktop/DesktopSavingsScreen';
import { DesktopNotificationsScreen } from './scripts/desktop/DesktopNotificationsScreen';
import { DesktopHelpCentreScreen } from './scripts/desktop/DesktopHelpCentreScreen';
import { DesktopSupportScreen } from './scripts/desktop/DesktopSupportScreen';
import { DesktopActivityScreen } from './scripts/desktop/DesktopActivityScreen';
import { DesktopScanScreen } from './scripts/desktop/DesktopScanScreen';
import { DesktopDiscoveringScreen } from './scripts/desktop/DesktopDiscoveringScreen';
import { SupportScreen } from './scripts/SupportScreen';
import { TermsScreen } from './scripts/TermsScreen';
import { PrivacyScreen } from './scripts/PrivacyScreen';
import { PreferencesScreen } from './scripts/PreferencesScreen';
import { AddressesScreen } from './scripts/AddressesScreen';
import { ScanScreen } from './scripts/ScanScreen';
import { HomeScreen } from './scripts/HomeScreen';
import { DealsScreen } from './scripts/DealsScreen';
import { FeaturedDealsScreen } from './scripts/FeaturedDealsScreen';
import { FiltersScreen } from './scripts/FiltersScreen';
import { DealDetailScreen } from './scripts/DealDetailScreen';
import { HowToClaimScreen } from './scripts/HowToClaimScreen';
import { ClaimSuccessScreen } from './scripts/ClaimSuccessScreen';
import { GiftSentScreen, type GiftRecipientSummary } from './scripts/GiftSentScreen';
import { ClaimedDealScreen } from './scripts/ClaimedDealScreen';
import { MerchantChatScreen } from './scripts/MerchantChatScreen';
import { DealTermsScreen } from './scripts/DealTermsScreen';
import { DiscoverScreen } from './scripts/DiscoverScreen';
import { MerchantDealsScreen } from './scripts/MerchantDealsScreen';
import { ProductsCatalogueScreen } from './scripts/ProductsCatalogueScreen';
import { MenuProductsScreen } from './scripts/MenuProductsScreen';
import { BusinessProfileScreen } from './scripts/BusinessProfileScreen';
import { BusinessAccountChoiceScreen } from './scripts/BusinessAccountChoiceScreen';
import { BusinessOnboardingScreen } from './scripts/BusinessOnboardingScreen';
import { BusinessDealStudioFlow } from './scripts/BusinessDealStudioFlow';
import {
  BusinessSetupNavContext,
  clearBusinessSetupSnapshot,
  getBusinessSetupSnapshot,
  hasBusinessSetupSnapshot,
  setBusinessSetupVerificationState,
  type BusinessSetupNavValue,
} from './scripts/businessSetup';
import { BusinessVerificationScreen } from './scripts/BusinessVerificationScreen';
import { VerificationStatusCenterScreen } from './scripts/VerificationStatusCenterScreen';
import { SubscriptionScreen } from './scripts/SubscriptionScreen';
import { BusinessOrdersScreen } from './scripts/BusinessOrdersScreen';
import { BusinessMessagesScreen } from './scripts/BusinessMessagesScreen';
import { BusinessOverviewScreen } from './scripts/BusinessOverviewScreen';
import { BusinessPosMenuScreen } from './scripts/BusinessPosMenuScreen';
import { BusinessHubScreen } from './scripts/BusinessHubScreen';
import type { HubModuleKey } from './scripts/BusinessHubHomeScreen';
import { BusinessMoreScreen } from './scripts/BusinessMoreScreen';
import { BusinessStaffScreen } from './scripts/BusinessStaffScreen';
import { DesktopStaffDirectoryScreen } from './scripts/desktop/DesktopStaffDirectoryScreen';
import { BusinessInviteStaffScreen } from './scripts/BusinessInviteStaffScreen';
import { DesktopStaffInviteScreen } from './scripts/desktop/DesktopStaffInviteScreen';
import { BusinessLoyaltyScreen } from './scripts/BusinessLoyaltyScreen';
import { BusinessLoyaltyRewardsScreen } from './scripts/BusinessLoyaltyRewardsScreen';
import { BusinessAnalyticsScreen } from './scripts/BusinessAnalyticsScreen';
import { BusinessBranchComparisonScreen } from './scripts/BusinessBranchComparisonScreen';
import { AnalyticsBusinessScreen } from './scripts/AnalyticsBusinessScreen';
import { AnalyticsCustomersScreen } from './scripts/AnalyticsCustomersScreen';
import { AnalyticsDealsScreen } from './scripts/AnalyticsDealsScreen';
import { AnalyticsLocationsScreen } from './scripts/AnalyticsLocationsScreen';
import { AnalyticsPosScreen } from './scripts/AnalyticsPosScreen';
import { AnalyticsExportScreen } from './scripts/AnalyticsExportScreen';
import { AnalyticsFilterScreen } from './scripts/AnalyticsFilterScreen';
import type { AnalyticsTabKey } from './components/AnalyticsChrome';
import { BusinessPosDisplayOrderScreen } from './scripts/BusinessPosDisplayOrderScreen';
import { BusinessPosDisplayTipScreen } from './scripts/BusinessPosDisplayTipScreen';
import { BusinessPosDisplayPayScreen } from './scripts/BusinessPosDisplayPayScreen';
import { BusinessPosDisplayReceiptScreen } from './scripts/BusinessPosDisplayReceiptScreen';
import { BusinessSplitBillScreen } from './scripts/BusinessSplitBillScreen';
import { BusinessPosHomeScreen } from './scripts/BusinessPosHomeScreen';
import { BusinessPosRegisterScreen } from './scripts/BusinessPosRegisterScreen';
import { BusinessPosCartScreen } from './scripts/BusinessPosCartScreen';
import { BusinessPosSwitchScreen } from './scripts/BusinessPosSwitchScreen';
import { BusinessPosCustomerScreen } from './scripts/BusinessPosCustomerScreen';
import { BusinessPosSaleCompleteScreen } from './scripts/BusinessPosSaleCompleteScreen';
import { BusinessPosPaymentScreen } from './scripts/BusinessPosPaymentScreen';
import { BusinessPosProductShiftScreen } from './scripts/BusinessPosProductShiftScreen';
import { BusinessPosStockScreen } from './scripts/BusinessPosStockScreen';
import { BusinessPosLedgerScreen } from './scripts/BusinessPosLedgerScreen';
import { BusinessPosCustomerLookupScreen } from './scripts/BusinessPosCustomerLookupScreen';
import { BusinessPosOrderLookupScreen } from './scripts/BusinessPosOrderLookupScreen';
import { BusinessPosCustomerDossierScreen } from './scripts/BusinessPosCustomerDossierScreen';
import { BusinessPosOfflineCheckoutScreen } from './scripts/BusinessPosOfflineCheckoutScreen';
import { BusinessPosTransactionDetailScreen } from './scripts/BusinessPosTransactionDetailScreen';
import { BusinessPosOfflineBufferScreen } from './scripts/BusinessPosOfflineBufferScreen';
import { BusinessPosKitchenStreamScreen } from './scripts/BusinessPosKitchenStreamScreen';
import { BusinessPosSettingsScreen } from './scripts/BusinessPosSettingsScreen';
import { PublicPosMenuScreen } from './scripts/PublicPosMenuScreen';
import { PublicPosCartReviewScreen } from './scripts/PublicPosCartReviewScreen';
import { PublicPosOrderTrackingScreen } from './scripts/PublicPosOrderTrackingScreen';
import type { PosTabKey } from './components/PosTabBar';
import { type PosCartLine } from './scripts/posCartData';
import { type PublicCartLine } from './scripts/publicPosData';
import type { BusinessTabKey } from './components/BusinessTabBar';
import { BusinessBoostHubScreen } from './scripts/BusinessBoostHubScreen';
import { BusinessBoostMetricsScreen } from './scripts/BusinessBoostMetricsScreen';
import { BusinessBoostWalletScreen } from './scripts/BusinessBoostWalletScreen';
import { BusinessSegmentsHubScreen, type SegmentRef } from './scripts/BusinessSegmentsHubScreen';
import { BusinessSegmentActionsScreen } from './scripts/BusinessSegmentActionsScreen';
import { BusinessSegmentCreateScreen } from './scripts/BusinessSegmentCreateScreen';
import { BusinessSegmentDetailScreen } from './scripts/BusinessSegmentDetailScreen';
import { ConsumerCartScreen } from './scripts/ConsumerCartScreen';
import type { BoostTabKey } from './components/BoostTabBar';
import { ServicesCatalogueScreen } from './scripts/ServicesCatalogueScreen';
import { CommentsSheet } from './components/sheets/CommentsSheet';
import { ReviewsSheet } from './components/sheets/ReviewsSheet';
import { ShareSheet } from './components/sheets/ShareSheet';
import { ClaimAuthSheet } from './components/sheets/ClaimAuthSheet';
import { ClaimConfirmSheet } from './components/sheets/ClaimConfirmSheet';
import { ClaimIdentitySheet } from './components/sheets/ClaimIdentitySheet';
import { ClaimIdentityModal, type ClaimDealSummary } from './components/desktop/dialogs/ClaimIdentityModal';
import { CommentsDrawer } from './components/desktop/dialogs/CommentsDrawer';
import { ClaimAuthModal } from './components/desktop/dialogs/ClaimAuthModal';
import { ClaimConfirmationModal } from './components/desktop/dialogs/ClaimConfirmationModal';
import { ReviewsModal } from './components/desktop/dialogs/ReviewsModal';
import { ShareModal } from './components/desktop/dialogs/ShareModal';
import { GiftRecipientDetailsModal } from './components/desktop/dialogs/GiftRecipientDetailsModal';
import { ConfirmGiftSendModal } from './components/desktop/dialogs/ConfirmGiftSendModal';
import { SomeoneElseModal } from './components/desktop/dialogs/SomeoneElseModal';
import { RecipientVerificationModal } from './components/desktop/dialogs/RecipientVerificationModal';
import { RecipientSummaryModal } from './components/desktop/dialogs/RecipientSummaryModal';
import { RecipientDetailsSheet } from './components/sheets/RecipientDetailsSheet';
import { RecipientVerificationSheet } from './components/sheets/RecipientVerificationSheet';
import { RecipientSummarySheet } from './components/sheets/RecipientSummarySheet';
import { GiftRecipientDetailsSheet } from './components/sheets/GiftRecipientDetailsSheet';
import { ConfirmGiftSendSheet } from './components/sheets/ConfirmGiftSendSheet';
import { ContactBusinessSheet } from './components/sheets/ContactBusinessSheet';
import { ClaimedTermsSheet } from './components/sheets/ClaimedTermsSheet';
import { DesktopHomeScreen } from './scripts/desktop/DesktopHomeScreen';
import { DesktopDealsScreen } from './scripts/desktop/DesktopDealsScreen';
import { DesktopDiscoverScreen } from './scripts/desktop/DesktopDiscoverScreen';
import { DesktopFeaturedDealsScreen } from './scripts/desktop/DesktopFeaturedDealsScreen';
import { DesktopFiltersScreen } from './scripts/desktop/DesktopFiltersScreen';
import { DesktopDealDetailScreen } from './scripts/desktop/DesktopDealDetailScreen';
import { DesktopUrbanGrillStorefrontScreen } from './scripts/desktop/DesktopUrbanGrillStorefrontScreen';
import { DesktopProductDetailScreen } from './scripts/desktop/DesktopProductDetailScreen';
import { DesktopSpaStorefrontScreen } from './scripts/desktop/DesktopSpaStorefrontScreen';
import { DesktopAllProductsScreen } from './scripts/desktop/DesktopAllProductsScreen';
import { DesktopAllServicesScreen } from './scripts/desktop/DesktopAllServicesScreen';
import { DesktopSpaBookingScreen } from './scripts/desktop/DesktopSpaBookingScreen';
import { DesktopDashboardScreen } from './scripts/desktop/DesktopDashboardScreen';
import { DesktopOrdersScreen } from './scripts/desktop/DesktopOrdersScreen';
import { DesktopOrderDetailScreen } from './scripts/desktop/DesktopOrderDetailScreen';
import { DesktopBookingDetailScreen } from './scripts/desktop/DesktopBookingDetailScreen';
import { DesktopMyDealsScreen } from './scripts/desktop/DesktopMyDealsScreen';
import { DesktopMessagesScreen } from './scripts/desktop/DesktopMessagesScreen';
import { DesktopCartScreen } from './scripts/desktop/DesktopCartScreen';
import { DesktopAccountSettingsScreen } from './scripts/desktop/DesktopAccountSettingsScreen';
import { DesktopBusinessAccountChoiceScreen } from './scripts/desktop/DesktopBusinessAccountChoiceScreen';
import { DesktopBusinessOnboardingScreen } from './scripts/desktop/DesktopBusinessOnboardingScreen';
import { DesktopBusinessVerificationScreen } from './scripts/desktop/DesktopBusinessVerificationScreen';
import { DesktopVerificationStatusCenterScreen } from './scripts/desktop/DesktopVerificationStatusCenterScreen';
import { DesktopSubscriptionScreen } from './scripts/desktop/DesktopSubscriptionScreen';
import { DesktopBusinessOrdersScreen } from './scripts/desktop/DesktopBusinessOrdersScreen';
import { DesktopBusinessPosOrdersScreen } from './scripts/desktop/DesktopBusinessPosOrdersScreen';
import { DesktopBusinessMessagesWorkspaceScreen } from './scripts/desktop/DesktopBusinessMessagesWorkspaceScreen';
import { CampaignsChannelScreen } from './scripts/campaigns/CampaignsChannelScreen';
import { DesktopMoreSubscriptionScreen } from './scripts/desktop/DesktopMoreSubscriptionScreen';
import { DesktopMoreAddOnsScreen } from './scripts/desktop/DesktopMoreAddOnsScreen';
import { DesktopBusinessNotificationsScreen } from './scripts/desktop/DesktopBusinessNotificationsScreen';
import { DesktopBusinessHelpSupportScreen } from './scripts/desktop/DesktopBusinessHelpSupportScreen';
import { DesktopBusinessSettingsScreen } from './scripts/desktop/DesktopBusinessSettingsScreen';
import { DesktopDealsWorkspaceScreen } from './scripts/desktop/DesktopDealsWorkspaceScreen';
import { DesktopDealStudioFlow } from './scripts/desktop/DesktopDealStudioFlow';
import { DesktopBusinessProfilePreviewStudioScreen } from './scripts/desktop/DesktopBusinessProfilePreviewStudioScreen';
import { DesktopBusinessOverviewScreen } from './scripts/desktop/DesktopBusinessOverviewScreen';
import { DesktopDealLocationPricingScreen } from './scripts/desktop/DesktopDealLocationPricingScreen';
import { DesktopDealCreateLocationsScreen } from './scripts/desktop/DesktopDealCreateLocationsScreen';
import { DesktopBusinessProfileStorefrontScreen } from './scripts/desktop/DesktopBusinessProfileStorefrontScreen';
import { SIGN_OUT_EVENT, BUSINESS_NAV_EVENT } from './scripts/desktop/PortalShell';
import { MOBILE_ACCOUNT_NAV_EVENT } from './utils/appEvents';
import { DesktopDealAnalyticsScreen } from './scripts/desktop/DesktopDealAnalyticsScreen';
import { DesktopBusinessBranchPricingScreen } from './scripts/desktop/DesktopBusinessBranchPricingScreen';
import { DesktopBusinessCustomersScreen } from './scripts/desktop/DesktopBusinessCustomersScreen';
import { DesktopCustomerProfileScreen } from './scripts/desktop/DesktopCustomerProfileScreen';
import { DesktopLoyaltyProgrammeScreen } from './scripts/desktop/DesktopLoyaltyProgrammeScreen';
import { DesktopLoyaltyRewardsScreen } from './scripts/desktop/DesktopLoyaltyRewardsScreen';
import { DesktopBusinessCatalogHubScreen } from './scripts/desktop/DesktopBusinessCatalogHubScreen';
import { DesktopBusinessLocationsHubScreen } from './scripts/desktop/DesktopBusinessLocationsHubScreen';
import { DesktopBranchDetailScreen } from './scripts/desktop/DesktopBranchDetailScreen';
import { DesktopServicesCategoriesScreen } from './scripts/desktop/DesktopServicesCategoriesScreen';
import { DesktopAnalyticsBusinessScreen } from './scripts/desktop/DesktopAnalyticsBusinessScreen';
import { DesktopAnalyticsDealsScreen } from './scripts/desktop/DesktopAnalyticsDealsScreen';
import { DesktopAnalyticsPosScreen } from './scripts/desktop/DesktopAnalyticsPosScreen';
import { DesktopAnalyticsExportScreen } from './scripts/desktop/DesktopAnalyticsExportScreen';
import { DesktopAnalyticsFilterScreen } from './scripts/desktop/DesktopAnalyticsFilterScreen';
import { DesktopAnalyticsLocationsScreen } from './scripts/desktop/DesktopAnalyticsLocationsScreen';
import { DesktopAnalyticsCustomersScreen } from './scripts/desktop/DesktopAnalyticsCustomersScreen';
import { DesktopPosDisplayOrderScreen } from './scripts/desktop/DesktopPosDisplayOrderScreen';
import { DesktopPosDisplayTipScreen } from './scripts/desktop/DesktopPosDisplayTipScreen';
import { DesktopPosDisplayPayScreen } from './scripts/desktop/DesktopPosDisplayPayScreen';
import { DesktopSplitBillScreen } from './scripts/desktop/DesktopSplitBillScreen';
import { DesktopPosDisplayReceiptScreen } from './scripts/desktop/DesktopPosDisplayReceiptScreen';
import { DesktopPosHomeScreen } from './scripts/desktop/DesktopPosHomeScreen';
import { DesktopPosRegisterScreen } from './scripts/desktop/DesktopPosRegisterScreen';
import { DesktopPosPaymentScreen } from './scripts/desktop/DesktopPosPaymentScreen';
import { DesktopPosSaleCompleteScreen } from './scripts/desktop/DesktopPosSaleCompleteScreen';
import { DesktopPosStockScreen } from './scripts/desktop/DesktopPosStockScreen';
import { DesktopPosLedgerScreen } from './scripts/desktop/DesktopPosLedgerScreen';
import { DesktopPosOfflineSaleScreen } from './scripts/desktop/DesktopPosOfflineSaleScreen';
import { DesktopPosBufferScreen } from './scripts/desktop/DesktopPosBufferScreen';
import { DesktopPosKitchenScreen } from './scripts/desktop/DesktopPosKitchenScreen';
import { DesktopPosCartScreen } from './scripts/desktop/DesktopPosCartScreen';
import { DesktopPosSwitchScreen } from './scripts/desktop/DesktopPosSwitchScreen';
import { DesktopPosCustomerScreen } from './scripts/desktop/DesktopPosCustomerScreen';
import { DesktopPosProductShiftScreen } from './scripts/desktop/DesktopPosProductShiftScreen';
import { DesktopPosCustomerLookupScreen } from './scripts/desktop/DesktopPosCustomerLookupScreen';
import { DesktopPosOrderLookupScreen } from './scripts/desktop/DesktopPosOrderLookupScreen';
import { DesktopPosCustomerDossierScreen } from './scripts/desktop/DesktopPosCustomerDossierScreen';
import { DesktopPosTransactionDetailScreen } from './scripts/desktop/DesktopPosTransactionDetailScreen';
import { DesktopPublicPosCartScreen } from './scripts/desktop/DesktopPublicPosCartScreen';
import { DesktopPublicPosTrackingScreen } from './scripts/desktop/DesktopPublicPosTrackingScreen';
import { DesktopPublicPosMenuScreen } from './scripts/desktop/DesktopPublicPosMenuScreen';
import { DesktopPosGeneralSettingsScreen } from './scripts/desktop/DesktopPosGeneralSettingsScreen';
import type { PosTerminalNavKey } from './scripts/desktop/PosTerminalChrome';
import { type PosTerminalLine } from './scripts/desktop/posTerminalData';
import { type PosCustomerRecord } from './scripts/desktop/posRegisterExtras';
import { StoreOrderingProvider } from './context/StoreOrderingContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { DesktopStoreOrderingDashboard } from './scripts/desktop/DesktopStoreOrderingDashboard';
import { DesktopStoreOrderingQrScreen } from './scripts/desktop/DesktopStoreOrderingQrScreen';
import { DesktopStoreOrderingSettingsScreen } from './scripts/desktop/DesktopStoreOrderingSettingsScreen';
import { StoreOrderingScreen } from './scripts/StoreOrderingScreen';
import { ClusterOnboardingScreen } from './scripts/ClusterOnboardingScreen';
import { DesktopClusterOnboardingScreen } from './scripts/desktop/DesktopClusterOnboardingScreen';
import { ClusterSystemScreen } from './scripts/ClusterSystemScreen';
import { DesktopClusterSystemScreen } from './scripts/desktop/DesktopClusterSystemScreen';
import { ClusterBoostFlow } from './scripts/ClusterBoostFlow';
import { ClusterBoostListScreen } from './scripts/ClusterBoostListScreen';

type Route =
  | 'welcome'
  | 'cluster-onboarding'
  | 'cluster-system'
  | 'cluster-boost'
  | 'cluster-boost-new'
  | 'discover-deals'
  | 'start-vemtap'
  | 'auth-code'
  | 'sign-in'
  | 'verify-email'
  | 'profile-setup'
  | 'location-permission'
  | 'manual-location'
  | 'confirm-location'
  | 'discovering'
  | 'home'
  | 'deals'
  | 'featured-deals'
  | 'filters'
  | 'discover'
  | 'saved'
  | 'referrals'
  | 'business-referrals'
  | 'google-confirm'
  | 'onboarding-welcome'
  | 'account'
  | 'savings'
  | 'notifications'
  | 'privacy'
  | 'addresses'
  | 'preferences'
  | 'help'
  | 'support'
  | 'terms'
  | 'settings'
  | 'support-legal'
  | 'edit-profile'
  | 'rewards'
  | 'scan'
  | 'activity'
  | 'business-onboarding'
  | 'business-verification'
  | 'verification-status'
  | 'subscription'
  | 'subscription-ending'
  | 'subscription-expired'
  | 'business-orders'
  | 'business-bookings'
  | 'business-pos-orders'
  | 'business-messages'
  | 'business-messages-sms'
  | 'business-messages-email'
  | 'business-subscription'
  | 'business-overview'
  | 'business-pos-menu'
  | 'business-hub'
  | 'hub-locations'
  | 'hub-branch-detail'
  | 'hub-catalog'
  | 'hub-services'
  | 'hub-deals'
  | 'hub-customers'
  | 'customer-invite-join'
  | 'hub-profile'
  | 'deal-location-pricing'
  | 'deal-create-locations'
  | 'deal-studio'
  | 'business-profile-studio'
  | 'hub-deal-detail'
  | 'business-branch-pricing'
  | 'hub-loyalty'
  | 'hub-loyalty-rewards'
  | 'hub-staff'
  | 'hub-staff-invite'
  | 'hub-customer-profile'
  | 'analytics-overview'
  | 'analytics-audience'
  | 'analytics-branches'
  | 'analytics-business'
  | 'analytics-customers'
  | 'analytics-deals'
  | 'analytics-locations'
  | 'analytics-pos'
  | 'analytics-export'
  | 'analytics-filter'
  | 'pos-display-order'
  | 'pos-display-tip'
  | 'pos-display-pay'
  | 'pos-display-receipt'
  | 'pos-split-bill'
  | 'pos-home'
  | 'pos-home-offline'
  | 'pos-register'
  | 'pos-cart'
  | 'pos-switch'
  | 'pos-customer'
  | 'pos-sale-complete'
  | 'pos-payment'
  | 'pos-product-shift'
  | 'pos-stock'
  | 'pos-ledger'
  | 'pos-customers-lookup'
  | 'pos-order-lookup'
  | 'pos-dossier'
  | 'pos-offline'
  | 'pos-txn-detail'
  | 'pos-buffer'
  | 'pos-kitchen'
  | 'pos-settings'
  | 'public-pos-menu'
  | 'public-pos-cart'
  | 'public-pos-tracking'
  | 'business-more'
  | 'store-ordering-dashboard'
  | 'store-ordering-qr'
  | 'store-ordering-settings'
  | 'boost'
  | 'boost-hub'
  | 'boost-studio'
  | 'boost-metrics'
  | 'boost-wallet'
  | 'segments-hub'
  | 'segment-actions'
  | 'segment-create'
  | 'segment-detail'
  | 'business-add-ons'
  | 'business-notifications'
  | 'business-support'
  | 'business-settings'
  | 'deal-detail'
  | 'how-to-claim'
  | 'claim-success'
  | 'gift-sent'
  | 'claimed-deal'
  | 'merchant-chat'
  | 'deal-terms'
  | 'storefront'
  | 'storefront-products'
  | 'storefront-menu'
  | 'business-profile'
  | 'spa-profile'
  | 'spa-services'
  | 'product-detail'
  | 'checkout'
  | 'order-placed'
  | 'spa-storefront'
  | 'spa-booking'
  | 'service-detail'
  | 'spa-booking-checkout'
  | 'spa-booking-confirmed'
  | 'dashboard'
  | 'orders'
  | 'conversation'
  | 'order-detail'
  | 'booking-detail'
  | 'my-deals'
  | 'messages'
  | 'cart'
  | 'account-settings'
  | 'comments'
  | 'reviews'
  | 'share'
  | 'claim-auth'
  | 'claim-confirm'
  | 'claim-identity'
  | 'claim-recipient'
  | 'claim-verify'
  | 'claim-summary'
  | 'claim-gift'
  | 'claim-gift-confirm'
  | 'claimed-contact'
  | 'claimed-terms'
  | 'admin-referral';

const ROUTE_PATH: Record<Route, string> = {
  welcome: '/onboarding',
  'discover-deals': '/discover-deals',
  'start-vemtap': '/start-vemtap',
  'auth-code': '/auth-code',
  'sign-in': '/sign-in',
  'verify-email': '/verify-email',
  'profile-setup': '/profile-setup',
  'location-permission': '/location-permission',
  'manual-location': '/manual-location',
  'confirm-location': '/confirm-location',
  discovering: '/discovering',
  home: '/',
  deals: '/deals',
  'featured-deals': '/featured-deals',
  filters: '/filters',
  discover: '/discover',
  saved: '/saved',
  referrals: '/account/referrals',
  'business-referrals': '/business/referrals',
  'google-confirm': '/google-confirm',
  'onboarding-welcome': '/onboarding/welcome',
  account: '/account',
  savings: '/account/savings',
  notifications: '/account/notifications',
  privacy: '/account/privacy',
  addresses: '/account/addresses',
  preferences: '/account/preferences',
  help: '/account/help',
  support: '/account/support',
  terms: '/account/terms',
  settings: '/settings',
  'support-legal': '/support',
  'edit-profile': '/account/edit-profile',
  rewards: '/account/rewards',
  scan: '/scan',
  activity: '/account/activity',
  'business-onboarding': '/business-onboarding',
  'business-verification': '/business-verification',
  'verification-status': '/business-verification/status',
  subscription: '/subscription',
  'subscription-ending': '/subscription/trial-ending',
  'subscription-expired': '/subscription/expired',
  'business-orders': '/business/orders',
  'business-bookings': '/business/orders/bookings',
  'business-pos-orders': '/business/orders/pos',
  'business-messages': '/business/messages',
  'business-messages-sms': '/business/messages/sms',
  'business-messages-email': '/business/messages/email',
  'business-subscription': '/business/subscription',
  'business-overview': '/business/overview',
  'business-pos-menu': '/business/pos/menu',
  'business-hub': '/business/hub',
  'hub-locations': '/business/hub/locations',
  'hub-branch-detail': '/business/hub/locations/branch',
  'hub-catalog': '/business/hub/catalog',
  'hub-services': '/business/hub/catalog/services',
  'hub-deals': '/business/hub/deals',
  'hub-customers': '/business/hub/customers',
  // Dynamic public path (/join/{slug}?invite=…) — placeholder entry; the
  // URL-sync effect never overwrites it (see renderRoute effect).
  'customer-invite-join': '/join',
  'hub-profile': '/business/hub/profile',
  'deal-location-pricing': '/business/deals/location-pricing',
  'deal-create-locations': '/business/deals/create/locations',
  'deal-studio': '/business/deals/create/studio',
  'business-profile-studio': '/business/settings/profile',
  'hub-deal-detail': '/business/hub/deals/detail',
  'business-branch-pricing': '/business/catalog/branch-pricing',
  'hub-loyalty': '/business/hub/loyalty',
  'hub-loyalty-rewards': '/business/hub/loyalty/rewards',
  'hub-staff': '/business/hub/staff',
  'hub-staff-invite': '/business/hub/staff/invite',
  'hub-customer-profile': '/business/hub/customers/profile',
  'analytics-overview': '/analytics/overview',
  'analytics-audience': '/analytics/audience',
  'analytics-branches': '/analytics/branches',
  'analytics-business': '/analytics/business',
  'analytics-customers': '/analytics/customers',
  'analytics-deals': '/analytics/deals',
  'analytics-locations': '/analytics/locations',
  'analytics-pos': '/analytics/pos',
  'analytics-export': '/analytics/export',
  'analytics-filter': '/analytics/filter',
  'pos-display-order': '/pos/display/order',
  'pos-display-tip': '/pos/display/tip',
  'pos-display-pay': '/pos/display/pay',
  'pos-display-receipt': '/pos/display/receipt',
  'pos-split-bill': '/pos/split-bill',
  'pos-home': '/pos/home',
  'pos-home-offline': '/pos/home/offline',
  'pos-register': '/pos/register',
  'pos-cart': '/pos/cart',
  'pos-switch': '/pos/switch',
  'pos-customer': '/pos/customer',
  'pos-sale-complete': '/pos/sale-complete',
  'pos-payment': '/pos/payment',
  'pos-product-shift': '/pos/product/shift',
  'pos-stock': '/pos/stock',
  'pos-ledger': '/pos/ledger',
  'pos-customers-lookup': '/pos/customers',
  'pos-order-lookup': '/pos/orders/lookup',
  'pos-dossier': '/pos/customer/dossier',
  'pos-offline': '/pos/offline',
  'pos-txn-detail': '/pos/txn/detail',
  'pos-buffer': '/pos/buffer',
  'pos-kitchen': '/pos/kitchen',
  'pos-settings': '/pos/settings',
  'public-pos-menu': '/public/pos/menu',
  'public-pos-cart': '/public/pos/cart',
  'public-pos-tracking': '/public/pos/tracking',
  'business-more': '/business/more',
  'cluster-onboarding': '/business/cluster/onboarding',
  'cluster-system': '/business/cluster',
  'cluster-boost': '/business/cluster/boost',
  'cluster-boost-new': '/business/cluster/boost/new',
  'store-ordering-dashboard': '/business/store-ordering',
  'store-ordering-qr': '/business/store-ordering/qr',
  'store-ordering-settings': '/business/store-ordering/settings',
  boost: '/boost',
  'boost-hub': '/boost-hub',
  'boost-studio': '/boost-hub/studio',
  'boost-metrics': '/boost-metrics',
  'boost-wallet': '/boost-wallet',
  'segments-hub': '/segments',
  'segment-actions': '/segments/actions',
  'segment-create': '/segments/create',
  'segment-detail': '/segments/detail',
  'business-add-ons': '/business/add-ons',
  'business-notifications': '/business/notifications',
  'business-support': '/business/support',
  'business-settings': '/business/settings',
  'deal-detail': '/deals/lunch-combo',
  'how-to-claim': '/how-to-claim',
  'claim-success': '/claim/success',
  'gift-sent': '/gift/sent',
  'claimed-deal': '/my/claimed-deal',
  'merchant-chat': '/messages',
  'deal-terms': '/deal-terms',
  storefront: '/discover',
  'storefront-products': '/discover',
  'storefront-menu': '/discover',
  'business-profile': '/discover',
  'spa-profile': '/discover',
  'spa-services': '/discover',
  'service-detail': '/discover',
  'product-detail': '/discover',
  checkout: '/checkout',
  'order-placed': '/orders',
  'spa-storefront': '/discover',
  'spa-booking': '/discover',
  'spa-booking-checkout': '/discover',
  'spa-booking-confirmed': '/discover',
  dashboard: '/dashboard',
  orders: '/orders',
  'order-detail': '/orders/order',
  'booking-detail': '/orders/booking',
  'my-deals': '/my-deals',
  messages: '/messages',
  conversation: '/messages/conversation',
  cart: '/cart',
  'account-settings': '/account/settings',
  comments: '/comments',
  reviews: '/reviews',
  share: '/share',
  'claim-auth': '/claim/sign-in',
  'claim-confirm': '/claim/confirm',
  'claim-identity': '/claim/identity',
  'claim-recipient': '/claim/recipient',
  'claim-verify': '/claim/verify',
  'claim-summary': '/claim/summary',
  'claim-gift': '/claim/gift',
  'claim-gift-confirm': '/claim/gift/confirm',
  'claimed-contact': '/my/claimed-deal/contact',
  'claimed-terms': '/my/claimed-deal/terms',
  // Platform Admin — deliberately absent from every user nav; admins open it
  // directly. Gating is the backend's job once auth exists.
  'admin-referral': '/admin/referral',
};

const PATH_ROUTE = new Map(Object.entries(ROUTE_PATH).map(([key, path]) => [path, key as Route]));

const OVERLAY_ROUTES = new Set<Route>([
  'comments',
  'reviews',
  'share',
  'claim-auth',
  'claim-confirm',
  'claim-identity',
  'claim-recipient',
  'claim-verify',
  'claim-summary',
  'claim-gift',
  'claim-gift-confirm',
  'claimed-contact',
  'claimed-terms',
]);

const CLAIM_STEP_ROUTES = new Set<Route>([
  'claim-confirm',
  'claim-identity',
  'claim-recipient',
  'claim-verify',
  'claim-summary',
  'claim-gift',
  'claim-gift-confirm',
]);

const AUTH_ROUTES = new Set<Route>([
  'account',
  'savings',
  'notifications',
  'privacy',
  'addresses',
  'preferences',
  'help',
  'support',
  'terms',
  'settings',
  'support-legal',
  'edit-profile',
  'rewards',
  'account-settings',
  'scan',
  'activity',
  'dashboard',
  'orders',
  'order-detail',
  'booking-detail',
  'my-deals',
  'messages',
  'conversation',
  'claimed-deal',
  'claim-success',
  'gift-sent',
  'merchant-chat',
  'claimed-contact',
  'claimed-terms',
  'referrals',
  'business-referrals',
  ...CLAIM_STEP_ROUTES,
]);

const DESKTOP_ONLY_ROUTES = new Set<Route>([
  'spa-storefront',
]);

const ONBOARDED_KEY = 'vemtap_onboarded';

const hasOnboarded = () => window.localStorage.getItem(ONBOARDED_KEY) === '1';

function guardRoute(found: Route, authed: boolean, isDesktop: boolean): Route {
  if (DESKTOP_ONLY_ROUTES.has(found) && !isDesktop) return authed ? 'home' : 'welcome';
  if (authed) return found;
  if (CLAIM_STEP_ROUTES.has(found)) return 'claim-auth';
  if (AUTH_ROUTES.has(found)) return 'welcome';
  return found;
}

function businessSectionRoute(section: string, venue: 'urban' | 'spa', serviceSlug?: string): Route {
  switch (section) {
    case 'deals':
      return 'storefront';
    case 'products':
      return 'product-detail';
    case 'checkout':
      return 'checkout';
    case 'order-placed':
      return 'order-placed';
    case 'menu':
      return 'storefront-menu';
    case 'services':
      return serviceSlug ? 'service-detail' : 'spa-services';
    case 'shop':
      return 'spa-storefront';
    case 'booking':
      return 'spa-booking';
    case 'booking/checkout':
      return 'spa-booking-checkout';
    case 'booking/confirmed':
      return 'spa-booking-confirmed';
    default:
      return venue === 'spa' ? 'spa-profile' : 'business-profile';
  }
}

function entryRoute(path: string, authed: boolean, isDesktop: boolean): Route {
  // Public customer invite page — reachable signed-out via /join/{business-slug}.
  if (path.startsWith('/join/')) return 'customer-invite-join';
  const direct = PATH_ROUTE.get(path);
  if (direct && direct !== 'welcome' && direct !== 'home') {
    return guardRoute(direct, authed, isDesktop);
  }
  const businessPathMatch = resolveBusinessPath(path);
  if (businessPathMatch) {
    return guardRoute(
      businessSectionRoute(businessPathMatch.section, businessPathMatch.business.venue, businessPathMatch.serviceSlug),
      authed,
      isDesktop,
    );
  }
  return (authed || hasOnboarded()) ? 'home' : 'welcome';
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <LocationProvider>
          <ClaimsProvider>
            <OrdersProvider>
              <ContactsProvider>
              <CampaignsProvider>
              <BusinessBranchProvider>
                <CartProvider>
                  <BookingProvider>
                    <AccountDeletionProvider>
                      <PosSettingsProvider>
                        <PosOfflineProvider>
                          <AppInner />
                          <BranchSwitchOverlay />
                        </PosOfflineProvider>
                      </PosSettingsProvider>
                    </AccountDeletionProvider>
                  </BookingProvider>
                </CartProvider>
              </BusinessBranchProvider>
              </CampaignsProvider>
              </ContactsProvider>
            </OrdersProvider>
          </ClaimsProvider>
        </LocationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

function AppInner() {
  const { authed, claimed, signIn, signOut, markClaimed, resetClaim } = useAuth();
  const cart = useCart();
  const booking = useBooking();
  const profile = useProfile();
  const claims = useClaims();
  const contacts = useContacts();
  const isDesktop = useIsDesktop();
  const [route, setRouteState] = useState<Route>(() => entryRoute(window.location.pathname, authed, isDesktop));
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfileRef | null>(() => {
    const match = resolveBusinessPath(window.location.pathname);
    return match?.business ?? null;
  });
  const [confirmFrom, setConfirmFrom] = useState<'location-permission' | 'manual-location'>('location-permission');
  const [authFrom, setAuthFrom] = useState<Route>('start-vemtap');
  const [feedFrom, setFeedFrom] = useState<Route>('home');
  /**
   * Referral code captured from a referral URL (e.g. `?ref=CODE`) at mount,
   * seeded into the provisional store below so `pushState` navigation can't
   * lose it and onboarding can prefill from it. It is a provisional hint only —
   * nothing verifies it against a server, and it is never persisted.
   */
  /** Whether onboarding finished, so the welcome screen knows which audience. */
  const [welcomeAudience, setWelcomeAudience] = useState<'customer' | 'business'>('customer');
  /** Business-setup progress captured at the moment onboarding completed. */
  const [welcomeBusiness, setWelcomeBusiness] = useState<{
    profileCompleted: boolean;
    offeringsCompleted: boolean;
    verificationState: 'not-started' | 'in-progress' | 'complete';
  } | null>(null);
  const [dealFrom, setDealFrom] = useState<Route>('home');
  const [selectedDeal, setSelectedDeal] = useState<ClaimDealSummary | null>(null);
  const [bizFrom, setBizFrom] = useState<Route>('discover');
  const [profileFrom, setProfileFrom] = useState<Route>('discover');
  const [catalogueFrom, setCatalogueFrom] = useState<Route>('storefront');
  const [detailFrom, setDetailFrom] = useState<Route>('storefront-products');
  const [detailProduct, setDetailProduct] = useState<CatalogueProduct | null>(() => {
    const match = resolveBusinessPath(window.location.pathname);
    return (match?.productId ? findProduct(match.productId) : undefined) ?? null;
  });
  const [detailService, setDetailService] = useState<SpaCatalogueService | null>(() => {
    const match = resolveBusinessPath(window.location.pathname);
    return (match?.serviceSlug ? findSpaService(match.serviceSlug) : undefined) ?? null;
  });
  const [serviceFrom, setServiceFrom] = useState<Route>('spa-services');
  const [bookingFrom, setBookingFrom] = useState<Route>('spa-profile');
  const [orderSummary, setOrderSummary] = useState<SubmittedOrder | null>(null);
  const [businessSetupSkipIntro, setBusinessSetupSkipIntro] = useState(false);
  const [businessOnboardingFrom, setBusinessOnboardingFrom] = useState<Route>('dashboard');
  const [activeOrderRef, setActiveOrderRef] = useState<string | undefined>(undefined);
  const [chatFrom, setChatFrom] = useState<Route>('claimed-deal');
  const [termsFrom, setTermsFrom] = useState<Route>('deal-detail');
  const [claimedFrom, setClaimedFrom] = useState<Route>('claim-success');
  const [activeConversation, setActiveConversation] = useState('urban');
  const [giftRecipient, setGiftRecipient] = useState<GiftRecipientSummary | null>(null);
  const [claimRecipient, setClaimRecipient] = useState<GiftRecipientSummary | null>(null);
  const [activeClaim, setActiveClaim] = useState<ClaimRecord | null>(null);
  const [claimSelfConfirmOpen, setClaimSelfConfirmOpen] = useState(false);
  const [posCart, setPosCart] = useState<PosCartLine[]>([]);
  const [posTermCart, setPosTermCart] = useState<PosTerminalLine[]>([]);
  const [posCustomer, setPosCustomer] = useState<string | null>(null);
  const [posCustomerRecord, setPosCustomerRecord] = useState<PosCustomerRecord | null>(null);
  /** Loyalty points earned by the sale currently shown on the receipt screen. */
  const [posSalePoints, setPosSalePoints] = useState(0);
  /** Points manually awarded to the mobile-flow customer during the sale. */
  const [posCustomerBonus, setPosCustomerBonus] = useState(0);
  const [posDossierCustomer, setPosDossierCustomer] = useState('Michael James');
  const [publicCart, setPublicCart] = useState<PublicCartLine[]>([]);
  const [posActiveNav, setPosActiveNav] = useState('pos-transactions');

  /**
   * Sales completed while the till is offline are parked locally so the cashier
   * keeps trading; the queue pushes them the moment connectivity returns (or
   * when "Sync Online" is tapped on the register).
   */
  const { isOnline, enqueue } = usePosOffline();
  const queuePosSaleIfOffline = useCallback(
    (lines: Array<{ name: string; qty: number; unit: number }>, tender: string) => {
      if (isOnline) return;
      const total = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
      enqueue({
        ref: `POS-${10840 + Math.floor(Math.random() * 60)}`,
        total,
        tender,
        items: lines.map((line) => `${line.qty}× ${line.name}`).join(', ') || 'No items',
      });
    },
    [enqueue, isOnline],
  );

  const posTab = (key: PosTabKey) => {
    switch (key) {
      case 'register':
        setRoute('pos-register');
        break;
      case 'orders':
        setRoute('business-pos-orders');
        break;
      case 'customers':
        setRoute('pos-customers-lookup');
        break;
      case 'products':
        setRoute('pos-stock');
        break;
      case 'ledger':
        setRoute('pos-ledger');
        break;
      case 'drawer':
        setRoute('pos-home');
        break;
      case 'more':
        setRoute('business-more');
        break;
    }
  };

  const posTerminalNav = (key: PosTerminalNavKey) => {
    switch (key) {
      case 'home':
        setRoute('pos-home');
        break;
      case 'register':
        setRoute('pos-register');
        break;
      case 'orders':
        setRoute('pos-order-lookup');
        break;
      case 'bookings':
        // Bookings have their own page — never the order lookup.
        setRoute('business-bookings');
        break;
      case 'products':
        setRoute('pos-stock');
        break;
      case 'ledger':
        setRoute('pos-ledger');
        break;
      case 'hardware-and-sync':
        // /pos/sync was removed — offline state + "Sync Online" live on the
        // register now, so this nav lands on the till.
        setRoute('pos-register');
        break;
      case 'settings':
        setRoute('pos-settings');
        break;
    }
  };

  const resolveRoutePath = useCallback((target: Route) => {
    const activeUrbanBusiness = selectedBusiness && selectedBusiness.venue === 'urban' ? selectedBusiness : URBAN_BUSINESS;
    const activeSpaBusiness = selectedBusiness && selectedBusiness.venue === 'spa' ? selectedBusiness : SPA_BUSINESS;

    switch (target) {
      case 'storefront':
        return selectedBusiness ? businessSubPath(selectedBusiness, 'deals') : '/discover';
      case 'storefront-products':
        return selectedBusiness ? businessSubPath(selectedBusiness, 'products') : '/discover';
      case 'storefront-menu':
        return selectedBusiness ? businessSubPath(selectedBusiness, 'menu') : '/discover';
      case 'business-profile':
        return selectedBusiness ? businessPath(selectedBusiness) : '/discover';
      case 'checkout':
        return selectedBusiness ? businessSubPath(selectedBusiness, 'checkout') : '/checkout';
      case 'order-placed':
        return selectedBusiness ? businessSubPath(selectedBusiness, 'order-placed') : '/orders';
      case 'spa-profile':
        return selectedBusiness ? businessPath(selectedBusiness) : '/discover';
      case 'spa-storefront':
        return selectedBusiness ? businessSubPath(selectedBusiness, 'shop') : '/discover';
      case 'spa-services':
        return selectedBusiness ? businessSubPath(selectedBusiness, 'services') : '/discover';
      case 'service-detail':
        return detailService ? servicePath(activeSpaBusiness.slug, detailService.slug) : ROUTE_PATH['service-detail'];
      case 'product-detail':
        return detailProduct ? productPath(activeUrbanBusiness.slug, detailProduct.id) : ROUTE_PATH['product-detail'];
      default:
        return ROUTE_PATH[target];
    }
  }, [detailProduct, detailService, selectedBusiness]);

  const setRoute = (target: Route) => {
    if (target === route) return;
    const targetPath = resolveRoutePath(target);
    if (window.location.pathname !== targetPath) window.history.pushState(null, '', targetPath);
    setRouteState(target);
  };

  const openProduct = (id: string, display?: Partial<CatalogueProduct>, from?: Route) => {
    const base = findProduct(id);
    if (!base) return;
    setDetailProduct({ ...base, ...display, id: base.id });
    if (from) setDetailFrom(from);
    const businessRef = selectedBusiness && selectedBusiness.venue === 'urban' ? selectedBusiness : URBAN_BUSINESS;
    const target = productPath(businessRef.slug, base.id);
    if (window.location.pathname !== target) window.history.pushState(null, '', target);
    setRouteState('product-detail');
  };

  const startCheckout = () => {
    if (cart.count === 0) return;
    setRoute('checkout');
  };

  const openService = (key: string, from?: Route) => {
    const base = findSpaService(key);
    if (!base) return;
    setDetailService(base);
    if (from) setServiceFrom(from);
    const businessRef = selectedBusiness && selectedBusiness.venue === 'spa' ? selectedBusiness : SPA_BUSINESS;
    const target = servicePath(businessRef.slug, base.slug);
    if (window.location.pathname !== target) window.history.pushState(null, '', target);
    setRouteState('service-detail');
  };

  const placeOrder = (order: SubmittedOrder) => {
    // BUG-017: a completed purchase becomes a business contact record
    // (idempotent on phone, marketing consent stored separately).
    contacts.upsertFromOrder(order);
    setOrderSummary(order);
    cart.clear();
    setRoute('order-placed');
  };

  useEffect(() => {
    // The shared portal account menu clears the session, then asks the router
    // to move to the sign-in screen.
    const handleSignOut = () => setRouteState('sign-in');
    window.addEventListener(SIGN_OUT_EVENT, handleSignOut);
    return () => window.removeEventListener(SIGN_OUT_EVENT, handleSignOut);
  }, []);

  useEffect(() => {
    const expected =
      route === 'customer-invite-join'
        ? null // dynamic /join/{slug}?invite=… path — never overwritten
        : resolveRoutePath(route);
    if (expected && window.location.pathname !== expected) {
      window.history.replaceState(null, '', expected);
    }

    const pathMatch = resolveBusinessPath(window.location.pathname);
    if (pathMatch && (!selectedBusiness || selectedBusiness.slug !== pathMatch.business.slug)) {
      setSelectedBusiness(pathMatch.business);
    }

    const onPopState = () => {
      const path = window.location.pathname;
      setRouteState(entryRoute(path, authed, isDesktop));
      const match = resolveBusinessPath(path);
      if (match) {
        setSelectedBusiness((prev) => (prev && prev.slug === match.business.slug ? prev : match.business));
      }
      if (match?.section === 'products') {
        const base = findProduct(match.productId);
        if (base) setDetailProduct((prev) => (prev && prev.id === base.id ? prev : base));
      }
      if (match?.section === 'services' && match.serviceSlug) {
        const base = findSpaService(match.serviceSlug);
        if (base) setDetailService((prev) => (prev && prev.id === base.id ? prev : base));
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [authed, isDesktop, route, detailProduct, detailService, resolveRoutePath, selectedBusiness]);

  useEffect(() => {
    if (route !== 'product-detail' || detailProduct) return;
    const match = resolveBusinessPath(window.location.pathname);
    const base = match?.productId ? findProduct(match.productId) : undefined;
    if (base) setDetailProduct(base);
    else setRouteState('storefront-products');
  }, [route, detailProduct]);

  /**
   * Capture a referral code from the URL once, before the path-sync effect
   * above replaces the URL (and drops the query string). This is a provisional
   * hint for onboarding only — it is never persisted and never treated as
   * secured attribution.
   */
  useEffect(() => {
    const fromUrl = normaliseReferralCode(readReferralCodeFromUrl());
    if (fromUrl && !getProvisionalReferralCode()) {
      setProvisionalReferralCode(fromUrl, 'url');
    }
  }, []);

  useEffect(() => {
    if (route !== 'service-detail' || detailService) return;
    const match = resolveBusinessPath(window.location.pathname);
    const base = match?.serviceSlug ? findSpaService(match.serviceSlug) : undefined;
    if (base) setDetailService(base);
    else setRouteState('spa-services');
  }, [route, detailService]);

  useEffect(() => {
    if (route === 'spa-booking-confirmed' && !booking.confirmedRef) setRouteState('spa-booking');
  }, [route, booking.confirmedRef]);

  useEffect(() => {
    if (route === 'order-placed' && !orderSummary) setRouteState('home');
  }, [route, orderSummary]);

  useEffect(() => {
    if (OVERLAY_ROUTES.has(route)) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [route]);

  const openDeal = (from: Route, deal?: ClaimDealSummary | null) => {
    setDealFrom(from);
    setSelectedDeal(deal ?? null);
    setRoute('deal-detail');
  };

  const startClaim = (from: Route) => {
    if (claimed) {
      setClaimedFrom(from);
      setRoute('claimed-deal');
      return;
    }
    setRoute(authed ? 'claim-confirm' : 'claim-auth');
  };

  const completeClaim = () => {
    const record = claims.recordClaim({
      kind: claimRecipient ? 'someone-else' : 'self',
      sender: { name: profile.fullName, email: profile.email, phone: profile.phone },
      recipient: claimRecipient ?? undefined,
    });
    setActiveClaim(record);
    setClaimRecipient(null);
    markClaimed();
    setRoute('claim-success');
  };

  const completeGift = () => {
    const record = claims.recordClaim({
      kind: 'gift',
      sender: { name: profile.fullName, email: profile.email, phone: profile.phone },
      recipient: giftRecipient
        ? { name: giftRecipient.name, email: giftRecipient.email, phone: giftRecipient.phone }
        : undefined,
    });
    setActiveClaim(record);
    markClaimed();
    setRoute('gift-sent');
  };

  /**
   * BUG-006/008/009 — the desktop deal-detail screen records its own claim and
   * hands the record here so the customer lands on a real outcome screen
   * (claim success / gift sent) instead of a transient toast.
   */
  const handleClaimComplete = (record: ClaimRecord) => {
    setActiveClaim(record);
    markClaimed();
    if (record.kind === 'gift') {
      if (record.recipient) {
        setGiftRecipient({
          name: record.recipient.name,
          email: record.recipient.email,
          phone: record.recipient.phone,
        });
      }
      setRoute('gift-sent');
      return;
    }
    setClaimRecipient(null);
    setRoute('claim-success');
  };

  /** BUG-005/BUG-006/BUG-009 — "Claim for myself" only completes after the identity confirmation step. */
  const confirmSelfClaim = () => {
    setClaimSelfConfirmOpen(false);
    const onClaimed = claimSuccessRef.current;
    claimSuccessRef.current = null;
    onClaimed?.();
    const record = claims.recordClaim({
      kind: 'self',
      sender: { name: profile.fullName, email: profile.email, phone: profile.phone },
    });
    setActiveClaim(record);
    if (claimed) {
      setClaimedFrom(route);
      setRoute('claimed-deal');
      return;
    }
    markClaimed();
    setRoute('claim-success');
  };

  const [claimPopupOpen, setClaimPopupOpen] = useState(false);
  const [claimDialog, setClaimDialog] = useState<'gift' | 'giftConfirm' | 'other' | 'verify' | 'summary' | null>(null);
  const claimSuccessRef = useRef<(() => void) | null>(null);

  const openClaimPopup = (dealOrCallback?: ClaimDealSummary | ((() => void) | null), onClaimed?: () => void) => {
    const deal = typeof dealOrCallback === 'function' || dealOrCallback == null ? null : dealOrCallback;
    const callback = typeof dealOrCallback === 'function' ? dealOrCallback : onClaimed ?? null;

    if (deal) {
      setSelectedDeal(deal);
    }

    claimSuccessRef.current = callback;
    setClaimPopupOpen(true);
  };

  const closeClaimPopup = () => {
    claimSuccessRef.current = null;
    setClaimPopupOpen(false);
  };

  const finishClaimChoice = (choice: 'self' | 'gift' | 'other') => {
    setClaimPopupOpen(false);
    if (choice === 'self') {
      // BUG-005: never submit the claim before the customer confirms their identity.
      setClaimSelfConfirmOpen(true);
      return;
    }
    claimSuccessRef.current = null;
    setClaimRecipient(null);
    if (isDesktop) {
      setClaimDialog(choice === 'gift' ? 'gift' : 'other');
    } else {
      setRoute(choice === 'gift' ? 'claim-gift' : 'claim-recipient');
    }
  };

  /**
   * BUG-006/BUG-008/BUG-009: desktop previously stopped at a toast. Every claim
   * method now lands on a real outcome screen carrying the recorded claim.
   */
  const finishDesktopClaim = (kind: 'self' | 'gift' | 'someone-else') => {
    setClaimDialog(null);
    if (kind === 'gift') {
      completeGift();
      return;
    }
    completeClaim();
  };

  useEffect(() => {
    if (route === 'discovering') {
      window.localStorage.setItem(ONBOARDED_KEY, '1');
      signIn();
    }
  }, [route, signIn]);

  const openFeedRoute = (target: 'featured-deals' | 'filters', from: Route) => {
    setFeedFrom(from);
    setRoute(target);
  };

  const accountNav = (target: AccountTarget) => {
    if (target === 'business-onboarding') {
      setBusinessOnboardingFrom('account');
    }
    setRoute(target);
  };

  const feedNav = (key: DesktopNavKey) => {
    switch (key) {
      case 'home':
        setRoute('home');
        break;
      case 'discover':
        setRoute('discover');
        break;
      case 'deals':
        setRoute('deals');
        break;
      case 'exclusive-deals':
        setRoute('deals');
        break;
      case 'how-it-works':
        setRoute('welcome');
        break;
      case 'for-business':
        setBusinessOnboardingFrom(route);
        setRoute('business-onboarding');
        break;
      case 'sign-in':
        setRoute('sign-in');
        break;
      case 'get-started':
        setRoute('start-vemtap');
        break;
      case 'businesses':
        setRoute('storefront');
        break;
      case 'storefront':
        setRoute('storefront');
        break;
      case 'all-products':
        setRoute('storefront-products');
        break;
      case 'all-services':
        setRoute('spa-services');
        break;
      case 'product-detail':
        setRoute('product-detail');
        break;
      case 'spa-storefront':
        setRoute('spa-storefront');
        break;
      case 'spa-booking':
        setRoute('spa-booking');
        break;
      case 'dashboard':
        setRoute('dashboard');
        break;
      case 'orders':
        setRoute('orders');
        break;
      case 'my-deals':
        setRoute('my-deals');
        break;
      case 'messages':
        setRoute('messages');
        break;
      case 'cart':
        setRoute('cart');
        break;
      case 'notifications':
        setRoute('notifications');
        break;
      case 'account-settings':
        setRoute('account-settings');
        break;
      case 'deal-detail':
        setRoute('deal-detail');
        break;
      case 'for-merchants':
        setBusinessOnboardingFrom(route);
        setRoute('business-onboarding');
        break;
    }
  };

  const nav = (getStartedRoute: Route) => (key: DesktopNavKey) => {
    switch (key) {
      case 'home':
        setRoute('home');
        break;
      case 'discover':
        setRoute('discover');
        break;
      case 'deals':
        setRoute('deals');
        break;
      case 'exclusive-deals':
        setRoute('discover-deals');
        break;
      case 'how-it-works':
        setRoute('welcome');
        break;
      case 'for-business':
        setBusinessOnboardingFrom(route);
        setRoute('business-onboarding');
        break;
      case 'sign-in':
        setRoute('sign-in');
        break;
      case 'get-started':
        setRoute(getStartedRoute);
        break;
      case 'businesses':
      case 'storefront':
        setRoute('storefront');
        break;
      case 'all-products':
        setRoute('storefront-products');
        break;
      case 'all-services':
        setRoute('spa-services');
        break;
      case 'product-detail':
        setRoute('product-detail');
        break;
      case 'spa-storefront':
        setRoute('spa-storefront');
        break;
      case 'spa-booking':
        setRoute('spa-booking');
        break;
      case 'dashboard':
        setRoute('dashboard');
        break;
      case 'orders':
        setRoute('orders');
        break;
      case 'my-deals':
        setRoute('my-deals');
        break;
      case 'messages':
        setRoute('messages');
        break;
      case 'cart':
        setRoute('cart');
        break;
      case 'notifications':
        setRoute('notifications');
        break;
      case 'account-settings':
        setRoute('account-settings');
        break;
      case 'deal-detail':
        setRoute('deal-detail');
        break;
      case 'for-merchants':
        setBusinessOnboardingFrom(route);
        setRoute('business-onboarding');
        break;
    }
  };

  const [boostReturnRoute, setBoostReturnRoute] = useState<Route>('business-overview');
  const [boostItem, setBoostItem] = useState<string | null>(null);
  const [hubCustomerName, setHubCustomerName] = useState('Michael James');

  const openBoost = (item?: string) => {
    // The Boost Studio always opens inside the dashboard (side menu intact) —
    // never in the subscription/onboarding shell.
    setBoostReturnRoute(route === 'boost-studio' ? 'boost-hub' : route);
    setBoostItem(item ?? null);
    setRoute('boost-studio');
  };

  // Cluster Boost Visibility — cluster-specific product, separate from the
  // global Boost Studio. `itemId` preselects an eligible cluster pool item
  // and skips the item-selection step.
  const [clusterBoostItem, setClusterBoostItem] = useState<string | null>(null);
  const openClusterBoost = (itemId?: string) => {
    setClusterBoostItem(itemId ?? null);
    setRoute('cluster-boost-new');
  };

  const boostTab = (key: BoostTabKey) => {
    switch (key) {
      case 'overview':
        setRoute('boost-hub');
        break;
      case 'boost':
        openBoost();
        break;
      case 'metrics':
        setRoute('boost-metrics');
        break;
      case 'wallet':
        setRoute('boost-wallet');
        break;
    }
  };

  const [activeSegment, setActiveSegment] = useState<SegmentRef>({
    name: 'Returning Customers',
    count: '294',
    meta: '68.2% repeat interaction rate',
    desc: 'Interacted or placed 2+ orders at Urban Grill & Bistro in the trailing 90 days.',
  });

  const useSegment = (segment: SegmentRef) => {
    setActiveSegment(segment);
    setRoute('segment-actions');
  };

  const openHubModule = (module: HubModuleKey) => {
    const moduleRoute: Record<HubModuleKey, Route> = {
      deals: 'hub-deals',
      catalog: 'hub-catalog',
      customers: 'hub-customers',
      loyalty: 'hub-loyalty',
      locations: 'hub-locations',
      staff: 'hub-staff',
      profile: 'hub-profile',
      referrals: 'business-referrals',
    };
    setRoute(moduleRoute[module]);
  };

  const goBackToPrevious = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setRoute('business-overview');
    }
  };

  const businessTab = (key: BusinessTabKey) => {
    switch (key) {
      case 'overview':
        setRoute('business-overview');
        break;
      case 'orders':
        setRoute('business-orders');
        break;
      case 'messages':
        setRoute('business-messages');
        break;
      case 'business':
        setRoute('business-hub');
        break;
      case 'more':
        setRoute('business-more');
        break;
    }
  };

  const businessPortalNav = (key: string) => {
    switch (key) {
      // Legacy BusinessPortalNavKey aliases
      case 'overview':
        setRoute('business-overview');
        break;
      case 'orders':
      case 'orders-all':
        setRoute('business-orders');
        break;
      case 'bookings':
      case 'orders-bookings':
        setRoute('business-bookings');
        break;
      case 'messages':
      case 'messages-all':
      case 'messages-inquiries':
      case 'messages-inapp':
        setRoute('business-messages');
        break;
      case 'messages-sms':
        setRoute('business-messages-sms');
        break;
      case 'messages-email':
        setRoute('business-messages-email');
        break;
      case 'catalog':
      case 'business-catalog':
        setRoute('hub-catalog');
        break;
      case 'deals':
      case 'business-deals':
        setRoute('hub-deals');
        break;
      case 'locations':
      case 'business-locations':
        setRoute('hub-locations');
        break;
      case 'customers':
      case 'business-customers':
        setRoute('hub-customers');
        break;
      case 'business-profile':
        setRoute('hub-profile');
        break;
      case 'business-referrals':
        setRoute('business-referrals');
        break;
      case 'business-loyalty':
        setRoute('hub-loyalty');
        break;
      case 'business-staff':
        setRoute('hub-staff');
        break;
      case 'analytics':
      case 'more-analytics':
        setRoute('analytics-overview');
        break;
      case 'pos':
        setPosActiveNav('pos-transactions');
        setRoute('business-pos-orders');
        break;
      case 'pos-home':
        setPosActiveNav('pos-home');
        // Dedicated POS overview with its own URL path (/pos/home).
        setRoute('pos-home');
        break;
      case 'pos-sale':
        // Launches the full POS terminal register. The business sidebar stays on
        // screen (collapsed) with the POS menu beside it.
        setRoute('pos-register');
        break;
      case 'pos-transactions':
        setPosActiveNav('pos-transactions');
        setRoute('business-pos-orders');
        break;
      case 'pos-stock':
        setRoute('pos-stock');
        break;
      case 'pos-ledger':
        setRoute('pos-ledger');
        break;
      case 'pos-settings':
        setRoute('pos-settings');
        break;
      case 'pos-sync':
        // BUG: /pos/sync is gone. Offline state and "Sync Online" now live on
        // the register itself, so this nav key just lands on the till.
        setPosActiveNav('pos-home');
        setRoute('pos-register');
        break;
      case 'settings':
      case 'more-settings':
        // Business Settings — NDPR data rights, transaction PIN, account
        // deletion and the rest of the account-holder security controls.
        setRoute('business-settings');
        break;
      // Store Ordering
      case 'store-ordering':
      case 'store-ordering-dashboard':
        setRoute('store-ordering-dashboard');
        break;
      case 'store-ordering-qr':
        setRoute('store-ordering-qr');
        break;
      case 'store-ordering-settings':
        setRoute('store-ordering-settings');
        break;
      // Cluster section
      case 'cluster-system':
      case 'cluster':
        setRoute('cluster-system');
        break;
      case 'cluster-onboarding':
        setRoute('cluster-onboarding');
        break;
      case 'cluster-boost':
        setRoute('cluster-boost');
        break;
      case 'cluster-boost-new':
        setRoute('cluster-boost-new');
        break;
      // More section
      case 'more':
        setRoute('business-more');
        break;
      case 'more-marketing':
        setRoute('boost-hub');
        break;
      case 'more-subscription':
        // Dashboard subscription & billing — designed for an existing account,
        // NOT the business-onboarding subscription flow (route 'subscription').
        setRoute('business-subscription');
        break;
      case 'more-addons':
        // Dashboard add-ons & credits — same reasoning as above.
        setRoute('business-add-ons');
        break;
      case 'more-notifications':
        // Dashboard notifications — the account-holder feed, not the overview.
        setRoute('business-notifications');
        break;
      case 'more-verification':
        // Dashboard verification status center — not the onboarding KYC flow.
        setRoute('verification-status');
        break;
      case 'more-support':
        // Dashboard Help & Support — never the public consumer help centre.
        setRoute('business-support');
        break;
    }
  };

  // The collapsed business rail inside the POS shell navigates via a window
  // event, since the POS chrome is rendered several levels below this router.
  const businessPortalNavRef = useRef(businessPortalNav);
  businessPortalNavRef.current = businessPortalNav;

  useEffect(() => {
    const handleBusinessNav = (event: Event) => {
      const key = (event as CustomEvent<string>).detail;
      businessPortalNavRef.current(key);
    };
    window.addEventListener(BUSINESS_NAV_EVENT, handleBusinessNav);
    return () => window.removeEventListener(BUSINESS_NAV_EVENT, handleBusinessNav);
  }, []);

  // The mobile/tablet dashboard headers (below `lg`) render inline with no nav
  // callback, so the account menu and notification bell announce their intent
  // through this window event instead.
  useEffect(() => {
    const handleMobileAccountNav = (event: Event) => {
      const key = (event as CustomEvent<string>).detail;
      if (key === 'dashboard') setRoute('business-hub');
      else if (key === 'notifications') setRoute('business-notifications');
      else if (key === 'settings') setRoute('business-settings');
    };
    window.addEventListener(MOBILE_ACCOUNT_NAV_EVENT, handleMobileAccountNav);
    return () => window.removeEventListener(MOBILE_ACCOUNT_NAV_EVENT, handleMobileAccountNav);
  }, []);

  const goToAnalyticsTab = (tab: AnalyticsTabKey) => {
    setRoute(`analytics-${tab}` as Route);
  };

  const renderDetail = () =>
    isDesktop ? (
      <DesktopDealDetailScreen
        onNav={feedNav}
        onBack={() => setRoute(dealFrom)}
        onClaimComplete={handleClaimComplete}
      />
    ) : (
      <DealDetailScreen
        onBack={() => setRoute(dealFrom)}
        onHowToClaim={() => setRoute('how-to-claim')}
        onTerms={() => {
          setTermsFrom('deal-detail');
          setRoute('deal-terms');
        }}
        onComments={() => setRoute('comments')}
        onReviews={() => setRoute('reviews')}
        onShare={() => setRoute('share')}
        onClaim={() => startClaim('deal-detail')}
        onMerchant={() => {
          setProfileFrom('deal-detail');
          setRoute('business-profile');
        }}
        claimed={claimed}
        onViewWallet={() => {
          setClaimedFrom('deal-detail');
          setRoute('claimed-deal');
        }}
      />
    );

  const cancelActiveClaim = () => {
    const active = claims.claims.find((entry) => entry.kind !== 'gift');
    if (active) claims.removeClaim(active.ref);
    setActiveClaim(null);
    resetClaim();
    setRoute('home');
  };

  const renderClaimed = () =>
    isDesktop ? (
      <DesktopClaimedDealScreen
        onNav={feedNav}
        onBack={() => setRoute(claimedFrom)}
        onContact={() => setRoute('claimed-contact')}
        onReview={() => setRoute('support')}
        onCancelClaim={cancelActiveClaim}
      />
    ) : (
      <ClaimedDealScreen
        onBack={() => setRoute(claimedFrom)}
        onContact={() => setRoute('claimed-contact')}
        onReview={() => setRoute('support')}
        onCancelClaim={cancelActiveClaim}
      />
    );

  const renderRoute = () => {
    switch (route) {
    case 'welcome':
      if (isDesktop) return <DesktopWelcomeScreen onNav={nav('start-vemtap')} />;
      return <WelcomeScreen onGetStarted={() => setRoute('start-vemtap')} onSignIn={() => setRoute('sign-in')} />;

    case 'discover-deals':
      if (isDesktop)
        return (
          <DesktopDiscoverDealsScreen
            onNav={nav('start-vemtap')}
            onNext={() => setRoute('start-vemtap')}
            onSkip={() => setRoute('start-vemtap')}
            onOpenDeal={() => openDeal('discover-deals')}
          />
        );
      return (
        <DiscoverDealsScreen
          onBack={() => setRoute('welcome')}
          onNext={() => setRoute('start-vemtap')}
          onSkip={() => setRoute('start-vemtap')}
          onOpenDeal={() => openDeal('discover-deals')}
        />
      );

    case 'start-vemtap':
      if (isDesktop) return <DesktopStartVemtapScreen onNav={nav('auth-code')} onGetStarted={() => setRoute('auth-code')} />;
      return (
        <StartVemtapScreen
          onBack={() => setRoute('welcome')}
          onGetStarted={() => {
            setAuthFrom('start-vemtap');
            setRoute('auth-code');
          }}
          onSkip={() => {
            setAuthFrom('start-vemtap');
            setRoute('auth-code');
          }}
          onBusinessSetup={() => setRoute('business-onboarding')}
        />
      );

    case 'auth-code':
      if (isDesktop)
        return (
          <DesktopAuthCodeScreen
            onContinue={() => setRoute('verify-email')}
            onGoogle={() => {
              signIn();
              setRoute('google-confirm');
            }}
            onSignIn={() => setRoute('sign-in')}
            onBusinessRegister={() => setRoute('business-onboarding')}
          />
        );
      return (
        <AuthCodeScreen
          onBack={() => setRoute(authFrom)}
          onContinue={() => setRoute('verify-email')}
          onGoogle={() => {
            signIn();
            setRoute('google-confirm');
          }}
          onBusinessRegister={() => setRoute('business-onboarding')}
        />
      );

    case 'sign-in':
      if (isDesktop)
        return (
          <DesktopSignInScreen
            onSignIn={async ({ identifier, password }) => {
              await signIn({ identifier, password });
              setRoute('discovering');
            }}
            onGoogleSignIn={() => {
              signIn();
              setRoute('discovering');
            }}
            onCreateAccount={() => {
              setAuthFrom('sign-in');
              setRoute('auth-code');
            }}
            onBusinessRegister={() => setRoute('business-onboarding')}
            onCustomerSignIn={async () => {
              if (!hasApiConfig()) {
                await signIn({ identifier: 'demo@vemtap.com', password: 'demo-password' });
              }
              setRoute('dashboard');
            }}
            onBusinessSignIn={async () => {
              if (!hasApiConfig()) {
                await signIn({ identifier: 'demo@vemtap.com', password: 'demo-password' });
              }
              setRoute('business-overview');
            }}
          />
        );
      return (
        <SignInScreen
          onBack={() => setRoute('welcome')}
          onSignIn={async ({ identifier, password }) => {
            await signIn({ identifier, password });
            setRoute('discovering');
          }}
          onGoogleSignIn={() => {
            signIn();
            setRoute('discovering');
          }}
          onCreateAccount={() => {
            setAuthFrom('sign-in');
            setRoute('auth-code');
          }}
          onBusinessRegister={() => setRoute('business-onboarding')}
          onCustomerSignIn={async () => {
            if (!hasApiConfig()) {
              await signIn({ identifier: 'demo@vemtap.com', password: 'demo-password' });
            }
            setRoute('dashboard');
          }}
          onBusinessSignIn={async () => {
            if (!hasApiConfig()) {
              await signIn({ identifier: 'demo@vemtap.com', password: 'demo-password' });
            }
            setRoute('business-overview');
          }}
        />
      );

    case 'verify-email':
      if (isDesktop)
        return (
          <DesktopVerifyEmailScreen
            onBack={() => setRoute('auth-code')}
            onContinue={() => setRoute('profile-setup')}
            onEditEmail={() => setRoute('auth-code')}
            onBusinessSetup={() => setRoute('business-onboarding')}
          />
        );
      return (
        <VerifyEmailScreen
          onBack={() => setRoute('auth-code')}
          onContinue={() => setRoute('profile-setup')}
          onEditEmail={() => setRoute('auth-code')}
        />
      );

    case 'profile-setup':
      if (isDesktop)
        return (
          <DesktopProfileSetupScreen
            onBack={() => setRoute('verify-email')}
            onComplete={() => setRoute('location-permission')}
            onBusinessSetup={() => setRoute('business-onboarding')}
          />
        );
      return <ProfileSetupScreen onBack={() => setRoute('verify-email')} onComplete={() => setRoute('location-permission')} />;

    case 'location-permission':
      if (isDesktop)
        return (
          <DesktopLocationPermissionScreen
            onNav={nav('confirm-location')}
            onUseLocation={() => {
              setConfirmFrom('location-permission');
              setRoute('confirm-location');
            }}
            onManualLocation={() => setRoute('manual-location')}
          />
        );
      return (
        <LocationPermissionScreen
          onBack={() => setRoute('profile-setup')}
          onUseLocation={() => {
            setConfirmFrom('location-permission');
            setRoute('confirm-location');
          }}
          onManualLocation={() => setRoute('manual-location')}
        />
      );

    case 'manual-location':
      if (isDesktop)
        return (
          <DesktopManualLocationScreen
            onNav={nav('confirm-location')}
            onBack={() => setRoute('location-permission')}
            onContinue={() => {
              setConfirmFrom('manual-location');
              setRoute('confirm-location');
            }}
          />
        );
      return (
        <ManualLocationScreen
          onBack={() => setRoute('location-permission')}
          onContinue={() => {
            setConfirmFrom('manual-location');
            setRoute('confirm-location');
          }}
          onBusinessSetup={() => setRoute('business-onboarding')}
        />
      );

    case 'confirm-location':
      if (isDesktop)
        return (
          <DesktopConfirmLocationScreen
            onNav={nav('discovering')}
            onBack={() => setRoute(confirmFrom)}
            onChangeLocation={() => setRoute('manual-location')}
            onContinue={() => setRoute('discovering')}
            onBusinessSetup={() => setRoute('business-onboarding')}
          />
        );
      return (
        <ConfirmLocationScreen
          onBack={() => setRoute(confirmFrom)}
          onChangeLocation={() => setRoute('manual-location')}
          onContinue={() => setRoute('discovering')}
          onBusinessSetup={() => setRoute('business-onboarding')}
        />
      );

    case 'discovering':
      // `discovering` only ever runs on the customer path, so it always resets
      // the welcome audience — otherwise a prior business onboarding would
      // leave the welcome screen showing business copy.
      if (welcomeAudience !== 'customer') setWelcomeAudience('customer');
      if (isDesktop)
        return (
          <DesktopDiscoveringScreen onNav={nav('onboarding-welcome')} onReady={() => setRoute('onboarding-welcome')} />
        );
      return <DiscoveringScreen onReady={() => setRoute('onboarding-welcome')} />;

    /**
     * Post-onboarding welcome: a readiness checklist plus the "Refer Others &
     * Earn Rewards" panel, shown immediately before the dashboard.
     */
    case 'onboarding-welcome': {
      const enterDashboard = () => {
        clearProvisionalReferralCode();
        setWelcomeBusiness(null);
        setRoute('home');
      };
      if (isDesktop)
        return (
          <DesktopOnboardingWelcomeScreen
            audience={welcomeAudience}
            business={welcomeBusiness ?? undefined}
            onEnterDashboard={enterDashboard}
          />
        );
      return (
        <OnboardingWelcomeScreen
          audience={welcomeAudience}
          business={welcomeBusiness ?? undefined}
          onEnterDashboard={enterDashboard}
        />
      );
    }

    case 'home':
      if (isDesktop)
        return (
          <DesktopHomeScreen
            onNav={feedNav}
            onOpenFilters={() => openFeedRoute('filters', 'home')}
            onOpenFeatured={() => openFeedRoute('featured-deals', 'home')}
            onOpenDeals={() => setRoute('deals')}
            onOpenDeal={(deal) => openDeal('home', deal ?? null)}
            onClaim={openClaimPopup}
          />
        );
      return (
        <HomeScreen
          onTab={(tab) => setRoute(tab)}
          onOpenFilters={() => openFeedRoute('filters', 'home')}
          onOpenFeatured={() => openFeedRoute('featured-deals', 'home')}
          onOpenDeals={() => setRoute('deals')}
          onOpenDeal={() => openDeal('home')}
          onOpenNotifications={() => setRoute('notifications')}
          onEnroll={() => setRoute('business-onboarding')}
          onAccount={() => setRoute('account')}
        />
      );

    case 'deals':
      if (isDesktop)
        return (
          <DesktopDealsScreen
            onNav={feedNav}
            onOpenFilters={() => openFeedRoute('filters', 'deals')}
            onOpenFeatured={() => openFeedRoute('featured-deals', 'deals')}
            onOpenDeal={(deal) => openDeal('deals', deal ?? null)}
            onClaim={openClaimPopup}
          />
        );
      return (
        <DealsScreen
          onTab={(tab) => setRoute(tab)}
          onOpenFilters={() => openFeedRoute('filters', 'deals')}
          onOpenDeal={() => openDeal('deals')}
          onOpenNotifications={() => setRoute('notifications')}
          onClaim={openClaimPopup}
          onAccount={() => setRoute('account')}
        />
      );

    case 'featured-deals':
      if (isDesktop)
        return (
          <DesktopFeaturedDealsScreen
            onNav={feedNav}
            onOpenFilters={() => openFeedRoute('filters', 'featured-deals')}
            onOpenDeal={() => openDeal('featured-deals')}
          />
        );
      return <FeaturedDealsScreen onBack={() => setRoute(feedFrom)} onOpenDeal={() => openDeal('featured-deals')} />;

    case 'filters':
      if (isDesktop) return <DesktopFiltersScreen onNav={feedNav} onClose={() => setRoute(feedFrom)} />;
      return <FiltersScreen onClose={() => setRoute(feedFrom)} />;

    case 'deal-detail':
      if (isDesktop)
        return (
          <DesktopDealDetailScreen
            onNav={feedNav}
            onBack={() => setRoute(dealFrom)}
            onClaimComplete={handleClaimComplete}
            deal={selectedDeal}
          />
        );
      return <>{renderDetail()}</>;

    case 'comments':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <CommentsDrawer
              open
              onClose={() => setRoute('deal-detail')}
              onClaim={() => {
                setRoute('deal-detail');
                openClaimPopup();
              }}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <CommentsSheet open onClose={() => setRoute('deal-detail')} />
        </>
      );

    case 'reviews':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ReviewsModal open onClose={() => setRoute('deal-detail')} />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ReviewsSheet open onClose={() => setRoute('deal-detail')} />
        </>
      );

    case 'share':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ShareModal open onClose={() => setRoute('deal-detail')} />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ShareSheet open onClose={() => setRoute('deal-detail')} />
        </>
      );

    case 'claim-auth':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ClaimAuthModal
              open
              onAuthenticated={() => {
                signIn();
                setRoute('claim-confirm');
              }}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ClaimAuthSheet
            open
            onAuthenticated={() => {
              signIn();
              setRoute('claim-confirm');
            }}
            onClose={() => setRoute('deal-detail')}
          />
        </>
      );

    case 'claim-confirm':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ClaimConfirmationModal
              open
              onClose={() => setRoute('deal-detail')}
              onConfirm={() => setRoute('claim-identity')}
              deal={selectedDeal}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ClaimConfirmSheet open onClose={() => setRoute('deal-detail')} onConfirm={() => setRoute('claim-identity')} />
        </>
      );

    case 'claim-identity':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ClaimIdentityModal
              open
              identity={{ name: profile.fullName }}
              deal={selectedDeal}
              onClaimSelf={() => setClaimSelfConfirmOpen(true)}
              onGift={() => setRoute('claim-gift')}
              onSomeoneElse={() => {
                setClaimRecipient(null);
                setRoute('claim-recipient');
              }}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ClaimIdentitySheet
            open
            identity={{ name: profile.fullName, email: profile.email, initials: profile.initials }}
            onClaimSelf={() => setClaimSelfConfirmOpen(true)}
            onGift={() => setRoute('claim-gift')}
            onSomeoneElse={() => {
              setClaimRecipient(null);
              setRoute('claim-recipient');
            }}
            onClose={() => setRoute('deal-detail')}
          />
        </>
      );

    case 'claim-recipient':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <SomeoneElseModal
              open
              onContinue={(values) => {
                setClaimRecipient({
                  name: `${values.firstName} ${values.lastName}`.trim(),
                  email: values.email,
                  phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
                });
                setRoute('claim-verify');
              }}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <RecipientDetailsSheet
            open
            onContinue={(values) => {
              setClaimRecipient({
                name: `${values.firstName} ${values.lastName}`.trim(),
                email: values.email,
                phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
              });
              setRoute('claim-verify');
            }}
            onBack={() => setRoute('claim-identity')}
            onClose={() => setRoute('deal-detail')}
          />
        </>
      );

    case 'claim-verify':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <RecipientVerificationModal
              open
              recipient={claimRecipient}
              onVerify={() => setRoute('claim-summary')}
              onBack={() => setRoute('claim-recipient')}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <RecipientVerificationSheet
            open
            recipient={claimRecipient}
            onVerify={() => setRoute('claim-summary')}
            onBack={() => setRoute('claim-recipient')}
            onClose={() => setRoute('deal-detail')}
          />
        </>
      );

    case 'claim-summary':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <RecipientSummaryModal
              open
              recipient={claimRecipient}
              onConfirm={completeClaim}
              onEdit={() => setRoute('claim-recipient')}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <RecipientSummarySheet
            open
            recipient={claimRecipient}
            onContinue={completeClaim}
            onEdit={() => setRoute('claim-recipient')}
            onClose={() => setRoute('deal-detail')}
          />
        </>
      );

    case 'claim-gift':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <GiftRecipientDetailsModal
              open
              onContinue={(values) => {
                setGiftRecipient({
                  name: `${values.firstName} ${values.lastName}`.trim() || 'Gift Recipient',
                  email: values.email,
                  phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
                });
                setRoute('claim-gift-confirm');
              }}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <GiftRecipientDetailsSheet
            open
            onContinue={(values) => {
              setGiftRecipient({
                name: `${values.firstName} ${values.lastName}`.trim(),
                email: values.email,
                phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : '0801 234 5678',
              });
              setRoute('claim-gift-confirm');
            }}
            onClose={() => setRoute('deal-detail')}
          />
        </>
      );

    case 'claim-gift-confirm':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ConfirmGiftSendModal
              open
              recipient={giftRecipient}
              onSend={completeGift}
              onEdit={() => setRoute('claim-gift')}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ConfirmGiftSendSheet
            open
            recipient={giftRecipient}
            onConfirm={completeGift}
            onEdit={() => setRoute('claim-gift')}
            onClose={() => setRoute('deal-detail')}
          />
        </>
      );

    case 'how-to-claim':
      if (isDesktop)
        return (
          <DesktopHowToClaimScreen
            onNav={feedNav}
            onBack={() => setRoute('deal-detail')}
            onClaim={() => startClaim('how-to-claim')}
            onTerms={() => {
              setTermsFrom('how-to-claim');
              setRoute('deal-terms');
            }}
          />
        );
      return (
        <HowToClaimScreen
          onBack={() => setRoute('deal-detail')}
          onClaim={() => startClaim('how-to-claim')}
          onTerms={() => {
            setTermsFrom('how-to-claim');
            setRoute('deal-terms');
          }}
        />
      );

    case 'claim-success':
      if (isDesktop)
        return (
          <DesktopClaimSuccessScreen
            onNav={feedNav}
            onBack={() => setRoute('deal-detail')}
            claim={activeClaim}
            onViewMyDeal={() => {
              setClaimedFrom('claim-success');
              setRoute('claimed-deal');
            }}
            onContinue={() => setRoute('home')}
          />
        );
      return (
        <ClaimSuccessScreen
          onBack={() => setRoute('deal-detail')}
          claim={activeClaim}
          onViewMyDeal={() => {
            setClaimedFrom('claim-success');
            setRoute('claimed-deal');
          }}
          onContinue={() => setRoute('home')}
        />
      );

    case 'gift-sent':
      if (isDesktop)
        return (
          <DesktopGiftSentScreen
            onNav={feedNav}
            recipient={giftRecipient}
            claim={activeClaim}
            onBack={() => setRoute('deal-detail')}
            onDone={() => setRoute('my-deals')}
            onSendAnother={() => setRoute('claim-identity')}
          />
        );
      return (
        <GiftSentScreen
          recipient={giftRecipient}
          claim={activeClaim}
          onBack={() => setRoute('deal-detail')}
          onDone={() => setRoute('my-deals')}
          onSendAnother={() => setRoute('claim-identity')}
        />
      );

    case 'claimed-deal':
      return <>{renderClaimed()}</>;

    case 'claimed-contact':
      if (isDesktop)
        return (
          <>
            {renderClaimed()}
            <ContactBusinessModal
              open
              onChat={() => setRoute('merchant-chat')}
              onClose={() => setRoute('claimed-deal')}
            />
          </>
        );
      return (
        <>
          {renderClaimed()}
          <ContactBusinessSheet open onChat={() => setRoute('merchant-chat')} onClose={() => setRoute('claimed-deal')} />
        </>
      );

    case 'claimed-terms': {
      // Show the terms frozen onto the claim, not whatever the live offer has.
      const claimTerms = activeClaim?.terms ?? claims.latestOf('self')?.terms;
      if (isDesktop)
        return (
          <>
            {renderClaimed()}
            <ClaimedTermsModal open onClose={() => setRoute('claimed-deal')} terms={claimTerms} />
          </>
        );
      return (
        <>
          {renderClaimed()}
          <ClaimedTermsSheet open onClose={() => setRoute('claimed-deal')} terms={claimTerms} />
        </>
      );
    }

    case 'merchant-chat':
      if (isDesktop)
        return (
          <DesktopMerchantChatScreen
            onNav={feedNav}
            onBack={() => setRoute(chatFrom)}
            onViewQr={() => {
              setClaimedFrom('merchant-chat');
              setRoute('claimed-deal');
            }}
          />
        );
      return (
        <MerchantChatScreen
          onBack={() => setRoute(chatFrom)}
          onViewQr={() => {
            setClaimedFrom('merchant-chat');
            setRoute('claimed-deal');
          }}
        />
      );

    case 'deal-terms':
      if (isDesktop)
        return (
          <DesktopDealTermsScreen
            onNav={feedNav}
            onBack={() => setRoute(termsFrom)}
            onClaim={() => startClaim('deal-terms')}
          />
        );
      return (
        <DealTermsScreen
          onBack={() => setRoute(termsFrom)}
          onClaim={() => startClaim('deal-terms')}
        />
      );

    case 'storefront':
      if (isDesktop) return <DesktopUrbanGrillStorefrontScreen onNav={feedNav} onClaim={openClaimPopup} onCheckout={startCheckout} />;
      return (
        <MerchantDealsScreen
          business={selectedBusiness}
          onBack={() => setRoute(bizFrom)}
          onOpenDeal={() => openDeal('storefront')}
          onBusinessSetup={() => setRoute('business-onboarding')}
          onShowGrid={() => {
            setCatalogueFrom('storefront');
            setRoute('storefront-products');
          }}
          onClaim={openClaimPopup}
        />
      );

    case 'storefront-products':
      if (isDesktop)
        return <DesktopAllProductsScreen onNav={feedNav} onBack={() => setRoute('storefront')} />;
      return (
        <ProductsCatalogueScreen
          onBack={() => setRoute(catalogueFrom)}
          onListView={() => setRoute('storefront-menu')}
          onOpenProduct={(id, display) => openProduct(id, display, 'storefront-products')}
          onCheckout={startCheckout}
        />
      );

    case 'storefront-menu':
      if (isDesktop)
        return (
          <DesktopStorefrontMenuScreen
            onNav={feedNav}
            onBack={() => setRoute(bizFrom)}
            onOpenDeals={() => {
              setBizFrom(bizFrom);
              setRoute('storefront');
            }}
            onGridView={() => {
              setCatalogueFrom('storefront-menu');
              setRoute('storefront-products');
            }}
            onOpenProduct={(id, display) => openProduct(id, display, 'storefront-menu')}
            onCheckout={startCheckout}
          />
        );
      return (
        <MenuProductsScreen
          onBack={() => setRoute(bizFrom)}
          onOpenDeals={() => {
            setBizFrom(bizFrom);
            setRoute('storefront');
          }}
          onGridView={() => {
            setCatalogueFrom('storefront-menu');
            setRoute('storefront-products');
          }}
          onOpenProduct={(id, display) => openProduct(id, display, 'storefront-menu')}
          onCheckout={startCheckout}
        />
      );

    case 'business-profile':
      if (isDesktop)
        return (
          <DesktopUrbanGrillStorefrontScreen
            business={selectedBusiness}
            onNav={feedNav}
            activeNav="discover"
            onClaim={openClaimPopup}
            onCheckout={startCheckout}
          />
        );
      return (
        <BusinessProfileScreen
          venue="urban"
          business={selectedBusiness}
          onBack={() => setRoute(profileFrom)}
          onOpenDeals={() => {
            setBizFrom('business-profile');
            setRoute('storefront');
          }}
          onOpenProducts={() => {
            setCatalogueFrom('business-profile');
            setRoute('storefront-products');
          }}
          onClaim={openClaimPopup}
        />
      );

    case 'spa-profile':
      if (isDesktop) return <DesktopSpaStorefrontScreen onNav={feedNav} onClaim={openClaimPopup} />;
      return (
        <BusinessProfileScreen
          venue="spa"
          business={selectedBusiness}
          onBack={() => setRoute(profileFrom)}
          onOpenDeals={() => setRoute(profileFrom)}
          onOpenServices={() => {
            setBizFrom('spa-profile');
            setRoute('spa-services');
          }}
          onOpenService={(name) => openService(name, 'spa-profile')}
          onClaim={openClaimPopup}
        />
      );

    case 'spa-services':
      if (isDesktop) return <DesktopAllServicesScreen onNav={feedNav} onBack={() => setRoute('spa-profile')} />;
      return (
        <ServicesCatalogueScreen
          onBack={() => setRoute(bizFrom)}
          onOpenDeals={() => setRoute('spa-profile')}
          onOpenService={(name) => openService(name, 'spa-services')}
          onContinueBook={() => {
            setBookingFrom('spa-services');
            setRoute('spa-booking');
          }}
        />
      );

    case 'service-detail':
      if (isDesktop) return <DesktopSpaStorefrontScreen onNav={feedNav} onClaim={openClaimPopup} />;
      if (!detailService) return null;
      return (
        <ServiceDetailScreen
          service={detailService}
          onBack={() => setRoute(serviceFrom)}
          onBook={() => {
            booking.ensureService(detailService.id);
            setBookingFrom('service-detail');
            setRoute('spa-booking');
          }}
        />
      );

    case 'product-detail':
      if (isDesktop) return <DesktopProductDetailScreen onNav={feedNav} onBack={() => setRoute('storefront')} />;
      if (!detailProduct) return null;
      return (
        <ProductDetailScreen
          product={detailProduct}
          onBack={() => setRoute(detailFrom)}
          onCheckout={startCheckout}
          onOpenBusiness={() => {
            setProfileFrom('product-detail');
            setRoute('business-profile');
          }}
        />
      );

    case 'checkout':
      if (isDesktop)
        return (
          <DesktopCheckoutScreen onNav={feedNav} onBack={() => setRoute('storefront-menu')} onPlaced={placeOrder} />
        );
      return <CheckoutScreen onBack={() => setRoute('storefront-menu')} onPlaced={placeOrder} />;

    case 'order-placed':
      if (!orderSummary) return null;
      if (isDesktop)
        return (
          <DesktopOrderPlacedScreen
            onNav={feedNav}
            order={orderSummary}
            onClose={() => setRoute('home')}
            onHome={() => setRoute('discover')}
            onTrack={() => {
              setChatFrom('order-placed');
              setRoute('merchant-chat');
            }}
          />
        );
      return (
        <OrderPlacedScreen
          order={orderSummary}
          onClose={() => setRoute('home')}
          onHome={() => setRoute('discover')}
          onTrack={() => {
            setChatFrom('order-placed');
            setRoute('merchant-chat');
          }}
        />
      );

    case 'spa-storefront':
      if (isDesktop) return <DesktopSpaStorefrontScreen onNav={feedNav} onClaim={openClaimPopup} />;
      return null;

    case 'spa-booking':
      if (isDesktop)
        return (
          <DesktopSpaBookingScreen
            onNav={feedNav}
            onBack={() => setRoute('spa-storefront')}
            onChat={() => setRoute('messages')}
          />
        );
      return (
        <SpaBookingScheduleScreen
          onBack={() => setRoute(bookingFrom)}
          onReview={() => setRoute('spa-booking-checkout')}
        />
      );

    case 'spa-booking-checkout':
      if (isDesktop)
        return (
          <DesktopSpaBookingScreen
            onNav={feedNav}
            onBack={() => setRoute('spa-storefront')}
            onChat={() => {
              // BUG-026: open the receptionist conversation directly.
              setActiveConversation('glow');
              setRoute('conversation');
            }}
          />
        );
      return (
        <BookingCheckoutScreen
          onBack={() => setRoute('spa-booking')}
          onConfirmed={() => setRoute('spa-booking-confirmed')}
        />
      );

    case 'spa-booking-confirmed':
      if (isDesktop)
        return (
          <DesktopSpaBookingScreen
            onNav={feedNav}
            onBack={() => setRoute('spa-storefront')}
            onChat={() => {
              setActiveConversation('glow');
              setRoute('conversation');
            }}
          />
        );
      if (!booking.confirmedRef) return null;
      return (
        <BookingConfirmedScreen
          refCode={booking.confirmedRef}
          onBack={() => setRoute('spa-services')}
          onHome={() => setRoute('home')}
          onChat={() => {
            // BUG-026: open the business conversation for the spa receptionist.
            setActiveConversation('glow');
            setRoute('conversation');
          }}
        />
      );

    case 'dashboard':
      if (isDesktop) return <DesktopDashboardScreen onNav={feedNav} />;
      return (
        <DashboardScreen
          onTab={(tab) => setRoute(tab)}
          onNavigate={(target) => {
            if (target === 'business-onboarding') {
              setBusinessOnboardingFrom('dashboard');
            }
            setRoute(target);
          }}
          onShowQR={() => {
            setClaimedFrom('dashboard');
            setRoute('claimed-deal');
          }}
        />
      );

    case 'orders':
      if (isDesktop)
        return (
          <DesktopOrdersScreen
            onNav={feedNav}
            onOpenOrder={(ref) => {
              setActiveOrderRef(ref);
              setRoute('order-detail');
            }}
            onOpenBooking={() => setRoute('booking-detail')}
          />
        );
      return (
        <OrdersScreen
          onTab={(tab) => setRoute(tab)}
          onOpenConversation={(threadId) => {
            setActiveConversation(threadId);
            setRoute('conversation');
          }}
          onOpenOrder={(ref) => {
            setActiveOrderRef(ref);
            setRoute('order-detail');
          }}
          onOpenBooking={() => setRoute('booking-detail')}
          onNavigate={(target) => setRoute(target)}
        />
      );

    case 'order-detail':
      if (isDesktop)
        return <DesktopOrderDetailScreen orderRef={activeOrderRef} onNav={feedNav} onBack={() => setRoute('orders')} />;
      return (
        <OrderDetailScreen
          orderRef={activeOrderRef}
          onBack={() => setRoute('orders')}
          onChat={() => {
            setActiveConversation('urban');
            setRoute('conversation');
          }}
          onReorder={() => setRoute('storefront')}
          onSupport={() => setRoute('support')}
        />
      );

    case 'booking-detail':
      if (isDesktop)
        return <DesktopBookingDetailScreen onNav={feedNav} onBack={() => setRoute('orders')} />;
      return (
        <BookingDetailScreen
          onBack={() => setRoute('orders')}
          onReschedule={() => setRoute('spa-booking')}
          onChat={() => {
            setActiveConversation('glow');
            setRoute('conversation');
          }}
        />
      );

    case 'my-deals':
      if (isDesktop) return <DesktopMyDealsScreen onNav={feedNav} />;
      return (
        <MyDealsScreen
          onTab={(tab) => setRoute(tab)}
          onShowPass={() => {
            setClaimedFrom('my-deals');
            setRoute('claimed-deal');
          }}
          onNavigate={(target) => setRoute(target)}
        />
      );

    case 'messages':
      if (isDesktop) return <DesktopMessagesScreen onNav={feedNav} />;
      return (
        <MessagesScreen
          onTab={(tab) => setRoute(tab)}
          onOpen={(threadId) => {
            setActiveConversation(threadId);
            setRoute('conversation');
          }}
        />
      );

    case 'conversation':
      if (isDesktop) return <DesktopMessagesScreen onNav={feedNav} initialThread={activeConversation} />;
      return (
        <ConversationScreen
          threadId={activeConversation}
          onBack={() => setRoute('messages')}
          onViewPass={() => {
            setClaimedFrom('messages');
            setRoute('claimed-deal');
          }}
          onSecondary={() => setRoute('dashboard')}
        />
      );

    case 'cart':
      if (isDesktop) return <DesktopCartScreen onNav={feedNav} onCheckout={startCheckout} />;
      return (
        <ConsumerCartScreen
          onBack={() => setRoute('dashboard')}
          onCheckout={startCheckout}
          onBrowseDeals={() => setRoute('deals')}
          onOpenStorefront={() => setRoute('storefront-menu')}
        />
      );

    case 'account-settings':
      if (isDesktop) return <DesktopAccountSettingsScreen onNav={feedNav} />;
      return (
        <AccountSettingsScreen
          onBack={() => setRoute('settings')}
          onOpenPrivacy={() => setRoute('privacy')}
          onOpenTerms={() => setRoute('terms')}
          onSignOut={() => {
            signOut();
            setRoute('home');
          }}
        />
      );

    case 'discover':
      if (isDesktop)
        return (
          <DesktopDiscoverScreen
            onNav={feedNav}
            onOpenFilters={() => openFeedRoute('filters', 'discover')}
            onOpenBusiness={(business) => {
              const normalized = (business.name ?? '').toLowerCase();
              const isSpa = business.venue === 'spa' || normalized.includes('spa') || normalized.includes('serenity') || normalized.includes('glow');
              const isUrban = business.venue === 'urban' || normalized.includes('grill') || normalized.includes('bistro') || normalized.includes('restaurant');

              const businessName = business.name?.trim() || 'Business storefront';
              const slugBase = (business.slug ?? businessName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `${isSpa ? 'spa' : 'business'}-${Date.now()}`;
              const businessRef: BusinessProfileRef = {
                slug: slugBase,
                id: business.id || slugBase,
                name: businessName,
                venue: isSpa ? 'spa' : 'urban',
              };

              setSelectedBusiness(businessRef);
              setProfileFrom('discover');

              if (isSpa) {
                setRoute('spa-profile');
                return;
              }

              if (isUrban || !isSpa) {
                setRoute('business-profile');
                return;
              }
            }}
            onBusinessSetup={() => setRoute('business-onboarding')}
          />
        );
      return (
        <DiscoverScreen
          onTab={(tab) => {
            if (tab === 'home') setRoute('home');
            else if (tab === 'deals') setRoute('deals');
            else if (tab === 'saved') setRoute('saved');
            else if (tab === 'account') setRoute('account');
          }}
          onOpenBusiness={(business) => {
            const normalized = (business.name ?? '').toLowerCase();
            const isSpa = business.venue === 'spa' || normalized.includes('spa') || normalized.includes('serenity') || normalized.includes('glow');
            const isUrban = business.venue === 'urban' || normalized.includes('grill') || normalized.includes('bistro') || normalized.includes('restaurant');
            const businessName = business.name?.trim() || 'Business storefront';
            const slugBase = (business.slug ?? businessName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `${isSpa ? 'spa' : 'business'}-${Date.now()}`;
            const businessRef: BusinessProfileRef = {
              slug: slugBase,
              id: business.id || slugBase,
              name: businessName,
              venue: isSpa ? 'spa' : 'urban',
            };

            setSelectedBusiness(businessRef);
            setProfileFrom('discover');

            if (isSpa) {
              setRoute('spa-profile');
              return;
            }

            if (isUrban || !isSpa) {
              setRoute('business-profile');
              return;
            }
          }}
          onOpenFilters={() => openFeedRoute('filters', 'discover')}
          onOpenNotifications={() => setRoute('notifications')}
          onBusinessSetup={() => setRoute('business-onboarding')}
        />
      );

    case 'saved':
      if (isDesktop)
        return (
          <DesktopSavedItemsScreen
            onNav={feedNav}
            onBack={() => setRoute('account')}
            onOpenDeal={() => setRoute('deal-detail')}
            onOpenBusiness={() => {
              setProfileFrom('saved');
              setRoute('spa-profile');
            }}
            onBrowse={() => setRoute('discover')}
          />
        );
      return (
        <SavedItemsScreen
          onBack={() => setRoute('home')}
          onOpenDeal={() => setRoute('deal-detail')}
          onOpenBusiness={() => {
            setProfileFrom('saved');
            setRoute('spa-profile');
          }}
          onBrowse={() => setRoute('discover')}
        />
      );

    /** Customer "Referrals & Rewards" — immediately after Saved & Wishlist. */
    case 'referrals':
      if (isDesktop)
        return <DesktopCustomerReferralsScreen onNav={feedNav} onBack={() => setRoute('account')} />;
      return <CustomerReferralsScreen onBack={() => setRoute('account')} />;

    /** Business → Referrals — immediately after Business Profile. */
    case 'business-referrals':
      if (isDesktop) return <DesktopBusinessReferralsScreen onNav={businessPortalNav} />;
      return <BusinessReferralsScreen onBack={() => setRoute('business-hub')} />;

    /**
     * Platform Admin → Referral programme. Not reachable from user navigation;
     * an admin opens `/admin/referral` directly to swap the explainer video.
     */
    case 'admin-referral':
      return <AdminReferralScreen onBack={() => setRoute('business-referrals')} />;

    /**
     * Google profile confirmation — shown after the Google button and before
     * the dashboard. Confirms the profile the frontend holds, asks for a phone
     * number Google didn't share, and takes an optional referral code.
     */
    case 'google-confirm': {
      const finishGoogleConfirm = (details: GoogleConfirmDetails) => {
        if (details.referralCode) setProvisionalReferralCode(details.referralCode, 'manual');
        profile.update({ phone: details.phone });
        setWelcomeAudience('customer');
        setRoute('discovering');
      };
      if (isDesktop)
        return (
          <DesktopGoogleProfileConfirmScreen onBack={() => setRoute('auth-code')} onContinue={finishGoogleConfirm} />
        );
      return <GoogleProfileConfirmScreen onBack={() => setRoute('auth-code')} onContinue={finishGoogleConfirm} />;
    }

    case 'account':
      if (isDesktop)
        return (
          <DesktopAccountScreen
            onNav={feedNav}
            onBack={() => setRoute('home')}
            onNavigate={accountNav}
            onSignOut={() => {
              signOut();
              setRoute('home');
            }}
          />
        );
      return (
        <AccountScreen
          onTab={(tab) => setRoute(tab)}
          onNavigate={(target) => setRoute(target)}
          onSignOut={() => {
            signOut();
            setRoute('home');
          }}
        />
      );

    case 'settings':
      if (isDesktop)
        return (
          <DesktopSettingsScreen onNav={feedNav} onBack={() => setRoute('account')} onNavigate={accountNav} />
        );
      return <SettingsScreen onBack={() => setRoute('account')} onNavigate={(target) => setRoute(target)} />;

    case 'support-legal':
      if (isDesktop)
        return (
          <DesktopSupportLegalScreen onNav={feedNav} onBack={() => setRoute('account')} onNavigate={accountNav} />
        );
      return <SupportLegalScreen onBack={() => setRoute('account')} onNavigate={(target) => setRoute(target)} />;

    case 'edit-profile':
      if (isDesktop) return <DesktopEditProfileScreen onNav={feedNav} onBack={() => setRoute('account')} />;
      return <EditProfileScreen onBack={() => setRoute('account')} />;

    case 'rewards':
      if (isDesktop) return <DesktopRewardsScreen onNav={feedNav} onBack={() => setRoute('account')} />;
      return <RewardsScreen onBack={() => setRoute('savings')} />;

    case 'savings':
      if (isDesktop)
        return (
          <DesktopSavingsScreen
            onNav={feedNav}
            onBack={() => setRoute('account')}
            onOpenRewards={() => setRoute('rewards')}
            onSupport={() => setRoute('support')}
          />
        );
      return (
        <SavingsScreen
          onBack={() => setRoute('account')}
          onOpenRewards={() => setRoute('rewards')}
          onSupport={() => setRoute('support')}
        />
      );

    case 'notifications':
      if (isDesktop)
        return (
          <DesktopNotificationsScreen
            onNav={feedNav}
            onBack={() => setRoute('settings')}
            onOpenPass={() => {
              setClaimedFrom('notifications');
              setRoute('claimed-deal');
            }}
            onOpenBooking={() => setRoute('booking-detail')}
            onOpenGift={() => {
              setClaimedFrom('notifications');
              setRoute('claimed-deal');
            }}
            onOpenRewards={() => setRoute('rewards')}
            onBrowseDeals={() => setRoute('discover')}
            onOpenPreferences={() => setRoute('preferences')}
          />
        );
      return (
        <NotificationsScreen
          onBack={() => setRoute('settings')}
          onOpenPass={() => {
            setClaimedFrom('notifications');
            setRoute('claimed-deal');
          }}
          onOpenBooking={() => setRoute('booking-detail')}
          onOpenGift={() => {
            setClaimedFrom('notifications');
            setRoute('claimed-deal');
          }}
          onOpenRewards={() => setRoute('rewards')}
          onBrowseDeals={() => setRoute('discover')}
          onOpenPreferences={() => setRoute('preferences')}
        />
      );

    case 'privacy':
      if (isDesktop)
        return (
          <DesktopPrivacyScreen
            onNav={feedNav}
            onBack={() => setRoute('settings')}
            onOpenTerms={() => setRoute('terms')}
          />
        );
      return (
        <PrivacyScreen
          onBack={() => setRoute('settings')}
          onOpenTerms={() => setRoute('terms')}
        />
      );

    case 'addresses':
      if (isDesktop) return <DesktopAddressesScreen onNav={feedNav} onBack={() => setRoute('settings')} />;
      return <AddressesScreen onBack={() => setRoute('settings')} />;

    case 'preferences':
      if (isDesktop) return <DesktopPreferencesScreen onNav={feedNav} onBack={() => setRoute('settings')} />;
      return <PreferencesScreen onBack={() => setRoute('settings')} />;

    case 'help':
      if (isDesktop)
        return (
          <DesktopHelpCentreScreen
            onNav={feedNav}
            onBack={() => setRoute('support-legal')}
            onStartChat={() => setRoute('support')}
            onOpenMerchant={() => setRoute('business-onboarding')}
            onOpenTerms={() => setRoute('terms')}
          />
        );
      return (
        <HelpCentreScreen
          onBack={() => setRoute('support-legal')}
          onStartChat={() => setRoute('support')}
          onOpenMerchant={() => setRoute('business-onboarding')}
          onOpenTerms={() => setRoute('terms')}
        />
      );

    case 'support':
      if (isDesktop)
        return (
          <DesktopSupportScreen
            onNav={feedNav}
            onBack={() => setRoute('support-legal')}
            onOpenHelp={() => setRoute('help')}
          />
        );
      return (
        <SupportScreen
          onBack={() => setRoute('support-legal')}
          onOpenHelp={() => setRoute('help')}
        />
      );

    case 'terms':
      if (isDesktop) return <DesktopTermsScreen onNav={feedNav} onBack={() => setRoute('support-legal')} />;
      return <TermsScreen onBack={() => setRoute('support-legal')} />;

    case 'scan':
      if (isDesktop)
        return (
          <DesktopScanScreen
            onNav={feedNav}
            onBack={() => setRoute('dashboard')}
            onOpenTableMenu={() => setRoute('public-pos-menu')}
          />
        );
      return (
        <ScanScreen
          onBack={() => setRoute('dashboard')}
          onOpenTableMenu={() => setRoute('public-pos-menu')}
        />
      );

    case 'activity':
      if (isDesktop)
        return (
          <DesktopActivityScreen
            onNav={feedNav}
            onBack={() => setRoute('dashboard')}
            onOpenReceipt={() => setRoute('order-detail')}
            onWriteReview={() => setRoute('reviews')}
            onOpenOrders={() => setRoute('orders')}
            onOpenService={() => setRoute('service-detail')}
            onBrowse={() => setRoute('discover')}
          />
        );
      return (
        <ActivityScreen
          onBack={() => setRoute('dashboard')}
          onOpenReceipt={() => setRoute('order-detail')}
          onWriteReview={() => setRoute('reviews')}
          onOpenOrders={() => setRoute('orders')}
          onOpenService={() => setRoute('service-detail')}
          onBrowse={() => setRoute('discover')}
        />
      );

    case 'business-onboarding': {
      // A signed-in consumer starting business setup first chooses whether to
      // reuse the existing (intact) consumer account or register a fresh,
      // separate business identity. Reusing skips the marketing intro and
      // lands directly on "Tell us about your business".
      const showAccountChoice = authed && !businessSetupSkipIntro && !hasBusinessSetupSnapshot();
      const leaveOnboarding = () => {
        setBusinessSetupSkipIntro(false);
        const destination = authed
          ? (businessOnboardingFrom && businessOnboardingFrom !== 'business-onboarding'
              ? businessOnboardingFrom
              : (isDesktop ? 'dashboard' : 'account'))
          : 'start-vemtap';
        setRoute(destination);
      };
      const finishOnboarding = () => {
        setBusinessSetupSkipIntro(false);
        setBusinessSetupVerificationState('in-progress');
        setRoute('business-verification');
      };
      const openVerification = () => {
        setBusinessSetupVerificationState('in-progress');
        setRoute('business-verification');
      };
      const useNewAccount = () => {
        // BUG-028: normal registration flow with a fresh Google / email
        // identity — never silently linked to the existing consumer account.
        setBusinessSetupSkipIntro(false);
        setRoute('sign-in');
      };

      if (showAccountChoice) {
        return isDesktop ? (
          <DesktopBusinessAccountChoiceScreen
            onBack={leaveOnboarding}
            onContinueWithAccount={() => setBusinessSetupSkipIntro(true)}
            onUseNewAccount={useNewAccount}
          />
        ) : (
          <BusinessAccountChoiceScreen
            onBack={leaveOnboarding}
            onContinueWithAccount={() => setBusinessSetupSkipIntro(true)}
            onUseNewAccount={useNewAccount}
          />
        );
      }

      return (
        <>
          {isDesktop ? (
            <DesktopBusinessOnboardingScreen
              initialStep={businessSetupSkipIntro ? 'basic' : 'intro'}
              onBack={() => {
                if (businessSetupSkipIntro) {
                  setBusinessSetupSkipIntro(false);
                } else {
                  leaveOnboarding();
                }
              }}
              onOpenVerification={openVerification}
              onComplete={finishOnboarding}
            />
          ) : (
            <BusinessOnboardingScreen
              initialStep={businessSetupSkipIntro ? 'basic' : 'intro'}
              onBack={() => {
                if (businessSetupSkipIntro) {
                  setBusinessSetupSkipIntro(false);
                } else {
                  leaveOnboarding();
                }
              }}
              onOpenVerification={openVerification}
              onComplete={finishOnboarding}
            />
          )}
        </>
      );
    }

    case 'business-verification': {
      // If onboarding is mid-flight, verification is the third setup section:
      // keep the tracker visible, let Back return to setup (progress preserved),
      // and only clear saved progress once verification is truly finished.
      const setupSnapshot = getBusinessSetupSnapshot();
      const backFromVerification = () => setRoute(setupSnapshot ? 'business-onboarding' : 'home');
      const finishVerification = () => {
        setBusinessSetupVerificationState('complete');
        // Summarise the completed business onboarding on the welcome screen
        // (readiness checklist + refer-others) before the dashboard.
        setWelcomeBusiness({
          profileCompleted: true,
          offeringsCompleted: true,
          verificationState: 'complete',
        });
        setWelcomeAudience('business');
        clearBusinessSetupSnapshot();
        setRoute('onboarding-welcome');
      };
      const verificationNav: BusinessSetupNavValue | null = setupSnapshot
        ? {
            activeSection: 'verification',
            profileCompleted: true,
            offeringsCompleted: true,
            verificationState: setupSnapshot.verificationState,
            onSelectSection: (id) => {
              if (id !== 'verification') setRoute('business-onboarding');
            },
          }
        : null;
      const screen = isDesktop ? (
        <DesktopBusinessVerificationScreen
          onBack={backFromVerification}
          onComplete={finishVerification}
          onActivate={() => setRoute('subscription')}
          onPreviewStorefront={() => setRoute('storefront')}
          onConfigureStorefront={() => setRoute('storefront')}
          onCreateDeal={() => setRoute('deals')}
          onQrStands={() => setRoute('business-overview')}
        />
      ) : (
        <BusinessVerificationScreen
          onBack={backFromVerification}
          onComplete={finishVerification}
          onActivate={() => setRoute('subscription')}
          onPreviewStorefront={() => setRoute('storefront')}
        />
      );
      return <BusinessSetupNavContext.Provider value={verificationNav}>{screen}</BusinessSetupNavContext.Provider>;
    }

    case 'verification-status':
      if (isDesktop)
        return (
          <DesktopVerificationStatusCenterScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('business-overview')}
            onUpdateInfo={() => setRoute('business-verification')}
          />
        );
      return (
        <VerificationStatusCenterScreen
          onBack={() => setRoute('business-overview')}
          onUpdateInfo={() => setRoute('business-verification')}
        />
      );

    case 'subscription':
      if (isDesktop)
        return (
          <DesktopSubscriptionScreen
            initialStep="overview"
            onExit={() => setRoute('cluster-onboarding')}
            onViewBusiness={() => setRoute('storefront')}
            onBoost={() => setRoute('boost')}
          />
        );
      return (
        <SubscriptionScreen
          initialStep="overview"
          onExit={() => setRoute('cluster-onboarding')}
          onViewBusiness={() => setRoute('storefront')}
          onBoost={() => setRoute('boost')}
        />
      );

    case 'subscription-ending':
      if (isDesktop)
        return (
          <DesktopSubscriptionScreen
            initialStep="trialEnding"
            onExit={() => setRoute('business-overview')}
            onViewBusiness={() => setRoute('storefront')}
            onBoost={() => setRoute('boost')}
          />
        );
      return (
        <SubscriptionScreen
          initialStep="trialEnding"
          onExit={() => setRoute('business-overview')}
          onViewBusiness={() => setRoute('storefront')}
          onBoost={() => setRoute('boost')}
        />
      );

    case 'subscription-expired':
      if (isDesktop)
        return (
          <DesktopSubscriptionScreen
            initialStep="trialExpired"
            onExit={() => setRoute('business-overview')}
            onViewBusiness={() => setRoute('storefront')}
            onBoost={() => setRoute('boost')}
          />
        );
      return (
        <SubscriptionScreen
          initialStep="trialExpired"
          onExit={() => setRoute('business-overview')}
          onViewBusiness={() => setRoute('storefront')}
          onBoost={() => setRoute('boost')}
        />
      );

    case 'boost':
      if (isDesktop)
        return (
          <DesktopSubscriptionScreen
            initialStep="boost"
            onExit={() => setRoute(boostReturnRoute)}
            onViewBusiness={() => setRoute('storefront')}
            onBoost={() => setRoute('boost')}
            boostOnBack={() => setRoute(boostReturnRoute)}
            boostItem={boostItem}
          />
        );
      return (
        <SubscriptionScreen
          initialStep="boost"
          onExit={() => setRoute(boostReturnRoute)}
          onViewBusiness={() => setRoute('storefront')}
          onBoost={() => setRoute('boost')}
          boostOnBack={() => setRoute(boostReturnRoute)}
          boostItem={boostItem}
        />
      );

    case 'boost-hub':
      if (isDesktop)
        return (
          <DesktopBoostHubScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('business-more')}
            onTab={boostTab}
            onBoost={(item) => openBoost(item)}
            onOpenMetrics={() => setRoute('boost-metrics')}
            onOpenSegments={() => setRoute('segments-hub')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessBoostHubScreen
            onBack={() => setRoute('business-more')}
            onTab={boostTab}
            onBoost={(item) => openBoost(item)}
            onOpenMetrics={() => setRoute('boost-metrics')}
            onOpenSegments={() => setRoute('segments-hub')}
          />
        </div>
      );

    case 'boost-studio':
      // Boost Studio lives at /boost-hub/studio — inside the business dashboard
      // with the side menu still on screen (not the onboarding shell). The only
      // purchasable placement today is the Cluster Campaign, so the studio runs
      // the same unified campaign flow as /business/cluster/boost.
      if (isDesktop)
        return (
          <ClusterBoostFlow
            chrome="portal"
            onNav={businessPortalNav}
            desktopNav="more-marketing"
            onBack={() => setRoute(boostReturnRoute)}
            onDone={() => setRoute('boost-hub')}
            onOpenWallet={() => setRoute('boost-wallet')}
            preselectedItemId={boostItem ?? null}
          />
        );
      return (
        <div className="biz-flow">
          <ClusterBoostFlow
            chrome="portal"
            onBack={() => setRoute(boostReturnRoute)}
            onDone={() => setRoute('boost-hub')}
            onOpenWallet={() => setRoute('boost-wallet')}
            preselectedItemId={boostItem ?? null}
          />
        </div>
      );

    case 'boost-metrics':
      if (isDesktop)
        return <DesktopBoostMetricsScreen onNav={businessPortalNav} onBack={() => setRoute('boost-hub')} onTab={boostTab} />;
      return (
        <div className="biz-flow">
          <BusinessBoostMetricsScreen onBack={() => setRoute('boost-hub')} onTab={boostTab} />
        </div>
      );

    case 'boost-wallet':
      if (isDesktop)
        return <DesktopBoostWalletScreen onNav={businessPortalNav} onBack={() => setRoute('boost-hub')} onTab={boostTab} />;
      return (
        <div className="biz-flow">
          <BusinessBoostWalletScreen onBack={() => setRoute('boost-hub')} onTab={boostTab} />
        </div>
      );

    case 'segments-hub':
      if (isDesktop)
        return (
          <DesktopSegmentsHubScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('boost-hub')}
            onOpenBoost={() => openBoost()}
            onOpenCampaigns={() => setRoute('boost-hub')}
            onCreate={() => setRoute('segment-create')}
            onUseSegment={useSegment}
            onViewCohort={() => setRoute('segment-detail')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSegmentsHubScreen
            onBack={() => setRoute('boost-hub')}
            onOpenBoost={() => openBoost()}
            onOpenCampaigns={() => setRoute('boost-hub')}
            onCreate={() => setRoute('segment-create')}
            onUseSegment={useSegment}
            onViewCohort={() => setRoute('segment-detail')}
          />
        </div>
      );

    case 'segment-actions':
      if (isDesktop)
        return (
          <DesktopSegmentActionsScreen
            onNav={businessPortalNav}
            segment={activeSegment}
            onBack={() => setRoute('segments-hub')}
            onLaunchCampaign={() => openBoost()}
            onOpenMessages={() => setRoute('messages')}
            onOpenDeals={() => setRoute('hub-deals')}
            onOpenCrm={() => setRoute('hub-customers')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSegmentActionsScreen
            segment={activeSegment}
            onBack={() => setRoute('segments-hub')}
            onLaunchCampaign={() => openBoost()}
            onOpenMessages={() => setRoute('messages')}
            onOpenDeals={() => setRoute('hub-deals')}
            onOpenCrm={() => setRoute('hub-customers')}
          />
        </div>
      );

    case 'segment-create':
      if (isDesktop)
        return (
          <DesktopSegmentCreateScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('segments-hub')}
            onSaved={() => setRoute('segments-hub')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSegmentCreateScreen onBack={() => setRoute('segments-hub')} onSaved={() => setRoute('segments-hub')} />
        </div>
      );

    case 'segment-detail':
      if (isDesktop)
        return (
          <DesktopSegmentDetailScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('segments-hub')}
            onUseSegment={useSegment}
            onEditRules={() => setRoute('segment-create')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSegmentDetailScreen
            onBack={() => setRoute('segments-hub')}
            onUseSegment={useSegment}
            onEditRules={() => setRoute('segment-create')}
          />
        </div>
      );

    case 'business-add-ons':
      // Dashboard add-ons & credits — for an existing account, inside the business
      // portal chrome. The onboarding add-ons flow (route 'subscription', step
      // 'addons') remains for the setup journey only.
      if (isDesktop) return <DesktopMoreAddOnsScreen onNav={businessPortalNav} />;
      return (
        <SubscriptionScreen
          initialStep="addons"
          onExit={() => setRoute('business-overview')}
          onViewBusiness={() => setRoute('storefront')}
          onBoost={() => setRoute('boost')}
        />
      );

    case 'business-notifications':
      // Dashboard notifications — account-holder feed inside the business
      // portal (the consumer route 'notifications' keeps its own chrome).
      if (isDesktop) return <DesktopBusinessNotificationsScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <NotificationsScreen
            onBack={() => setRoute('business-more')}
            onOpenPass={() => {
              setClaimedFrom('business-notifications');
              setRoute('claimed-deal');
            }}
            onOpenBooking={() => setRoute('booking-detail')}
            onOpenGift={() => {
              setClaimedFrom('business-notifications');
              setRoute('claimed-deal');
            }}
            onOpenRewards={() => setRoute('rewards')}
            onBrowseDeals={() => setRoute('discover')}
            onOpenPreferences={() => setRoute('preferences')}
          />
        </div>
      );

    case 'business-support':
      // Dashboard Help & Support — merchant help inside the portal, not the
      // public consumer help centre (routes 'help' / 'support').
      if (isDesktop) return <DesktopBusinessHelpSupportScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <HelpCentreScreen
            onBack={() => setRoute('business-more')}
            onStartChat={() => setRoute('support')}
            onOpenMerchant={() => setRoute('business-onboarding')}
            onOpenTerms={() => setRoute('terms')}
          />
        </div>
      );

    case 'business-settings':
      // Business Settings for an existing account — NDPR data rights,
      // transaction PIN change, account deletion, security & preferences.
      if (isDesktop)
        return (
          <DesktopBusinessSettingsScreen
            onNav={businessPortalNav}
            onSignOut={() => {
              signOut();
              setRoute('welcome');
            }}
          />
        );
      return (
        <div className="biz-flow">
          <AccountSettingsScreen
            onBack={() => setRoute('business-more')}
            onOpenPrivacy={() => setRoute('privacy')}
            onOpenTerms={() => setRoute('terms')}
            onSignOut={() => {
              signOut();
              setRoute('welcome');
            }}
          />
        </div>
      );

    case 'business-subscription':
      // Dashboard subscription & billing — for an existing account, inside the
      // business portal chrome (not the onboarding SubscriptionChrome).
      if (isDesktop) return <DesktopMoreSubscriptionScreen onNav={businessPortalNav} />;
      return (
        <SubscriptionScreen
          initialStep="overview"
          onExit={() => setRoute('business-overview')}
          onViewBusiness={() => setRoute('storefront')}
          onBoost={() => setRoute('boost')}
        />
      );

    case 'business-overview':
      if (isDesktop)
        return (
          <DesktopBusinessOverviewScreen
            onNav={businessPortalNav}
            onSubscribe={() => setRoute('business-subscription')}
            onBoost={() => openBoost()}
            onAddOns={() => setRoute('business-add-ons')}
            onOpenOrders={() => setRoute('business-orders')}
            onOpenBookings={() => setRoute('business-bookings')}
            onOpenMessages={() => setRoute('business-messages')}
          />
        );
      return (
        <BusinessOverviewScreen
          onTab={businessTab}
          onSubscribe={() => setRoute('subscription')}
          onBoost={() => openBoost()}
          onAddOns={() => setRoute('business-add-ons')}
          onOpenOrders={() => setRoute('business-orders')}
          onOpenBookings={() => setRoute('business-bookings')}
          onOpenMessages={() => setRoute('business-messages')}
          onOpenPosMenu={() => setRoute('business-pos-menu')}
        />
      );

    case 'business-pos-menu':
      // Mobile-only POS menu page (POS overview quick action). Desktop uses the
      // POS rail instead — fall back to the POS overview if reached there.
      if (isDesktop) return <DesktopBusinessOverviewScreen onNav={businessPortalNav} onSubscribe={() => setRoute('business-subscription')} onBoost={() => openBoost()} onAddOns={() => setRoute('business-add-ons')} onOpenOrders={() => setRoute('business-orders')} onOpenBookings={() => setRoute('business-bookings')} onOpenMessages={() => setRoute('business-messages')} />;
      return (
        <BusinessPosMenuScreen
          onOpenPage={(key) => businessPortalNav(key)}
          onBack={() => setRoute('business-overview')}
          onTab={businessTab}
        />
      );

    case 'business-branch-pricing':
      if (isDesktop)
        return (
          <DesktopBusinessBranchPricingScreen
            onNav={businessPortalNav}
            onBackToCatalog={() => setRoute('hub-catalog')}
          />
        );
      return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'business-hub':
      if (isDesktop)
        return (
          <DesktopBusinessHubScreen
            onNav={businessPortalNav}
            onBoost={(item) => openBoost(item)}
            onPreviewStorefront={() => setRoute('storefront')}
            onOpenModule={openHubModule}
          />
        );
      return (
        <BusinessHubScreen
          initialStep="hub"
          onTab={businessTab}
          onBoost={(item) => openBoost(item)}
          onOpenMessages={() => setRoute('business-messages')}
          onPreviewStorefront={() => setRoute('storefront')}
          onOpenModule={openHubModule}
        />
      );

    case 'hub-locations':
      if (isDesktop)
        return (
          <DesktopBusinessLocationsHubScreen
            onNav={businessPortalNav}
            onAddBranch={() => setRoute('business-onboarding')}
            onOpenBranch={() => setRoute('hub-branch-detail')}
          />
        );
      return <BusinessHubScreen initialStep="locations" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'hub-branch-detail':
      if (isDesktop)
        return (
          <DesktopBranchDetailScreen
            onNav={businessPortalNav}
            onBackToLocations={() => setRoute('hub-locations')}
          />
        );
      return <BusinessHubScreen initialStep="locations" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'hub-catalog':
      if (isDesktop)
        return (
          <DesktopBusinessCatalogHubScreen
            onNav={businessPortalNav}
            onOpenBranchPricing={() => setRoute('business-branch-pricing')}
            onOpenServices={() => setRoute('hub-services')}
          />
        );
      return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'hub-services':
      if (isDesktop)
        return (
          <DesktopServicesCategoriesScreen
            onNav={businessPortalNav}
            onBackToCatalog={() => setRoute('hub-catalog')}
          />
        );
      return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'hub-deals':
      if (isDesktop)
        return (
          <DesktopDealsWorkspaceScreen
            onNav={businessPortalNav}
            onCreateDeal={() => setRoute('deal-studio')}
            onEditDeal={() => setRoute('deal-location-pricing')}
            onOpenDealDetail={() => setRoute('hub-deal-detail')}
            onOpenLogs={() => setRoute('analytics-deals')}
            onOpenPos={() => setRoute('business-pos-orders')}
            onBoost={(dealName) => openBoost(dealName)}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'deal-studio':
      if (isDesktop)
        return (
          <DesktopDealStudioFlow
            onComplete={() => setRoute('hub-deals')}
            onExit={() => setRoute('hub-deals')}
            onNav={businessPortalNav}
          />
        );
      return (
        <BusinessDealStudioFlow onComplete={() => setRoute('hub-deals')} onExit={() => setRoute('hub-deals')} />
      );

    case 'hub-customers':
      if (isDesktop)
        return (
          <DesktopBusinessCustomersScreen
            onNav={businessPortalNav}
            onViewProfile={(name) => {
              setHubCustomerName(name);
              setRoute('hub-customer-profile');
            }}
            onPreviewInvite={(url) => {
              window.history.pushState(null, '', url);
              setRoute('customer-invite-join');
            }}
          />
        );
      return (
        <BusinessHubScreen
          initialStep="customers"
          onTab={businessTab}
          onBoost={(item) => openBoost(item)}
          onOpenMessages={() => setRoute('business-messages')}
          onPreviewStorefront={() => setRoute('storefront')}
          onOpenModule={openHubModule}
          onViewCustomerProfile={(name) => {
            setHubCustomerName(name);
            setRoute('hub-customer-profile');
          }}
          onOpenAnalytics={() => setRoute('analytics-customers')}
          onPreviewInvite={(url) => {
            window.history.pushState(null, '', url);
            setRoute('customer-invite-join');
          }}
        />
      );

    case 'customer-invite-join': {
      // Public invite page: /join/{business-slug}?invite=TOKEN — no auth guard.
      const inviteSlug = decodeURIComponent(window.location.pathname.split('/')[2] ?? '');
      const inviteToken = new URLSearchParams(window.location.search).get('invite');
      return <CustomerInviteJoinScreen businessSlug={inviteSlug} inviteToken={inviteToken} />;
    }

    case 'hub-profile':
      if (isDesktop)
        return (
          <DesktopBusinessProfilePreviewStudioScreen
            onNav={businessPortalNav}
            onPreviewStorefront={() => setRoute('storefront')}
          />
        );
      return <BusinessHubScreen initialStep="profile" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'deal-location-pricing':
      if (isDesktop)
        return (
          <DesktopDealLocationPricingScreen
            onNav={businessPortalNav}
            onCancel={() => setRoute('hub-deals')}
            onSave={() => setRoute('hub-deals')}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'deal-create-locations':
      if (isDesktop)
        return (
          <DesktopDealCreateLocationsScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('hub-deals')}
            onReview={() => setRoute('hub-deal-detail')}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'business-profile-studio':
      if (isDesktop)
        return (
          <DesktopBusinessProfileStorefrontScreen
            onNav={businessPortalNav}
            onDiscard={() => setRoute('business-overview')}
          />
        );
      return <BusinessHubScreen initialStep="profile" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'hub-deal-detail':
      if (isDesktop)
        return (
          <DesktopDealAnalyticsScreen
            onNav={businessPortalNav}
            onEditPricing={() => setRoute('deal-location-pricing')}
            onConfigureCap={() => setRoute('deal-location-pricing')}
            onChat={() => setRoute('business-messages')}
            onBoost={() => openBoost('Weekend Prime Lunch Combo')}
            onEditDeal={() => setRoute('deal-studio')}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('storefront')} onOpenModule={openHubModule} />;

    case 'hub-customer-profile':
      if (isDesktop)
        return <DesktopCustomerProfileScreen onNav={businessPortalNav} onBack={() => setRoute('hub-customers')} />;
      return (
        <BusinessHubScreen
          initialStep="customerProfile"
          initialCustomer={hubCustomerName}
          onTab={businessTab}
          onBoost={(item) => openBoost(item)}
          onOpenMessages={() => setRoute('business-messages')}
          onPreviewStorefront={() => setRoute('storefront')}
          onOpenModule={openHubModule}
          onViewCustomerProfile={(name) => setHubCustomerName(name)}
          onBackCustomerProfile={() => setRoute('hub-customers')}
        />
      );

    case 'hub-staff':
      if (isDesktop)
        return <DesktopStaffDirectoryScreen onNav={businessPortalNav} onInvite={() => setRoute('hub-staff-invite')} />;
      return <BusinessStaffScreen onTab={businessTab} onInvite={() => setRoute('hub-staff-invite')} />;

    case 'hub-staff-invite':
      if (isDesktop)
        return (
          <DesktopStaffInviteScreen onNav={businessPortalNav} onBack={() => setRoute('hub-staff')} />
        );
      return (
        <>
          <div aria-hidden="true" className="pointer-events-none">
            <BusinessStaffScreen onTab={businessTab} onInvite={() => undefined} />
          </div>
          <div className="biz-flow">
            <BusinessInviteStaffScreen onBack={() => setRoute('hub-staff')} />
          </div>
        </>
      );

    case 'hub-loyalty':
      if (isDesktop)
        return (
          <DesktopLoyaltyProgrammeScreen
            onNav={businessPortalNav}
            onOpenRewards={() => setRoute('hub-loyalty-rewards')}
          />
        );
      return <BusinessLoyaltyScreen onTab={businessTab} onOpenRewards={() => setRoute('hub-loyalty-rewards')} />;

    case 'hub-loyalty-rewards':
      if (isDesktop)
        return (
          <DesktopLoyaltyRewardsScreen
            onNav={businessPortalNav}
            onOpenProgramme={() => setRoute('hub-loyalty')}
          />
        );
      return <BusinessLoyaltyRewardsScreen onBack={() => setRoute('hub-loyalty')} />;

    case 'analytics-overview':
      if (isDesktop) return <DesktopAnalyticsBusinessScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <BusinessAnalyticsScreen
            initialTab="overview"
            onExit={() => setRoute('business-hub')}
            onNavigate={(target) => setRoute(target === 'overview' ? 'analytics-overview' : target === 'audience' ? 'analytics-audience' : 'analytics-branches')}
          />
        </div>
      );

    case 'analytics-audience':
      if (isDesktop) return <DesktopAnalyticsCustomersScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <BusinessAnalyticsScreen
            initialTab="audience"
            onExit={() => setRoute('hub-customers')}
            onNavigate={(target) => setRoute(target === 'overview' ? 'analytics-overview' : target === 'audience' ? 'analytics-audience' : 'analytics-branches')}
          />
        </div>
      );

    case 'analytics-branches':
      if (isDesktop) return <DesktopAnalyticsLocationsScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <BusinessBranchComparisonScreen onBack={() => setRoute('analytics-overview')} />
        </div>
      );

    case 'analytics-business':
      if (isDesktop) return <DesktopAnalyticsBusinessScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <AnalyticsBusinessScreen
            onAnalyticsTab={goToAnalyticsTab}
            onOpenFilter={() => setRoute('analytics-filter')}
            onOpenExport={() => setRoute('analytics-export')}
            onTab={businessTab}
          />
        </div>
      );

    case 'analytics-customers':
      if (isDesktop) return <DesktopAnalyticsCustomersScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <AnalyticsCustomersScreen
            onAnalyticsTab={goToAnalyticsTab}
            onOpenFilter={() => setRoute('analytics-filter')}
            onOpenExport={() => setRoute('analytics-export')}
            onTab={businessTab}
          />
        </div>
      );

    case 'analytics-deals':
      if (isDesktop)
        return (
          <DesktopAnalyticsDealsScreen
            onNav={businessPortalNav}
            onAnalyticsTab={goToAnalyticsTab}
            onOpenFilter={() => setRoute('analytics-filter')}
            onOpenExport={() => setRoute('analytics-export')}
            onManageDeals={() => setRoute('hub-deals')}
          />
        );
      return (
        <div className="biz-flow">
          <AnalyticsDealsScreen
            onAnalyticsTab={goToAnalyticsTab}
            onOpenFilter={() => setRoute('analytics-filter')}
            onOpenExport={() => setRoute('analytics-export')}
            onTab={businessTab}
            onManageDeals={() => setRoute('hub-deals')}
          />
        </div>
      );

    case 'analytics-locations':
      if (isDesktop) return <DesktopAnalyticsLocationsScreen onNav={businessPortalNav} />;
      return (
        <div className="biz-flow">
          <AnalyticsLocationsScreen
            onAnalyticsTab={goToAnalyticsTab}
            onOpenFilter={() => setRoute('analytics-filter')}
            onOpenExport={() => setRoute('analytics-export')}
            onTab={businessTab}
            onManageLocations={() => setRoute('hub-locations')}
          />
        </div>
      );

    case 'analytics-pos':
      if (isDesktop)
        return (
          <DesktopAnalyticsPosScreen
            onNav={businessPortalNav}
            onAnalyticsTab={goToAnalyticsTab}
            onOpenFilter={() => setRoute('analytics-filter')}
            onOpenExport={() => setRoute('analytics-export')}
            onOpenCatalog={() => setRoute('hub-catalog')}
            onOpenSync={() => setRoute('pos-register')}
          />
        );
      return (
        <div className="biz-flow">
          <AnalyticsPosScreen
            onAnalyticsTab={goToAnalyticsTab}
            onOpenFilter={() => setRoute('analytics-filter')}
            onOpenExport={() => setRoute('analytics-export')}
            onTab={businessTab}
            onOpenCatalog={() => setRoute('hub-catalog')}
            onOpenSync={() => setRoute('pos-register')}
          />
        </div>
      );

    case 'analytics-export':
      if (isDesktop) return <DesktopAnalyticsExportScreen onNav={businessPortalNav} onBack={goBackToPrevious} />;
      return (
        <div className="biz-flow">
          <AnalyticsExportScreen onBack={goBackToPrevious} />
        </div>
      );

    case 'analytics-filter':
      if (isDesktop) return <DesktopAnalyticsFilterScreen onNav={businessPortalNav} onBack={goBackToPrevious} />;
      return (
        <div className="biz-flow">
          <AnalyticsFilterScreen onBack={goBackToPrevious} />
        </div>
      );

    case 'pos-display-order':
      if (isDesktop) return <DesktopPosDisplayOrderScreen />;
      return (
        <div className="biz-flow">
          <BusinessPosDisplayOrderScreen
            onBack={() => setRoute('business-pos-orders')}
            onProceed={() => setRoute('pos-display-tip')}
            onSplit={() => setRoute('pos-split-bill')}
          />
        </div>
      );

    case 'pos-display-tip':
      if (isDesktop)
        return <DesktopPosDisplayTipScreen onProceed={() => setRoute('pos-display-pay')} />;
      return (
        <div className="biz-flow">
          <BusinessPosDisplayTipScreen onBack={() => setRoute('pos-display-order')} onProceed={() => setRoute('pos-display-pay')} />
        </div>
      );

    case 'pos-display-pay':
      if (isDesktop) return <DesktopPosDisplayPayScreen onSplit={() => setRoute('pos-split-bill')} />;
      return (
        <div className="biz-flow">
          <BusinessPosDisplayPayScreen
            onBack={() => setRoute('pos-display-tip')}
            onSplit={() => setRoute('pos-split-bill')}
            onPaid={() => setRoute('pos-display-receipt')}
          />
        </div>
      );

    case 'pos-split-bill':
      if (isDesktop)
        return (
          <DesktopSplitBillScreen
            cart={posTermCart}
            onBack={() => setRoute('pos-register')}
            onPay={() => setRoute('pos-payment')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSplitBillScreen onBack={goBackToPrevious} onPay={() => setRoute('pos-display-pay')} />
        </div>
      );

    case 'pos-display-receipt':
      if (isDesktop) return <DesktopPosDisplayReceiptScreen onDone={() => setRoute('pos-order-lookup')} />;
      return (
        <div className="biz-flow">
          <BusinessPosDisplayReceiptScreen onBack={goBackToPrevious} onDone={() => setRoute('business-pos-orders')} />
        </div>
      );

    case 'pos-home':
      if (isDesktop)
        return (
          <DesktopPosHomeScreen
            onNav={posTerminalNav}
            onNewSale={() => setRoute('pos-register')}
            onOpenLedger={() => setRoute('pos-ledger')}
            onOpenProducts={() => setRoute('pos-stock')}
            onOpenCustomers={() => setRoute('pos-customers-lookup')}
            onOpenKitchen={() => setRoute('pos-kitchen')}
            onOpenOrderLookup={() => setRoute('pos-order-lookup')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosHomeScreen
            onNewSale={() => setRoute('pos-register')}
            onOpenOrders={() => setRoute('business-pos-orders')}
            onOpenLedger={() => setRoute('pos-ledger')}
            onOpenCustomers={() => setRoute('pos-customers-lookup')}
            onOpenProducts={() => setRoute('pos-stock')}
            onSwitchTill={() => setRoute('pos-switch')}
            onOpenDisplay={() => setRoute('pos-display-order')}
            onNavMore={() => setRoute('business-more')}
            onOpenQueue={() => setRoute('pos-buffer')}
            onOpenSync={() => setRoute('pos-register')}
            onOpenSettings={() => setRoute('pos-settings')}
            onOpenKitchen={() => setRoute('pos-kitchen')}
            onOpenOrderLookup={() => setRoute('pos-order-lookup')}
          />
        </div>
      );

    case 'pos-home-offline':
      if (isDesktop)
        return (
          <DesktopPosHomeScreen
            onNav={posTerminalNav}
            onNewSale={() => setRoute('pos-offline')}
            onOpenLedger={() => setRoute('pos-ledger')}
            onOpenProducts={() => setRoute('pos-stock')}
            onOpenCustomers={() => setRoute('pos-customers-lookup')}
            onOpenKitchen={() => setRoute('pos-kitchen')}
            onOpenOrderLookup={() => setRoute('pos-order-lookup')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosHomeScreen
            initialOffline
            onNewSale={() => setRoute('pos-offline')}
            onOpenOrders={() => setRoute('business-pos-orders')}
            onOpenLedger={() => setRoute('pos-ledger')}
            onOpenCustomers={() => setRoute('pos-customers-lookup')}
            onOpenProducts={() => setRoute('pos-stock')}
            onSwitchTill={() => setRoute('pos-switch')}
            onOpenDisplay={() => setRoute('pos-display-order')}
            onNavMore={() => setRoute('business-more')}
            onOpenQueue={() => setRoute('pos-buffer')}
            onOpenSync={() => setRoute('pos-register')}
            onOpenSettings={() => setRoute('pos-settings')}
            onOpenKitchen={() => setRoute('pos-kitchen')}
          />
        </div>
      );

    case 'pos-register':
      if (isDesktop)
        return (
          <DesktopPosRegisterScreen
            onNav={posTerminalNav}
            cart={posTermCart}
            onCartChange={setPosTermCart}
            customer={posCustomerRecord}
            onCustomerChange={(record) => {
              setPosCustomerRecord(record);
              setPosCustomer(record ? record.name : null);
            }}
            onCharge={() => setRoute('pos-payment')}
            onSplit={() => setRoute('pos-split-bill')}
            onOpenCustomer={() => setRoute('pos-customer')}
            onOpenOrders={() => setRoute('pos-order-lookup')}
            onHelp={() => setRoute('business-support')}
            onAwardPoints={(points) => {
              setPosCustomerRecord((record) => (record ? { ...record, points: record.points + points } : record));
            }}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosRegisterScreen
            cart={posCart}
            onCartChange={setPosCart}
            onBack={() => setRoute('pos-home')}
            onCharge={() => setRoute('pos-cart')}
            onOpenCustomer={() => setRoute('pos-customer')}
            onOpenOrders={() => setRoute('pos-order-lookup')}
          />
        </div>
      );

    case 'pos-cart':
      if (isDesktop)
        return (
          <DesktopPosCartScreen
            onNav={posTerminalNav}
            cart={posTermCart}
            onCartChange={setPosTermCart}
            customer={posCustomer}
            onBack={() => setRoute('pos-register')}
            onCharge={() => setRoute('pos-payment')}
            onOpenCustomer={() => setRoute('pos-customer')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosCartScreen
            cart={posCart}
            onCartChange={setPosCart}
            customer={posCustomer}
            customerBonus={posCustomerBonus}
            onBack={() => setRoute('pos-register')}
            onCharge={() => setRoute('pos-payment')}
            onOpenCustomer={() => setRoute('pos-customer')}
            onRemoveCustomer={() => {
              setPosCustomer(null);
              setPosCustomerBonus(0);
            }}
          />
        </div>
      );

    case 'pos-switch':
      if (isDesktop)
        return (
          <DesktopPosSwitchScreen onNav={posTerminalNav} onBack={goBackToPrevious} onConfirm={() => setRoute('pos-home')} />
        );
      return (
        <div className="biz-flow">
          <BusinessPosSwitchScreen onBack={goBackToPrevious} onConfirm={() => setRoute('pos-home')} />
        </div>
      );

    case 'pos-customer':
      if (isDesktop)
        return (
          <DesktopPosCustomerScreen
            onNav={posTerminalNav}
            onBack={goBackToPrevious}
            onAttach={(name) => {
              setPosCustomer(name);
              setRoute('pos-cart');
            }}
            onRegisterNew={() => setRoute('hub-customers')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosCustomerScreen
            onBack={goBackToPrevious}
            onAttach={(name) => {
              setPosCustomer(name);
              setPosCustomerBonus(0);
              setRoute('pos-cart');
            }}
            onRegisterNew={() => setRoute('hub-customers')}
          />
        </div>
      );

    case 'pos-sale-complete':
      if (isDesktop)
        return (
          <DesktopPosSaleCompleteScreen
            onNav={posTerminalNav}
            cart={posTermCart}
            customer={posCustomer}
            awardedPoints={posSalePoints}
            onNewSale={() => {
              setPosTermCart([]);
              setPosCustomer(null);
              setRoute('pos-register');
            }}
            onOpenOrders={() => setRoute('pos-order-lookup')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosSaleCompleteScreen
            cart={posCart}
            customer={posCustomer}
            awardedPoints={posSalePoints}
            onBack={() => setRoute('pos-home')}
            onNewSale={() => {
              setPosCart([]);
              setPosCustomer(null);
              setPosCustomerBonus(0);
              setRoute('pos-register');
            }}
          />
        </div>
      );

    case 'pos-payment':
      if (isDesktop)
        return (
          <DesktopPosPaymentScreen
            onNav={posTerminalNav}
            cart={posTermCart}
            customer={posCustomerRecord}
            onCustomerChange={(record) => {
              setPosCustomerRecord(record);
              setPosCustomer(record ? record.name : null);
            }}
            onBack={() => setRoute('pos-register')}
            onComplete={(points) => {
              queuePosSaleIfOffline(posTermCart, 'Card / POS');
              setPosSalePoints(points);
              setRoute('pos-sale-complete');
            }}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosPaymentScreen
            cart={posCart}
            customer={posCustomer}
            customerBonus={posCustomerBonus}
            onAwardPoints={(points) => setPosCustomerBonus((prev) => prev + points)}
            onBack={() => setRoute('pos-cart')}
            onReceipt={(points) => {
              queuePosSaleIfOffline(
                posCart.map((line) => ({ name: line.name, qty: line.qty, unit: line.unit })),
                'Card / POS',
              );
              setPosSalePoints(points);
              setRoute('pos-sale-complete');
            }}
            onNewSale={() => {
              setPosCart([]);
              setPosCustomer(null);
              setPosCustomerBonus(0);
              setRoute('pos-register');
            }}
          />
        </div>
      );

    case 'pos-product-shift':
      if (isDesktop)
        return (
          <DesktopPosProductShiftScreen
            onNav={posTerminalNav}
            onBack={goBackToPrevious}
            onAddToSale={() => {
              setPosTermCart((prev) => {
                const id = 'ribeye-400g';
                const existing = prev.find((line) => line.id === id);
                if (existing) return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line));
                return [
                  ...prev,
                  { id, name: 'Woodfire Aged Ribeye Steak (400g)', mods: 'Grills Station • Made to order', unit: 14000, qty: 1 },
                ];
              });
              setRoute('pos-register');
            }}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosProductShiftScreen
            onBack={goBackToPrevious}
            onAddToSale={() => {
              setPosCart((prev) => {
                const id = 'woodfire-ribeye-400g';
                const existing = prev.find((line) => line.id === id);
                if (existing) return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line));
                return [...prev, { id, name: 'Woodfire Aged Ribeye Steak', unit: 14000, member: 14000, qty: 1 }];
              });
              setRoute('pos-register');
            }}
          />
        </div>
      );

    case 'pos-stock':
      if (isDesktop)
        return (
          <DesktopPosStockScreen
            onNav={posTerminalNav}
            onOpenProduct={() => setRoute('pos-product-shift')}
            onOpenCatalogue={() => setRoute('hub-catalog')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosStockScreen
            onNav={posTab}
            onOpenProduct={() => setRoute('pos-product-shift')}
            onOpenCatalogue={() => setRoute('hub-catalog')}
          />
        </div>
      );

    case 'pos-ledger':
      if (isDesktop)
        return <DesktopPosLedgerScreen onNav={posTerminalNav} onOpenOrder={() => setRoute('pos-txn-detail')} />;
      return (
        <div className="biz-flow">
          <BusinessPosLedgerScreen onNav={posTab} onOpenOrder={() => setRoute('pos-txn-detail')} />
        </div>
      );

    case 'pos-customers-lookup':
      if (isDesktop)
        return (
          <DesktopPosCustomerLookupScreen
            onNav={posTerminalNav}
            onAttach={(name) => {
              setPosCustomer(name);
              setRoute('pos-cart');
            }}
            onOpenDossier={(name) => {
              setPosDossierCustomer(name);
              setRoute('pos-dossier');
            }}
            onRegisterNew={() => setRoute('hub-customers')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosCustomerLookupScreen
            onNav={posTab}
            onAttach={(name) => {
              setPosCustomer(name);
              setRoute('pos-cart');
            }}
            onOpenDossier={(name) => {
              setPosDossierCustomer(name);
              setRoute('pos-dossier');
            }}
            onRegisterNew={() => setRoute('hub-customers')}
          />
        </div>
      );

    case 'pos-order-lookup':
      if (isDesktop)
        return <DesktopPosOrderLookupScreen onNav={posTerminalNav} onBack={() => setRoute('pos-home')} />;
      return (
        <div className="biz-flow">
          <BusinessPosOrderLookupScreen onBack={() => setRoute('pos-home')} />
        </div>
      );

    case 'pos-dossier':
      if (isDesktop)
        return (
          <DesktopPosCustomerDossierScreen
            onNav={posTerminalNav}
            customer={posDossierCustomer}
            onBack={goBackToPrevious}
            onAttach={() => {
              setPosCustomer(posDossierCustomer);
              setRoute('pos-cart');
            }}
            onOpenCrm={() => setRoute('hub-customers')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosCustomerDossierScreen
            customer={posDossierCustomer}
            onBack={goBackToPrevious}
            onAttach={() => {
              setPosCustomer(posDossierCustomer);
              setRoute('pos-cart');
            }}
            onOpenCrm={() => setRoute('hub-customers')}
          />
        </div>
      );

    case 'pos-offline':
      if (isDesktop)
        return <DesktopPosOfflineSaleScreen onNav={posTerminalNav} />;
      return (
        <div className="biz-flow">
          <BusinessPosOfflineCheckoutScreen onBack={() => setRoute('pos-home-offline')} onOpenQueue={() => setRoute('pos-buffer')} />
        </div>
      );

    case 'pos-txn-detail':
      if (isDesktop)
        return <DesktopPosTransactionDetailScreen onNav={posTerminalNav} onBack={goBackToPrevious} />;
      return (
        <div className="biz-flow">
          <BusinessPosTransactionDetailScreen onBack={goBackToPrevious} />
        </div>
      );

    case 'pos-buffer':
      if (isDesktop)
        return <DesktopPosBufferScreen onNav={posTerminalNav} onReturnToRegister={() => setRoute('pos-offline')} />;
      return (
        <div className="biz-flow">
          <BusinessPosOfflineBufferScreen onBack={goBackToPrevious} onReturnToRegister={() => setRoute('pos-offline')} />
        </div>
      );

    case 'public-pos-menu':
      if (isDesktop)
        return (
          <DesktopPublicPosMenuScreen
            cart={publicCart}
            onCartChange={setPublicCart}
            onOpenCart={() => setRoute('public-pos-cart')}
          />
        );
      return (
        <div className="biz-flow">
          <PublicPosMenuScreen
            cart={publicCart}
            onAddItem={(item) =>
              setPublicCart((prev) => {
                const existing = prev.find((line) => line.id === item.id);
                if (existing)
                  return prev.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line));
                return [...prev, { ...item, qty: 1 }];
              })
            }
            onOpenCart={() => setRoute('public-pos-cart')}
          />
        </div>
      );

    case 'public-pos-cart':
      if (isDesktop)
        return (
          <DesktopPublicPosCartScreen
            cart={publicCart}
            onCartChange={setPublicCart}
            onBack={() => setRoute('public-pos-menu')}
            onAddMore={() => setRoute('public-pos-menu')}
            onTrack={() => setRoute('public-pos-tracking')}
          />
        );
      return (
        <div className="biz-flow">
          <PublicPosCartReviewScreen
            cart={publicCart}
            onCartChange={setPublicCart}
            onBack={() => setRoute('public-pos-menu')}
            onAddMore={() => setRoute('public-pos-menu')}
            onTrack={() => setRoute('public-pos-tracking')}
          />
        </div>
      );

    case 'public-pos-tracking':
      if (isDesktop)
        return (
          <DesktopPublicPosTrackingScreen
            cart={publicCart}
            onBack={goBackToPrevious}
            onReopenMenu={() => setRoute('public-pos-menu')}
          />
        );
      return (
        <div className="biz-flow">
          <PublicPosOrderTrackingScreen
            cart={publicCart}
            onBack={goBackToPrevious}
            onReopenMenu={() => setRoute('public-pos-menu')}
          />
        </div>
      );

    case 'pos-kitchen':
      if (isDesktop)
        return <DesktopPosKitchenScreen onNav={posTerminalNav} onReturnToRegister={() => setRoute('pos-register')} />;
      return (
        <div className="biz-flow">
          <BusinessPosKitchenStreamScreen
            onBack={goBackToPrevious}
            onReturnToRegister={() => setRoute('pos-register')}
          />
        </div>
      );

    case 'pos-settings':
      if (isDesktop) return <DesktopPosGeneralSettingsScreen onNav={posTerminalNav} />;
      return (
        <div className="biz-flow">
          <BusinessPosSettingsScreen onBack={goBackToPrevious} />
        </div>
      );

    case 'business-more':
      if (isDesktop)
        return (
          <DesktopBusinessMoreScreen
            onNav={businessPortalNav}
            onOpenPos={() => setRoute('pos-home')}
            onOpenAnalytics={() => setRoute('analytics-business')}
            onOpenMarketing={() => setRoute('boost-hub')}
            onOpenStorefront={() => setRoute('storefront')}
            onOpenSubscription={() => setRoute('business-subscription')}
            onOpenVerification={() => setRoute('verification-status')}
            onOpenNotifications={() => setRoute('business-notifications')}
            onOpenSupport={() => setRoute('business-support')}
            onOpenSettings={() => setRoute('business-settings')}
            onOpenCluster={() => setRoute('cluster-system')}
            onSwitchConsumer={() => setRoute('home')}
            onOpenStoreOrdering={(sub) =>
              setRoute(
                sub === 'qr'
                  ? 'store-ordering-qr'
                  : sub === 'settings'
                  ? 'store-ordering-settings'
                  : 'store-ordering-dashboard',
              )
            }
            onSignOut={() => {
              signOut();
              setRoute('welcome');
            }}
          />
        );
      return (
        <BusinessMoreScreen
          onTab={businessTab}
          onOpenAnalytics={() => setRoute('analytics-business')}
          onOpenMarketing={() => setRoute('boost-hub')}
          onOpenSubscription={() => setRoute('subscription')}
          onOpenAddOns={() => setRoute('business-add-ons')}
          onOpenVerification={() => setRoute('verification-status')}
          onOpenNotifications={() => setRoute('business-notifications')}
          onOpenSupport={() => setRoute('business-support')}
          onOpenSettings={() => setRoute('business-settings')}
          onOpenCluster={() => setRoute('cluster-system')}
          onSwitchConsumer={() => setRoute('home')}
          onSignOut={() => {
            signOut();
            setRoute('welcome');
          }}
        />
      );

    case 'business-orders':
      if (isDesktop) return <DesktopBusinessOrdersScreen onNav={businessPortalNav} initialView="orders" />;
      return (
        <BusinessOrdersScreen
          initialStep="orders"
          onTab={businessTab}
          onOpenBooking={() => setRoute('booking-detail')}
        />
      );

    case 'business-bookings':
      if (isDesktop) return <DesktopBusinessOrdersScreen onNav={businessPortalNav} initialView="bookings" />;
      return (
        <BusinessOrdersScreen
          initialStep="bookings"
          onTab={businessTab}
          onOpenBooking={() => setRoute('booking-detail')}
        />
      );

    case 'business-pos-orders':
      if (isDesktop) return <DesktopBusinessPosOrdersScreen onNav={businessPortalNav} activeNav={posActiveNav} />;
      return (
        <BusinessOrdersScreen
          initialStep="pos"
          onTab={businessTab}
          onOpenBooking={() => setRoute('booking-detail')}
          onOpenDisplay={() => setRoute('pos-display-order')}
        />
      );

    case 'business-messages':
      if (isDesktop)
        return (
          <DesktopBusinessMessagesWorkspaceScreen
            onNav={businessPortalNav}
            onViewCustomerProfile={(name) => {
              setHubCustomerName(name);
              setRoute('hub-customer-profile');
            }}
          />
        );
      return (
        <BusinessMessagesScreen
          initialStep="home"
          onTab={businessTab}
          onSelectChannel={(key) => {
            if (key === 'chat') setRoute('business-messages');
            else if (key === 'sms') setRoute('business-messages-sms');
            else setRoute('business-messages-email');
          }}
        />
      );

    case 'business-messages-sms':
      return <CampaignsChannelScreen channel="sms" onNav={businessPortalNav} onTab={businessTab} />;

    case 'business-messages-email':
      return <CampaignsChannelScreen channel="email" onNav={businessPortalNav} onTab={businessTab} />;

    case 'store-ordering-dashboard':
      if (isDesktop) return <DesktopStoreOrderingDashboard onNav={businessPortalNav} />;
      return (
        <StoreOrderingScreen
          onTab={businessTab}
          initialSubTab="dashboard"
          onNavigateRoute={(r) => setRoute(r as Route)}
        />
      );

    case 'store-ordering-qr':
      if (isDesktop) return <DesktopStoreOrderingQrScreen onNav={businessPortalNav} />;
      return (
        <StoreOrderingScreen
          onTab={businessTab}
          initialSubTab="qr"
          onNavigateRoute={(r) => setRoute(r as Route)}
        />
      );

    case 'store-ordering-settings':
      if (isDesktop) return <DesktopStoreOrderingSettingsScreen onNav={businessPortalNav} />;
      return (
        <StoreOrderingScreen
          onTab={businessTab}
          initialSubTab="settings"
          onNavigateRoute={(r) => setRoute(r as Route)}
        />
      );
    case 'cluster-onboarding':
      if (isDesktop)
        return (
          <DesktopClusterOnboardingScreen
            onComplete={() => setRoute('cluster-system')}
            onSkip={() => setRoute('business-overview')}
            onCreateDeal={() => setRoute('deal-studio')}
            onCreateProduct={() => setRoute('hub-catalog')}
            onCreateLocation={() => setRoute('deal-create-locations')}
          />
        );
      return (
        <ClusterOnboardingScreen
          onComplete={() => setRoute('cluster-system')}
          onSkip={() => setRoute('business-overview')}
          onCreateDeal={() => setRoute('deal-studio')}
          onCreateProduct={() => setRoute('hub-catalog')}
          onCreateLocation={() => setRoute('deal-create-locations')}
        />
      );

    case 'cluster-system':
      if (isDesktop)
        return (
          <DesktopClusterSystemScreen
            onNav={businessPortalNav}
            onOpenOnboarding={() => setRoute('cluster-onboarding')}
            onCreateDeal={() => setRoute('deal-studio')}
            onCreateProduct={() => setRoute('hub-catalog')}
            onCreateLocation={() => setRoute('deal-create-locations')}
            onBoostItem={openClusterBoost}
            onOpenBoosts={() => setRoute('cluster-boost')}
          />
        );
      return (
        <ClusterSystemScreen
          onBack={() => setRoute('business-overview')}
          onTab={businessTab}
          onOpenOnboarding={() => setRoute('cluster-onboarding')}
          onCreateDeal={() => setRoute('deal-studio')}
          onCreateProduct={() => setRoute('hub-catalog')}
          onCreateLocation={() => setRoute('deal-create-locations')}
          onBoostItem={openClusterBoost}
          onOpenBoosts={() => setRoute('cluster-boost')}
        />
      );

    case 'cluster-boost':
      return (
        <ClusterBoostListScreen
          onBack={() => setRoute('cluster-system')}
          onBackToCluster={() => setRoute('cluster-system')}
          onBoostItem={openClusterBoost}
        />
      );

    case 'cluster-boost-new':
      return (
        <ClusterBoostFlow
          onBack={() => setRoute('cluster-system')}
          onDone={() => setRoute('cluster-boost')}
          onOpenWallet={() => setRoute('boost-wallet')}
          preselectedItemId={clusterBoostItem}
        />
      );

    default:
        return null;
    }
  };

  return (
    <StoreOrderingProvider>
    <>
      {renderRoute()}

      {claimPopupOpen &&
        (isDesktop ? (
          <ClaimIdentityModal
            open
            identity={{ name: profile.fullName }}
            deal={selectedDeal}
            onClose={closeClaimPopup}
            onClaimSelf={() => finishClaimChoice('self')}
            onGift={() => finishClaimChoice('gift')}
            onSomeoneElse={() => finishClaimChoice('other')}
          />
        ) : (
          <ClaimIdentitySheet
            open
            identity={{ name: profile.fullName, email: profile.email, initials: profile.initials }}
            onClose={closeClaimPopup}
            onClaimSelf={() => finishClaimChoice('self')}
            onGift={() => finishClaimChoice('gift')}
            onSomeoneElse={() => finishClaimChoice('other')}
          />
        ))}

      {/* BUG-005 — identity confirmation step before any "Claim for myself" is submitted. */}
      {claimSelfConfirmOpen &&
        (isDesktop ? (
          <ClaimSelfConfirmModal
            open
            onClose={() => setClaimSelfConfirmOpen(false)}
            onConfirm={confirmSelfClaim}
            onCompleteProfile={() => {
              setClaimSelfConfirmOpen(false);
              setRoute('edit-profile');
            }}
          />
        ) : (
          <ClaimSelfConfirmSheet
            open
            onClose={() => setClaimSelfConfirmOpen(false)}
            onConfirm={confirmSelfClaim}
            onCompleteProfile={() => {
              setClaimSelfConfirmOpen(false);
              setRoute('edit-profile');
            }}
          />
        ))}

      {isDesktop && claimDialog === 'gift' && (
        <GiftRecipientDetailsModal
          open
          onClose={() => setClaimDialog(null)}
          onContinue={(values) => {
            setGiftRecipient({
              name: `${values.firstName} ${values.lastName}`.trim() || 'Gift Recipient',
              email: values.email,
              phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
            });
            setClaimDialog('giftConfirm');
          }}
        />
      )}
      {isDesktop && claimDialog === 'giftConfirm' && (
        <ConfirmGiftSendModal
          open
          recipient={giftRecipient}
          onClose={() => setClaimDialog(null)}
          onEdit={() => setClaimDialog('gift')}
          onSend={() => finishDesktopClaim('gift')}
        />
      )}
      {isDesktop && claimDialog === 'other' && (
        <SomeoneElseModal
          open
          onClose={() => setClaimDialog(null)}
          onContinue={(values) => {
            setClaimRecipient({
              name: `${values.firstName} ${values.lastName}`.trim(),
              email: values.email,
              phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
            });
            setClaimDialog('verify');
          }}
        />
      )}
      {isDesktop && claimDialog === 'verify' && (
        <RecipientVerificationModal
          open
          recipient={claimRecipient}
          onClose={() => setClaimDialog(null)}
          onVerify={() => setClaimDialog('summary')}
          onBack={() => setClaimDialog('other')}
        />
      )}
      {isDesktop && claimDialog === 'summary' && (
        <RecipientSummaryModal
          open
          recipient={claimRecipient}
          onClose={() => setClaimDialog(null)}
          onConfirm={() => finishDesktopClaim('someone-else')}
          onEdit={() => setClaimDialog('other')}
        />
      )}
      <PwaInstallPrompt />
    </>
    </StoreOrderingProvider>
  );
}
