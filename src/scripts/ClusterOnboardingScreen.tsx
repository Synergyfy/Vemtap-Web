import { useState, useEffect, useRef } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
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
} from './clusterData';
import { ClusterQrCode } from '../components/ClusterQrCode';
import { hasApiConfig } from '../services/api/client';
import { useMyBusiness } from '../hooks/business/useMyBusiness';
import { apiErrorMessage } from '../services/errorMessages';
import { planErrorMessage } from '../services/planErrors';
import type { ClusterKind } from '../services/clustersService';
import { SHOWCASE_PREFERENCE, toCluster, useLiveCluster } from './clusterLive';

interface ClusterOnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
  initialStep?: 'intro' | 'detect' | 'found' | 'not_found' | 'create' | 'choose_feature' | 'success';
  onCreateDeal?: () => void;
  onCreateProduct?: () => void;
  onCreateLocation?: () => void;
}

export function ClusterOnboardingScreen({
  onComplete,
  onSkip,
  initialStep = 'intro',
  onCreateDeal,
  onCreateProduct,
  onCreateLocation,
}: ClusterOnboardingScreenProps) {
  const [step, setStep] = useState<
    'intro' | 'detect' | 'found' | 'not_found' | 'create' | 'choose_feature' | 'success'
  >(initialStep);

  // Detection state
  const [detectProgress, setDetectProgress] = useState(0);
  const [detectedCluster, setDetectedCluster] = useState<Cluster | null>(null);
  const [unitOrSuite, setUnitOrSuite] = useState(hasApiConfig() ? '' : 'Shop G-12, Ground Floor');

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState<ClusterType>('mall');
  const [createAddress, setCreateAddress] = useState(hasApiConfig() ? '' : 'Plot 1044 Ahmadu Bello Way, Area 11, Garki, Abuja');
  const [createCity, setCreateCity] = useState(hasApiConfig() ? '' : 'Abuja');
  const [createState, setCreateState] = useState('FCT');
  const [createRadius, setCreateRadius] = useState(500);
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Active cluster after join/create
  const [activeCluster, setActiveCluster] = useState<Cluster | null>(null);

  // Showcase choice state during onboarding
  const [selectedShowcaseType, setSelectedShowcaseType] = useState<ShowcaseEntityType>('deal');
  const [localState, setClusterState] = useState(getClusterState());
  const live = hasApiConfig();
  // Live: start from the business's own address; demo keeps the sample venue.
  const myBusiness = useMyBusiness().data;
  const businessAddress = [myBusiness?.address, myBusiness?.city].filter(Boolean).join(', ');
  const registeredAddress = live ? businessAddress || 'your registered business address' : 'Plot 1044 Ahmadu Bello Way, Area 11, Garki, Abuja';
  useEffect(() => {
    if (!live || !myBusiness) return;
    setCreateAddress((current) => current || myBusiness.address || '');
    setCreateCity((current) => current || myBusiness.city || '');
  }, [live, myBusiness]);
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

  // Simulate detection animation
  useEffect(() => {
    if (step === 'detect') {
      setDetectProgress(10);
      const timer1 = setTimeout(() => setDetectProgress(45), 600);
      const timer2 = setTimeout(() => setDetectProgress(85), 1200);
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
      }, 1800);

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
      setCreateError('Please agree to the Cluster Community Guidelines.');
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
    <AppScreen surface="bg-surface-canvas">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface-canvas/95 backdrop-blur-md border-b border-border-subtle px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step !== 'intro' && step !== 'success' && (
            <button
              type="button"
              onClick={() => {
                if (step === 'detect' || step === 'found' || step === 'not_found') setStep('intro');
                else if (step === 'create') setStep('not_found');
                else if (step === 'choose_feature') setStep('found');
              }}
              className="p-1 -ml-1 text-text-secondary hover:text-text-primary rounded-lg"
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-tint-blue flex items-center justify-center text-primary">
              <Icon name="hub" className="text-[18px]" />
            </div>
            <div>
              <h1 className="font-heading-sm text-heading-sm text-text-primary leading-tight">
                Cluster Network
              </h1>
              <p className="text-[11px] text-text-secondary">Community Footfall &amp; Rotator</p>
            </div>
          </div>
        </div>

        {step !== 'success' && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors px-2 py-1"
          >
            Skip for now
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-12 max-w-lg mx-auto w-full">
        {/* ================= STEP 1: INTRO ================= */}
        {step === 'intro' && (
          <div className="flex flex-col gap-5 pt-2">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-container to-blue-700 p-6 text-white shadow-xl">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase mb-3">
                  <Icon name="verified" className="text-[14px]" />
                  <span>Verified Merchant Program</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Multiply Your Footfall With VEMTAP Clusters
                </h2>
                <p className="text-white/85 text-sm leading-relaxed">
                  Join physical shopping centers, commercial plazas, and markets. Share one QR
                  point and promote your deals to every nearby customer.
                </p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Value Proposition Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                  <Icon name="groups" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm">
                    Shared Customer Traffic
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    When shoppers scan the cluster pass at any entrance or counter, your verified
                    deals are immediately presented.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Icon name="sync" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm">
                    VEMTAP Deal Rotator Pool
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Admin-balanced algorithm rotates deals from all members fairly, driving repeat
                    cross-store visits.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon name="qr_code_2" className="text-[20px]" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm">
                    Single Shared QR &amp; Smart Pass
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    One unified printable pass and NFC point covers the entire mall or plaza. No
                    clutter for shoppers.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep('detect')}
                className="w-full h-12 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-on-primary font-semibold text-sm shadow-md"
              >
                <span>Check Location for Clusters</span>
                <Icon name="near_me" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="w-full h-11 bg-surface-subtle hover:bg-surface-container rounded-xl flex items-center justify-center text-text-secondary font-medium text-sm transition-colors"
              >
                Skip to Business Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DETECTING ================= */}
        {step === 'detect' && (
          <div className="flex flex-col items-center justify-center text-center py-12 px-2 gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-75" />
              <div className="absolute inset-3 rounded-full bg-primary/20 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-primary-container text-white flex items-center justify-center shadow-xl">
                <Icon name="radar" className="text-[36px] animate-spin" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h2 className="text-xl font-bold text-text-primary">
                Detecting Commercial Clusters
              </h2>
              <p className="text-xs text-text-secondary">
                Checking your physical address:
                <br />
                <span className="font-semibold text-text-primary">
                  {registeredAddress}
                </span>
              </p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${detectProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-text-tertiary">
                {detectProgress < 40 && 'Pinpointing GPS & address geofence...'}
                {detectProgress >= 40 &&
                  detectProgress < 85 &&
                  'Querying active VEMTAP commercial zones...'}
                {detectProgress >= 85 && 'Finalizing merchant network results...'}
              </p>
            </div>

            {/* Test overrides (demo only) */}
            {!live && (
            <div className="pt-6 border-t border-border-subtle w-full max-w-xs">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Simulate Scenario
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const state = getClusterState();
                    setDetectedCluster(state.currentCluster);
                    setStep('found');
                  }}
                  className="flex-1 py-1 px-2 rounded-lg bg-surface-subtle text-[11px] font-medium text-text-secondary border border-border-subtle hover:border-primary"
                >
                  Force Match
                </button>
                <button
                  type="button"
                  onClick={() => setStep('not_found')}
                  className="flex-1 py-1 px-2 rounded-lg bg-surface-subtle text-[11px] font-medium text-text-secondary border border-border-subtle hover:border-primary"
                >
                  Force None
                </button>
              </div>
            </div>
            )}
          </div>
        )}

        {/* ================= STEP 3A: CLUSTER FOUND ================= */}
        {step === 'found' && detectedCluster && (
          <div className="flex flex-col gap-5 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Icon name="check_circle" className="text-[20px]" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-950 text-sm">
                  Commercial Cluster Detected!
                </h3>
                <p className="text-xs text-emerald-800">
                  Your business address matches an active VEMTAP merchant collective.
                </p>
              </div>
            </div>

            {/* Cluster Card */}
            <div className="p-5 rounded-3xl bg-surface-subtle border border-border-subtle shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary bg-surface-tint-blue px-2.5 py-0.5 rounded-full mb-1">
                    <Icon name="storefront" className="text-[13px]" />
                    <span>Shopping Mall Cluster</span>
                  </div>
                  <h2 className="text-lg font-bold text-text-primary">{detectedCluster.name}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{detectedCluster.address}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-md">
                  <Icon name="hub" className="text-[22px]" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-subtle/60 text-center">
                <div className="p-2 rounded-xl bg-surface-canvas">
                  <p className="text-base font-bold text-text-primary">
                    {live ? '—' : detectedCluster.stats.totalBusinesses}
                  </p>
                  <p className="text-[11px] text-text-secondary">Businesses</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-canvas">
                  <p className="text-base font-bold text-emerald-600">
                    {live ? '—' : detectedCluster.stats.totalDealsInPool}
                  </p>
                  <p className="text-[11px] text-text-secondary">Pool Deals</p>
                </div>
                <div className="p-2 rounded-xl bg-surface-canvas">
                  <p className="text-base font-bold text-primary">
                    {live ? '—' : `${(detectedCluster.stats.totalScans / 1000).toFixed(1)}k`}
                  </p>
                  <p className="text-[11px] text-text-secondary">Total Scans</p>
                </div>
              </div>

              {/* Unit / Suite input */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Your Unit / Suite in this Center:
                </label>
                <input
                  type="text"
                  value={unitOrSuite}
                  onChange={(e) => setUnitOrSuite(e.target.value)}
                  placeholder="e.g. Shop G-12, Ground Floor"
                  className="w-full px-3 py-2 text-sm bg-surface-canvas border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleJoinDetected}
                className="w-full h-12 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-on-primary font-semibold text-sm shadow-md"
              >
                <span>Continue to Feature Selection</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setStep('not_found')}
                className="w-full h-10 bg-transparent text-text-secondary hover:text-text-primary text-xs font-medium"
              >
                Not your mall or plaza? Create a new one
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3B: CLUSTER NOT FOUND ================= */}
        {step === 'not_found' && (
          <div className="flex flex-col gap-5 pt-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Icon name="location_off" className="text-[32px]" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h2 className="text-xl font-bold text-text-primary">
                No Existing Cluster Found
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                We couldn't detect an active merchant cluster at your registered address (
                <span className="font-semibold text-text-primary">{live ? registeredAddress : 'Area 11, Garki'}</span>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle text-left space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Icon name="add_circle" className="text-[18px]" />
                <span>Initialize a New Cluster</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                If your business is located inside a shopping plaza, market, or commercial axis, you
                can register the cluster now. Neighboring merchants will be able to discover and
                join your shared QR pass.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep('create')}
                className="w-full h-12 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-on-primary font-semibold text-sm shadow-md"
              >
                <Icon name="add" className="text-[18px]" />
                <span>Create a New Cluster</span>
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="w-full h-11 bg-surface-subtle hover:bg-surface-container rounded-xl flex items-center justify-center text-text-secondary font-medium text-sm transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CREATE CLUSTER ================= */}
        {step === 'create' && (
          <form onSubmit={handleCreateCluster} className="flex flex-col gap-4 pt-2">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Register New Cluster</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Establish the shared community hub for your commercial building or district.
              </p>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                <Icon name="error" className="text-[16px] shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Cluster / Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Ceddi Plaza Commercial Hub"
                  className="w-full px-3 py-2.5 text-sm bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Cluster Type *
                  </label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as ClusterType)}
                    className="w-full px-3 py-2.5 text-sm bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                  >
                    <option value="mall">Shopping Mall</option>
                    <option value="plaza">Commercial Plaza</option>
                    <option value="market">Open Market / Bazaar</option>
                    <option value="commercial-axis">Commercial Strip / Axis</option>
                    <option value="strip">Retail Arcade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Radius Coverage
                  </label>
                  <select
                    value={createRadius}
                    onChange={(e) => setCreateRadius(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                  >
                    <option value={300}>300 meters (Single Mall)</option>
                    <option value={500}>500 meters (Plaza + Wing)</option>
                    <option value={1000}>1 kilometer (Commercial Strip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Physical Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  placeholder="Plot number and street"
                  className="w-full px-3 py-2.5 text-sm bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">City</label>
                  <input
                    type="text"
                    value={createCity}
                    onChange={(e) => setCreateCity(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">State</label>
                  <input
                    type="text"
                    value={createState}
                    onChange={(e) => setCreateState(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Your Unit / Suite Number
                </label>
                <input
                  type="text"
                  value={unitOrSuite}
                  onChange={(e) => setUnitOrSuite(e.target.value)}
                  placeholder="e.g. Suite 204 or Ground Floor Shop 12"
                  className="w-full px-3 py-2.5 text-sm bg-surface-subtle border border-border-subtle rounded-xl focus:border-primary outline-none"
                />
              </div>

              {/* Guidelines Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedGuidelines}
                  onChange={(e) => setAgreedGuidelines(e.target.checked)}
                  className="mt-0.5 rounded border-border-subtle text-primary focus:ring-0"
                />
                <span className="text-xs text-text-secondary leading-snug">
                  I confirm that Urban Grill &amp; Bistro is physically located at this address and
                  agree to the VEMTAP Cluster Fair Rotator Guidelines.
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                className="w-full h-12 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-on-primary font-semibold text-sm shadow-md"
              >
                <span>Continue to Feature Selection</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setStep('not_found')}
                className="w-full h-10 bg-transparent text-text-secondary text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 4.5: CHOOSE WHAT TO FEATURE ================= */}
        {step === 'choose_feature' && (
          <div className="flex flex-col gap-5 pt-2">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary bg-surface-tint-blue px-2.5 py-0.5 rounded-full mb-1">
                <span>Cluster Showcase Setup</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Choose What to Feature in the Cluster
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Select whether you want to showcase promotional deals, catalog products, or your
                storefront profile in the {live ? 'cluster' : 'Amaka Mall'} rotator.
              </p>
            </div>

            {/* 3 Showcase Options */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedShowcaseType('deal')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  selectedShowcaseType === 'deal'
                    ? 'border-primary bg-surface-tint-blue/30 text-primary shadow-xs ring-1 ring-primary'
                    : 'border-border-subtle bg-surface-subtle text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Icon name="local_offer" className="text-[16px]" />
                  <span>Deals</span>
                </div>
                <span className="text-[10px] text-text-tertiary leading-tight">
                  Discounts &amp; Vouchers
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedShowcaseType('product')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  selectedShowcaseType === 'product'
                    ? 'border-primary bg-surface-tint-blue/30 text-primary shadow-xs ring-1 ring-primary'
                    : 'border-border-subtle bg-surface-subtle text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Icon name="inventory_2" className="text-[16px]" />
                  <span>Products</span>
                </div>
                <span className="text-[10px] text-text-tertiary leading-tight">
                  Dishes &amp; Catalog
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedShowcaseType('profile')}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  selectedShowcaseType === 'profile'
                    ? 'border-primary bg-surface-tint-blue/30 text-primary shadow-xs ring-1 ring-primary'
                    : 'border-border-subtle bg-surface-subtle text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Icon name="badge" className="text-[16px]" />
                  <span>Profile</span>
                </div>
                <span className="text-[10px] text-text-tertiary leading-tight">
                  Brand Spotlight
                </span>
              </button>
            </div>

            {/* List of items with Show / Hide Toggles */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Select items to activate:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedShowcaseType === 'deal' && onCreateDeal) onCreateDeal();
                    else if ((selectedShowcaseType === 'product' || selectedShowcaseType === 'service') && onCreateProduct) onCreateProduct();
                    else if (selectedShowcaseType === 'profile' && onCreateLocation) onCreateLocation();
                  }}
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <Icon name="add" className="text-[14px]" />
                  <span>
                    {selectedShowcaseType === 'deal'
                      ? 'Create Deal'
                      : selectedShowcaseType === 'product'
                      ? 'Create Product'
                      : 'Create Location'}
                  </span>
                </button>
              </div>

              {myShowcaseItems.length === 0 && (
                <div className="text-center py-6 text-xs text-text-secondary space-y-2 bg-surface-subtle border border-border-subtle rounded-2xl p-4">
                  <p>No {selectedShowcaseType === 'deal' ? 'deals' : selectedShowcaseType === 'product' ? 'products or services' : 'storefronts'} found in your catalog yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedShowcaseType === 'deal' && onCreateDeal) onCreateDeal();
                      else if ((selectedShowcaseType === 'product' || selectedShowcaseType === 'service') && onCreateProduct) onCreateProduct();
                      else if (selectedShowcaseType === 'profile' && onCreateLocation) onCreateLocation();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-primary-container text-white text-xs font-semibold inline-flex items-center gap-1 shadow-xs"
                  >
                    <Icon name="add" className="text-[14px]" />
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
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    item.showInCluster
                      ? 'border-primary/40 bg-surface-tint-blue/10 shadow-xs'
                      : 'border-border-subtle bg-surface-subtle opacity-75'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-text-primary truncate">{item.title}</h5>
                    <p className="text-[11px] text-text-secondary">
                      {item.discount || `₦${item.price.toLocaleString()}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      item.showInCluster
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    <Icon
                      name={item.showInCluster ? 'check_circle' : 'radio_button_unchecked'}
                      className="text-[15px]"
                    />
                    <span>{item.showInCluster ? 'Active' : 'Muted'}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmShowcase}
                className="w-full h-12 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-on-primary font-semibold text-sm shadow-md"
              >
                <span>Save &amp; Generate Cluster Pass</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: SUCCESS ================= */}
        {step === 'success' && activeCluster && (
          <div className="flex flex-col items-center text-center gap-5 pt-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
              <Icon name="celebration" className="text-[32px]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-text-primary">
                Welcome to {activeCluster.name}!
              </h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Your business is now an active member. Your selected items will be featured in the
                cluster rotator pool.
              </p>
            </div>

            {/* QR Pass Preview */}
            <ClusterQrCode
              url={activeCluster.qrCode.url}
              clusterName={activeCluster.name}
              displayCode={activeCluster.qrCode.displayCode}
              size={180}
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={onComplete}
                className="w-full h-12 bg-primary-container active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2 text-on-primary font-semibold text-sm shadow-md"
              >
                <span>Go to Cluster System Dashboard</span>
                <Icon name="hub" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="w-full h-11 bg-surface-subtle hover:bg-surface-container rounded-xl flex items-center justify-center text-text-secondary font-medium text-sm transition-colors"
              >
                Continue to Business Overview
              </button>
            </div>
          </div>
        )}
      </main>
      {notice && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-[430px] z-50 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2.5 text-label-md font-medium shadow-lg">
          {notice}
        </div>
      )}
    </AppScreen>
  );
}
