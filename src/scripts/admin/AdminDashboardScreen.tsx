import { useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminOverviewScreen } from './AdminOverviewScreen';
import { AdminBusinessesScreen } from './AdminBusinessesScreen';
import { AdminCustomersScreen } from './AdminCustomersScreen';
import { AdminVerificationScreen } from './AdminVerificationScreen';
import { AdminCategoriesScreen } from './AdminCategoriesScreen';
import { AdminLocationsScreen } from './AdminLocationsScreen';
import { AdminDealsScreen } from './AdminDealsScreen';
import { AdminOrdersScreen } from './AdminOrdersScreen';
import { AdminMarketingScreen } from './AdminMarketingScreen';
import { AdminSubscriptionsScreen } from './AdminSubscriptionsScreen';
import { AdminAnalyticsScreen } from './AdminAnalyticsScreen';
import { AdminSettingsScreen } from './AdminSettingsScreen';
import { AdminReferralScreen } from './AdminReferralScreen';

interface AdminDashboardScreenProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AdminDashboardScreen({ currentPath, onNavigate }: AdminDashboardScreenProps) {
  const { content, breadcrumb } = useMemo(() => {
    switch (currentPath) {
      case '/admin/customers':
        return {
          content: <AdminCustomersScreen onNavigate={onNavigate} />,
          breadcrumb: { module: 'Customers', page: 'Master Directory & Profile' },
        };

      case '/admin/businesses':
        return {
          content: <AdminBusinessesScreen onNavigate={onNavigate} />,
          breadcrumb: { module: 'Businesses', page: 'All Businesses' },
        };

      case '/admin/businesses/verification':
        return {
          content: <AdminVerificationScreen onNavigate={onNavigate} />,
          breadcrumb: { module: 'Businesses', page: 'Verification Status' },
        };

      case '/admin/businesses/categories':
        return {
          content: <AdminCategoriesScreen onNavigate={onNavigate} />,
          breadcrumb: { module: 'Businesses', page: 'Business Categories' },
        };

      case '/admin/locations':
      case '/admin/locations/clusters':
        return {
          content: <AdminLocationsScreen onNavigate={onNavigate} subpage="clusters" />,
          breadcrumb: { module: 'Locations & Clusters', page: 'Cluster Management' },
        };

      case '/admin/locations/hierarchy':
        return {
          content: <AdminLocationsScreen onNavigate={onNavigate} subpage="hierarchy" />,
          breadcrumb: { module: 'Locations & Clusters', page: 'Location Hierarchy' },
        };

      case '/admin/locations/map':
        return {
          content: <AdminLocationsScreen onNavigate={onNavigate} subpage="map" />,
          breadcrumb: { module: 'Locations & Clusters', page: 'Cluster Map' },
        };

      case '/admin/locations/geofencing':
        return {
          content: <AdminLocationsScreen onNavigate={onNavigate} subpage="map" />,
          breadcrumb: { module: 'Locations & Clusters', page: 'Spatial Geofencing' },
        };

      case '/admin/locations/fleet':
        return {
          content: <AdminLocationsScreen onNavigate={onNavigate} subpage="clusters" />,
          breadcrumb: { module: 'Locations & Clusters', page: 'POS & NFC Fleet' },
        };

      case '/admin/deals':
        return {
          content: <AdminDealsScreen onNavigate={onNavigate} subpage="active" />,
          breadcrumb: { module: 'Deals & Discovery', page: 'All Deals' },
        };

      case '/admin/deals/flagged':
        return {
          content: <AdminDealsScreen onNavigate={onNavigate} subpage="active" />,
          breadcrumb: { module: 'Deals & Discovery', page: 'Flagged Deals' },
        };

      case '/admin/deals/moderation':
        return {
          content: <AdminDealsScreen onNavigate={onNavigate} subpage="moderation" />,
          breadcrumb: { module: 'Deals & Discovery', page: 'Discovery Listings' },
        };

      case '/admin/deals/featured':
        return {
          content: <AdminDealsScreen onNavigate={onNavigate} subpage="featured" />,
          breadcrumb: { module: 'Deals & Discovery', page: 'Featured Placement' },
        };

      case '/admin/orders':
        return {
          content: <AdminOrdersScreen onNavigate={onNavigate} subpage="live" />,
          breadcrumb: { module: 'Orders & POS', page: 'Orders & Bookings' },
        };

      case '/admin/orders/transactions':
      case '/admin/orders/disputes':
        return {
          content: <AdminOrdersScreen onNavigate={onNavigate} subpage="transactions" />,
          breadcrumb: { module: 'Orders & POS', page: 'Transactions & Exceptions' },
        };

      case '/admin/orders/terminals':
        return {
          content: <AdminOrdersScreen onNavigate={onNavigate} subpage="terminals" />,
          breadcrumb: { module: 'Orders & POS', page: 'POS Monitoring' },
        };

      case '/admin/marketing':
        return {
          content: <AdminMarketingScreen onNavigate={onNavigate} subpage="campaigns" />,
          breadcrumb: { module: 'Marketing & Ads', page: 'Campaigns & Announcements' },
        };

      case '/admin/marketing/ads':
      case '/admin/marketing/slots':
        return {
          content: <AdminMarketingScreen onNavigate={onNavigate} subpage="ads" />,
          breadcrumb: { module: 'Marketing & Ads', page: 'Ads Management' },
        };

      case '/admin/marketing/performance':
      case '/admin/marketing/broadcasts':
        return {
          content: <AdminMarketingScreen onNavigate={onNavigate} subpage="performance" />,
          breadcrumb: { module: 'Marketing & Ads', page: 'Ad Performance' },
        };

      case '/admin/subscriptions':
      case '/admin/subscriptions/plans':
        return {
          content: <AdminSubscriptionsScreen onNavigate={onNavigate} subpage="plan-configuration" />,
          breadcrumb: { module: 'Subscriptions & Payments', page: 'Plan Configuration' },
        };

      case '/admin/subscriptions/subscriptions':
        return {
          content: <AdminSubscriptionsScreen onNavigate={onNavigate} subpage="subscriptions" />,
          breadcrumb: { module: 'Subscriptions & Payments', page: 'Subscriptions' },
        };

      case '/admin/subscriptions/payments':
        return {
          content: <AdminSubscriptionsScreen onNavigate={onNavigate} subpage="payments" />,
          breadcrumb: { module: 'Subscriptions & Payments', page: 'Payments' },
        };

      case '/admin/subscriptions/ad-billing':
      case '/admin/subscriptions/escrow':
      case '/admin/subscriptions/invoices':
        return {
          content: <AdminSubscriptionsScreen onNavigate={onNavigate} subpage="ad-billing" />,
          breadcrumb: { module: 'Subscriptions & Payments', page: 'Ad Payments & Billing' },
        };

      case '/admin/analytics':
        return {
          content: <AdminAnalyticsScreen onNavigate={onNavigate} subpage="platform-performance" />,
          breadcrumb: { module: 'Analytics & Reports', page: 'Platform Performance' },
        };

      case '/admin/analytics/growth':
        return {
          content: <AdminAnalyticsScreen onNavigate={onNavigate} subpage="customer-and-business-growth" />,
          breadcrumb: { module: 'Analytics & Reports', page: 'Customer & Business Growth' },
        };

      case '/admin/analytics/deals':
        return {
          content: <AdminAnalyticsScreen onNavigate={onNavigate} subpage="deals-and-discovery-performance" />,
          breadcrumb: { module: 'Analytics & Reports', page: 'Deals & Discovery Performance' },
        };

      case '/admin/analytics/clusters':
        return {
          content: <AdminAnalyticsScreen onNavigate={onNavigate} subpage="clusters-and-locations-performance" />,
          breadcrumb: { module: 'Analytics & Reports', page: 'Clusters & Locations Performance' },
        };

      case '/admin/analytics/revenue':
        return {
          content: <AdminAnalyticsScreen onNavigate={onNavigate} subpage="revenue-and-advertising-reports" />,
          breadcrumb: { module: 'Analytics & Reports', page: 'Revenue & Advertising Reports' },
        };

      case '/admin/settings':
        return {
          content: <AdminSettingsScreen onNavigate={onNavigate} subpage="platform" />,
          breadcrumb: { module: 'Support & Settings', page: 'Platform Settings' },
        };

      case '/admin/settings/support':
        return {
          content: <AdminSettingsScreen onNavigate={onNavigate} subpage="support" />,
          breadcrumb: { module: 'Support & Settings', page: 'Support Requests' },
        };

      case '/admin/settings/disputes':
        return {
          content: <AdminSettingsScreen onNavigate={onNavigate} subpage="disputes" />,
          breadcrumb: { module: 'Support & Settings', page: 'Complaints & Disputes' },
        };

      case '/admin/settings/team':
        return {
          content: <AdminSettingsScreen onNavigate={onNavigate} subpage="team" />,
          breadcrumb: { module: 'Support & Settings', page: 'Admin Roles & Access' },
        };

      case '/admin/settings/audit':
        return {
          content: <AdminSettingsScreen onNavigate={onNavigate} subpage="audit" />,
          breadcrumb: { module: 'Support & Settings', page: 'Admin Activity Log' },
        };

      case '/admin/referral':
        return {
          content: <AdminReferralScreen onBack={() => onNavigate('/admin/settings')} />,
          breadcrumb: { module: 'Support & Settings', page: 'Referral Programme Video' },
        };

      case '/admin':
      case '/admin/overview':
      default:
        return {
          content: <AdminOverviewScreen onNavigate={onNavigate} />,
          breadcrumb: { module: undefined, page: 'Overview' },
        };
    }
  }, [currentPath, onNavigate]);

  return (
    <AdminLayout currentPath={currentPath} onNavigate={onNavigate} breadcrumb={breadcrumb}>
      {content}
    </AdminLayout>
  );
}

