import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsDesktop } from './hooks/useIsDesktop';
import { PosSettingsProvider } from './context/PosSettingsContext';
import { PosOfflineProvider, usePosOffline } from './context/PosOfflineContext';
import type { DesktopNavKey } from './components/ui/DesktopChrome';
import type { AccountTarget } from './components/AccountRows';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isBusinessRole, type SessionUser } from './services/sessionService';
import { Skeleton, SkeletonGroup } from './components/ui/Skeleton';
import { useSessionUser } from './hooks/useSessionUser';
import { ApiError, SESSION_EXPIRED_EVENT } from './services/api/client';
import { businessService } from './services/businessService';
import { hasApiConfig } from './lib/api';
import { authService } from './services';
import type { CatalogueItem } from './services/catalogueItemsService';
import { ownerAuthService, OTP_GATE_MESSAGE } from './services/ownerAuthService';
import { apiErrorMessage } from './services/errorMessages';
import { startGoogleSignIn, takeGoogleRedirectResult, type GoogleIntent } from './services/googleAuth';
import { catalogueService } from './services/catalogueService';
import { messageService } from './services/messageService';
import { BusinessBranchProvider, BranchSwitchOverlay } from './context/BusinessBranchContext';
import { CartProvider } from './context/CartContext';
import { BookingProvider, useBooking } from './context/BookingContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { DealFiltersProvider } from './context/DealFiltersContext';
import { AREA_NOT_FOUND, findPlace, getCurrentPlace, type PickedPlace } from './services/currentLocation';
import { ClaimsProvider, currentVoucher, rememberGiftLink, useClaims, type ClaimHolder, type ClaimRecord } from './context/ClaimsContext';
import { OrdersProvider } from './context/OrdersContext';
import { parsePrice } from './utils/format';
import { ClaimSelfConfirmSheet } from './components/sheets/ClaimSelfConfirmSheet';
import { ClaimSelfConfirmModal } from './components/desktop/dialogs/ClaimSelfConfirmModal';
import { CheckoutScreen } from './scripts/CheckoutScreen';
import { OrderPlacedScreen } from './scripts/OrderPlacedScreen';
import { ContactsProvider, useContacts } from './context/ContactsContext';
import { CampaignsProvider } from './context/CampaignsContext';
import { AccountDeletionProvider } from './context/AccountDeletionContext';
import type { SubmittedOrder } from './context/OrdersContext';
import { useCart } from './context/CartContext';
import {
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
import { NotFoundScreen } from './scripts/NotFoundScreen';
import { GiftRejectScreen } from './scripts/GiftRejectScreen';
import { VoucherRedeemScreen } from './scripts/VoucherRedeemScreen';
import { DesktopNotFoundScreen } from './scripts/desktop/DesktopNotFoundScreen';
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
import { referralsService } from './services/referralsService';
import { ActivityScreen } from './scripts/ActivityScreen';
import { NotificationsScreen } from './scripts/NotificationsScreen';
import { HelpCentreScreen } from './scripts/HelpCentreScreen';
import { AccountSettingsScreen } from './scripts/AccountSettingsScreen';
import { DashboardScreen } from './scripts/DashboardScreen';
import { MyDealsScreen } from './scripts/MyDealsScreen';
import { MessagesScreen } from './scripts/MessagesScreen';
import { ConversationScreen } from './scripts/ConversationScreen';
import { useCustomerMessagingRealtime, useCustomerThreadBinding } from './hooks/useCustomerMessagingRealtime';
import { OrdersScreen } from './scripts/OrdersScreen';
import { OrderDetailScreen } from './scripts/OrderDetailScreen';
import { BookingDetailScreen } from './scripts/BookingDetailScreen';
import { AuthCodeScreen } from './scripts/AuthCodeScreen';
import { SignInScreen } from './scripts/SignInScreen';
import { ForgotPinScreen } from './scripts/ForgotPinScreen';
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
import { DesktopForgotPinScreen } from './scripts/desktop/DesktopForgotPinScreen';
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
import { BusinessProfileScreen } from './scripts/BusinessProfileScreen';
import { ProductDetailScreen } from './scripts/ProductDetailScreen';
import { DesktopProductDetailScreen } from './scripts/desktop/DesktopProductDetailScreen';
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
import { BusinessAccountChoiceScreen } from './scripts/BusinessAccountChoiceScreen';
import { BusinessOnboardingScreen } from './scripts/BusinessOnboardingScreen';
import type { ProfileSetupDraft } from './scripts/ProfileSetupScreen';
import { BusinessDealStudioFlow } from './scripts/BusinessDealStudioFlow';
import {
  BusinessSetupNavContext,
  clearBusinessSetupSnapshot,
  clearBusinessSignup,
  getBusinessSetupSnapshot,
  getBusinessSignup,
  hasUnfinishedBusinessSetup,
  hydrateBusinessSetupFromServer,
  markBusinessSetupScreensDone,
  saveBusinessSignup,
  setBusinessSetupSnapshotStep,
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
import { BusinessStorefrontPreviewScreen } from './scripts/desktop/BusinessStorefrontPreviewScreen';
import { dealIdFromPath, useDealDetail } from './hooks/useDealDetail';
import { SIGN_OUT_EVENT, BUSINESS_NAV_EVENT } from './scripts/desktop/PortalShell';
import { MOBILE_ACCOUNT_NAV_EVENT, SEARCH_PICK_EVENT, type SearchPick } from './utils/appEvents';
import { DesktopDealAnalyticsScreen } from './scripts/desktop/DesktopDealAnalyticsScreen';
import { DesktopBusinessBranchPricingScreen } from './scripts/desktop/DesktopBusinessBranchPricingScreen';
import { DesktopBusinessCustomersScreen } from './scripts/desktop/DesktopBusinessCustomersScreen';
import { DesktopCustomerProfileScreen } from './scripts/desktop/DesktopCustomerProfileScreen';
import { DesktopLoyaltyProgrammeScreen } from './scripts/desktop/DesktopLoyaltyProgrammeScreen';
import { DesktopLoyaltyRewardsScreen } from './scripts/desktop/DesktopLoyaltyRewardsScreen';
import { DesktopBusinessCatalogHubScreen } from './scripts/desktop/DesktopBusinessCatalogHubScreen';
import { DesktopBusinessLocationsHubScreen } from './scripts/desktop/DesktopBusinessLocationsHubScreen';
import { DesktopBusinessAddBranchScreen } from './scripts/desktop/DesktopBusinessAddBranchScreen';
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
  | 'business-auth'
  | 'sign-in'
  | 'forgot-pin'
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
  | 'hub-catalog-new-product'
  | 'hub-catalog-new-service'
  | 'hub-services'
  | 'hub-deals'
  | 'hub-customers'
  | 'customer-invite-join'
  | 'hub-profile'
  | 'hub-storefront-preview'
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
  | 'admin-referral'
  | 'not-found'
  | 'gift-reject';

const ROUTE_PATH: Record<Route, string> = {
  welcome: '/onboarding',
  'discover-deals': '/discover-deals',
  'start-vemtap': '/start-vemtap',
  'auth-code': '/auth-code',
  'business-auth': '/business-auth',
  'sign-in': '/sign-in',
  'forgot-pin': '/forgot-pin',
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
  'hub-catalog-new-product': '/business/hub/catalog/products/new',
  'hub-catalog-new-service': '/business/hub/catalog/services/new',
  'hub-services': '/business/hub/catalog/services',
  'hub-deals': '/business/hub/deals',
  'hub-customers': '/business/hub/customers',
  // Dynamic public path (/join/{slug}?invite=…) — placeholder entry; the
  // URL-sync effect never overwrites it (see renderRoute effect).
  'customer-invite-join': '/join',
  'hub-profile': '/business/hub/profile',
  'hub-storefront-preview': '/business/hub/profile/preview',
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
  'not-found': '/not-found',
  'gift-reject': '/deals/gift-reject',
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

/** Public storefront pages that live under /business/<slug> — never the merchant portal. */
const STOREFRONT_ROUTES = new Set<Route>([
  'storefront',
  'storefront-products',
  'storefront-menu',
  'business-profile',
  'spa-profile',
  'spa-services',
  'service-detail',
  'product-detail',
  'checkout',
  'order-placed',
  'spa-storefront',
  'spa-booking',
  'spa-booking-checkout',
  'spa-booking-confirmed',
]);

const PORTAL_PREFIXES = ['/business/', '/pos/', '/analytics/', '/boost-hub', '/segments'];

/** Merchant portal pages: they need a signed-in business user once the API is configured. */
function isPortalRoute(route: Route) {
  if (STOREFRONT_ROUTES.has(route)) return false;
  const path = ROUTE_PATH[route];
  return PORTAL_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * Pages of the customer shell: an owner reaching one gets a customer token.
 * Anything not here and not a portal page (public business pages, sign-in,
 * help, legal) is neutral and keeps the current token.
 */
const CUSTOMER_SHELL_ROUTES = new Set<Route>([
  ...CLAIM_STEP_ROUTES,
  'home',
  'deals',
  'featured-deals',
  'filters',
  'discover',
  'saved',
  'referrals',
  'account',
  'account-settings',
  'savings',
  'notifications',
  'addresses',
  'preferences',
  'settings',
  'edit-profile',
  'rewards',
  'scan',
  'activity',
  'dashboard',
  'orders',
  'order-detail',
  'booking-detail',
  'my-deals',
  'messages',
  'conversation',
  'cart',
  'checkout',
  'claim-success',
  'claimed-deal',
]);

/** A voucher's own pass page, the link in its QR. */
const PASS_PATH = '/my/claimed-deal/';
const passIdFromPath = (path: string) => (path.startsWith(PASS_PATH) ? decodeURIComponent(path.slice(PASS_PATH.length).replace(/\/+$/, '')) || null : null);

const DESKTOP_ONLY_ROUTES = new Set<Route>([
  'spa-storefront',
]);

const ONBOARDED_KEY = 'vemtap_onboarded';

/** Which sign-up journey ("customer" / "business") a verification belongs to. */
const AUTH_INTENT_KEY = 'vemtap_auth_intent';

const hasOnboarded = () => window.localStorage.getItem(ONBOARDED_KEY) === '1';

/** Live: signed-in customer pages; signed out (or an ended session) goes to onboarding. */
const SIGNED_IN_ROUTES = new Set<Route>([
  'deals',
  'featured-deals',
  'filters',
  'discover',
  'saved',
  'dashboard',
  'account',
  'account-settings',
  'settings',
  'savings',
  'rewards',
  'notifications',
  'addresses',
  'preferences',
  'edit-profile',
  'referrals',
  'activity',
  'orders',
  'order-detail',
  'booking-detail',
  'my-deals',
  'messages',
  'conversation',
  // Post-sign-up steps: the account exists before these open.
  'location-permission',
  'manual-location',
  'confirm-location',
  'discovering',
]);

/** Sign-up and sign-in pages: a signed-in visitor opening one returns to their shell. */
const SIGNED_OUT_ROUTES = new Set<Route>([
  'welcome',
  'discover-deals',
  'start-vemtap',
  'auth-code',
  'business-auth',
  'sign-in',
  'forgot-pin',
  'verify-email',
  'profile-setup',
]);
const isSignedOutPath = (path: string) => {
  const found = PATH_ROUTE.get(path);
  return found !== undefined && SIGNED_OUT_ROUTES.has(found);
};

function guardRoute(found: Route, authed: boolean, isDesktop: boolean): Route {
  if (DESKTOP_ONLY_ROUTES.has(found) && !isDesktop) return authed ? 'home' : 'welcome';
  if (authed) return found;
  if (hasApiConfig() && SIGNED_IN_ROUTES.has(found)) return 'welcome';
  if (CLAIM_STEP_ROUTES.has(found)) return 'claim-auth';
  if (AUTH_ROUTES.has(found)) return 'welcome';
  return found;
}

function businessSectionRoute(section: string, venue: 'urban' | 'spa', serviceSlug?: string): Route {
  switch (section) {
    // The bundled demo storefront sub-pages are retired: their links land on the live business page.
    case 'deals':
      return 'business-profile';
    case 'products':
      return 'product-detail';
    case 'checkout':
      return 'checkout';
    case 'order-placed':
      return 'order-placed';
    case 'menu':
      return 'business-profile';
    case 'services':
      return serviceSlug ? 'service-detail' : 'business-profile';
    case 'shop':
      return 'business-profile';
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

function dealDetailSlug(deal?: ClaimDealSummary | null): string {
  const rawTitle = deal?.title?.trim() || deal?.business?.trim() || 'deal';
  const normalized = rawTitle
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);

  const idPart = typeof deal?.id !== 'undefined' && deal?.id !== null ? String(deal.id).trim() : '';
  return (normalized || 'deal') + (idPart ? `-${idPart}` : '');
}

function dealDetailPath(deal?: ClaimDealSummary | null): string {
  const slug = dealDetailSlug(deal);
  return `/deals/${encodeURIComponent(slug)}`;
}

/**
 * The route a URL opens. `resume` (the first page load only, never Back/Forward)
 * reopens an unfinished business sign-up or setup from the bare entry URL.
 */
function entryRoute(rawPath: string, authed: boolean, isDesktop: boolean, resume = false): Route {
  const path = rawPath.replace(/\/+$/, '') || '/';
  // Public customer invite page — reachable signed-out via /join/{business-slug}.
  if (path.startsWith('/join/')) return 'customer-invite-join';
  if (path === ROUTE_PATH['gift-reject']) return 'gift-reject';
  if (path.startsWith('/deals/')) return 'deal-detail';
  if (path.startsWith(PASS_PATH)) return guardRoute('claimed-deal', authed, isDesktop);
  const direct = PATH_ROUTE.get(path);
  if (authed && hasApiConfig() && isSignedOutPath(path)) return 'home';
  // A page load can't restore a sign-up in progress unless a business one was saved.
  if (resume && !authed && hasApiConfig() && (direct === 'verify-email' || direct === 'profile-setup') && !getBusinessSignup()?.email) {
    return 'start-vemtap';
  }
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
  if (direct === undefined && path !== '/') return 'not-found';
  // Live mode: the customer home is for signed-in users only — "onboarded on
  // this device before" survives sign-out and expired sessions. An unfinished
  // business sign-up reopens where it stopped. Signed-in accounts always land on
  // home: unfinished setup resumes only from "Set up your business on VEMTAP".
  if (hasApiConfig()) {
    if (!authed) return (resume && getBusinessSignup()?.stage) || 'welcome';
    return 'home';
  }
  return (authed || hasOnboarded()) ? 'home' : 'welcome';
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <LocationProvider>
          <DealFiltersProvider>
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
          </DealFiltersProvider>
        </LocationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

/** The result Google sent back to `/google-callback`, read once per page load. */
const GOOGLE_REDIRECT = takeGoogleRedirectResult();
/** The URL this tab opened; a protected one is returned to after signing in. */
const ENTRY_PATH = window.location.pathname;
rememberGiftLink(window.location.search);
const GIFT_REJECT_TOKEN = new URLSearchParams(window.location.search).get('token') ?? '';
const RETURN_PATH_KEY = 'vemtap_return_to';

function AppInner() {
  const { authed, signIn, signOut, markAuthenticated, markClaimed, resetClaim, adoptSession, switchShell } = useAuth();
  const sessionQuery = useSessionUser();
  const sessionUser = sessionQuery.data;
  // A live owner already has their business identity: business entry points
  // should open their dashboard instead of starting sign-up again.
  // Includes an owner whose token is currently scoped to the customer shell.
  const isBusinessSession = hasApiConfig() && !!sessionUser && (Boolean(sessionUser.businessRole) || isBusinessRole(sessionUser.role));
  const cart = useCart();
  const booking = useBooking();
  const profile = useProfile();
  const claims = useClaims();
  const contacts = useContacts();
  const isDesktop = useIsDesktop();
  const [route, setRouteState] = useState<Route>(() =>
    GOOGLE_REDIRECT
      ? ((GOOGLE_REDIRECT.pending.from in ROUTE_PATH ? GOOGLE_REDIRECT.pending.from : 'welcome') as Route)
      : entryRoute(window.location.pathname, authed, isDesktop, true),
  );
  /** A failed "Continue with Google", shown on the screen it started from. */
  const [googleError, setGoogleError] = useState<{ route: Route; message: string } | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfileRef | null>(() => {
    const match = resolveBusinessPath(window.location.pathname);
    return match?.business ?? null;
  });
  const [confirmFrom, setConfirmFrom] = useState<'location-permission' | 'manual-location'>('location-permission');
  const [authFrom, setAuthFrom] = useState<Route>('start-vemtap');
  const [customerSignup, setCustomerSignup] = useState({
    // A business sign-up resumed on the code or details screen keeps its email.
    email: getBusinessSignup()?.email ?? '',
    code: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  /**
   * Which audience the in-flight sign-up belongs to. `auth-code` and
   * `business-auth` both hand off to `verify-email` / `google-confirm`, so
   * those screens need to know where "continue" must land: the consumer
   * profile setup, or the Business Profile page for a merchant.
   */
  const [authIntent, setAuthIntentState] = useState<'customer' | 'business'>(
    // Restored on load so a hard refresh mid-flow (e.g. on /verify-email)
    // still completes into the right journey instead of dropping merchants
    // into the customer one.
    // A business sign-up resumed past its email screen is always the business journey.
    () =>
      window.localStorage.getItem(AUTH_INTENT_KEY) === 'business' || (getBusinessSignup()?.email ?? '') !== ''
        ? 'business'
        : 'customer',
  );
  const setAuthIntent = (intent: 'customer' | 'business') => {
    setAuthIntentState(intent);
    try {
      window.localStorage.setItem(AUTH_INTENT_KEY, intent);
    } catch {
      // Storage unavailable — the in-memory value still works this session.
    }
  };
  /** Sign In is reachable from several sign-ups — remember where it was opened from. */
  const [signInFrom, setSignInFrom] = useState<Route>('welcome');
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
  const [commentsModalOnly, setCommentsModalOnly] = useState(false);
  const dealChatOpening = useRef(false);
  const dealSheetOpen = useRef(false);
  // A reloaded or shared /deals/<title>-<id> link has no selected deal yet, so its id comes from the URL.
  // On a deal's own page its link decides the deal, so refresh, Back and shared links open the right one.
  const liveDeal = useDealDetail((route === 'deal-detail' ? dealIdFromPath(window.location.pathname) : undefined) ?? selectedDeal?.id ?? dealIdFromPath(window.location.pathname));
  const liveDealDetail = liveDeal.detail;
  useEffect(() => {
    if (!liveDealDetail) return;
    // The claim flow, sheets and share page read the selected deal, so keep it on the live values.
    setSelectedDeal({
      id: liveDealDetail.id,
      title: liveDealDetail.title,
      business: liveDealDetail.businessName,
      location: liveDealDetail.address ?? liveDealDetail.branchName ?? undefined,
      price: liveDealDetail.price,
      oldPrice: liveDealDetail.oldPrice,
      image: liveDealDetail.image,
      images: liveDealDetail.images,
      discountLabel: liveDealDetail.discountPercent > 0 ? `${liveDealDetail.discountPercent}% OFF` : undefined,
      commentCount: liveDealDetail.reviewsCount,
    });
  }, [liveDealDetail]);
  const [bizFrom, setBizFrom] = useState<Route>('discover');
  const [profileFrom, setProfileFrom] = useState<Route>('discover');
  const [catalogueFrom, setCatalogueFrom] = useState<Route>('storefront');
  const [detailFrom, setDetailFrom] = useState<Route>('storefront-products');
  const [detailProduct, setDetailProduct] = useState<CatalogueProduct | null>(() => {
    const match = resolveBusinessPath(window.location.pathname);
    return (match?.productId ? findProduct(match.productId) : undefined) ?? null;
  });
  /** The live product/service page: `/business/<code>/products/<itemId>`. */
  const [liveItem, setLiveItem] = useState<{ code: string; id: string } | null>(() => {
    const match = resolveBusinessPath(window.location.pathname);
    return match?.productId ? { code: match.business.slug, id: match.productId } : null;
  });
  const [detailService, setDetailService] = useState<SpaCatalogueService | null>(() => {
    const match = resolveBusinessPath(window.location.pathname);
    return (match?.serviceSlug ? findSpaService(match.serviceSlug) : undefined) ?? null;
  });
  const [serviceFrom, setServiceFrom] = useState<Route>('spa-services');
  const [bookingFrom, setBookingFrom] = useState<Route>('spa-profile');
  const [orderSummary, setOrderSummary] = useState<SubmittedOrder | null>(null);
  // A signed-in owner reopening unfinished setup is already past the intro.
  const [businessSetupSkipIntro, setBusinessSetupSkipIntro] = useState(
    () => hasApiConfig() && authed && hasUnfinishedBusinessSetup(),
  );
  /**
   * "Reuse this account or register a fresh business identity?" is asked from
   * the business intro's primary button — i.e. once the merchant has actually
   * started signing up — so it is its own state instead of being derived at
   * route entry (which used to hide the intro behind the question).
   */
  const [businessChoiceOpen, setBusinessChoiceOpen] = useState(false);
  const [businessOnboardingFrom, setBusinessOnboardingFrom] = useState<Route>('dashboard');
  const [activeOrderRef, setActiveOrderRef] = useState<string | undefined>(undefined);
  const [activeBookingRef, setActiveBookingRef] = useState<string | undefined>(undefined);
  const [chatFrom, setChatFrom] = useState<Route>('claimed-deal');
  const [termsFrom, setTermsFrom] = useState<Route>('deal-detail');
  /** Where "How to Claim" was opened: a deal page (claim that deal) or the Deals feed (no deal to claim). */
  const [howToClaimFrom, setHowToClaimFrom] = useState<Route>('deal-detail');
  const openHowToClaim = (from: Route) => {
    setHowToClaimFrom(from);
    setRoute('how-to-claim');
  };
  const [claimedFrom, setClaimedFrom] = useState<Route>('claim-success');
  // The voucher picked on the dashboard, so its pass and contact sheet show that one.
  const [dashboardClaimRef, setDashboardClaimRef] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState('');
  useCustomerMessagingRealtime(authed);
  useCustomerThreadBinding(route === 'conversation' ? activeConversation : null, authed);
  const [giftRecipient, setGiftRecipient] = useState<GiftRecipientSummary | null>(null);
  const [giftNote, setGiftNote] = useState('');
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
      // Live sales queue themselves (with their API payload) in usePosCheckout.
      if (isOnline || hasApiConfig()) return;
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

  const resolveRoutePath = useCallback((target: Route, overrideDeal?: ClaimDealSummary | null) => {
    const activeSpaBusiness = selectedBusiness && selectedBusiness.venue === 'spa' ? selectedBusiness : null;
    const dealForRoute = overrideDeal ?? selectedDeal ?? null;

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
        return detailService && activeSpaBusiness ? servicePath(activeSpaBusiness.slug, detailService.slug) : '/discover';
      case 'product-detail':
        return liveItem ? productPath(liveItem.code, liveItem.id) : '/discover';
      case 'deal-detail':
        return dealForRoute ? dealDetailPath(dealForRoute) : '/deals';
      default:
        return ROUTE_PATH[target];
    }
  }, [liveItem, detailService, selectedBusiness, selectedDeal]);

  const setRoute = (target: Route, nextDeal?: ClaimDealSummary | null) => {
    if (target === route) return;
    const targetPath = resolveRoutePath(target, nextDeal);
    if (window.location.pathname !== targetPath) window.history.pushState(null, '', targetPath);
    setRouteState(target);
  };

  const openProduct = (id: string, display?: Partial<CatalogueProduct>, from?: Route) => {
    const base = findProduct(id);
    if (!base) return;
    if (!selectedBusiness || selectedBusiness.venue !== 'urban') return;
    setDetailProduct({ ...base, ...display, id: base.id });
    if (from) setDetailFrom(from);
    const target = productPath(selectedBusiness.slug, base.id);
    if (window.location.pathname !== target) window.history.pushState(null, '', target);
    setRouteState('product-detail');
  };

  const startCheckout = () => {
    if (cart.count === 0) return;
    if (hasApiConfig() && !authed) {
      // Orders belong to an account; the cart waits through sign-in.
      window.sessionStorage.setItem(RETURN_PATH_KEY, ROUTE_PATH.cart);
      setRoute('sign-in');
      return;
    }
    setRoute('checkout');
  };

  const openService = (key: string, from?: Route) => {
    const base = findSpaService(key);
    if (!base) return;
    if (!selectedBusiness || selectedBusiness.venue !== 'spa') return;
    setDetailService(base);
    if (from) setServiceFrom(from);
    const target = servicePath(selectedBusiness.slug, base.slug);
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
    const handleSignOut = () => {
      // Signing out is never "continue the business sign-up".
      setSignInFrom('welcome');
      setRouteState('sign-in');
    };
    window.addEventListener(SIGN_OUT_EVENT, handleSignOut);
    return () => window.removeEventListener(SIGN_OUT_EVENT, handleSignOut);
  }, []);

  // A 401 from the API: if the user is in the merchant portal, send them to
  // sign in again (public pages keep working for guests).
  const routeRef = useRef(route);
  routeRef.current = route;
  useEffect(() => {
    const handleExpired = () => {
      if (isPortalRoute(routeRef.current)) setRouteState('sign-in');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  // Signed in: a sign-up left unfinished on this device is done (or replaced).
  useEffect(() => {
    if (authed) clearBusinessSignup();
  }, [authed]);

  // The page decides the shell: an owner reaching a business page by any means
  // (link, Back, reload) gets a business token, and a customer page a customer
  // token. Neutral pages keep what they have. Held while a sign-in or "Set up
  // your business" is choosing where to go.
  const [shellHold, setShellHold] = useState(Boolean(GOOGLE_REDIRECT));
  // A signed-in visitor opened a sign-up or sign-in page (URL, Back): their
  // shell is only known once the session loads.
  const [returningToShell, setReturningToShell] = useState(
    () => authed && hasApiConfig() && !GOOGLE_REDIRECT && isSignedOutPath(window.location.pathname),
  );
  const [shellSwitchFailed, setShellSwitchFailed] = useState<Route | null>(null);
  const shellSwitchInFlight = useRef(false);
  const onBusinessPage = isPortalRoute(route) || route === 'business-onboarding' || route === 'business-verification';
  // A scanned voucher that isn't this customer's: a business account scans it for redeeming.
  const scanNeedsBusiness =
    route === 'claimed-deal' &&
    !claims.claimsLoading &&
    Boolean(passIdFromPath(window.location.pathname)) &&
    !claims.claims.some((claim) => claim.id === passIdFromPath(window.location.pathname) && !claim.sentForOther);
  const shellRoleNeeded: 'Owner' | 'Manager' | 'Staff' | 'Customer' | null = shellHold || returningToShell
    ? null
    : scanNeedsBusiness && sessionUser?.businessRole && sessionUser.role === 'Customer'
      ? sessionUser.businessRole
    : onBusinessPage && sessionUser?.businessRole && sessionUser.role === 'Customer'
      ? sessionUser.businessRole
      : !onBusinessPage && CUSTOMER_SHELL_ROUTES.has(route) && !passIdFromPath(window.location.pathname) && isBusinessRole(sessionUser?.role)
        ? 'Customer'
        : null;
  const shellSwitching = shellRoleNeeded !== null && shellSwitchFailed !== route;
  useEffect(() => {
    if (!shellSwitching || !shellRoleNeeded || shellSwitchInFlight.current) return;
    shellSwitchInFlight.current = true;
    const failedOn = route;
    void switchShell(shellRoleNeeded)
      .then(() => setShellSwitchFailed(null))
      .catch((error) => {
        console.error('Could not switch shell:', error);
        // Show the page anyway; it reports its own errors.
        setShellSwitchFailed(failedOn);
      })
      .finally(() => {
        shellSwitchInFlight.current = false;
      });
  }, [shellSwitching, shellRoleNeeded, route, switchShell]);

  // Business pages need a business: plain customers never see them, and an owner
  // without one goes home. Finished owners have no setup to open. Only a saved
  // run keeps /business-onboarding, including Back from its verification step.
  const plainCustomerOnBusinessPage =
    hasApiConfig() &&
    onBusinessPage &&
    !!sessionUser &&
    !sessionUser.businessRole &&
    (sessionUser.role === 'Customer' || sessionUser.role === 'USER');
  const [accessChecked, setAccessChecked] = useState<Route | null>(null);
  const accessCheckPending =
    hasApiConfig() &&
    !!sessionUser &&
    !shellHold &&
    !returningToShell &&
    !shellSwitching &&
    accessChecked !== route &&
    ((isPortalRoute(route) && sessionUser.role === 'Owner' && !sessionUser.businessId) ||
      (route === 'business-onboarding' && isBusinessRole(sessionUser.role) && Boolean(sessionUser.businessId)));
  useEffect(() => {
    if (plainCustomerOnBusinessPage) setRouteState('home');
  }, [plainCustomerOnBusinessPage]);
  useEffect(() => {
    if (!accessCheckPending) return;
    let ignore = false;
    const checkedRoute = route;
    const settle = (next: Route | null) => {
      if (ignore) return;
      setAccessChecked(checkedRoute);
      if (next) setRouteState(next);
    };
    if (checkedRoute === 'business-onboarding') {
      void hydrateBusinessSetupFromServer().then((saved) => {
        const runOpen = hasUnfinishedBusinessSetup(saved) || (saved?.screensDone && saved.verificationState !== 'complete');
        settle(runOpen ? null : 'business-overview');
      });
    } else {
      // The session can predate a business setup just created, so ask the API.
      void businessService
        .myBusiness()
        .then((business) => settle(business?.id ? null : 'home'))
        .catch((error) => settle(error instanceof ApiError && error.status === 404 ? 'home' : null));
    }
    return () => {
      ignore = true;
    };
  }, [accessCheckPending, route]);

  // Remember the protected page a signed-out visitor opened, for after sign-in.
  useEffect(() => {
    const opened = PATH_ROUTE.get(ENTRY_PATH);
    if (hasApiConfig() && !authed && passIdFromPath(ENTRY_PATH)) window.sessionStorage.setItem(RETURN_PATH_KEY, ENTRY_PATH);
    if (!hasApiConfig() || authed || !opened || opened === 'home') return;
    if (SIGNED_IN_ROUTES.has(opened) || isPortalRoute(opened)) window.sessionStorage.setItem(RETURN_PATH_KEY, ENTRY_PATH);
    // Only the page this tab opened on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A reload loses which chat was open; the inbox still has it.
  useEffect(() => {
    if (route === 'conversation' && !activeConversation) setRouteState('messages');
  }, [route, activeConversation]);

  // A reload loses the just-claimed voucher; its wallet still has it.
  useEffect(() => {
    if (route === 'claim-success' && !activeClaim) setRouteState('my-deals');
  }, [route, activeClaim]);

  // The referral admin page is for platform admins only.
  const adminCheckPending =
    hasApiConfig() && route === 'admin-referral' && (!sessionUser || (sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'Admin'));
  useEffect(() => {
    if (!hasApiConfig() || route !== 'admin-referral') return;
    if (!authed) setRouteState('sign-in');
    else if (sessionUser && sessionUser.role !== 'SUPER_ADMIN' && sessionUser.role !== 'Admin') setRouteState('home');
  }, [authed, route, sessionUser]);

  // Opening a portal page signed out (with the API configured) goes to sign in;
  // customer pages without a session (signed out, expired) go to onboarding.
  useEffect(() => {
    if (!hasApiConfig() || authed) return;
    if (isPortalRoute(route)) setRouteState('sign-in');
    else if (route === 'home' || SIGNED_IN_ROUTES.has(route)) setRouteState('welcome');
  }, [authed, route]);

  useEffect(() => {
    const expected =
      route === 'customer-invite-join' ||
      route === 'not-found' ||
      (route === 'claimed-deal' && passIdFromPath(window.location.pathname)) ||
      (route === 'deal-detail' && window.location.pathname.startsWith('/deals/'))
        ? null // dynamic /join/{slug}?invite=…, a deal's own link and unknown paths — never overwritten
        : resolveRoutePath(route);
    if (expected && window.location.pathname !== expected) {
      window.history.replaceState(null, '', expected);
    }

    const pathMatch = resolveBusinessPath(window.location.pathname);
    if (pathMatch) {
      setSelectedBusiness((prev) => (prev && prev.slug === pathMatch.business.slug ? prev : pathMatch.business));
    } else {
      setSelectedBusiness(null);
    }

    const onPopState = () => {
      const path = window.location.pathname;
      setRouteState(entryRoute(path, authed, isDesktop));
      if (authed && hasApiConfig() && isSignedOutPath(path)) setReturningToShell(true);
      const match = resolveBusinessPath(path);
      if (match) {
        setSelectedBusiness((prev) => (prev && prev.slug === match.business.slug ? prev : match.business));
      }
      if (match?.section === 'products' && match.productId) {
        const next = { code: match.business.slug, id: match.productId };
        setLiveItem((prev) => (prev && prev.code === next.code && prev.id === next.id ? prev : next));
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
    if (route !== 'product-detail' || liveItem) return;
    const match = resolveBusinessPath(window.location.pathname);
    if (match?.productId) setLiveItem({ code: match.business.slug, id: match.productId });
    else setRouteState('discover');
  }, [route, liveItem]);

  /**
   * Capture a referral code from the URL once, before the path-sync effect
   * above replaces the URL (and drops the query string). This is a provisional
   * hint for onboarding only — it is never persisted and never treated as
   * secured attribution.
   */
  useEffect(() => {
    // The link just opened wins over any code saved earlier.
    const fromUrl = normaliseReferralCode(readReferralCodeFromUrl());
    if (fromUrl) setProvisionalReferralCode(fromUrl, 'url');
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

  const openDeal = async (from: Route, deal?: ClaimDealSummary | null) => {
    setDealFrom(from);

    // Open the page straight away: its skeleton shows until `useDealDetail` loads the deal.
    setSelectedDeal(deal ?? null);
    setRoute('deal-detail', deal ?? null);
    // Reopening the same deal refreshes its counts in the background.
    liveDeal.reload();
  };

  /** Opens a live business page by its public code (`uniqueCode`). */
  const openBusiness = (ref: { code: string; id?: string; name?: string }, from: Route) => {
    const next: BusinessProfileRef = { slug: ref.code, id: ref.id ?? '', name: ref.name ?? '', venue: 'urban' };
    setSelectedBusiness(next);
    setProfileFrom(from);
    const target = businessPath(next);
    if (window.location.pathname !== target) window.history.pushState(null, '', target);
    setRouteState('business-profile');
  };

  /** Opens a live product/service page for an item of the business with this code. */
  const openItem = (code: string, itemId: string, from: Route) => {
    setLiveItem({ code, id: itemId });
    setDetailFrom(from);
    const target = productPath(code, itemId);
    if (window.location.pathname !== target) window.history.pushState(null, '', target);
    setRouteState('product-detail');
  };

  /** Opens the business behind a deal: its real code comes from the deal's public details. */
  const openBusinessForDeal = async (deal: ClaimDealSummary | null | undefined, from: Route) => {
    const offerId = deal?.id != null ? String(deal.id) : '';
    if (!offerId) return;
    try {
      const response = await catalogueService.getPublicOfferDetails(offerId);
      const record = response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
      const payload = (record.data && typeof record.data === 'object' ? record.data : record) as Record<string, unknown>;
      const business = (payload.business && typeof payload.business === 'object' ? payload.business : {}) as Record<string, unknown>;
      const code = typeof business.uniqueCode === 'string' && business.uniqueCode ? business.uniqueCode : typeof business.slug === 'string' ? business.slug : '';
      if (code) openBusiness({ code, id: typeof business.id === 'string' ? business.id : undefined, name: typeof business.name === 'string' ? business.name : undefined }, from);
    } catch {
      // The deal page stays open; nothing to navigate to without the business's code.
    }
  };

  // Global search (desktop navbar / mobile home) → open the picked deal or business, or the Deals page with the term.
  const [dealsSearch, setDealsSearch] = useState({ query: '', key: 0 });
  const searchPickRef = useRef<(pick: SearchPick) => void>(() => undefined);
  searchPickRef.current = (pick: SearchPick) => {
    if (pick.kind === 'deal') void openDeal(route, pick.deal);
    else if (pick.kind === 'business') openBusiness({ code: pick.code, id: pick.id, name: pick.name }, route);
    else {
      setDealsSearch((prev) => ({ query: pick.query, key: prev.key + 1 }));
      setRoute('deals');
    }
  };
  useEffect(() => {
    const onPick = (event: Event) => {
      const pick = (event as CustomEvent<SearchPick>).detail;
      if (pick) searchPickRef.current(pick);
    };
    window.addEventListener(SEARCH_PICK_EVENT, onPick);
    return () => window.removeEventListener(SEARCH_PICK_EVENT, onPick);
  }, []);
  useEffect(() => {
    if (route !== 'deals' && dealsSearch.query) setDealsSearch((prev) => ({ ...prev, query: '' }));
  }, [route, dealsSearch.query]);

  const openDealComments = (from: Route, deal?: ClaimDealSummary | null) => {
    setDealFrom(from);
    setSelectedDeal(deal ?? null);
    setCommentsModalOnly(true);
    setRoute(from);
  };

  const startClaim = (from: Route) => {
    if (dealClaimed) {
      setClaimedFrom(from);
      setRoute('claimed-deal');
      return;
    }
    setRoute(authed ? 'claim-confirm' : 'claim-auth');
  };

  /** The deal as the page shows it, frozen onto the voucher. */
  const claimDealFields = () => ({
    dealTitle: liveDeal.detail?.title ?? selectedDeal?.title,
    dealBusiness: liveDeal.detail?.businessName ?? selectedDeal?.business,
    dealImage: liveDeal.detail?.image ?? selectedDeal?.image,
    dealLocation: liveDeal.detail?.address ?? selectedDeal?.location,
    dealPrice: liveDeal.detail?.price ?? parsePrice(selectedDeal?.price),
    dealOldPrice: liveDeal.detail?.oldPrice ?? (parsePrice(selectedDeal?.oldPrice) || parsePrice(selectedDeal?.price)),
    discountLabel: selectedDeal?.discountLabel,
    dealPhone: liveDeal.detail?.phone ?? undefined,
    dealLatitude: liveDeal.detail?.latitude ?? undefined,
    dealLongitude: liveDeal.detail?.longitude ?? undefined,
    terms: liveDeal.detail?.terms,
  });

  // A claim is two API steps: a code is emailed to the holder, then the code is
  // traded for the voucher. Self claims trade it on the code step; claims for
  // someone else trade it after their summary.
  const [claimHolder, setClaimHolder] = useState<ClaimHolder | null>(null);
  const [claimCode, setClaimCode] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimBusy, setClaimBusy] = useState(false);

  const sendClaimCode = async (holder: ClaimHolder) => {
    const offerId = selectedDeal?.id ? String(selectedDeal.id) : liveDeal.detail?.id;
    setClaimHolder(holder);
    setClaimError(null);
    setClaimBusy(true);
    try {
      if (!offerId) throw new Error('This deal can’t be claimed right now.');
      await claims.requestClaimCode(offerId, holder);
    } catch (error) {
      setClaimError(apiErrorMessage(error, 'We couldn’t send the code. Please try again.'));
    } finally {
      setClaimBusy(false);
    }
  };

  const holderFromRecipient = (recipient: { name: string; email: string; phone?: string }): ClaimHolder => {
    const [firstName = '', ...rest] = recipient.name.trim().split(/\s+/);
    return { firstName, lastName: rest.join(' '), email: recipient.email, phone: recipient.phone ?? '' };
  };

  const completeClaim = async (code = claimCode): Promise<boolean> => {
    setClaimBusy(true);
    setClaimError(null);
    try {
      const record = await claims.recordClaim({
        offerId: selectedDeal?.id ? String(selectedDeal.id) : liveDeal.detail?.id,
        kind: claimRecipient ? 'someone-else' : 'self',
        ...claimDealFields(),
        code: hasApiConfig() ? code : undefined,
        email: claimHolder?.email,
        sender: { name: profile.fullName, email: profile.email, phone: profile.phone },
        recipient: claimRecipient ?? undefined,
      });
      setActiveClaim(record);
      setClaimRecipient(null);
      setClaimHolder(null);
      setClaimCode('');
      markClaimed();
      claimSuccessRef.current?.();
      claimSuccessRef.current = null;
      setRoute('claim-success');
      return true;
    } catch (error) {
      setClaimError(apiErrorMessage(error, 'We couldn’t confirm this claim. Please try again.'));
      return false;
    } finally {
      setClaimBusy(false);
    }
  };

  /** Back on the code step with the reason shown (a wrong or expired code). */
  const backToClaimCode = () => setRoute('claim-verify');

  const completeGift = async () => {
    setClaimBusy(true);
    setClaimError(null);
    try {
      const record = await claims.recordClaim({
        offerId: selectedDeal?.id ? String(selectedDeal.id) : undefined,
        kind: 'gift',
        ...claimDealFields(),
        sender: { name: profile.fullName, email: profile.email, phone: profile.phone },
        note: giftNote,
        recipient: giftRecipient
          ? { name: giftRecipient.name, email: giftRecipient.email, phone: giftRecipient.phone }
          : undefined,
      });
      setActiveClaim(record);
      markClaimed();
      setClaimDialog(null);
      setRoute('gift-sent');
    } catch (error) {
      setClaimError(apiErrorMessage(error, 'We couldn’t send this gift. Please try again.'));
    } finally {
      setClaimBusy(false);
    }
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
  const confirmSelfClaim = async () => {
    setClaimSelfConfirmOpen(false);
    setClaimRecipient(null);
    if (!hasApiConfig()) {
      await completeClaim();
      return;
    }
    const holder = { firstName: profile.firstName, lastName: profile.lastName, email: profile.email, phone: profile.phone };
    setRoute('claim-verify');
    await sendClaimCode(holder);
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
  const finishDesktopClaim = async (kind: 'self' | 'gift' | 'someone-else') => {
    if (kind === 'gift') {
      // Stays open on failure so the reason shows on the review step.
      await completeGift();
      return;
    }
    setClaimDialog(null);
    if (!(await completeClaim())) setClaimDialog('verify');
  };

  useEffect(() => {
    if (route === 'discovering') {
      window.localStorage.setItem(ONBOARDED_KEY, '1');
      // Demo mode signs the visitor in here; live users are already signed in
      // by sign-up (a credential-less live sign-in would only throw).
      if (!hasApiConfig()) signIn();
    }
  }, [route, signIn]);

  // The identity question only ever belongs to one visit to business onboarding.
  useEffect(() => {
    if (route !== 'business-onboarding') setBusinessChoiceOpen(false);
  }, [route]);

  const openFeedRoute = (target: 'featured-deals' | 'filters', from: Route) => {
    setFeedFrom(from);
    setRoute(target);
  };

  const accountNav = (target: AccountTarget) => {
    if (target === 'business-onboarding') {
      // An owner switching to the customer view still owns a business.
      void openBusinessSetup('account');
      return;
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
        void openBusinessSetup(route);
        break;
      case 'sign-in':
        setSignInFrom('welcome');
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
      case 'saved':
        setRoute('saved');
        break;
      case 'notifications':
        setRoute('notifications');
        break;
      case 'referrals':
        setRoute('referrals');
        break;
      case 'account-settings':
        setRoute('account-settings');
        break;
      case 'deal-detail':
        setRoute('deal-detail');
        break;
      case 'for-merchants':
        void openBusinessSetup(route);
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
        void openBusinessSetup(route);
        break;
      case 'sign-in':
        setSignInFrom('welcome');
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
      case 'saved':
        setRoute('saved');
        break;
      case 'notifications':
        setRoute('notifications');
        break;
      case 'referrals':
        setRoute('referrals');
        break;
      case 'account-settings':
        setRoute('account-settings');
        break;
      case 'deal-detail':
        setRoute('deal-detail');
        break;
      case 'for-merchants':
        void openBusinessSetup(route);
        break;
    }
  };

  const [boostReturnRoute, setBoostReturnRoute] = useState<Route>('business-overview');
  const [boostItem, setBoostItem] = useState<string | null>(null);
  // Live: the boost or promotion the metrics screen shows (null = latest active).
  const [boostMetricsTarget, setBoostMetricsTarget] = useState<{ kind: 'boost' | 'promotion'; id: string } | null>(null);
  const [hubCustomerName, setHubCustomerName] = useState('Michael James');
  const [hubCustomerId, setHubCustomerId] = useState<string | null>(null);
  // Live deals: the catalogue item a new deal is built on, the deal being
  // viewed or priced, and a one-off catalogue message ("pick an item").
  const [dealSource, setDealSource] = useState<CatalogueItem | null>(null);
  const [dealGroupId, setDealGroupId] = useState<string | null>(null);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  // Live branches & pricing: the branch opened from Locations, the item whose
  // branch prices are edited, and the add-branch form shown inside Locations.
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [pricingItemId, setPricingItemId] = useState<string | null>(null);
  const [addingBranch, setAddingBranch] = useState(false);
  /** Deals start from a real item; with none chosen, live sends the owner to the catalogue. */
  const openDealStudio = (item?: CatalogueItem | null) => {
    if (item) {
      setDealSource(item);
      setCatalogNotice(null);
      setRoute('deal-studio');
      return;
    }
    if (hasApiConfig()) {
      setCatalogNotice(
        isDesktop
          ? 'Pick an item, then choose Add to Deals (or Make a Deal after publishing).'
          : 'Pick an item, then tap Make a Deal in its options.',
      );
      setRoute('hub-catalog');
      return;
    }
    setRoute('deal-studio');
  };
  /** Cluster "Create location": live opens the add-branch form in Locations. */
  const openCreateLocation = () => {
    if (hasApiConfig()) {
      if (isDesktop) setAddingBranch(true);
      setRoute('hub-locations');
      return;
    }
    setRoute('deal-create-locations');
  };
  const openDealGroup = (next: Route) => (id?: string) => {
    setDealGroupId(id ?? null);
    setRoute(next);
  };
  useEffect(() => {
    if (route !== 'hub-catalog') setCatalogNotice(null);
    if (route !== 'hub-locations') setAddingBranch(false);
  }, [route]);

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
        // The metrics tab shows the latest active campaign.
        setBoostMetricsTarget(null);
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
    desc: 'Interacted or placed 2+ orders with your local dining partner in the trailing 90 days.',
  });

  // Live: the saved segment whose rules are being edited (null creates a new one).
  const [editingSegment, setEditingSegment] = useState<SegmentRef['segment'] | null>(null);

  const useSegment = (segment: SegmentRef) => {
    setActiveSegment(segment);
    setRoute('segment-actions');
  };

  const viewSegment = (segment?: SegmentRef) => {
    if (segment) setActiveSegment(segment);
    setRoute('segment-detail');
  };

  const createSegment = () => {
    setEditingSegment(null);
    setRoute('segment-create');
  };

  const editSegmentRules = () => {
    setEditingSegment(activeSegment.segment ?? null);
    setRoute('segment-create');
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

  const dealClaim = claims.claims.find((claim) => claim.status === 'claimed' && !claim.sentForOther && claim.offerId === liveDeal.detail?.id);
  const dealClaimed = Boolean(dealClaim);
  // Opened from the deal page, the voucher screen shows that deal's voucher, not the latest one.
  // A scanned pass link opens that voucher, or nothing if it isn't this account's.
  const scannedPassId = route === 'claimed-deal' ? passIdFromPath(window.location.pathname) : null;
  const scannedClaim = scannedPassId ? claims.claims.find((claim) => claim.id === scannedPassId && !claim.sentForOther) ?? null : undefined;
  const dashboardClaim = (claimedFrom === 'dashboard' || claimedFrom === 'my-deals') && dashboardClaimRef ? claims.claims.find((claim) => claim.ref === dashboardClaimRef) : undefined;
  const walletClaim = scannedClaim !== undefined ? scannedClaim : claimedFrom === 'deal-detail' ? dealClaim : dashboardClaim;
  const openDashboardVoucher = (claim: ClaimRecord, target: 'claimed-deal' | 'claimed-contact') => {
    setDashboardClaimRef(claim.ref);
    setClaimedFrom('dashboard');
    setRoute(target);
  };

  /** Opens the customer's chat with the deal's branch; rejects when it can't be opened. */
  // Closing the comments or reviews sheet refreshes the page's counts, so a new post shows.
  useEffect(() => {
    if (route === 'comments' || route === 'reviews') dealSheetOpen.current = true;
    else if (dealSheetOpen.current) {
      dealSheetOpen.current = false;
      if (route === 'deal-detail') liveDeal.reload();
    }
  }, [route, liveDeal.reload]);

  /** Opens the customer's chat with a branch, or the inbox if it can't be opened. */
  const openBranchChat = (branchId?: string) => {
    if (!branchId) {
      setRoute('messages');
      return;
    }
    messageService
      .openBranchThread(branchId)
      .then((threadId) => {
        setActiveConversation(threadId);
        setRoute('conversation');
      })
      .catch(() => setRoute('messages'));
  };

  const openDealChat = async () => {
    const branchId = liveDeal.detail?.branchId;
    if (!branchId) throw new Error('Chat is not available for this deal');
    if (dealChatOpening.current) return; // A second click must not race a second new chat into being.
    dealChatOpening.current = true;
    try {
      const threadId = await messageService.openBranchThread(branchId);
      setActiveConversation(threadId);
      setRoute('conversation');
    } finally {
      dealChatOpening.current = false;
    }
  };

  const renderDetail = () =>
    isDesktop ? (
      <DesktopDealDetailScreen
        onNav={feedNav}
        onBack={() => setRoute(dealFrom)}
        onClaimComplete={handleClaimComplete}
        onOpenBusiness={() => void openBusinessForDeal(selectedDeal, 'deal-detail')}
        detail={liveDeal.detail}
        loading={liveDeal.loading}
        error={liveDeal.error}
        onRetry={liveDeal.reload}
        onChat={openDealChat}
        claimed={dealClaimed}
        onViewWallet={() => {
          setClaimedFrom('deal-detail');
          setRoute('claimed-deal');
        }}
      />
    ) : (
      <DealDetailScreen
        onBack={() => setRoute(dealFrom)}
        onHowToClaim={() => openHowToClaim('deal-detail')}
        onTerms={() => {
          setTermsFrom('deal-detail');
          setRoute('deal-terms');
        }}
        onComments={() => {
          setCommentsModalOnly(false);
          setRoute('comments');
        }}
        onReviews={() => setRoute('reviews')}
        onShare={() => setRoute('share')}
        onClaim={() => startClaim('deal-detail')}
        onMerchant={() => void openBusinessForDeal(selectedDeal, 'deal-detail')}
        claimed={dealClaimed}
        onViewWallet={() => {
          setClaimedFrom('deal-detail');
          setRoute('claimed-deal');
        }}
        detail={liveDeal.detail}
        loading={liveDeal.loading}
        error={liveDeal.error}
        onRetry={liveDeal.reload}
        onChat={openDealChat}
      />
    );

  /** Releases the voucher on the API first; rejects, keeping it, when the API refuses. */
  const cancelActiveClaim = async () => {
    const active = walletClaim ?? currentVoucher(claims.claims);
    if (active?.id) await claims.deleteClaim(active.id);
    else if (active) claims.removeClaim(active.ref);
    setActiveClaim(null);
    resetClaim();
    setRoute('home');
  };

  const requestCustomerSignupOtp = async (email: string) => {
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      throw new Error('An email is required to continue.');
    }

    setCustomerSignup((current) => ({ ...current, email: nextEmail }));
    // A customer sign-up replaces any business one left unfinished here.
    clearBusinessSignup();

    if (!hasApiConfig()) {
      return;
    }

    await authService.requestCustomerOtp({ email: nextEmail });
  };

  /** Business sign-up (`business-auth`): live, the email gets a 6-digit owner code. */
  const requestOwnerSignupOtp = async (email: string) => {
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      throw new Error('An email is required to continue.');
    }

    setCustomerSignup((current) => ({ ...current, email: nextEmail }));

    if (hasApiConfig()) await ownerAuthService.requestOtp(nextEmail);
    // Email screen done: a return visit opens the code screen for this email.
    saveBusinessSignup({ stage: 'verify-email', email: nextEmail });
  };

  /**
   * Live: verify the owner code, then collect name, phone and PIN on the
   * shared profile-setup screen before registering. Demo goes straight to setup.
   */
  const verifyOwnerSignupCode = async (code: string) => {
    if (!hasApiConfig()) {
      clearBusinessSignup();
      enterBusinessProfile();
      return;
    }
    const nextCode = code.trim();
    await ownerAuthService.verifyOtp(customerSignup.email, nextCode);
    setCustomerSignup((current) => ({ ...current, code: nextCode }));
    // Code screen done: a return visit opens the details screen.
    saveBusinessSignup({ stage: 'profile-setup', email: customerSignup.email });
    setRoute('profile-setup');
  };

  /** Registers the owner with the PIN as their sign-in secret (same as customers) and keeps the session. */
  const completeOwnerSignup = async (details: { firstName: string; lastName: string; phone: string; pin: string }) => {
    const firstName = details.firstName.trim();
    const lastName = details.lastName.trim();
    const phone = details.phone.replace(/\D/g, '').slice(0, 15);
    const pin = details.pin.replace(/\D/g, '').slice(0, 6);
    if (pin.length !== 6) {
      throw new Error('Create a 6-digit security PIN to continue.');
    }

    const email = customerSignup.email;
    const referralCode = getProvisionalReferralCode() || undefined;
    try {
      adoptSession(
        await ownerAuthService.register({
          email,
          password: pin,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(phone ? { businessNumber: `+${phone}` } : {}),
          referralCode,
        }),
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes(OTP_GATE_MESSAGE)) {
        // The code step has to be redone, so a return visit reopens it.
        saveBusinessSignup({ stage: 'verify-email' });
        throw new Error('Your code has expired. Go back, request a new one and try again.');
      }
      throw error;
    }

    // The code was consumed with the sign-up above.
    if (referralCode) clearProvisionalReferralCode();

    // The account exists now: setup progress takes over (saved on the account).
    clearBusinessSignup();
    profile.update({ firstName: firstName || 'User', lastName, email, phone: phone ? `+${phone}` : '' });
    enterBusinessProfile();
  };

  /**
   * Plain wording for a rejected sign-up code. The API keeps only the newest
   * code per email, so a code from an earlier email reads as "invalid".
   */
  const signupCodeError = (error: unknown, stage: 'code' | 'profile') => {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('expired')) {
      return new Error(
        stage === 'code'
          ? 'That code has expired — tap Resend for a new one.'
          : 'Your verification code expired. Go back, request a new code and try again.',
      );
    }
    if (message.includes('invalid otp') || message.includes('otp not found') || message.includes('session not found')) {
      return new Error(
        stage === 'code'
          ? 'That code isn’t right — use the code in the most recent email, or tap Resend.'
          : 'Your verification code is no longer valid. Go back, request a new code and try again.',
      );
    }
    return error instanceof Error ? error : new Error('We could not verify your code. Please try again.');
  };

  const handleCustomerSignupVerification = async (code: string) => {
    const nextCode = code.replace(/\D/g, '').slice(0, 6);
    if (!nextCode) {
      throw new Error('Enter the 6-digit verification code to continue.');
    }

    // Live: check the code now (like the owner path), so a wrong or superseded
    // code is caught here instead of after the whole profile is filled in.
    if (hasApiConfig()) {
      try {
        await ownerAuthService.verifyOtp(customerSignup.email, nextCode);
      } catch (error) {
        throw signupCodeError(error, 'code');
      }
    }

    setCustomerSignup((current) => ({ ...current, code: nextCode }));
  };

  const completeCustomerSignup = async (details: { firstName: string; lastName: string; phone: string; pin: string }) => {
    const email = customerSignup.email.trim().toLowerCase();
    const code = customerSignup.code.replace(/\D/g, '').slice(0, 6);
    const firstName = details.firstName.trim();
    const lastName = details.lastName.trim();
    const phone = details.phone.replace(/\D/g, '').slice(0, 15);
    const pin = details.pin.replace(/\D/g, '').slice(0, 6);

    if (!email || !code) {
      throw new Error('Your email and verification code are required to finish registration.');
    }

    if (pin.length !== 6) {
      throw new Error('Create a 6-digit security PIN to continue.');
    }

    const payload = {
      email,
      code,
      pin,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(phone ? { phone: `+${phone}` } : {}),
      referralCode: getProvisionalReferralCode() || undefined,
    };

    if (hasApiConfig()) {
      try {
        await authService.verifyCustomerPin(payload);
      } catch (error) {
        throw signupCodeError(error, 'profile');
      }
      // The code was recorded with the sign-up above.
      clearProvisionalReferralCode();
    }

    profile.update({
      firstName: firstName || 'User',
      lastName,
      email,
      phone: phone ? `+${phone}` : '',
    });
    markAuthenticated(true);
  };

  /**
   * Point the saved run at "Business Profile": it is parked on the marketing
   * intro while sign-up (or the account-identity choice) happens, so it must
   * resume on profile details instead of looping back to that intro. A
   * merchant already mid-setup keeps their saved step.
   */
  const resumeAtBusinessProfile = () => {
    const saved = getBusinessSetupSnapshot();
    if (!saved || saved.step === 'intro') setBusinessSetupSnapshotStep('basic');
    setBusinessSetupSkipIntro(true);
  };

  /**
   * A merchant who just finished business sign-up (`business-auth` → email
   * code or Google confirmation) enters setup on "Business Profile". The
   * marketing intro has already run, and the existing-account choice must not
   * re-appear for this brand-new business identity.
   */
  const enterBusinessProfile = () => {
    // Live, the owner-account step on setup signs the merchant in.
    if (!hasApiConfig()) void signIn();
    setAuthIntent('customer');
    const open = () => {
      resumeAtBusinessProfile();
      setRoute('business-onboarding');
    };
    // Live: pick up a run saved on the account (signed out, or another device).
    if (hasApiConfig()) void hydrateBusinessSetupFromServer().then(open);
    else open();
  };

  /**
   * A signed-in owner returns to the shell they last used. Unfinished setup, or
   * no business yet, is the customer shell; setup reopens from its button.
   * Staff and admins only have the business side.
   */
  const resumeReturnPath = () => {
    const path = window.sessionStorage.getItem(RETURN_PATH_KEY);
    window.sessionStorage.removeItem(RETURN_PATH_KEY);
    if (!path) return false;
    setRoute(entryRoute(path, true, isDesktop));
    return true;
  };

  const routeSignedInOwner = async (user?: SessionUser | null, replaceTo?: (target: Route) => void) => {
    if (!replaceTo && resumeReturnPath()) return;
    const go = replaceTo ?? setRoute;
    const saved = await hydrateBusinessSetupFromServer();
    const customerShell =
      user?.lastActiveShell === 'customer' ||
      (user?.role === 'Owner' && (hasUnfinishedBusinessSetup(saved) || !user.businessId));
    if (!customerShell) {
      go('business-overview');
      return;
    }
    setAuthIntent('customer');
    go('home');
  };

  // The session has loaded: a customer (or an owner on a customer token) stays on
  // home; a business token goes back through the same choice as signing in.
  useEffect(() => {
    if (!returningToShell || !(sessionUser || sessionQuery.isError)) return;
    if (!isBusinessRole(sessionUser?.role)) {
      setReturningToShell(false);
      return;
    }
    void routeSignedInOwner(sessionUser, setRouteState).finally(() => setReturningToShell(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returningToShell, sessionUser, sessionQuery.isError]);

  /**
   * "Set up your business on VEMTAP": the way back into unfinished setup, on the
   * page after the last one completed. Finished owners get their dashboard.
   */
  const openBusinessSetup = async (from: Route = route) => {
    setBusinessOnboardingFrom(from);
    if (!isBusinessSession) {
      setRoute('business-onboarding');
      return;
    }
    setShellHold(true);
    try {
      const owner = sessionUser?.role === 'Customer' ? await switchShell(sessionUser.businessRole ?? 'Owner') : sessionUser;
      const saved = await hydrateBusinessSetupFromServer();
      if (hasUnfinishedBusinessSetup(saved)) {
        setAuthIntent('customer');
        setBusinessSetupSkipIntro(true);
        setRoute('business-onboarding');
      } else if (owner?.role === 'Owner' && !owner.businessId) {
        setAuthIntent('customer');
        resumeAtBusinessProfile();
        setRoute('business-onboarding');
      } else {
        setRoute('business-overview');
      }
    } catch (error) {
      console.error('Could not open business setup:', error);
    } finally {
      setShellHold(false);
    }
  };

  // Sign-up location (live): the browser's position or a typed area becomes
  // the customer's saved location; failures reject with a message the screen shows.
  const savedLocation = useLocation();
  const savePlace = (place: PickedPlace, radius = savedLocation.radius) =>
    savedLocation.setLocation(place.district, radius, { city: place.city, lat: place.lat, lng: place.lng });
  const saveCurrentPlace = async () => savePlace(await getCurrentPlace());
  const saveTypedPlace = async (area: string) => {
    const place = await findPlace(area);
    if (!place) throw new Error(AREA_NOT_FOUND);
    savePlace(place);
  };
  const confirmPlace = hasApiConfig()
    ? {
        district: savedLocation.district,
        city: savedLocation.city === 'Your city' ? undefined : savedLocation.city,
      }
    : {};

  /** Live "Continue with Google": leaves for Google, or shows why it can't. */
  const continueWithGoogle = (intent: GoogleIntent, from: Route) => {
    setGoogleError(null);
    try {
      startGoogleSignIn(intent, from);
    } catch (error) {
      setGoogleError({ route: from, message: apiErrorMessage(error) });
    }
  };

  // Back from Google: sign in through the API, then continue the journey the
  // visitor started (new accounts confirm their phone first).
  const googleHandled = useRef(false);
  useEffect(() => {
    const result = GOOGLE_REDIRECT;
    if (!result || googleHandled.current) return;
    googleHandled.current = true;
    const from = (result.pending.from in ROUTE_PATH ? result.pending.from : 'welcome') as Route;
    const fail = (message: string) => setGoogleError({ route: from, message });
    if (result.error) {
      // Closing Google's page is a cancel, not an error.
      if (result.error !== 'access_denied') fail('Google sign-in didn’t complete. Please try again.');
      setShellHold(false);
      return;
    }
    const { intent } = result.pending;
    void (async () => {
      try {
        const response = (await authService.googleSignIn({
          token: result.idToken,
          ...(intent === 'business' ? { role: 'OWNER' } : intent === 'customer' ? { role: 'CUSTOMER' } : {}),
        })) as Parameters<typeof adoptSession>[0] & { isNewUser?: boolean; requiresTwoFactor?: boolean };
        if (response.requiresTwoFactor) {
          fail('This account uses two-factor sign-in. Sign in with your email and PIN instead.');
          return;
        }
        const user = adoptSession(response);
        const isNew = Boolean(response.isNewUser);
        // A new account can still claim the code captured from a referral
        // link before Google redirected away — best effort, so a rejected or
        // unknown code never blocks the sign-in flow.
        const pendingReferral = getProvisionalReferralCode();
        if (isNew && pendingReferral) {
          void referralsService
            .claim(pendingReferral)
            .then(() => clearProvisionalReferralCode())
            .catch(() => {
              // Leave the stored code; the confirm screen can still take one.
            });
        }
        const business = isBusinessRole(user?.role);
        if (business && user?.businessId && !isNew) {
          await routeSignedInOwner(user);
          return;
        }
        if (intent === 'business') {
          setAuthIntent('business');
          if (isNew) setRoute('google-confirm');
          else if (business) enterBusinessProfile();
          else {
            // An existing customer account: the usual "use this account or a
            // new business identity" question decides.
            setBusinessOnboardingFrom(from);
            setRoute('business-onboarding');
            setBusinessChoiceOpen(true);
          }
          return;
        }
        if (business) {
          await routeSignedInOwner(user);
          return;
        }
        setAuthIntent('customer');
        // New accounts confirm their phone; returning customers go straight home.
        if (isNew) setRoute('google-confirm');
        else if (!resumeReturnPath()) setRoute('home');
      } catch (error) {
        fail(apiErrorMessage(error, 'Google sign-in failed. Please try again.'));
      } finally {
        setShellHold(false);
      }
    })();
    // Runs once for the page Google returned to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderClaimed = () =>
    isDesktop ? (
      <DesktopClaimedDealScreen
        onNav={feedNav}
        onBack={() => setRoute(claimedFrom)}
        onContact={() => setRoute('claimed-contact')}
        onReview={() => setRoute('support')}
        onCancelClaim={cancelActiveClaim}
        claim={walletClaim}
      />
    ) : (
      <ClaimedDealScreen
        onBack={() => setRoute(claimedFrom)}
        onContact={() => setRoute('claimed-contact')}
        onReview={() => setRoute('support')}
        onCancelClaim={cancelActiveClaim}
        claim={walletClaim}
      />
    );

  /** The code step: self claims finish here, others go on to their summary. */
  const onClaimCode = (code: string) => {
    if (claimRecipient) {
      setClaimCode(code);
      setClaimError(null);
      setRoute('claim-summary');
      return;
    }
    void completeClaim(code);
  };

  const renderRoute = () => {
    // Sign In opened from the business sign-up modal: authenticating resumes
    // business setup instead of dropping the merchant into the customer feed.
    const resumeBusinessSetup = signInFrom === 'business-auth';
    switch (route) {
    case 'welcome':
      if (isDesktop) return <DesktopWelcomeScreen onNav={nav('start-vemtap')} />;
      return <WelcomeScreen onGetStarted={() => setRoute('start-vemtap')} onSignIn={() => {
        setSignInFrom('welcome');
        setRoute('sign-in');
      }} />;

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
          onBusinessSetup={() => {
            setBusinessOnboardingFrom('start-vemtap');
            setRoute('business-onboarding');
          }}
        />
      );

    case 'auth-code':
      if (isDesktop)
        return (
          <DesktopAuthCodeScreen
            onBack={() => setRoute(authFrom)}
            onContinue={() => setRoute('sign-in')}
            onSubmitEmail={async (email) => {
              await requestCustomerSignupOtp(email);
              setAuthIntent('customer');
              setRoute('verify-email');
            }}
            onGoogle={() => {
              if (hasApiConfig()) {
                continueWithGoogle('customer', 'auth-code');
                return;
              }
              signIn();
              setAuthIntent('customer');
              setRoute('google-confirm');
            }}
            googleError={googleError?.route === 'auth-code' ? googleError : null}
            onSignIn={() => {
              setSignInFrom('auth-code');
              setRoute('sign-in');
            }}
            onBusinessRegister={() => {
              setBusinessOnboardingFrom('auth-code');
              setRoute('business-onboarding');
            }}
          />
        );
      return (
        <AuthCodeScreen
          onBack={() => setRoute(authFrom)}
          onContinue={() => setRoute('sign-in')}
          onSubmitEmail={async (email) => {
            await requestCustomerSignupOtp(email);
            setAuthIntent('customer');
            setRoute('verify-email');
          }}
          onGoogle={() => {
            if (hasApiConfig()) {
            continueWithGoogle('customer', 'auth-code');
            return;
            }
            signIn();
            setAuthIntent('customer');
            setRoute('google-confirm');
          }}
          googleError={googleError?.route === 'auth-code' ? googleError : null}
          // "Already have an account? Sign In" reuses the shared sign-in
          // screen instead of continuing into verification (desktop parity).
          onSignIn={() => {
            setSignInFrom('auth-code');
            setRoute('sign-in');
          }}
          onBusinessRegister={() => {
            setBusinessOnboardingFrom('auth-code');
            setRoute('business-onboarding');
          }}
        />
      );

    /**
     * The same sign-up modal, opened as a business. Entered from "Set Up My
     * Business" on the business intro (and from "use a new account" on the
     * account-choice screen), so `authIntent` routes verification to the
     * Business Profile page and the swap card invites a customer to register
     * instead of a second business.
     */
    case 'business-auth':
      if (isDesktop)
        return (
          <DesktopAuthCodeScreen
            mode="business"
            onBack={() => setRoute('business-onboarding')}
            onContinue={() => {
              setAuthIntent('business');
              setRoute('verify-email');
            }}
            onSubmitEmail={async (email) => {
              await requestOwnerSignupOtp(email);
              setAuthIntent('business');
              setRoute('verify-email');
            }}
            onGoogle={() => {
              if (hasApiConfig()) {
                continueWithGoogle('business', 'business-auth');
                return;
              }
              signIn();
              setAuthIntent('business');
              setRoute('google-confirm');
            }}
            googleError={googleError?.route === 'business-auth' ? googleError : null}
            onSignIn={() => {
              setSignInFrom('business-auth');
              setRoute('sign-in');
            }}
            onCustomerRegister={() => {
              setAuthFrom('business-auth');
              setRoute('auth-code');
            }}
          />
        );
      return (
        <AuthCodeScreen
          mode="business"
          onBack={() => setRoute('business-onboarding')}
          onContinue={() => {
            setAuthIntent('business');
            setRoute('verify-email');
          }}
          onSubmitEmail={async (email) => {
            await requestOwnerSignupOtp(email);
            setAuthIntent('business');
            setRoute('verify-email');
          }}
          onGoogle={() => {
            if (hasApiConfig()) {
            continueWithGoogle('business', 'business-auth');
            return;
            }
            signIn();
            setAuthIntent('business');
            setRoute('google-confirm');
          }}
          googleError={googleError?.route === 'business-auth' ? googleError : null}
          onSignIn={() => {
            setSignInFrom('business-auth');
            setRoute('sign-in');
          }}
          onCustomerRegister={() => {
            setAuthFrom('business-auth');
            setRoute('auth-code');
          }}
        />
      );

    case 'forgot-pin':
      if (isDesktop) return <DesktopForgotPinScreen onBack={() => setRoute('sign-in')} />;
      return <ForgotPinScreen onBack={() => setRoute('sign-in')} />;

    case 'sign-in':
      if (isDesktop)
        return (
          <DesktopSignInScreen
            onBack={() => setRoute(signInFrom)}
            onSignIn={async ({ identifier, password }) => {
              const user = await signIn({ identifier, password });
              if (resumeBusinessSetup) {
                enterBusinessProfile();
                return;
              }
              if (isBusinessRole(user?.role)) {
                await routeSignedInOwner(user);
                return;
              }
              // A returning customer goes straight home; onboarding is for sign-up.
              if (!resumeReturnPath()) setRoute(hasApiConfig() ? 'home' : 'discovering');
            }}
            onGoogleSignIn={async () => {
              if (hasApiConfig()) {
                continueWithGoogle(resumeBusinessSetup ? 'business' : 'sign-in', 'sign-in');
                return;
              }
              if (!hasApiConfig()) {
                await signIn({ identifier: 'demo@vemtap.com', password: 'demo-password' });
              }
              if (resumeBusinessSetup) {
                enterBusinessProfile();
                return;
              }
              setRoute('google-confirm');
            }}
            onCreateAccount={() => {
              setAuthFrom('sign-in');
              setRoute('auth-code');
            }}
            // Every business entry opens the business intro — the sign-up
            // modal it leads to is what collects the new merchant's credentials.
            onBusinessRegister={() => {
              setBusinessOnboardingFrom('sign-in');
              setRoute('business-onboarding');
            }}
            onForgotPin={() => setRoute('forgot-pin')}
            googleError={googleError?.route === 'sign-in' ? googleError : null}
          />
        );
      return (
        <SignInScreen
          onBack={() => setRoute(signInFrom)}
          onSignIn={async ({ identifier, password }) => {
            const user = await signIn({ identifier, password });
            if (resumeBusinessSetup) {
              enterBusinessProfile();
              return;
            }
            if (isBusinessRole(user?.role)) {
              await routeSignedInOwner(user);
              return;
            }
            // A returning customer goes straight home; onboarding is for sign-up.
            if (!resumeReturnPath()) setRoute(hasApiConfig() ? 'home' : 'discovering');
          }}
          onGoogleSignIn={async () => {
            if (hasApiConfig()) {
            continueWithGoogle(resumeBusinessSetup ? 'business' : 'sign-in', 'sign-in');
            return;
            }
            if (!hasApiConfig()) {
              await signIn({ identifier: 'demo@vemtap.com', password: 'demo-password' });
            }
            if (resumeBusinessSetup) {
              enterBusinessProfile();
              return;
            }
            setRoute('google-confirm');
          }}
          onCreateAccount={() => {
            setAuthFrom('sign-in');
            setRoute('auth-code');
          }}
          // Every business entry opens the business intro — the sign-up
          // modal it leads to is what collects the new merchant's credentials.
          onBusinessRegister={() => {
            setBusinessOnboardingFrom('sign-in');
            setRoute('business-onboarding');
          }}
          onForgotPin={() => setRoute('forgot-pin')}
            googleError={googleError?.route === 'sign-in' ? googleError : null}
        />
      );

    case 'verify-email': {
      // The code screen is shared: a merchant who signed up through
      // `business-auth` finishes on the Business Profile page, a customer
      // keeps going through the consumer profile setup.
      const businessSignup = authIntent === 'business';
      const authEntry: Route = businessSignup ? 'business-auth' : 'auth-code';
      if (isDesktop)
        return (
          <DesktopVerifyEmailScreen
            onBack={() => setRoute(authEntry)}
            onContinue={async (code) => {
              if (businessSignup) {
                await verifyOwnerSignupCode(code);
                return;
              }
              await handleCustomerSignupVerification(code);
              setRoute('profile-setup');
            }}
            onEditEmail={() => setRoute(authEntry)}
            onBusinessSetup={() => void openBusinessSetup()}
            email={customerSignup.email}
            onResend={async () => {
              if (businessSignup) await requestOwnerSignupOtp(customerSignup.email);
              else await requestCustomerSignupOtp(customerSignup.email);
            }}
          />
        );
      return (
        <VerifyEmailScreen
          onBack={() => setRoute(authEntry)}
          onContinue={async (code) => {
            if (businessSignup) {
              await verifyOwnerSignupCode(code);
              return;
            }
            await handleCustomerSignupVerification(code);
            setRoute('profile-setup');
          }}
          onEditEmail={() => setRoute(authEntry)}
          onBusinessSetup={() => void openBusinessSetup()}
          email={businessSignup && !hasApiConfig() ? undefined : customerSignup.email}
          onResend={
            businessSignup
              ? hasApiConfig()
                ? async () => {
                    await requestOwnerSignupOtp(customerSignup.email);
                  }
                : undefined
              : async () => {
                  await requestCustomerSignupOtp(customerSignup.email);
                }
          }
        />
      );
    }

    case 'profile-setup': {
      // Business sign-up keeps the name and phone typed here across visits.
      const businessSignup = authIntent === 'business';
      const savedSignup = businessSignup ? getBusinessSignup() : null;
      const signupDraft = savedSignup
        ? { firstName: savedSignup.firstName ?? '', lastName: savedSignup.lastName ?? '', phone: savedSignup.phone ?? '' }
        : undefined;
      const saveSignupDraft = businessSignup ? (draft: ProfileSetupDraft) => saveBusinessSignup(draft) : undefined;
      if (isDesktop)
        return (
          <DesktopProfileSetupScreen
            onBack={() => setRoute('verify-email')}
            email={customerSignup.email}
            code={customerSignup.code}
            initialValues={signupDraft}
            onDraftChange={saveSignupDraft}
            onComplete={async (details) => {
              if (authIntent === 'business') {
                await completeOwnerSignup(details);
                return;
              }
              await completeCustomerSignup(details);
              setRoute('location-permission');
            }}
            onBusinessSetup={() => void openBusinessSetup()}
          />
        );
      return (
        <ProfileSetupScreen
          onBack={() => setRoute('verify-email')}
          email={customerSignup.email}
          code={customerSignup.code}
          initialValues={signupDraft}
          onDraftChange={saveSignupDraft}
          onComplete={async (details) => {
            if (authIntent === 'business') {
              await completeOwnerSignup(details);
              return;
            }
            await completeCustomerSignup(details);
            setRoute('location-permission');
          }}
          onBusinessSetup={authIntent === 'business' ? undefined : () => void openBusinessSetup()}
        />
      );
    }

    case 'location-permission':
      if (isDesktop)
        return (
          <DesktopLocationPermissionScreen
            onNav={nav('confirm-location')}
            onUseLocation={async () => {
              if (hasApiConfig()) await saveCurrentPlace();
              setConfirmFrom('location-permission');
              setRoute('confirm-location');
            }}
            onManualLocation={() => setRoute('manual-location')}
          />
        );
      return (
        <LocationPermissionScreen
          onBack={() => setRoute('profile-setup')}
          onUseLocation={async () => {
            if (hasApiConfig()) await saveCurrentPlace();
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
            onContinue={async (area) => {
              if (hasApiConfig()) await saveTypedPlace(area);
              setConfirmFrom('manual-location');
              setRoute('confirm-location');
            }}
            onUseCurrentLocation={async () => {
              await saveCurrentPlace();
              setConfirmFrom('location-permission');
              setRoute('confirm-location');
            }}
          />
        );
      return (
        <ManualLocationScreen
          onBack={() => setRoute('location-permission')}
          onContinue={async (area) => {
            if (hasApiConfig()) await saveTypedPlace(area);
            setConfirmFrom('manual-location');
            setRoute('confirm-location');
          }}
          onUseCurrentLocation={async () => {
            await saveCurrentPlace();
            setConfirmFrom('location-permission');
            setRoute('confirm-location');
          }}
          onBusinessSetup={() => void openBusinessSetup()}
        />
      );

    case 'confirm-location':
      if (isDesktop)
        return (
          <DesktopConfirmLocationScreen
            onNav={nav('discovering')}
            onBack={() => setRoute(confirmFrom)}
            onChangeLocation={() => setRoute('manual-location')}
            onContinue={(radius) => {
              // Keep the radius picked here with the saved place.
              if (hasApiConfig() && radius !== savedLocation.radius) {
                savePlace({ district: savedLocation.district, city: confirmPlace.city, lat: savedLocation.lat, lng: savedLocation.lng }, radius);
              }
              setRoute('discovering');
            }}
            onBusinessSetup={() => void openBusinessSetup()}
            {...confirmPlace}
            initialRadius={savedLocation.radius}
          />
        );
      return (
        <ConfirmLocationScreen
          onBack={() => setRoute(confirmFrom)}
          onChangeLocation={() => setRoute('manual-location')}
          onContinue={() => setRoute('discovering')}
          onBusinessSetup={() => void openBusinessSetup()}
          {...confirmPlace}
          radius={savedLocation.radius}
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
          <>
          <DesktopHomeScreen
            onNav={feedNav}
            onOpenFilters={() => openFeedRoute('filters', 'home')}
            onOpenFeatured={() => openFeedRoute('featured-deals', 'home')}
            onOpenDeals={() => setRoute('deals')}
            onOpenDeal={(deal) => openDeal('home', deal ?? null)}
            onClaim={openClaimPopup}
            onOpenComments={(deal) => openDealComments('home', deal)}
            onOpenBusiness={(business) => openBusiness(business, 'home')}
          />
          {commentsModalOnly ? (
            <CommentsDrawer
              open
              deal={selectedDeal}
              onClose={() => {
                setCommentsModalOnly(false);
                setRoute('home');
              }}
              onClaim={() => {
                setCommentsModalOnly(false);
                setRoute('deal-detail');
                openClaimPopup();
              }}
            />
          ) : null}
          </>
        );
      return (
        <>
        <HomeScreen
          onTab={(tab) => setRoute(tab)}
          onOpenFilters={() => openFeedRoute('filters', 'home')}
          onOpenFeatured={() => openFeedRoute('featured-deals', 'home')}
          onOpenDeals={() => setRoute('deals')}
          onOpenDeal={(deal) => openDeal('home', deal ?? null)}
          onOpenBusiness={(business) => openBusiness(business, 'home')}
          onOpenNotifications={() => setRoute('notifications')}
          onEnroll={() => void openBusinessSetup()}
          onAccount={() => setRoute('account')}
          onOpenComments={(deal) => openDealComments('home', deal)}
        />
        {commentsModalOnly ? (
          <CommentsSheet
            open
            deal={selectedDeal}
            onClose={() => {
              setCommentsModalOnly(false);
              setRoute('home');
            }}
          />
        ) : null}
        </>
      );

    case 'deals':
      if (isDesktop)
        return (
          <>
            <DesktopDealsScreen
              key={`deals-${dealsSearch.key}`}
              initialSearch={dealsSearch.query}
              onNav={feedNav}
              onOpenFilters={() => openFeedRoute('filters', 'deals')}
              onOpenFeatured={() => openFeedRoute('featured-deals', 'deals')}
              onOpenDeal={(deal) => openDeal('deals', deal ?? null)}
              onOpenComments={(deal) => openDealComments('deals', deal ?? null)}
              onClaim={openClaimPopup}
              onHowToClaim={() => openHowToClaim('deals')}
            />
            {commentsModalOnly ? (
              <CommentsDrawer
                open
                deal={selectedDeal}
                onClose={() => {
                  setCommentsModalOnly(false);
                  setRoute('deals');
                }}
                onClaim={() => {
                  setCommentsModalOnly(false);
                  setRoute('deal-detail');
                  openClaimPopup();
                }}
              />
            ) : null}
          </>
        );
      return (
        <>
          <DealsScreen
            key={`deals-${dealsSearch.key}`}
            initialSearch={dealsSearch.query}
            onTab={(tab) => setRoute(tab)}
            onOpenFilters={() => openFeedRoute('filters', 'deals')}
            onOpenDeal={(deal) => openDeal('deals', deal ?? null)}
            onOpenNotifications={() => setRoute('notifications')}
            onClaim={openClaimPopup}
            onAccount={() => setRoute('account')}
            onHowToClaim={() => openHowToClaim('deals')}
            onOpenComments={(deal) => openDealComments('deals', deal)}
          />
          {commentsModalOnly ? (
            <CommentsSheet
              open
              deal={selectedDeal}
              onClose={() => {
                setCommentsModalOnly(false);
                setRoute('deals');
              }}
            />
          ) : null}
        </>
      );

    case 'featured-deals':
      if (isDesktop)
        return (
          <DesktopFeaturedDealsScreen
            onNav={feedNav}
            onOpenFilters={() => openFeedRoute('filters', 'featured-deals')}
            onOpenDeal={(deal) => openDeal('featured-deals', deal)}
          />
        );
      return (
        <FeaturedDealsScreen
          onBack={() => setRoute(feedFrom)}
          onOpenFilters={() => openFeedRoute('filters', 'featured-deals')}
          onBoost={() => void openBusinessSetup()}
          onOpenDeal={(deal) => openDeal('featured-deals', deal ?? null)}
        />
      );

    case 'filters':
      if (isDesktop) return <DesktopFiltersScreen onNav={feedNav} onClose={() => setRoute(feedFrom)} />;
      return <FiltersScreen onClose={() => setRoute(feedFrom)} />;

    case 'deal-detail':
      return <>{renderDetail()}</>;

    case 'comments':
      if (isDesktop)
        return commentsModalOnly ? (
          <CommentsDrawer
            open
            deal={selectedDeal}
            onClose={() => {
              setCommentsModalOnly(false);
              setRoute(dealFrom);
            }}
            onClaim={() => {
              setCommentsModalOnly(false);
              setRoute('deal-detail');
              openClaimPopup();
            }}
          />
        ) : (
          <>
            {renderDetail()}
            <CommentsDrawer
              open
              deal={selectedDeal}
              onClose={() => {
                setCommentsModalOnly(false);
                setRoute('deal-detail');
              }}
              onClaim={() => {
                setCommentsModalOnly(false);
                setRoute('deal-detail');
                openClaimPopup();
              }}
            />
          </>
        );
      return commentsModalOnly ? (
        <CommentsSheet
          open
          deal={selectedDeal}
          onClose={() => {
            setCommentsModalOnly(false);
            setRoute(dealFrom);
          }}
        />
      ) : (
        <>
          {renderDetail()}
          <CommentsSheet
            open
            deal={selectedDeal}
            onClose={() => {
              setCommentsModalOnly(false);
              setRoute('deal-detail');
            }}
          />
        </>
      );

    case 'reviews':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ReviewsModal open deal={selectedDeal} onClose={() => setRoute('deal-detail')} />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ReviewsSheet open deal={selectedDeal} onClose={() => setRoute('deal-detail')} />
        </>
      );

    case 'share':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ShareModal open onClose={() => setRoute('deal-detail')} deal={selectedDeal} />
          </>
        );
      return (
        <>
          {renderDetail()}
          <ShareSheet open onClose={() => setRoute('deal-detail')} deal={selectedDeal} />
        </>
      );

    case 'claim-auth':
      if (isDesktop)
        return (
          <>
            {renderDetail()}
            <ClaimAuthModal
              open
              deal={selectedDeal}
              onAuthenticated={() => {
                if (hasApiConfig()) {
                  // A real sign-in, then back to this deal to claim it.
                  window.sessionStorage.setItem(RETURN_PATH_KEY, window.location.pathname);
                  setSignInFrom('deal-detail');
                  setRoute('sign-in');
                  return;
                }
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
            detail={liveDeal.detail}
            open
            onAuthenticated={() => {
              if (hasApiConfig()) {
                // A real sign-in, then back to this deal to claim it.
                window.sessionStorage.setItem(RETURN_PATH_KEY, window.location.pathname);
                setSignInFrom('deal-detail');
                setRoute('sign-in');
                return;
              }
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
              detail={liveDeal.detail}
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
          <ClaimConfirmSheet open detail={liveDeal.detail} email={profile.email} onClose={() => setRoute('deal-detail')} onConfirm={() => setRoute('claim-identity')} />
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
            detail={liveDeal.detail}
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
                void sendClaimCode(
                  holderFromRecipient({
                    name: `${values.firstName} ${values.lastName}`.trim(),
                    email: values.email,
                    phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
                  }),
                );
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
              void sendClaimCode(
                holderFromRecipient({
                  name: `${values.firstName} ${values.lastName}`.trim(),
                  email: values.email,
                  phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
                }),
              );
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
              target={claimHolder?.email}
              error={claimError}
              busy={claimBusy}
              onResend={() => claimHolder && void sendClaimCode(claimHolder)}
              deal={selectedDeal}
              onVerify={onClaimCode}
              onBack={() => setRoute(claimRecipient ? 'claim-recipient' : 'deal-detail')}
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
            target={claimHolder?.email}
            error={claimError}
            busy={claimBusy}
            onResend={() => claimHolder && void sendClaimCode(claimHolder)}
            onVerify={onClaimCode}
            onBack={() => setRoute(claimRecipient ? 'claim-recipient' : 'deal-detail')}
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
              detail={liveDeal.detail}
              open
              recipient={claimRecipient}
              deal={selectedDeal}
              onConfirm={() => void completeClaim().then((done) => done || backToClaimCode())}
              onEdit={() => setRoute('claim-recipient')}
              onClose={() => setRoute('deal-detail')}
            />
          </>
        );
      return (
        <>
          {renderDetail()}
          <RecipientSummarySheet
            detail={liveDeal.detail}
            open
            recipient={claimRecipient}
            onContinue={() => void completeClaim().then((done) => done || backToClaimCode())}
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
                  name: `${values.firstName} ${values.lastName}`.trim(),
                  email: values.email,
                  phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
                });
                setGiftNote(values.note);
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
            detail={liveDeal.detail}
            open
            onContinue={(values) => {
              setGiftRecipient({
                name: `${values.firstName} ${values.lastName}`.trim(),
                email: values.email,
                phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
              });
              setGiftNote(values.note);
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
              detail={liveDeal.detail}
              open
              recipient={giftRecipient}
              note={giftNote}
              error={claimError}
              busy={claimBusy}
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
            detail={liveDeal.detail}
            open
            recipient={giftRecipient}
            error={claimError}
            busy={claimBusy}
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
            onBack={() => setRoute(howToClaimFrom)}
            backLabel={howToClaimFrom === 'deals' ? 'Deals' : 'Deal'}
            onClaim={howToClaimFrom === 'deals' ? undefined : () => startClaim('how-to-claim')}
            detail={howToClaimFrom === 'deals' ? null : liveDeal.detail}
            onTerms={howToClaimFrom === 'deals' ? undefined : () => {
              setTermsFrom('how-to-claim');
              setRoute('deal-terms');
            }}
          />
        );
      return (
        <HowToClaimScreen
          onBack={() => setRoute(howToClaimFrom)}
          onClaim={howToClaimFrom === 'deals' ? undefined : () => startClaim('how-to-claim')}
          detail={howToClaimFrom === 'deals' ? null : liveDeal.detail}
          onTerms={howToClaimFrom === 'deals' ? undefined : () => {
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

    case 'claimed-deal': {
      // A merchant scanning a voucher QR gets the redeem step, not the customer's pass.
      const scannedId = passIdFromPath(window.location.pathname);
      if (scannedId && isBusinessRole(sessionUser?.role)) {
        return <VoucherRedeemScreen claimId={scannedId} onDone={() => setRoute('business-overview')} />;
      }
      return <>{renderClaimed()}</>;
    }

    case 'claimed-contact':
      if (isDesktop)
        return (
          <>
            {renderClaimed()}
            <ContactBusinessModal
              open
              code={(walletClaim ?? currentVoucher(claims.claims))?.code}
              onChat={() => setRoute('merchant-chat')}
              onClose={() => setRoute('claimed-deal')}
            />
          </>
        );
      return (
        <>
          {renderClaimed()}
          <ContactBusinessSheet open code={(walletClaim ?? currentVoucher(claims.claims))?.code} onChat={() => setRoute('merchant-chat')} onClose={() => setRoute('claimed-deal')} />
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
            detail={liveDeal.detail}
            loading={liveDeal.loading}
            onNav={feedNav}
            onBack={() => setRoute(termsFrom)}
            onClaim={() => startClaim('deal-terms')}
          />
        );
      return (
        <DealTermsScreen
          detail={liveDeal.detail}
          loading={liveDeal.loading}
          onBack={() => setRoute(termsFrom)}
          onClaim={() => startClaim('deal-terms')}
        />
      );

    case 'storefront':
      if (isDesktop)
        return (
          <DesktopUrbanGrillStorefrontScreen
            business={selectedBusiness}
            onNav={feedNav}
            onClaim={(deal, onClaimed) => openClaimPopup(deal, onClaimed)}
            onOpenDeal={(deal) => openDeal('business-profile', deal)}
            onOpenItem={(itemId) => selectedBusiness?.slug && openItem(selectedBusiness.slug, itemId, 'business-profile')}
            onCheckout={startCheckout}
          />
        );
      return (
        <MerchantDealsScreen
          business={selectedBusiness}
          onBack={() => setRoute(bizFrom)}
          onOpenDeal={() => openDeal('storefront')}
          onBusinessSetup={() => void openBusinessSetup()}
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
    case 'spa-profile':
      if (isDesktop)
        return (
          <DesktopUrbanGrillStorefrontScreen
            business={selectedBusiness}
            onNav={feedNav}
            activeNav="discover"
            onClaim={(deal, onClaimed) => openClaimPopup(deal, onClaimed)}
            onOpenDeal={(deal) => openDeal('business-profile', deal)}
            onOpenItem={(itemId) => selectedBusiness?.slug && openItem(selectedBusiness.slug, itemId, 'business-profile')}
            onCheckout={startCheckout}
          />
        );
      return (
        <BusinessProfileScreen
          business={selectedBusiness}
          onBack={() => setRoute(profileFrom)}
          onClaim={(deal, onClaimed) => openClaimPopup(deal, onClaimed)}
          onOpenDeal={(deal) => openDeal('business-profile', deal)}
          onOpenItem={(itemId) => selectedBusiness?.slug && openItem(selectedBusiness.slug, itemId, 'business-profile')}
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

    case 'product-detail': {
      const backToBusiness = () => {
        if (liveItem) openBusiness({ code: liveItem.code }, 'product-detail');
      };
      const goBack = () => (detailFrom === 'business-profile' ? backToBusiness() : setRoute(detailFrom));
      if (isDesktop)
        return (
          <DesktopProductDetailScreen
            itemId={liveItem?.id ?? null}
            businessCode={liveItem?.code ?? null}
            onNav={feedNav}
            onBack={goBack}
            onOpenBusiness={backToBusiness}
            onOpenItem={(itemId) => liveItem && openItem(liveItem.code, itemId, 'product-detail')}
          />
        );
      return (
        <ProductDetailScreen
          itemId={liveItem?.id ?? null}
          businessCode={liveItem?.code ?? null}
          onBack={goBack}
          onOpenBusiness={backToBusiness}
        />
      );
    }

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
              setRoute('messages');
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
              setRoute('messages');
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
            setRoute('messages');
          }}
        />
      );

    case 'dashboard': {
      /**
       * Customer-dashboard "Get Started": a signed-in consumer first picks an
       * identity for this run ("Continue with this account" vs. "Use a new
       * account"), which is the same choice screen the business intro reaches
       * through "Set Up My Business". Signed-out visitors have no account to
       * reuse, so they go straight to the business sign-up modal.
       */
      const startBusinessSignup = () => {
        // A live owner taps this from their customer view: send them back to
        // the business dashboard rather than through setup again.
        if (isBusinessSession) {
          void openBusinessSetup('dashboard');
          return;
        }
        setBusinessOnboardingFrom('dashboard');
        if (authed) {
          setBusinessChoiceOpen(true);
          setRoute('business-onboarding');
        } else {
          setRoute('business-auth');
        }
      };
      if (isDesktop)
        return (
          <DesktopDashboardScreen
            onNav={feedNav}
            onStartBusinessSignup={startBusinessSignup}
            onOpenDeal={(deal) => void openDeal('dashboard', deal)}
            onShowPass={(claim) => openDashboardVoucher(claim, 'claimed-deal')}
            onContact={(claim) => openDashboardVoucher(claim, 'claimed-contact')}
            onOpenOrder={(ref) => {
              setActiveOrderRef(ref);
              setRoute('order-detail');
            }}
            onOpenBooking={() => setRoute('booking-detail')}
            onScan={() => setRoute('scan')}
          />
        );
      return (
        <DashboardScreen
          onTab={(tab) => setRoute(tab)}
          onNavigate={(target) => {
            if (target === 'business-onboarding') {
              void openBusinessSetup('dashboard');
              return;
            }
            setRoute(target);
          }}
          onStartBusinessSignup={startBusinessSignup}
          onOpenDeal={(deal) => void openDeal('dashboard', deal)}
          onShowQR={(claim) => openDashboardVoucher(claim, 'claimed-deal')}
        />
      );
    }

    case 'orders':
      if (isDesktop)
        return (
          <DesktopOrdersScreen
            onNav={feedNav}
            onOpenOrder={(ref) => {
              setActiveOrderRef(ref);
              setRoute('order-detail');
            }}
            onOpenBooking={(ref) => {
              setActiveBookingRef(ref);
              setRoute('booking-detail');
            }}
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
          onOpenBooking={(ref) => {
              setActiveBookingRef(ref);
              setRoute('booking-detail');
            }}
          onNavigate={(target) => setRoute(target)}
        />
      );

    case 'order-detail':
      if (isDesktop)
        return <DesktopOrderDetailScreen orderRef={activeOrderRef} onChat={openBranchChat} onNav={feedNav} onBack={() => setRoute('orders')} />;
      return (
        <OrderDetailScreen
          orderRef={activeOrderRef}
          onBack={() => setRoute('orders')}
          onChat={(branchId) => openBranchChat(branchId)}
          onReorder={() => setRoute('discover')}
          onSupport={() => setRoute('support')}
        />
      );

    case 'booking-detail':
      if (isDesktop)
        return <DesktopBookingDetailScreen bookingRef={activeBookingRef} onChat={openBranchChat} onNav={feedNav} onBack={() => setRoute('orders')} />;
      return (
        <BookingDetailScreen
          bookingRef={activeBookingRef}
          onBack={() => setRoute('orders')}
          onBookAgain={() => setRoute('discover')}
          onChat={(branchId) => openBranchChat(branchId)}
        />
      );

    case 'my-deals':
      if (isDesktop) return <DesktopMyDealsScreen onNav={feedNav} onOpenBusiness={(business) => openBusiness(business, 'my-deals')} />;
      return (
        <MyDealsScreen
          onTab={(tab) => setRoute(tab)}
          onShowPass={(claim) => {
            setDashboardClaimRef(claim.ref);
            setClaimedFrom('my-deals');
            setRoute('claimed-deal');
          }}
          onGiftReceipt={(claim) => {
            setGiftRecipient(null); // The receipt reads this gift's own recipient, not the last one sent.
            setActiveClaim(claim);
            setRoute('gift-sent');
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
          onOpenStorefront={() => setRoute('discover')}
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
            onOpenBusiness={(business) => openBusiness({ code: business.code, id: business.id, name: business.name }, 'discover')}
            onBusinessSetup={() => void openBusinessSetup()}
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
          onOpenBusiness={(business) => openBusiness({ code: business.code, id: business.id, name: business.name }, 'discover')}
          onOpenFilters={() => openFeedRoute('filters', 'discover')}
          onOpenNotifications={() => setRoute('notifications')}
          onBusinessSetup={() => void openBusinessSetup()}
        />
      );

    case 'saved':
      if (isDesktop)
        return (
          <DesktopSavedItemsScreen
            onNav={feedNav}
            onBack={() => setRoute('account')}
            onOpenDeal={(item) => void openDeal('saved', { id: item.id, title: item.title, business: item.subtitle, image: item.image })}
            onOpenBusiness={(item) => openBusiness({ code: item.code ?? '', id: item.id, name: item.title }, 'saved')}
            onOpenService={(item) => openItem(item.code ?? '', item.id, 'saved')}
            onBrowse={() => setRoute('discover')}
          />
        );
      return (
        <SavedItemsScreen
          onBack={() => setRoute('home')}
          onOpenDeal={(item) => void openDeal('saved', { id: item.id, title: item.title, business: item.subtitle, image: item.image })}
          onOpenBusiness={(item) => openBusiness({ code: item.code ?? '', id: item.id, name: item.title }, 'saved')}
          onOpenService={(item) => openItem(item.code ?? '', item.id, 'saved')}
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
    case 'gift-reject':
      return <GiftRejectScreen token={GIFT_REJECT_TOKEN} onDone={() => setRoute(authed ? 'home' : 'welcome')} />;

    case 'not-found': {
      const leave = () => setRoute(!authed ? 'welcome' : isBusinessRole(sessionUser?.role) ? 'business-overview' : 'home');
      return isDesktop ? <DesktopNotFoundScreen onHome={leave} /> : <NotFoundScreen onHome={leave} />;
    }

    case 'admin-referral':
      return <AdminReferralScreen onBack={() => setRoute('business-referrals')} />;

    /**
     * Google profile confirmation — shown after the Google button and before
     * the dashboard. Confirms the profile the frontend holds, asks for a phone
     * number Google didn't share, and takes an optional referral code.
     */
    case 'google-confirm': {
      const finishGoogleConfirm = (details: GoogleConfirmDetails) => {
        if (details.referralCode) {
          setProvisionalReferralCode(details.referralCode, 'manual');
          // Google accounts already exist by this screen, so a typed code is
          // claimed here instead of with a later register call — best effort,
          // the account's own code and an already-claimed code just resolve
          // to a server-side 400 that is ignored.
          void referralsService
            .claim(details.referralCode)
            .then(() => clearProvisionalReferralCode())
            .catch(() => {
              // Best effort — an unknown or already-claimed code is ignored.
            });
        }
        profile.update({ phone: details.phone });
        // Merchant sign-up — the confirmed Google identity belongs to the
        // business, so it enters setup instead of the customer feed.
        if (authIntent === 'business') {
          enterBusinessProfile();
          return;
        }
        setWelcomeAudience('customer');
        setRoute('discovering');
      };
      const googleAuthEntry: Route = authIntent === 'business' ? 'business-auth' : 'auth-code';
      if (isDesktop)
        return (
          <DesktopGoogleProfileConfirmScreen
            onBack={() => setRoute(googleAuthEntry)}
            onContinue={finishGoogleConfirm}
          />
        );
      return (
        <GoogleProfileConfirmScreen onBack={() => setRoute(googleAuthEntry)} onContinue={finishGoogleConfirm} />
      );
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
          // `accountNav` records the origin so leaving setup returns here
          // instead of the dashboard (desktop parity).
          onNavigate={accountNav}
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
            onOpenMerchant={() => void openBusinessSetup()}
            onOpenTerms={() => setRoute('terms')}
          />
        );
      return (
        <HelpCentreScreen
          onBack={() => setRoute('support-legal')}
          onStartChat={() => setRoute('support')}
          onOpenMerchant={() => void openBusinessSetup()}
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
      // Every business entry lands on the marketing intro first. The account
      // question ("reuse this consumer account vs. a fresh business identity")
      // only appears once the merchant actually starts signing up from it —
      // reusing the account lands on "Tell us about your business".
      const leaveOnboarding = () => {
        setBusinessChoiceOpen(false);
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
        markBusinessSetupScreensDone();
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
        // That fresh identity is a *business*, so it signs up through the
        // business modal (which then lands on Business Profile).
        setBusinessChoiceOpen(false);
        setBusinessSetupSkipIntro(false);
        setRoute('business-auth');
      };
      const continueWithAccount = async (pin?: string) => {
        // Live: the customer account becomes an owner account first (a PIN
        // account confirms its PIN); the business is created by setup's saves.
        if (hasApiConfig() && sessionUser && !isBusinessRole(sessionUser.role)) {
          try {
            adoptSession(
              await ownerAuthService.upgrade({
                ...(pin ? { password: pin } : {}),
                referralCode: getProvisionalReferralCode() || undefined,
              }),
            );
          } catch (error) {
            if (error instanceof Error && /incorrect password/i.test(error.message)) {
              throw new Error('That PIN is incorrect. Try again.');
            }
            throw error;
          }
        }
        // Reusing the consumer account skips straight to profile details — the
        // intro has already been shown, so re-aim the saved run at `basic`.
        setBusinessChoiceOpen(false);
        resumeAtBusinessProfile();
      };
      // Live PIN accounts confirm their PIN; Google accounts have none; demo shows the sample code step.
      const accountConfirmation = !hasApiConfig() ? 'demo-code' : sessionUser?.authProvider === 'GOOGLE' ? 'none' : 'pin';
      /**
       * "Set Up My Business": an unknown visitor signs up through the business
       * modal, a signed-in consumer first picks an identity for this run, and
       * a merchant already inside their own run continues where they left off.
       */
      const startBusinessSignup = !authed
        ? () => {
            // Intro done: a return visit opens the sign-up email screen.
            saveBusinessSignup({ stage: 'business-auth' });
            setRoute('business-auth');
          }
        : businessSetupSkipIntro
          ? undefined
          : () => setBusinessChoiceOpen(true);

      if (businessChoiceOpen) {
        return isDesktop ? (
          <DesktopBusinessAccountChoiceScreen
            onBack={leaveOnboarding}
            onContinueWithAccount={continueWithAccount}
            confirmation={accountConfirmation}
            onUseNewAccount={useNewAccount}
          />
        ) : (
          <BusinessAccountChoiceScreen
            onBack={leaveOnboarding}
            onContinueWithAccount={continueWithAccount}
            confirmation={accountConfirmation}
            onUseNewAccount={useNewAccount}
          />
        );
      }

      return (
        <>
          {isDesktop ? (
            <DesktopBusinessOnboardingScreen
              initialStep={businessSetupSkipIntro ? 'basic' : 'intro'}
              onStartSignup={startBusinessSignup}
              // The container routes Back itself (profile details → intro →
              // here), so reaching this callback means "leave setup".
              onBack={leaveOnboarding}
              onOpenVerification={openVerification}
              onComplete={finishOnboarding}
            />
          ) : (
            <BusinessOnboardingScreen
              initialStep={businessSetupSkipIntro ? 'basic' : 'intro'}
              onStartSignup={startBusinessSignup}
              // The container routes Back itself (profile details → intro →
              // here), so reaching this callback means "leave setup".
              onBack={leaveOnboarding}
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
          onPreviewStorefront={() => setRoute('hub-storefront-preview')}
          onConfigureStorefront={() => setRoute('storefront')}
          onCreateDeal={() => setRoute('hub-deals')}
          onQrStands={() => setRoute('business-overview')}
        />
      ) : (
        <BusinessVerificationScreen
          onBack={backFromVerification}
          onComplete={finishVerification}
          onActivate={() => setRoute('subscription')}
          onPreviewStorefront={() => setRoute('hub-storefront-preview')}
          onConfigureStorefront={() => setRoute('storefront')}
          onCreateDeal={() => setRoute('hub-deals')}
          onQrStands={() => setRoute('business-overview')}
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
            onOpenMetrics={(target) => {
              setBoostMetricsTarget(target ?? null);
              setRoute('boost-metrics');
            }}
            onOpenSegments={() => setRoute('segments-hub')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessBoostHubScreen
            onBack={() => setRoute('business-more')}
            onTab={boostTab}
            onBoost={(item) => openBoost(item)}
            onOpenMetrics={(target) => {
              setBoostMetricsTarget(target ?? null);
              setRoute('boost-metrics');
            }}
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
        return (
          <DesktopBoostMetricsScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('boost-hub')}
            onTab={boostTab}
            target={boostMetricsTarget}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessBoostMetricsScreen onBack={() => setRoute('boost-hub')} onTab={boostTab} target={boostMetricsTarget} />
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
            onCreate={createSegment}
            onUseSegment={useSegment}
            onViewCohort={viewSegment}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSegmentsHubScreen
            onBack={() => setRoute('boost-hub')}
            onOpenBoost={() => openBoost()}
            onOpenCampaigns={() => setRoute('boost-hub')}
            onCreate={createSegment}
            onUseSegment={useSegment}
            onViewCohort={viewSegment}
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
            onOpenMessages={() => setRoute('business-messages')}
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
            onOpenMessages={() => setRoute('business-messages')}
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
            editing={editingSegment}
            onBack={() => setRoute('segments-hub')}
            onSaved={() => setRoute('segments-hub')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSegmentCreateScreen
            editing={editingSegment}
            onBack={() => setRoute('segments-hub')}
            onSaved={() => setRoute('segments-hub')}
          />
        </div>
      );

    case 'segment-detail':
      if (isDesktop)
        return (
          <DesktopSegmentDetailScreen
            onNav={businessPortalNav}
            segment={activeSegment}
            onBack={() => setRoute('segments-hub')}
            onUseSegment={useSegment}
            onEditRules={editSegmentRules}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessSegmentDetailScreen
            segment={activeSegment}
            onBack={() => setRoute('segments-hub')}
            onUseSegment={useSegment}
            onEditRules={editSegmentRules}
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
            business
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
            onOpenMerchant={() => void openBusinessSetup()}
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
            itemId={pricingItemId}
            onNav={businessPortalNav}
            onBackToCatalog={() => setRoute('hub-catalog')}
          />
        );
      return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'business-hub':
      if (isDesktop)
        return (
          <DesktopBusinessHubScreen
            onNav={businessPortalNav}
            onBoost={(item) => openBoost(item)}
            onPreviewStorefront={() => setRoute('hub-storefront-preview')}
            onOpenModule={openHubModule}
          />
        );
      return (
        <BusinessHubScreen
          initialStep="hub"
          onTab={businessTab}
          onBoost={(item) => openBoost(item)}
          onOpenMessages={() => setRoute('business-messages')}
          onPreviewStorefront={() => setRoute('hub-storefront-preview')}
          onOpenModule={openHubModule}
        />
      );

    case 'hub-locations':
      if (isDesktop)
        return (
          hasApiConfig() && addingBranch ? (
            <DesktopBusinessAddBranchScreen onBack={() => setAddingBranch(false)} onSaved={() => setAddingBranch(false)} />
          ) : (
            <DesktopBusinessLocationsHubScreen
              onNav={businessPortalNav}
              // Live owners are already set up: the add-branch form opens here.
              onAddBranch={() => (hasApiConfig() ? setAddingBranch(true) : setRoute('business-onboarding'))}
              onOpenBranch={(branchId) => {
                setSelectedBranchId(branchId ?? null);
                setRoute('hub-branch-detail');
              }}
            />
          )
        );
      return <BusinessHubScreen initialStep="locations" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'hub-branch-detail':
      if (isDesktop)
        return (
          <DesktopBranchDetailScreen
            branchId={selectedBranchId}
            onNav={businessPortalNav}
            onBackToLocations={() => setRoute('hub-locations')}
          />
        );
      return <BusinessHubScreen initialStep="locations" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'hub-catalog':
    case 'hub-catalog-new-product':
    case 'hub-catalog-new-service':
      if (isDesktop)
        return (
          <DesktopBusinessCatalogHubScreen
            // Remount on the route change so the new form starts fresh.
            key={route}
            onNav={businessPortalNav}
            onOpenBranchPricing={(itemId) => {
              setPricingItemId(itemId ?? null);
              setRoute('business-branch-pricing');
            }}
            onOpenServices={() => setRoute('hub-services')}
            onMakeDeal={(item) => openDealStudio(item)}
            notice={route === 'hub-catalog' ? catalogNotice : null}
            onAddProduct={() => setRoute('hub-catalog-new-product')}
            startWithNewProduct={route === 'hub-catalog-new-product'}
            startWithNewService={route === 'hub-catalog-new-service'}
            onCloseForm={() => setRoute('hub-catalog')}
          />
        );
      return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'hub-services':
      if (isDesktop)
        return (
          <DesktopServicesCategoriesScreen
            onNav={businessPortalNav}
            onBackToCatalog={() => setRoute('hub-catalog')}
            onAddService={() => setRoute('hub-catalog-new-service')}
          />
        );
      return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'hub-deals':
      if (isDesktop)
        return (
          <DesktopDealsWorkspaceScreen
            onNav={businessPortalNav}
            onCreateDeal={() => openDealStudio()}
            onEditDeal={openDealGroup('deal-location-pricing')}
            onOpenDealDetail={openDealGroup('hub-deal-detail')}
            onOpenLogs={() => setRoute('analytics-deals')}
            onOpenPos={() => setRoute('business-pos-orders')}
            onBoost={(dealName) => openBoost(dealName)}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'deal-studio': {
      const leaveStudio = () => {
        setDealSource(null);
        setRoute('hub-deals');
      };
      // Live deals need a real item; without one the catalogue is where to pick it.
      if (hasApiConfig() && !dealSource) {
        const notice = 'Pick an item to make a deal from.';
        if (isDesktop)
          return (
            <DesktopBusinessCatalogHubScreen
              onNav={businessPortalNav}
              onOpenBranchPricing={(itemId) => {
              setPricingItemId(itemId ?? null);
              setRoute('business-branch-pricing');
            }}
              onOpenServices={() => setRoute('hub-services')}
              onMakeDeal={(item) => openDealStudio(item)}
              notice={notice}
            />
          );
        return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;
      }
      if (isDesktop)
        return (
          <DesktopDealStudioFlow sourceItem={dealSource} onComplete={leaveStudio} onExit={leaveStudio} onNav={businessPortalNav} />
        );
      return <BusinessDealStudioFlow sourceItem={dealSource} onComplete={leaveStudio} onExit={leaveStudio} />;
    }

    case 'hub-customers':
      if (isDesktop)
        return (
          <DesktopBusinessCustomersScreen
            onNav={businessPortalNav}
            onViewProfile={(name, userId) => {
              setHubCustomerName(name);
              setHubCustomerId(userId ?? null);
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
          onPreviewStorefront={() => setRoute('hub-storefront-preview')}
          onOpenModule={openHubModule}
          onViewCustomerProfile={(name, userId) => {
            setHubCustomerName(name);
            setHubCustomerId(userId ?? null);
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
            onPreviewStorefront={() => setRoute('hub-storefront-preview')}
            onEditProfile={() => setRoute('business-profile-studio')}
          />
        );
      return <BusinessHubScreen initialStep="profile" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'hub-storefront-preview':
      return (
        <BusinessStorefrontPreviewScreen
          onNav={businessPortalNav}
          onBack={() => setRoute('hub-profile')}
          onEditProfile={() => setRoute(isDesktop ? 'business-profile-studio' : 'hub-profile')}
        />
      );

    case 'deal-location-pricing':
      if (isDesktop)
        return (
          <DesktopDealLocationPricingScreen
            dealGroupId={dealGroupId}
            onNav={businessPortalNav}
            onCancel={() => setRoute('hub-deals')}
            onSave={() => setRoute('hub-deals')}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'deal-create-locations':
      // Live deals are created in the studio from a catalogue item, which has its own branch step.
      if (hasApiConfig()) {
        if (isDesktop)
          return (
            <DesktopBusinessCatalogHubScreen
              onNav={businessPortalNav}
              onOpenBranchPricing={(itemId) => {
                setPricingItemId(itemId ?? null);
                setRoute('business-branch-pricing');
              }}
              onOpenServices={() => setRoute('hub-services')}
              onMakeDeal={(item) => openDealStudio(item)}
              notice="Pick an item to make a deal from."
            />
          );
        return <BusinessHubScreen initialStep="catalog" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;
      }
      if (isDesktop)
        return (
          <DesktopDealCreateLocationsScreen
            onNav={businessPortalNav}
            onBack={() => setRoute('hub-deals')}
            onReview={() => setRoute('hub-deal-detail')}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'business-profile-studio':
      if (isDesktop)
        return (
          <DesktopBusinessProfileStorefrontScreen
            onNav={businessPortalNav}
            onDiscard={() => setRoute('business-overview')}
          />
        );
      return <BusinessHubScreen initialStep="profile" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'hub-deal-detail':
      if (isDesktop)
        return (
          <DesktopDealAnalyticsScreen
            dealGroupId={dealGroupId}
            onNav={businessPortalNav}
            onEditPricing={() => setRoute('deal-location-pricing')}
            onConfigureCap={() => setRoute('deal-location-pricing')}
            onChat={() => setRoute('business-messages')}
            onBoost={() => openBoost('Weekend Prime Lunch Combo')}
            // Live: an existing deal is edited on its branch pricing page.
            onEditDeal={() => (hasApiConfig() ? setRoute('deal-location-pricing') : setRoute('deal-studio'))}
            onDeleted={() => setRoute('hub-deals')}
          />
        );
      return <BusinessHubScreen initialStep="deals" onTab={businessTab} onBoost={(item) => openBoost(item)} onOpenMessages={() => setRoute('business-messages')} onPreviewStorefront={() => setRoute('hub-storefront-preview')} onOpenModule={openHubModule} />;

    case 'hub-customer-profile':
      if (isDesktop)
        return (
          <DesktopCustomerProfileScreen
            onNav={businessPortalNav}
            customerId={hubCustomerId}
            onBack={() => setRoute('hub-customers')}
          />
        );
      return (
        <BusinessHubScreen
          initialStep="customerProfile"
          initialCustomer={hubCustomerName}
          initialCustomerId={hubCustomerId}
          onTab={businessTab}
          onBoost={(item) => openBoost(item)}
          onOpenMessages={() => setRoute('business-messages')}
          onPreviewStorefront={() => setRoute('hub-storefront-preview')}
          onOpenModule={openHubModule}
          onViewCustomerProfile={(name, userId) => {
            setHubCustomerName(name);
            setHubCustomerId(userId ?? null);
          }}
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
            customerPoints={posCustomerRecord?.points}
            onBack={() => setRoute('pos-register')}
            onCharge={() => setRoute('pos-payment')}
            onOpenCustomer={() => setRoute('pos-customer')}
            onRemoveCustomer={() => {
              setPosCustomer(null);
              // Live: drop the API customer too, so the next sale isn't linked to them.
              if (hasApiConfig()) setPosCustomerRecord(null);
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
            onAttach={(name, record) => {
              setPosCustomer(name);
              if (record) setPosCustomerRecord(record);
              setRoute('pos-cart');
            }}
            onRegisterNew={() => setRoute('hub-customers')}
          />
        );
      return (
        <div className="biz-flow">
          <BusinessPosCustomerScreen
            onBack={goBackToPrevious}
            onAttach={(name, record) => {
              setPosCustomer(name);
              if (record) setPosCustomerRecord(record);
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
              // Live: drop the API customer too, so the next sale isn't linked to them.
              if (hasApiConfig()) setPosCustomerRecord(null);
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
              // Live: drop the API customer too, so the next sale isn't linked to them.
              if (hasApiConfig()) setPosCustomerRecord(null);
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
            customerId={posCustomerRecord?.id}
            customerPoints={posCustomerRecord?.points}
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
              // Live: drop the API customer too, so the next sale isn't linked to them.
              if (hasApiConfig()) setPosCustomerRecord(null);
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
            onAddToSale={(product) => {
              setPosTermCart((prev) => {
                const id = product?.id ?? 'ribeye-400g';
                const existing = prev.find((line) => line.id === id);
                if (existing) return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line));
                return [
                  ...prev,
                  product
                    ? { id, name: product.name, mods: '', unit: product.unit, qty: 1 }
                    : { id, name: 'Woodfire Aged Ribeye Steak (400g)', mods: 'Grills Station • Made to order', unit: 14000, qty: 1 },
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
            onAddToSale={(product) => {
              setPosCart((prev) => {
                const id = product?.id ?? 'woodfire-ribeye-400g';
                const existing = prev.find((line) => line.id === id);
                if (existing) return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line));
                return [
                  ...prev,
                  product
                    ? { id, name: product.name, unit: product.unit, member: product.unit, qty: 1 }
                    : { id, name: 'Woodfire Aged Ribeye Steak', unit: 14000, member: 14000, qty: 1 },
                ];
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
            onAttach={(name, record) => {
              setPosCustomer(name);
              if (record) setPosCustomerRecord(record);
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
            onAttach={(name, record) => {
              setPosCustomer(name);
              if (record) setPosCustomerRecord(record);
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
            onAttach={(record) => {
              setPosCustomer(record?.name ?? posDossierCustomer);
              if (record) setPosCustomerRecord(record);
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
            onAttach={(record) => {
              setPosCustomer(record?.name ?? posDossierCustomer);
              if (record) setPosCustomerRecord(record);
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
      if (isDesktop)
        return (
          <DesktopBusinessPosOrdersScreen onNav={businessPortalNav} activeNav={posActiveNav} onOpenSale={() => setRoute('pos-txn-detail')} />
        );
      return (
        <BusinessOrdersScreen
          initialStep="pos"
          onTab={businessTab}
          onOpenBooking={() => setRoute('booking-detail')}
          onOpenDisplay={() => setRoute('pos-display-order')}
          onOpenSale={() => setRoute('pos-txn-detail')}
        />
      );

    case 'business-messages':
      if (isDesktop)
        return (
          <DesktopBusinessMessagesWorkspaceScreen
            onNav={businessPortalNav}
            onViewCustomerProfile={(name) => {
              setHubCustomerName(name);
              setHubCustomerId(null);
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
            onCreateDeal={() => openDealStudio()}
            onCreateProduct={() => setRoute('hub-catalog')}
            onCreateLocation={openCreateLocation}
          />
        );
      return (
        <ClusterOnboardingScreen
          onComplete={() => setRoute('cluster-system')}
          onSkip={() => setRoute('business-overview')}
          onCreateDeal={() => openDealStudio()}
          onCreateProduct={() => setRoute('hub-catalog')}
          onCreateLocation={openCreateLocation}
        />
      );

    case 'cluster-system':
      if (isDesktop)
        return (
          <DesktopClusterSystemScreen
            onNav={businessPortalNav}
            onOpenOnboarding={() => setRoute('cluster-onboarding')}
            onCreateDeal={() => openDealStudio()}
            onCreateProduct={() => setRoute('hub-catalog')}
            onCreateLocation={openCreateLocation}
            onBoostItem={openClusterBoost}
            onOpenBoosts={() => setRoute('cluster-boost')}
          />
        );
      return (
        <ClusterSystemScreen
          onBack={() => setRoute('business-overview')}
          onTab={businessTab}
          onOpenOnboarding={() => setRoute('cluster-onboarding')}
          onCreateDeal={() => openDealStudio()}
          onCreateProduct={() => setRoute('hub-catalog')}
          onCreateLocation={openCreateLocation}
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
      {shellSwitching || returningToShell || plainCustomerOnBusinessPage || accessCheckPending || adminCheckPending ? (
        <SkeletonGroup label="Loading" className="mx-auto w-full max-w-5xl space-y-4 p-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </SkeletonGroup>
      ) : (
        renderRoute()
      )}

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
            detail={liveDeal.detail}
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
          deal={selectedDeal}
          onClose={() => setClaimDialog(null)}
          onContinue={(values) => {
            setGiftRecipient({
              name: `${values.firstName} ${values.lastName}`.trim(),
              email: values.email,
              phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
            });
            setGiftNote(values.note);
            setClaimError(null);
            setClaimDialog('giftConfirm');
          }}
        />
      )}
      {isDesktop && claimDialog === 'giftConfirm' && (
        <ConfirmGiftSendModal
          detail={liveDeal.detail}
          open
          recipient={giftRecipient}
          note={giftNote}
          error={claimError}
          busy={claimBusy}
          deal={selectedDeal}
          onClose={() => setClaimDialog(null)}
          onEdit={() => setClaimDialog('gift')}
          onSend={() => void finishDesktopClaim('gift')}
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
            void sendClaimCode(
              holderFromRecipient({
                name: `${values.firstName} ${values.lastName}`.trim(),
                email: values.email,
                phone: values.phone ? (values.phone.startsWith('0') ? values.phone : `0${values.phone}`) : undefined,
              }),
            );
          }}
        />
      )}
      {isDesktop && claimDialog === 'verify' && (
        <RecipientVerificationModal
          open
          recipient={claimRecipient}
          target={claimHolder?.email}
          error={claimError}
          busy={claimBusy}
          onResend={() => claimHolder && void sendClaimCode(claimHolder)}
          deal={selectedDeal}
          onClose={() => setClaimDialog(null)}
          onVerify={(code) => {
            setClaimCode(code);
            setClaimError(null);
            setClaimDialog('summary');
          }}
          onBack={() => setClaimDialog('other')}
        />
      )}
      {isDesktop && claimDialog === 'summary' && (
        <RecipientSummaryModal
          detail={liveDeal.detail}
          open
          recipient={claimRecipient}
          deal={selectedDeal}
          onClose={() => setClaimDialog(null)}
          onConfirm={() => void finishDesktopClaim('someone-else')}
          onEdit={() => setClaimDialog('other')}
        />
      )}
      <PwaInstallPrompt />
    </>
    </StoreOrderingProvider>
  );
}
