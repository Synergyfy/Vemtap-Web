import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Logo } from '../../components/ui/Logo';
import {
  getClusterState,
  joinCluster,
  createCluster,
  checkDuplicateCluster,
  toggleItemShowInCluster,
  setBusinessShowcasePreference,
  type Cluster,
  type ClusterType,
  type ShowcaseEntityType,
} from '../clusterData';
import { ClusterQrCode } from '../../components/ClusterQrCode';
import { hasApiConfig } from '../../services/api/client';
import { useMyBusiness } from '../../hooks/business/useMyBusiness';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import type { ClusterKind } from '../../services/clustersService';
import { SHOWCASE_PREFERENCE, toCluster, useLiveCluster } from '../clusterLive';

interface DesktopClusterOnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
  initialStep?: 'intro' | 'detect' | 'found' | 'not_found' | 'create' | 'choose_feature' | 'success';
  onCreateDeal?: () => void;
  onCreateProduct?: () => void;
  onCreateLocation?: () => void;
}

export function DesktopClusterOnboardingScreen({
  onComplete,
  onSkip,
  initialStep = 'intro',
  onCreateDeal,
  onCreateProduct,
  onCreateLocation,
}: DesktopClusterOnboardingScreenProps) {
  const [step, setStep] = useState<
    'intro' | 'detect' | 'found' | 'not_found' | 'create' | 'choose_feature' | 'success'
  >(initialStep);

  const [localState, setClusterState] = useState(() => getClusterState());
  const live = hasApiConfig();
  const liveCluster = useLiveCluster();
  const clusterState = live ? liveCluster.state : localState;
  const [notice, setNotice] = useState<string | null>(null);
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  };
  // The detection timer reads the latest live answer, not the one at mount.
  const liveRef = useRef(liveCluster);
  liveRef.current = liveCluster;
  const [selectedShowcaseType, setSelectedShowcaseType] = useState<ShowcaseEntityType>(() => {
    const pref = getClusterState().showcasePreference;
    if (pref === 'product' || pref === 'service' || pref === 'profile') return pref;
    return 'deal';
  });

  // Detection state
  const [detectProgress, setDetectProgress] = useState(0);
  const [detectedCluster, setDetectedCluster] = useState<Cluster | null>(null);
  const [unitOrSuite, setUnitOrSuite] = useState(hasApiConfig() ? '' : 'Shop G-12, Ground Floor');

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState<ClusterType>('mall');
  const [createAddress, setCreateAddress] = useState(live ? '' : 'Plot 1044 Ahmadu Bello Way, Area 11, Garki, Abuja');
  const [createCity, setCreateCity] = useState(live ? '' : 'Abuja');
  // Live: start from the business's own address; demo keeps the sample venue.
  const myBusiness = useMyBusiness().data;
  const businessAddress = [myBusiness?.address, myBusiness?.city].filter(Boolean).join(', ');
  const registeredAddress = live ? businessAddress || 'your registered business address' : 'Plot 1044 Ahmadu Bello Way, Area 11, Garki, Abuja';
  useEffect(() => {
    if (!live || !myBusiness) return;
    setCreateAddress((current) => current || myBusiness.address || '');
    setCreateCity((current) => current || myBusiness.city || '');
  }, [live, myBusiness]);

  const [createState, setCreateState] = useState('FCT');
  const [createRadius, setCreateRadius] = useState(500);
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Active cluster
  const [activeCluster, setActiveCluster] = useState<Cluster | null>(null);

  // Simulate detection
  useEffect(() => {
    if (step === 'detect') {
      setDetectProgress(15);
      const timer1 = setTimeout(() => setDetectProgress(50), 500);
      const timer2 = setTimeout(() => setDetectProgress(85), 1000);
      const timer3 = setTimeout(() => {
        setDetectProgress(100);
        if (live) {
          const current = liveRef.current;
          if (current.state.currentCluster) {
            setActiveCluster(current.state.currentCluster);
            setStep('choose_feature');
          } else if (current.detected) {
            setDetectedCluster(current.detected);
            setStep('found');
          } else {
            if (current.detectReason) notify(current.detectReason);
            setStep('not_found');
          }
          return;
        }
        const state = getClusterState();
        if (state.scenario === 'not_found') {
          setStep('not_found');
        } else {
          setDetectedCluster(state.currentCluster);
          setStep('found');
        }
      }, 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  const handleJoinDetected = () => {
    if (!detectedCluster) return;
    if (live) {
      liveCluster.join.mutate(detectedCluster.id, {
        onSuccess: (joined) => {
          setActiveCluster(toCluster(joined));
          setStep('choose_feature');
        },
        onError: (error) => notify(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not join the cluster.')),
      });
      return;
    }
    joinCluster(detectedCluster.id, unitOrSuite);
    setActiveCluster(detectedCluster);
    setClusterState(getClusterState());
    setStep('choose_feature');
  };

  const handleCreateCluster = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createName.trim()) {
      setCreateError('Please enter a cluster name.');
      return;
    }
    if (!agreedGuidelines) {
      setCreateError('Please accept the Cluster Community Guidelines.');
      return;
    }

    if (live) {
      liveCluster.propose.mutate(
        { name: createName.trim(), address: createAddress, kind: createType as ClusterKind },
        {
          onSuccess: (created) => {
            setActiveCluster(toCluster(created));
            setStep('choose_feature');
          },
          onError: (error) => notify(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not propose the cluster.')),
        },
      );
      return;
    }

    const dupCheck = checkDuplicateCluster(createName, createAddress);
    if (dupCheck.isDuplicate) {
      setCreateError(dupCheck.reason || 'A cluster with this name or location already exists.');
      return;
    }

    const created = createCluster({
      name: createName.trim(),
      type: createType,
      city: createCity,
      state: createState,
      address: createAddress,
      radiusMeters: createRadius,
      unitOrSuite,
    });

    setActiveCluster(created);
    setClusterState(getClusterState());
    setStep('choose_feature');
  };

  const handleToggleItem = (itemId: string) => {
    if (live) {
      const item = clusterState.showcaseItems.find((entry) => entry.id === itemId);
      if (item)
        liveCluster.toggleItem.mutate(item, {
          onError: (error) => notify(apiErrorMessage(error, 'Could not update the cluster showcase.')),
        });
      return;
    }
    toggleItemShowInCluster(itemId);
    setClusterState(getClusterState());
  };

  const handleConfirmShowcase = () => {
    if (live) {
      liveCluster.setPreference.mutate(SHOWCASE_PREFERENCE[selectedShowcaseType] ?? 'all', {
        onSuccess: () => setStep('success'),
        onError: (error) => notify(apiErrorMessage(error, 'Could not save what to show.')),
      });
      return;
    }
    setBusinessShowcasePreference(selectedShowcaseType);
    setStep('success');
  };

  const myShowcaseItems = clusterState.showcaseItems
    .filter((i) => i.businessId === (live ? 'self' : '104'))
    .filter((i) => i.entityType === selectedShowcaseType);

  return (
    <div className="min-h-screen bg-surface-canvas font-body-md text-text-primary flex flex-col">
      {/* Desktop Header */}
      <header className="fixed top-0 inset-x-0 h-16 z-50 bg-surface-canvas/90 backdrop-blur-xl border-b border-border-subtle">
        <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo variant="full" className="h-9 w-auto" />
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary">
              CLUSTER SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-text-secondary hidden sm:inline">
              Step: <strong className="text-text-primary capitalize">{step.replace('_', ' ')}</strong>
            </span>
            {step !== 'success' && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-subtle"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 pt-24 pb-16 px-6 lg:px-12 max-w-6xl mx-auto w-full">
        {/* ================= STEP 1: INTRO ================= */}
        {step === 'intro' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption uppercase tracking-wider font-semibold">
                <Icon name="verified" className="text-[16px]" />
                <span>Local Merchant Collective</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary">
                  Connect With Your Local Commercial Cluster
                </h1>
                <p className="text-text-secondary text-base leading-relaxed">
                  VEMTAP organizes businesses inside malls, commercial plazas, and market districts
                  into location clusters. Every cluster shares one community QR touchpoint and an
                  automated deal rotator pool.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                    <Icon name="groups" className="text-[20px]" />
                  </div>
                  <h3 className="font-semibold text-sm text-text-primary">Shared Footfall</h3>
                  <p className="text-xs text-text-secondary">
                    Shoppers browsing neighboring stores discover your deals automatically.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Icon name="sync" className="text-[20px]" />
                  </div>
                  <h3 className="font-semibold text-sm text-text-primary">Fair Deal Rotator</h3>
                  <p className="text-xs text-text-secondary">
                    VEMTAP rotates top offers across all cluster businesses in balanced intervals.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Icon name="qr_code_2" className="text-[20px]" />
                  </div>
                  <h3 className="font-semibold text-sm text-text-primary">Single Cluster QR</h3>
                  <p className="text-xs text-text-secondary">
                    One unified printable pass and NFC point for mall entrances and directories.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Icon name="trending_up" className="text-[20px]" />
                  </div>
                  <h3 className="font-semibold text-sm text-text-primary">Zero Extra Cost</h3>
                  <p className="text-xs text-text-secondary">
                    Fully included in your active merchant subscription and onboarding.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('detect')}
                  className="px-6 h-12 bg-primary-container hover:opacity-95 text-on-primary font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                  <span>Check Location Availability</span>
                  <Icon name="near_me" className="text-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-6 h-12 bg-surface-subtle hover:bg-surface-container text-text-secondary font-medium text-sm rounded-xl transition-colors"
                >
                  Skip to Dashboard
                </button>
              </div>
            </div>

            {/* Right Graphic / Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-surface-subtle to-surface-canvas border border-border-subtle shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Cluster System Preview
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="p-4 rounded-2xl bg-surface-canvas border border-border-subtle space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center">
                      <Icon name="hub" className="text-[22px]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">{live ? 'Your area cluster' : 'Amaka Mall Cluster'}</h4>
                      <p className="text-[11px] text-text-secondary">{live ? businessAddress || 'Matched from your address' : 'Area 11, Garki, Abuja'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-surface-subtle">
                      <p className="font-bold text-text-primary">{live ? '—' : '24'} Merchants</p>
                      <p className="text-[10px] text-text-tertiary">Active Members</p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-subtle">
                      <p className="font-bold text-emerald-600">{live ? '—' : '18'} Deals</p>
                      <p className="text-[10px] text-text-tertiary">In Rotator Pool</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Icon name="check" className="text-[16px] text-emerald-600" />
                    <span>Automatic geofence match based on your address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="check" className="text-[16px] text-emerald-600" />
                    <span>Instant deal promotion across cluster visitors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DETECTING ================= */}
        {step === 'detect' && (
          <div className="max-w-xl mx-auto py-12 flex flex-col items-center text-center gap-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-75" />
              <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-primary-container text-white flex items-center justify-center shadow-2xl">
                <Icon name="radar" className="text-[44px] animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-primary">
                Scanning Geofenced Merchant Zones
              </h2>
              <p className="text-sm text-text-secondary">
                Verifying registered coordinates for:
                <br />
                <span className="font-semibold text-text-primary">
                  {registeredAddress}
                </span>
              </p>
            </div>

            <div className="w-full max-w-sm space-y-2">
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${detectProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-tertiary">
                {detectProgress < 50 && 'Querying VEMTAP location geofence...'}
                {detectProgress >= 50 &&
                  detectProgress < 85 &&
                  'Matching commercial plazas & shopping centers within 500m...'}
                {detectProgress >= 85 && 'Finalizing merchant collective match...'}
              </p>
            </div>

            {/* Quick test overrides (demo only) */}
            {!live && (
            <div className="pt-6 border-t border-border-subtle w-full max-w-xs flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const state = getClusterState();
                  setDetectedCluster(state.currentCluster);
                  setStep('found');
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-surface-subtle text-xs font-semibold text-text-secondary border border-border-subtle hover:border-primary"
              >
                Simulate Match
              </button>
              <button
                type="button"
                onClick={() => setStep('not_found')}
                className="flex-1 py-1.5 px-3 rounded-lg bg-surface-subtle text-xs font-semibold text-text-secondary border border-border-subtle hover:border-primary"
              >
                Simulate None
              </button>
            </div>
            )}
          </div>
        )}

        {/* ================= STEP 3A: CLUSTER FOUND ================= */}
        {step === 'found' && detectedCluster && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Icon name="check_circle" className="text-[24px]" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-base">
                  Active Commercial Cluster Detected!
                </h3>
                <p className="text-xs text-emerald-800">
                  Your business is located within the physical boundary of an established VEMTAP
                  merchant collective.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle shadow-md space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-surface-tint-blue px-3 py-1 rounded-full mb-2">
                    <Icon name="storefront" className="text-[14px]" />
                    <span>Shopping Mall Cluster</span>
                  </span>
                  <h2 className="text-2xl font-bold text-text-primary">{detectedCluster.name}</h2>
                  <p className="text-sm text-text-secondary mt-1">{detectedCluster.address}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary-container text-white flex items-center justify-center shadow-lg">
                  <Icon name="hub" className="text-[28px]" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-border-subtle/70 text-center">
                <div className="p-3 rounded-xl bg-surface-canvas">
                  <p className="text-xl font-extrabold text-text-primary">
                    {live ? '—' : detectedCluster.stats.totalBusinesses}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Member Businesses</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-canvas">
                  <p className="text-xl font-extrabold text-emerald-600">
                    {live ? '—' : detectedCluster.stats.totalDealsInPool}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Pool Deals in Rotator</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-canvas">
                  <p className="text-xl font-extrabold text-primary">
                    {live ? '—' : `${(detectedCluster.stats.totalScans / 1000).toFixed(1)}k`}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Total Shopper Scans</p>
                </div>
              </div>

              {/* Member businesses preview (demo only — live members are listed once you join) */}
              <div className={live ? 'hidden' : undefined}>
                <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3">
                  Participating Center Merchants:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                    <p className="font-semibold text-text-primary">Zaria Artisan Bakery</p>
                    <p className="text-[11px] text-text-secondary">Kiosk 04, Central Atrium</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                    <p className="font-semibold text-text-primary">Aura Couture</p>
                    <p className="text-[11px] text-text-secondary">Suite 204, 1st Floor</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                    <p className="font-semibold text-text-primary">Bella Glow Skincare</p>
                    <p className="text-[11px] text-text-secondary">Suite 302, 2nd Floor</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                    <p className="font-semibold text-text-primary">GadgetZone Express</p>
                    <p className="text-[11px] text-text-secondary">Shop G-08, North Wing</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                    <p className="font-semibold text-text-primary">Prime Cuts Barber</p>
                    <p className="text-[11px] text-text-secondary">Suite 108, Mezzanine</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs flex items-center justify-center font-semibold text-primary">
                    +19 More Merchants
                  </div>
                </div>
              </div>

              {/* Unit number field */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                  Your Unit / Suite in this Center:
                </label>
                <input
                  type="text"
                  value={unitOrSuite}
                  onChange={(e) => setUnitOrSuite(e.target.value)}
                  placeholder="e.g. Shop G-12, Ground Floor"
                  className="w-full px-4 py-3 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleJoinDetected}
                className="flex-1 h-12 bg-primary-container hover:opacity-95 text-on-primary font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
                <span>Join This Cluster</span>
                <Icon name="check" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setStep('not_found')}
                className="px-5 h-12 bg-surface-subtle hover:bg-surface-container text-text-secondary text-xs font-semibold rounded-xl transition-colors"
              >
                Not your center? Create New
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3B: CLUSTER NOT FOUND ================= */}
        {step === 'not_found' && (
          <div className="max-w-xl mx-auto text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-md">
              <Icon name="location_off" className="text-[40px]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-primary">
                No Existing Cluster Found
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                We didn't detect an active merchant cluster at your registered location (
                <span className="font-semibold text-text-primary">
                  {registeredAddress}
                </span>
                ).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle text-left space-y-3">
              <div className="flex items-center gap-2.5 text-primary font-bold text-base">
                <Icon name="add_circle" className="text-[20px]" />
                <span>Initialize the Commercial Cluster</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                If your business operates within a shopping complex, market, or commercial
                strip, you can establish the cluster now. Neighboring businesses in the same facility
                can discover and join your unified QR point.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep('create')}
                className="px-8 h-12 bg-primary-container hover:opacity-95 text-on-primary font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
                <Icon name="add" className="text-[18px]" />
                <span>Create a New Cluster</span>
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="px-6 h-12 bg-surface-subtle hover:bg-surface-container text-text-secondary font-medium text-sm rounded-xl transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CREATE CLUSTER ================= */}
        {step === 'create' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleCreateCluster} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">Register New Cluster</h2>
                <p className="text-xs text-text-secondary mt-1">
                  Establish a shared merchant network for your shopping center or plaza.
                </p>
              </div>

              {createError && (
                <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2.5">
                  <Icon name="error" className="text-[18px] shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                    Cluster / Center Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Ceddi Plaza Commercial Hub"
                    className="w-full px-4 py-2.5 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Cluster Type *
                    </label>
                    <select
                      value={createType}
                      onChange={(e) => setCreateType(e.target.value as ClusterType)}
                      className="w-full px-4 py-2.5 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                    >
                      <option value="mall">Shopping Mall</option>
                      <option value="plaza">Commercial Plaza</option>
                      <option value="market">Open Market / Bazaar</option>
                      <option value="commercial-axis">Commercial Strip / Axis</option>
                      <option value="strip">Retail Arcade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Geofence Radius
                    </label>
                    <select
                      value={createRadius}
                      onChange={(e) => setCreateRadius(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                    >
                      <option value={300}>300 meters (Single Mall)</option>
                      <option value={500}>500 meters (Plaza + Wing)</option>
                      <option value={1000}>1 kilometer (Commercial Strip)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                    Physical Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={createAddress}
                    onChange={(e) => setCreateAddress(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={createCity}
                      onChange={(e) => setCreateCity(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={createState}
                      onChange={(e) => setCreateState(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                    Your Unit / Suite in this Center:
                  </label>
                  <input
                    type="text"
                    value={unitOrSuite}
                    onChange={(e) => setUnitOrSuite(e.target.value)}
                    placeholder="e.g. Suite 204 or Ground Floor Shop 12"
                    className="w-full px-4 py-2.5 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>

                <label className="flex items-start gap-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedGuidelines}
                    onChange={(e) => setAgreedGuidelines(e.target.checked)}
                    className="mt-0.5 rounded border-border-subtle text-primary focus:ring-0"
                  />
                  <span className="text-xs text-text-secondary leading-snug">
                    I confirm that Urban Grill &amp; Bistro operates physically within this location
                    and agree to adhere to the VEMTAP Cluster Deal Rotator Community Guidelines.
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="px-8 h-12 bg-primary-container hover:opacity-95 text-on-primary font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                  <span>Establish Cluster</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep('not_found')}
                  className="px-6 h-12 bg-surface-subtle hover:bg-surface-container text-text-secondary font-medium text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 4.5: CHOOSE WHAT TO FEATURE ================= */}
        {step === 'choose_feature' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-surface-tint-blue px-3 py-1 rounded-full">
                <Icon name="tune" className="text-[16px]" />
                <span>Cluster Showcase Setup</span>
              </div>
              <h2 className="text-3xl font-extrabold text-text-primary">
                Choose What to Feature in the Cluster
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Decide how your business appears to shoppers across the {activeCluster?.name || 'Cluster'} shared QR network.
                Your existing catalog has been auto-imported into the rotator pool.
              </p>
            </div>

            {/* 3 Entity Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setSelectedShowcaseType('deal')}
                className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                  selectedShowcaseType === 'deal'
                    ? 'border-primary bg-surface-tint-blue/20 ring-2 ring-primary shadow-sm'
                    : 'border-border-subtle bg-surface-subtle hover:border-primary/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="local_offer" className="text-[22px]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Special Deals &amp; Vouchers</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Feature limited-time discounts, lunch specials, and bundle savings in the cluster rotator.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-primary">
                  <span>{selectedShowcaseType === 'deal' ? 'Selected' : 'Select Deals'}</span>
                  {selectedShowcaseType === 'deal' && <Icon name="check_circle" className="text-[16px] ml-1.5" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedShowcaseType('product')}
                className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                  selectedShowcaseType === 'product'
                    ? 'border-primary bg-surface-tint-blue/20 ring-2 ring-primary shadow-sm'
                    : 'border-border-subtle bg-surface-subtle hover:border-primary/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="inventory_2" className="text-[22px]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Products &amp; Menu Catalog</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Showcase signature dishes, top products, or bookable services directly to visiting customers.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-primary">
                  <span>{selectedShowcaseType === 'product' ? 'Selected' : 'Select Catalog'}</span>
                  {selectedShowcaseType === 'product' && <Icon name="check_circle" className="text-[16px] ml-1.5" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedShowcaseType('profile')}
                className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                  selectedShowcaseType === 'profile'
                    ? 'border-primary bg-surface-tint-blue/20 ring-2 ring-primary shadow-sm'
                    : 'border-border-subtle bg-surface-subtle hover:border-primary/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center">
                  <Icon name="storefront" className="text-[22px]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Storefront Profile Spotlight</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Promote your brand profile, story, business hours, and full shop front on the cluster directory.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-primary">
                  <span>{selectedShowcaseType === 'profile' ? 'Selected' : 'Select Profile'}</span>
                  {selectedShowcaseType === 'profile' && <Icon name="check_circle" className="text-[16px] ml-1.5" />}
                </div>
              </button>
            </div>

            {/* Auto-imported items toggle table */}
            <div className="bg-surface-subtle border border-border-subtle rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-text-primary">
                    Manage Items in Cluster Rotator Pool
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Your items have been auto-synced. Toggle each item to choose whether it is active or hidden in the cluster rotator.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedShowcaseType === 'deal' && onCreateDeal) onCreateDeal();
                      else if ((selectedShowcaseType === 'product' || selectedShowcaseType === 'service') && onCreateProduct) onCreateProduct();
                      else if (selectedShowcaseType === 'profile' && onCreateLocation) onCreateLocation();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all"
                  >
                    <Icon name="add" className="text-[16px]" />
                    <span>
                      {selectedShowcaseType === 'deal'
                        ? 'Create Deal in Studio'
                        : selectedShowcaseType === 'product'
                        ? 'Create Product / Service'
                        : 'Create Storefront Location'}
                    </span>
                  </button>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-surface-canvas rounded-full border border-border-subtle text-text-secondary">
                    {myShowcaseItems.filter((i) => i.showInCluster).length} of {myShowcaseItems.length} Active
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {myShowcaseItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-text-secondary space-y-3">
                    <p>No {selectedShowcaseType === 'deal' ? 'deals' : selectedShowcaseType === 'product' ? 'products or services' : 'storefront locations'} found in your catalog yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedShowcaseType === 'deal' && onCreateDeal) onCreateDeal();
                        else if ((selectedShowcaseType === 'product' || selectedShowcaseType === 'service') && onCreateProduct) onCreateProduct();
                        else if (selectedShowcaseType === 'profile' && onCreateLocation) onCreateLocation();
                      }}
                      className="px-4 py-2 rounded-xl bg-primary-container text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm hover:opacity-95"
                    >
                      <Icon name="add" className="text-[16px]" />
                      <span>
                        {selectedShowcaseType === 'deal'
                          ? 'Open Deal Studio to Create Deal'
                          : selectedShowcaseType === 'product'
                          ? 'Open Catalog to Create Product/Service'
                          : 'Open Locations to Create Storefront'}
                      </span>
                    </button>
                  </div>
                )}
                {myShowcaseItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                      item.showInCluster
                        ? 'border-primary/40 bg-surface-canvas shadow-xs'
                        : 'border-border-subtle bg-surface-canvas/60 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-text-primary truncate">
                            {item.title}
                          </h5>
                          {item.discount && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-badge-discount-bg text-badge-discount-text">
                              {item.discount}
                            </span>
                          )}
                          {item.price && (
                            <span className="text-xs font-bold text-primary">
                              {item.price}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate mt-0.5 max-w-lg">
                          {item.subtitle}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-text-tertiary mt-1">
                          <span>{item.views.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{item.impressions.toLocaleString()} impressions</span>
                          <span>•</span>
                          <span>{item.clicks.toLocaleString()} clicks</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          item.showInCluster
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-surface-subtle text-text-tertiary'
                        }`}
                      >
                        {item.showInCluster ? 'Active in Rotator' : 'Hidden'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                          item.showInCluster ? 'bg-primary' : 'bg-border-subtle'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                            item.showInCluster ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation CTA */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('found')}
                className="px-6 h-12 bg-surface-subtle hover:bg-surface-container text-text-secondary font-medium text-sm rounded-xl transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleConfirmShowcase}
                className="px-8 h-12 bg-primary-container hover:opacity-95 text-on-primary font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
                <span>Save Showcase &amp; Continue</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: SUCCESS ================= */}
        {step === 'success' && activeCluster && (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl">
              <Icon name="celebration" className="text-[40px]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-text-primary">
                Welcome to {activeCluster.name}!
              </h2>
              <p className="text-sm text-text-secondary max-w-lg mx-auto">
                Your business is now an active member of the commercial network. Your deals will be
                automatically included in the cluster rotation pool.
              </p>
            </div>

            {/* QR Pass */}
            <div className="flex justify-center">
              <ClusterQrCode
                url={activeCluster.qrCode.url}
                clusterName={activeCluster.name}
                displayCode={activeCluster.qrCode.displayCode}
                size={220}
              />
            </div>

            {/* Next Steps Grid */}
            <div className="p-6 rounded-3xl bg-surface-subtle border border-border-subtle text-left grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <Icon name="sync" className="text-[16px]" />
                  <span>Deal Rotator Active</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Your top deals are synced with neighboring businesses for cross-store traffic.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
                  <Icon name="qr_code_2" className="text-[16px]" />
                  <span>Unified QR Pass</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Download or print your high-res vector pass for checkout counters and lobbies.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs">
                  <Icon name="space_dashboard" className="text-[16px]" />
                  <span>Dedicated Dashboard</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Track shopper scans, redemption counts, and fellow center merchants anytime.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={onComplete}
                className="px-8 h-12 bg-primary-container hover:opacity-95 text-on-primary font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
                <span>Enter Cluster System</span>
                <Icon name="hub" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="px-6 h-12 bg-surface-subtle hover:bg-surface-container text-text-secondary font-medium text-sm rounded-xl transition-colors"
              >
                Continue to Business Overview
              </button>
            </div>
          </div>
        )}
      </main>      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-surface text-on-surface-inverse px-space-md py-space-sm rounded-xl shadow-lg font-label-md text-label-md flex items-center gap-space-xs">
          {notice}
        </div>
      )}

    </div>
  );
}
