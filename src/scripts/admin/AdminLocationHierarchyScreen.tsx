import { useMemo, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import type { AdminApiCluster } from '../../services/adminService';
import { formatCount } from './adminLive';
import { useAdminClusters } from './useAdminData';

interface HierarchyNode {
  id: string;
  name: string;
  code?: string;
  countLabel: string;
  status: 'LIVE' | 'STAGED' | 'ROADMAP' | 'ACTIVE';
  merchants?: number;
  radius?: string;
}

const UNSPECIFIED = 'Not set';

/** Live tree: country → state → city → area → cluster, built from the clusters' own location fields. */
function buildTree(list: AdminApiCluster[]) {
  const key = (...parts: Array<string | null | undefined>) => parts.map((p) => p || UNSPECIFIED).join('|');
  const countries = new Map<string, HierarchyNode>();
  const states: Record<string, HierarchyNode[]> = {};
  const lgas: Record<string, HierarchyNode[]> = {};
  const wards: Record<string, HierarchyNode[]> = {};
  const clusters: Record<string, HierarchyNode[]> = {};
  const count = (map: Record<string, HierarchyNode[]>, parent: string, id: string, name: string) => {
    map[parent] ??= [];
    let node = map[parent].find((n) => n.id === id);
    if (!node) {
      node = { id, name, countLabel: '', status: 'LIVE', merchants: 0 };
      map[parent].push(node);
    }
    node.merchants = (node.merchants ?? 0) + 1;
    return node;
  };
  for (const c of list) {
    const countryId = key(c.country);
    const stateId = key(c.country, c.state);
    const cityId = key(c.country, c.state, c.city);
    const areaId = key(c.country, c.state, c.city, c.area);
    const country = countries.get(countryId) ?? { id: countryId, name: c.country || UNSPECIFIED, countLabel: '', status: 'LIVE' as const, merchants: 0 };
    country.merchants = (country.merchants ?? 0) + 1;
    countries.set(countryId, country);
    count(states, countryId, stateId, c.state || UNSPECIFIED);
    count(lgas, stateId, cityId, c.city || UNSPECIFIED);
    count(wards, cityId, areaId, c.area || UNSPECIFIED);
    clusters[areaId] ??= [];
    clusters[areaId].push({
      id: c.id,
      name: c.name,
      code: c.uniqueCode ?? c.id.slice(0, 8).toUpperCase(),
      countLabel: `${c.branchCount} branch${c.branchCount === 1 ? '' : 'es'}`,
      radius: c.radiusMeters ? `${c.radiusMeters}m` : '—',
      status: c.isActive ? 'ACTIVE' : 'STAGED',
    });
  }
  const label = (n: HierarchyNode) => ({ ...n, countLabel: `${n.merchants} cluster${n.merchants === 1 ? '' : 's'}` });
  const relabel = (map: Record<string, HierarchyNode[]>) =>
    Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.map(label)]));
  return {
    countries: Array.from(countries.values()).map(label),
    states: relabel(states),
    lgas: relabel(lgas),
    wards: relabel(wards),
    clusters,
  };
}

/** The selected id if it is in the list, else the first one. */
const pick = (nodes: HierarchyNode[], id: string) => (nodes.some((n) => n.id === id) ? id : nodes[0]?.id ?? '');

export function AdminLocationHierarchyScreen() {
  const live = hasApiConfig();
  const clustersQuery = useAdminClusters({ page: 1, limit: 200 });
  const liveList = useMemo(() => clustersQuery.data?.data ?? [], [clustersQuery.data]);
  const liveTree = useMemo(() => buildTree(liveList), [liveList]);

  // Navigation cascade state
  const [rawCountry, setSelectedCountry] = useState<string>('ng');
  const [rawState, setSelectedState] = useState<string>('lagos');
  const [rawLga, setSelectedLga] = useState<string>('ikeja');
  const [rawWard, setSelectedWard] = useState<string>('computer-village');
  const [rawCluster, setSelectedCluster] = useState<string>('cl-1');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Modal state
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitType, setNewUnitType] = useState<'State' | 'LGA' | 'Ward' | 'Cluster'>('Cluster');
  const [newUnitName, setNewUnitName] = useState('');

  const mockCountries: HierarchyNode[] = [
    { id: 'ng', name: 'Nigeria', countLabel: '36 States • 84 Clusters', status: 'LIVE' },
    { id: 'gh', name: 'Ghana', countLabel: '16 Regions • Sandbox', status: 'STAGED' },
    { id: 'ke', name: 'Kenya', countLabel: '47 Counties • Roadmap', status: 'ROADMAP' },
  ];

  const mockStates: Record<string, HierarchyNode[]> = {
    ng: [
      { id: 'lagos', name: 'Lagos State', countLabel: '20 LGAs • 42 Clusters', status: 'LIVE' },
      { id: 'fct', name: 'Abuja FCT', countLabel: '6 Area Councils • 18 Clusters', status: 'LIVE' },
      { id: 'rivers', name: 'Rivers State', countLabel: '23 LGAs • 12 Clusters', status: 'LIVE' },
      { id: 'kano', name: 'Kano State', countLabel: '44 LGAs • 12 Clusters', status: 'LIVE' },
    ],
    gh: [
      { id: 'accra', name: 'Greater Accra', countLabel: '16 Districts', status: 'STAGED' },
      { id: 'ashanti', name: 'Ashanti', countLabel: '30 Districts', status: 'STAGED' },
    ],
    ke: [
      { id: 'nairobi', name: 'Nairobi City', countLabel: '17 Sub-Counties', status: 'ROADMAP' },
      { id: 'mombasa', name: 'Mombasa County', countLabel: '6 Sub-Counties', status: 'ROADMAP' },
    ],
  };

  const mockLgas: Record<string, HierarchyNode[]> = {
    lagos: [
      { id: 'ikeja', name: 'Ikeja LGA', countLabel: 'Capital Dist. • 8 Clusters', status: 'LIVE' },
      { id: 'eti-osa', name: 'Eti-Osa LGA', countLabel: 'Coastal • 12 Clusters', status: 'LIVE' },
      { id: 'mainland', name: 'Lagos Mainland', countLabel: 'Yaba / Surulere • 6 Clusters', status: 'LIVE' },
      { id: 'alimosho', name: 'Alimosho LGA', countLabel: 'Dense Res. • 4 Clusters', status: 'LIVE' },
    ],
    fct: [
      { id: 'amc', name: 'Abuja Municipal', countLabel: 'Wuse / Garki • 12 Clusters', status: 'LIVE' },
      { id: 'gwa', name: 'Gwagwalada', countLabel: 'Outer • 3 Clusters', status: 'LIVE' },
    ],
  };

  const mockWards: Record<string, HierarchyNode[]> = {
    ikeja: [
      { id: 'computer-village', name: 'Computer Village Zone', countLabel: 'Tech Ward 04 • 3 Clusters', status: 'LIVE' },
      { id: 'allen', name: 'Allen Avenue Strip', countLabel: 'Retail Ward 02 • 2 Clusters', status: 'LIVE' },
      { id: 'gra', name: 'Ikeja GRA Central', countLabel: 'Hospitality • 1 Cluster', status: 'LIVE' },
      { id: 'oregun', name: 'Oregun Industrial', countLabel: 'Logistics • 2 Clusters', status: 'LIVE' },
    ],
    'eti-osa': [
      { id: 'admiralty', name: 'Admiralty Corridor', countLabel: 'Waterfront • 4 Clusters', status: 'LIVE' },
      { id: 'victoria', name: 'Victoria Island Core', countLabel: 'Financial • 6 Clusters', status: 'LIVE' },
    ],
  };

  const mockClusters: Record<string, HierarchyNode[]> = {
    'computer-village': [
      { id: 'cl-1', name: 'Ikeja Computer Village Hub', code: 'CL-LOS-IKV-01', countLabel: '284 Merchants', radius: '350m', status: 'ACTIVE' },
      { id: 'cl-2', name: 'Medical Road Corridor', code: 'CL-LOS-IKV-02', countLabel: '98 Merchants', radius: '220m', status: 'ACTIVE' },
      { id: 'cl-3', name: 'Simbiat Abiola Periphery', code: 'CL-LOS-IKV-03', countLabel: '64 Merchants', radius: '200m', status: 'ACTIVE' },
    ],
    allen: [
      { id: 'cl-4', name: 'Allen Commercial Walk', code: 'CL-LOS-ALN-01', countLabel: '142 Merchants', radius: '450m', status: 'ACTIVE' },
    ],
  };

  const countries = live ? liveTree.countries : mockCountries;
  const states = live ? liveTree.states : mockStates;
  const lgas = live ? liveTree.lgas : mockLgas;
  const wards = live ? liveTree.wards : mockWards;
  const clusters = live ? liveTree.clusters : mockClusters;

  // Live: fall back to the first node when a selection is not in the tree.
  const selectedCountry = live ? pick(countries, rawCountry) : rawCountry;
  const currentStates = states[selectedCountry] || [];
  const selectedState = live ? pick(currentStates, rawState) : rawState;
  const currentLgas = lgas[selectedState] || [];
  const selectedLga = live ? pick(currentLgas, rawLga) : rawLga;
  const currentWards = wards[selectedLga] || [];
  const selectedWard = live ? pick(currentWards, rawWard) : rawWard;
  const currentClusters = clusters[selectedWard] || [];
  const selectedCluster = live ? pick(currentClusters, rawCluster) : rawCluster;
  const selectedLeaf = liveList.find((c) => c.id === selectedCluster);
  const nameOf = (nodes: HierarchyNode[], id: string) => nodes.find((n) => n.id === id)?.name ?? '';
  const activePath = [
    nameOf(countries, selectedCountry),
    nameOf(currentStates, selectedState),
    nameOf(currentLgas, selectedLga),
    nameOf(currentWards, selectedWard),
    selectedLeaf ? `${selectedLeaf.name} (${selectedLeaf.uniqueCode ?? selectedLeaf.id.slice(0, 8)})` : '',
  ]
    .filter(Boolean)
    .join(' / ');

  const exportLeafGeoJson = () => {
    if (!selectedLeaf) return;
    const geo = {
      type: 'Feature',
      properties: { id: selectedLeaf.id, name: selectedLeaf.name, code: selectedLeaf.uniqueCode, radiusMeters: selectedLeaf.radiusMeters },
      geometry: { type: 'Point', coordinates: [selectedLeaf.longitude, selectedLeaf.latitude] },
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(geo, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-cluster-${selectedLeaf.uniqueCode ?? selectedLeaf.id}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyUri = () => {
    navigator.clipboard?.writeText(
      live
        ? `vemtap://geo/cluster/${selectedCluster}`
        : `vemtap://geo/hierarchy/${selectedCountry}/${selectedState}/${selectedLga}/${selectedWard}/${selectedCluster}`
    );
    setBannerNotice('Spatial URI copied to clipboard.');
    setTimeout(() => setBannerNotice(null), 3000);
  };

  const handleAuditSpatialDrift = () => {
    setBannerNotice('Running geospatial polygon vertex audit across 774 LGA boundaries... No drift detected.');
    setTimeout(() => setBannerNotice(null), 4000);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {bannerNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">verified</span>
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-blue-500 hover:text-blue-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header & Operational Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Sovereign Topography
            </span>
            <span className="text-xs text-slate-400">• Multi-Tier Spatial Model</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Location & Jurisdictional Hierarchy
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse sovereign boundaries, administrative subdivisions, local government areas, and micro-territories down to individual leaf clusters.
          </p>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
{!live && (
<>
          <button
            onClick={handleAuditSpatialDrift}
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">travel_explore</span>
            <span>Audit Spatial Drift</span>
          </button>
          <button
            onClick={() => setShowAddUnitModal(true)}
            type="button"
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Add Jurisdictional Unit</span>
          </button>
</>
)}
        </div>
      </div>

      {/* Top Operational KPI Cards (Bento Metric Strip) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Sovereign Territories</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {live ? countries.length : 3} <span className="text-sm font-normal text-slate-500">{live ? 'Countries' : 'Nations'}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">flag</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            {live ? (
              <span>with at least one cluster</span>
            ) : (
              <>
                <span className="text-emerald-600 font-semibold">1 Live</span>
                <span>• 1 Staged • 1 Roadmap</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">States & Regions</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {live ? Object.values(states).reduce((sum, list) => sum + list.length, 0) : 37} <span className="text-sm font-normal text-slate-500">Subdivisions</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">map</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            {live ? (
              <span>states with clusters</span>
            ) : (
              <>
                <span className="text-slate-700 font-semibold">36 States + FCT</span>
                <span>mapped in GIS database</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{live ? 'Cities' : 'Municipal LGAs'}</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {live ? Object.values(lgas).reduce((sum, list) => sum + list.length, 0) : 774} <span className="text-sm font-normal text-slate-500">{live ? 'Cities' : 'Districts'}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">location_city</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            {live ? (
              <span>cities with clusters</span>
            ) : (
              <>
                <span className="text-emerald-600 font-semibold">148 commercial</span>
                <span>high-frequency zones</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Registered Leaf Clusters</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {live ? formatCount(liveList.filter((c) => c.isActive).length) : 48}{' '}
                <span className="text-sm font-normal text-slate-500">Active</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            {live ? (
              <span>{formatCount(liveList.length)} clusters in total</span>
            ) : (
              <>
                <span className="text-amber-700 font-semibold">100% Boundary</span>
                <span>geofence verified</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Miller Columns / Multi-Tier Tree Explorer (macOS Finder Style) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Header of the Browser */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Administrative Hierarchy Browser</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Miller Column Cascade Navigation</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Click column item to cascade</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>RTK geofence locked</span>
            </div>
          </div>
        </div>

        {/* Miller Columns Container (5 Tiers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 min-h-[460px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
          {/* Tier 1: Country */}
          <div className="flex flex-col p-2 bg-slate-50/40">
            <div className="px-2.5 py-1.5 mb-2 flex items-center justify-between bg-slate-100 rounded text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <span>01. Country</span>
              <span className="text-slate-400 font-normal">3 Sovereign</span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
              {countries.map((c) => {
                const isSelected = c.id === selectedCountry;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCountry(c.id);
                      if (states[c.id]?.[0]) {
                        setSelectedState(states[c.id][0].id);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none">
                        {live ? '🌍' : c.id === 'ng' ? '🇳🇬' : c.id === 'gh' ? '🇬🇭' : '🇰🇪'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{c.name}</span>
                        <span className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {c.countLabel}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 2: State / Region */}
          <div className="flex flex-col p-2 bg-slate-50/30">
            <div className="px-2.5 py-1.5 mb-2 flex items-center justify-between bg-slate-100 rounded text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <span>02. State / Region</span>
              <span className="text-slate-400 font-normal">{currentStates.length} Nodes</span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
              {currentStates.map((s) => {
                const isSelected = s.id === selectedState;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedState(s.id);
                      if (lgas[s.id]?.[0]) {
                        setSelectedLga(lgas[s.id][0].id);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{s.name}</span>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {s.countLabel}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 3: LGA / District */}
          <div className="flex flex-col p-2 bg-slate-50/20">
            <div className="px-2.5 py-1.5 mb-2 flex items-center justify-between bg-slate-100 rounded text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <span>03. Municipal LGA</span>
              <span className="text-slate-400 font-normal">{currentLgas.length} Municipal</span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
              {currentLgas.map((l) => {
                const isSelected = l.id === selectedLga;
                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      setSelectedLga(l.id);
                      if (wards[l.id]?.[0]) {
                        setSelectedWard(wards[l.id][0].id);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{l.name}</span>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {l.countLabel}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 4: Area / Ward */}
          <div className="flex flex-col p-2 bg-slate-50/10">
            <div className="px-2.5 py-1.5 mb-2 flex items-center justify-between bg-slate-100 rounded text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <span>04. Ward / Zone</span>
              <span className="text-slate-400 font-normal">{currentWards.length} Zones</span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
              {currentWards.map((w) => {
                const isSelected = w.id === selectedWard;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedWard(w.id);
                      if (clusters[w.id]?.[0]) {
                        setSelectedCluster(clusters[w.id][0].id);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{w.name}</span>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {w.countLabel}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 5: Spatial Micro-Cluster (Leaf) */}
          <div className="flex flex-col p-2 bg-blue-50/20">
            <div className="px-2.5 py-1.5 mb-2 flex items-center justify-between bg-blue-100/60 rounded text-[11px] font-bold uppercase tracking-wider text-blue-900">
              <span>05. Spatial Clusters</span>
              <span className="text-blue-600 font-semibold">{currentClusters.length} Defined</span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
              {currentClusters.map((cl) => {
                const isSelected = cl.id === selectedCluster;
                return (
                  <div
                    key={cl.id}
                    onClick={() => setSelectedCluster(cl.id)}
                    className={`flex flex-col p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                        : 'hover:bg-blue-50 text-slate-800 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{cl.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {cl.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className={isSelected ? 'text-blue-100' : 'text-slate-500'}>
                        {cl.countLabel}
                      </span>
                      <span className={`font-mono text-[10px] ${isSelected ? 'text-blue-200' : 'text-blue-600'}`}>
                        R: {cl.radius}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Path & URI Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 flex-wrap">
            <span className="font-bold text-slate-900">Active Path:</span>
            <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {live
                ? activePath || (clustersQuery.isLoading ? 'Loading clusters…' : 'No clusters yet')
                : 'Nigeria / Lagos State / Ikeja LGA / Computer Village Zone / Ikeja Computer Village Hub (CL-LOS-IKV-01)'}
            </span>
          </div>
          <button
            onClick={handleCopyUri}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Copy Spatial URI Ref</span>
          </button>
        </div>
      </div>

      {/* Spatial Boundary & Geofence Matrix Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col lg:flex-row items-start justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">radar</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Spatial Boundary & Geofence Matrix</h3>
              <p className="text-xs text-slate-500">
                {live ? (selectedLeaf ? selectedLeaf.name : 'Select a cluster') : 'Verified polygon geometry & dynamic merchant ping density'}
              </p>
            </div>
          </div>

          {live && selectedLeaf && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Centre</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedLeaf.latitude?.toFixed(4) ?? '—'}, {selectedLeaf.longitude?.toFixed(4) ?? '—'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Radius</span>
                <span className="font-mono font-bold text-slate-800">{selectedLeaf.radiusMeters ? `${selectedLeaf.radiusMeters}m` : '—'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">QR Scans</span>
                <span className="font-mono font-bold text-blue-600">{formatCount(selectedLeaf.scanCount)}</span>
              </div>
            </div>
          )}
          {!live && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">GPS Accuracy</span>
              <span className="font-mono font-bold text-emerald-600">RTK DGPS (±2cm)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Polygon Vertices</span>
              <span className="font-mono font-bold text-slate-800">18 Geopoints</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Leaf Ping Density</span>
              <span className="font-mono font-bold text-blue-600">4,120 pings / min</span>
            </div>
          </div>
          )}
        </div>

        {/* Action Controls for Selected Node */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
{!live && (
          <button
            onClick={() => {
              setBannerNotice('Split leaf cluster into sub-wards.');
              setTimeout(() => setBannerNotice(null), 3000);
            }}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">call_split</span>
            <span>Split Leaf</span>
          </button>
)}
          <button
            disabled={live && !selectedLeaf}
            onClick={() => {
              if (live) return exportLeafGeoJson();
              setBannerNotice('Exported boundary shapefile.');
              setTimeout(() => setBannerNotice(null), 3000);
            }}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export GeoJSON</span>
          </button>
{!live && (
          <button
            onClick={() => {
              setBannerNotice('Geofence polygon calibrated against terrestrial satellite baseline.');
              setTimeout(() => setBannerNotice(null), 3500);
            }}
            className="flex-1 lg:flex-none h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">sync_saved_locally</span>
            <span>Calibrate Geofence</span>
          </button>
)}
        </div>
      </div>

      {/* Modal: Add Jurisdictional Unit */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Add Jurisdictional Unit</h3>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newUnitName.trim()) return;
                setBannerNotice(`Created new ${newUnitType}: "${newUnitName}" in hierarchy tree.`);
                setShowAddUnitModal(false);
                setNewUnitName('');
                setTimeout(() => setBannerNotice(null), 3500);
              }}
              className="p-4 flex flex-col gap-3 text-xs"
            >
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Unit Type</label>
                <select
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value as any)}
                  className="h-9 px-3 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="State">State / Region (Tier 2)</option>
                  <option value="LGA">Local Government Area (Tier 3)</option>
                  <option value="Ward">Ward / Commercial Zone (Tier 4)</option>
                  <option value="Cluster">Micro-Cluster Leaf (Tier 5)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Unit Name *</label>
                <input
                  type="text"
                  required
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="e.g. Surulere Central Hub"
                  className="h-9 px-3 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
                The new node will attach under the current selected parent branch:{' '}
                <span className="font-semibold">Ikeja LGA / Computer Village Zone</span>.
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

