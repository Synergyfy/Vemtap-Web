import { useState, type FormEvent } from 'react';

export interface ClusterRecord {
  id: string;
  code: string;
  name: string;
  zone: string;
  state: string;
  lga: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  businesses: number;
  deals: number;
  radius: number; // in meters
  lat: number;
  lng: number;
  taps24h: number;
  status: 'ACTIVE' | 'EXPANDING' | 'SUB-OPTIMAL' | 'PENDING';
  leadOfficer: string;
  zonalOffice: string;
  registeredDate: string;
  posDensity: string;
}

const INITIAL_CLUSTERS: ClusterRecord[] = [
  {
    id: 'c1',
    code: 'CL-LOS-IKV-01',
    name: 'Ikeja Computer Village Hub',
    zone: 'Otigba Tech Zone',
    state: 'Lagos State',
    lga: 'Ikeja LGA',
    tier: 'Tier 1',
    businesses: 284,
    deals: 38,
    radius: 1800,
    lat: 6.5944,
    lng: 3.3421,
    taps24h: 184500,
    status: 'ACTIVE',
    leadOfficer: 'Babatunde Adeleke',
    zonalOffice: 'Ikeja Central Office',
    registeredDate: 'Jan 14, 2024',
    posDensity: '98.4%',
  },
  {
    id: 'c2',
    code: 'CL-LOS-LEK-02',
    name: 'Lekki Phase 1 Waterfront & Admiralty',
    zone: 'Admiralty Commercial Strip',
    state: 'Lagos State',
    lga: 'Eti-Osa LGA',
    tier: 'Tier 1',
    businesses: 192,
    deals: 24,
    radius: 2400,
    lat: 6.4474,
    lng: 3.4723,
    taps24h: 142100,
    status: 'ACTIVE',
    leadOfficer: 'Chidinma Okoye',
    zonalOffice: 'Lekki Island Directorate',
    registeredDate: 'Feb 02, 2024',
    posDensity: '95.1%',
  },
  {
    id: 'c3',
    code: 'CL-LOS-VIC-03',
    name: 'Victoria Island Central Core',
    zone: 'Adeola Odeku Financial Strip',
    state: 'Lagos State',
    lga: 'Eti-Osa LGA',
    tier: 'Tier 1',
    businesses: 412,
    deals: 56,
    radius: 3100,
    lat: 6.4281,
    lng: 3.4219,
    taps24h: 290400,
    status: 'ACTIVE',
    leadOfficer: 'Emeka Nwosu',
    zonalOffice: 'Victoria Island Regional HQ',
    registeredDate: 'Dec 18, 2023',
    posDensity: '99.0%',
  },
  {
    id: 'c4',
    code: 'CL-ABJ-WUS-01',
    name: 'Wuse 2 High Street & Aminu Kano',
    zone: 'Wuse Commercial Crescent',
    state: 'Abuja FCT',
    lga: 'Abuja Municipal',
    tier: 'Tier 1',
    businesses: 148,
    deals: 18,
    radius: 2000,
    lat: 9.0765,
    lng: 7.4764,
    taps24h: 98200,
    status: 'ACTIVE',
    leadOfficer: 'Hadiza Bello',
    zonalOffice: 'FCT Zonal Hub',
    registeredDate: 'Mar 10, 2024',
    posDensity: '92.6%',
  },
  {
    id: 'c5',
    code: 'CL-LOS-YAB-04',
    name: 'Yaba Tech & University Corridor',
    zone: 'Herbert Macaulay Hub',
    state: 'Lagos State',
    lga: 'Lagos Mainland',
    tier: 'Tier 2',
    businesses: 126,
    deals: 15,
    radius: 1500,
    lat: 6.5173,
    lng: 3.3742,
    taps24h: 82400,
    status: 'EXPANDING',
    leadOfficer: 'Olumide Bakare',
    zonalOffice: 'Mainland Regional Unit',
    registeredDate: 'Apr 05, 2024',
    posDensity: '88.3%',
  },
  {
    id: 'c6',
    code: 'CL-LOS-ALB-05',
    name: 'Alaba International Market Zone',
    zone: 'Electronics Super-Sector',
    state: 'Lagos State',
    lga: 'Ojo LGA',
    tier: 'Tier 2',
    businesses: 510,
    deals: 42,
    radius: 4200,
    lat: 6.4619,
    lng: 3.1931,
    taps24h: 320900,
    status: 'EXPANDING',
    leadOfficer: 'Kelechi Eze',
    zonalOffice: 'West Coast Liaison',
    registeredDate: 'May 12, 2024',
    posDensity: '84.0%',
  },
];

interface AdminClusterManagementScreenProps {
  onNavigate?: (path: string) => void;
}

export function AdminClusterManagementScreen({ onNavigate }: AdminClusterManagementScreenProps) {
  const [clusters, setClusters] = useState<ClusterRecord[]>(INITIAL_CLUSTERS);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('c1');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TIER1' | 'TIER2' | 'EXPANDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dossierTab, setDossierTab] = useState<'details' | 'businesses' | 'boundaries' | 'qr'>('details');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClusterForm, setNewClusterForm] = useState({
    name: '',
    state: 'Lagos State',
    lga: 'Ikeja LGA',
    zone: 'Commercial Zone',
    radius: 1800,
    lat: 6.5944,
    lng: 3.3421,
    leadOfficer: 'Admin Supervisor',
  });

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  const filteredClusters = clusters.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'TIER1') return c.tier === 'Tier 1';
    if (activeTab === 'TIER2') return c.tier === 'Tier 2';
    if (activeTab === 'EXPANDING') return c.status === 'EXPANDING';
    return true;
  });

  const handleRegisterCluster = (e: FormEvent) => {
    e.preventDefault();
    if (!newClusterForm.name.trim()) return;

    const newC: ClusterRecord = {
      id: `c_${Date.now()}`,
      code: `CL-LOS-${newClusterForm.name.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      name: newClusterForm.name.trim(),
      zone: newClusterForm.zone.trim(),
      state: newClusterForm.state,
      lga: newClusterForm.lga,
      tier: 'Tier 2',
      businesses: 0,
      deals: 0,
      radius: Number(newClusterForm.radius) || 1500,
      lat: Number(newClusterForm.lat) || 6.5,
      lng: Number(newClusterForm.lng) || 3.35,
      taps24h: 0,
      status: 'EXPANDING',
      leadOfficer: newClusterForm.leadOfficer || 'Admin Supervisor',
      zonalOffice: `${newClusterForm.lga} Zonal Hub`,
      registeredDate: 'Today',
      posDensity: '100%',
    };

    setClusters((prev) => [newC, ...prev]);
    setSelectedClusterId(newC.id);
    setShowAddModal(false);
    setBannerNotice(`Cluster "${newC.name}" registered and initialized in GIS buffer engine.`);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const handleRecomputeBuffers = () => {
    setBannerNotice('Recomputed geofence perimeter polygon buffers for 48 operational clusters.');
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleExportGeoJSON = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: clusters.map((c) => ({
        type: 'Feature',
        properties: {
          id: c.id,
          code: c.code,
          name: c.name,
          radius: c.radius,
          businesses: c.businesses,
        },
        geometry: {
          type: 'Point',
          coordinates: [c.lng, c.lat],
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vemtap-clusters-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    setBannerNotice('Exported cluster boundaries as GeoJSON spatial coordinates.');
    setTimeout(() => setBannerNotice(null), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {bannerNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-center justify-between text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">verified</span>
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-blue-500 hover:text-blue-800 text-sm font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Operational Banner & Primary Action Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Jurisdiction / Federal Republic of Nigeria / Lagos State
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cluster Directory & Membership Governance
          </h1>
          <p className="text-sm text-slate-500">
            Provision spatial retail hubs, supervise merchant densities, and synchronize dynamic NFC/QR beacon radii.
          </p>
        </div>

        {/* Global Actions Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportGeoJSON}
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Territory GeoJSON</span>
          </button>
          <button
            onClick={handleRecomputeBuffers}
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">radar</span>
            <span>Recompute Geofence Buffers</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
            <span>Register New Cluster</span>
          </button>
        </div>
      </section>

      {/* Summary KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Active Clusters</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">48</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +3 this month
            </span>
            <span>• 100% GIS verified</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Geofenced Footprint</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">142.8 <span className="text-sm font-normal text-slate-500">km²</span></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">polyline</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-700 font-semibold">1,820m</span>
            <span>mean perimeter buffer</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Aggregated Merchants</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">3,420</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">store</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 94.2%
            </span>
            <span>Active POS Terminal density</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">24h Aggregated Footfall</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">1.28M <span className="text-sm font-normal text-slate-500">Taps</span></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">tap_and_play</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-amber-700 font-semibold">Peak 84k taps/hr</span>
            <span>across 48 zones</span>
          </div>
        </div>
      </div>

      {/* Master / Detail Workspace Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Master Table (7 cols) */}
        <div className="xl:col-span-7 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Search & Filters Toolstrip */}
          <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 min-w-[220px]">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cluster name, code, LGA, or zone..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                }`}
              >
                All (48)
              </button>
              <button
                onClick={() => setActiveTab('TIER1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'TIER1' ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Tier 1 (24)
              </button>
              <button
                onClick={() => setActiveTab('TIER2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'TIER2' ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Tier 2 (16)
              </button>
              <button
                onClick={() => setActiveTab('EXPANDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'EXPANDING' ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Expanding (8)
              </button>
            </div>
          </div>

          {/* High-Density Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3.5">Cluster Identifier</th>
                  <th className="py-2.5 px-3">City & State</th>
                  <th className="py-2.5 px-3 text-right">Businesses</th>
                  <th className="py-2.5 px-3 text-right">Deals</th>
                  <th className="py-2.5 px-3">Geofence</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClusters.map((cluster) => {
                  const isSelected = cluster.id === selectedClusterId;
                  return (
                    <tr
                      key={cluster.id}
                      onClick={() => setSelectedClusterId(cluster.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 hover:bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          {isSelected && <div className="w-1.5 h-7 bg-blue-600 rounded-full -ml-2" />}
                          <div>
                            <div className="font-bold text-slate-900">{cluster.name}</div>
                            <div className="font-mono text-[11px] text-slate-500">{cluster.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{cluster.lga}</div>
                        <div className="text-[11px] text-slate-500">{cluster.state}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-semibold text-slate-800">{cluster.businesses}</span>
                        <div className="text-[10px] text-emerald-600 font-medium">{cluster.posDensity} POS</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-semibold text-slate-800">{cluster.deals}</span>
                        <div className="text-[10px] text-slate-500">Active Live</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-700 font-medium">{(cluster.radius / 1000).toFixed(1)} km</span>
                        <div className="text-[10px] text-slate-400">Circular Buffer</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cluster.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cluster.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination / Count Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredClusters.length} of {clusters.length} clusters registered</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]">GIS Mesh: Realtime Synced</span>
            </div>
          </div>
        </div>

        {/* Cluster Dossier / Detail View (5 cols) */}
        <div className="xl:col-span-5 flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden sticky top-20">
          {/* Dossier Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                  {selectedCluster.tier} Zone
                </span>
                <span className="font-mono text-xs text-slate-500">{selectedCluster.code}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate?.('/admin/locations/map')}
                  className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                  title="View on Map"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                </button>
              </div>
            </div>

            <div className="mt-1">
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedCluster.name}</h2>
              <p className="text-xs text-slate-500">
                Nigeria • {selectedCluster.state} • {selectedCluster.lga} • {selectedCluster.zone}
              </p>
            </div>

            {/* Internal Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 mt-2 border-b border-slate-200">
              <button
                onClick={() => setDossierTab('details')}
                className={`pb-2 px-2 text-xs font-semibold flex items-center gap-1 transition-colors border-b-2 ${
                  dossierTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">tune</span>
                <span>Details</span>
              </button>
              <button
                onClick={() => setDossierTab('businesses')}
                className={`pb-2 px-2 text-xs font-semibold flex items-center gap-1 transition-colors border-b-2 ${
                  dossierTab === 'businesses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">store</span>
                <span>Businesses ({selectedCluster.businesses})</span>
              </button>
              <button
                onClick={() => setDossierTab('boundaries')}
                className={`pb-2 px-2 text-xs font-semibold flex items-center gap-1 transition-colors border-b-2 ${
                  dossierTab === 'boundaries'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">map</span>
                <span>Boundaries</span>
              </button>
              <button
                onClick={() => setDossierTab('qr')}
                className={`pb-2 px-2 text-xs font-semibold flex items-center gap-1 transition-colors border-b-2 ${
                  dossierTab === 'qr'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">qr_code</span>
                <span>QR Assets</span>
              </button>
            </div>
          </div>

          {/* Dossier Content Body */}
          <div className="p-4 flex flex-col gap-4 max-h-[calc(100vh-270px)] overflow-y-auto">
            {dossierTab === 'details' && (
              <>
                {/* Governance Details */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    Governance & Field Oversight
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Zonal Oversight</span>
                      <span className="font-semibold text-slate-800">{selectedCluster.zonalOffice}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Lead Field Officer</span>
                      <span className="font-semibold text-slate-800">{selectedCluster.leadOfficer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Registered Date</span>
                      <span className="font-medium text-slate-700">{selectedCluster.registeredDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Platform Rev Split</span>
                      <span className="font-semibold text-emerald-700">80% Merchant / 20% VEM</span>
                    </div>
                  </div>
                </div>

                {/* Spatial Telemetry & POS */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    Cartographic Telemetry & POS
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Centroid GPS</span>
                      <span className="font-mono font-medium text-slate-800">
                        {selectedCluster.lat.toFixed(4)}° N, {selectedCluster.lng.toFixed(4)}° E
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Geofence Radius</span>
                      <span className="font-semibold text-slate-800">{selectedCluster.radius.toLocaleString()} meters</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">POS Terminal Fleet</span>
                      <span className="font-semibold text-blue-600">{Math.round(selectedCluster.businesses * 1.45)} Active Terminals</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Network Ping Latency</span>
                      <span className="font-medium text-emerald-600">14ms (Lagos Edge)</span>
                    </div>
                  </div>
                </div>

                {/* 24h Activity Velocity */}
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-xl border border-blue-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">24h Footfall & Tap Velocity</span>
                    <span className="text-xs font-mono font-bold text-blue-700">{selectedCluster.taps24h.toLocaleString()} taps</span>
                  </div>
                  <div className="w-full bg-blue-200/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-blue-700">
                    <span>Peak Window: 13:00 - 17:30 WAT</span>
                    <span>Conversion: 24.8%</span>
                  </div>
                </div>

                {/* Quick Administrative Action Bar */}
                <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setBannerNotice(`Realigned geofence centroid anchor for ${selectedCluster.name}.`);
                      setTimeout(() => setBannerNotice(null), 3000);
                    }}
                    type="button"
                    className="w-full h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-blue-600">my_location</span>
                    <span>Re-Center Geofence Anchor</span>
                  </button>
                  <button
                    onClick={() => onNavigate?.('/admin/locations/map')}
                    type="button"
                    className="w-full h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    <span>Open in Cluster GIS Map</span>
                  </button>
                </div>
              </>
            )}

            {dossierTab === 'businesses' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Merchant roster in this cluster</span>
                  <span className="font-semibold text-slate-800">{selectedCluster.businesses} Merchants</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Slot Electronics Flagship', cat: 'Electronics & Gadgets', pos: '6 Terminals', status: 'Active' },
                    { name: '3C Hub Tech Megastore', cat: 'Smartphones & Accessories', pos: '4 Terminals', status: 'Active' },
                    { name: 'Microstation Computer Supercenter', cat: 'Computing & Repairs', pos: '3 Terminals', status: 'Active' },
                    { name: 'Mega Plaza Century Mall', cat: 'General Retail', pos: '8 Terminals', status: 'Active' },
                    { name: 'Finet Mobile Accessories', cat: 'Telecom & Peripherals', pos: '2 Terminals', status: 'Active' },
                  ].map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-500">{m.cat}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-700 font-medium">{m.pos}</span>
                        <div className="text-[10px] text-emerald-600 font-semibold">{m.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate?.('/admin/businesses')}
                  className="w-full py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 text-center"
                >
                  View All {selectedCluster.businesses} Merchants →
                </button>
              </div>
            )}

            {dossierTab === 'boundaries' && (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-slate-900 text-white rounded-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Boundary Perimeter</span>
                    <span className="font-mono text-emerald-400 font-bold">RTK DGPS VERIFIED</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 space-y-1">
                    <div>P1: [{selectedCluster.lat.toFixed(4)}, {selectedCluster.lng.toFixed(4)}]</div>
                    <div>P2: [{(selectedCluster.lat + 0.008).toFixed(4)}, {(selectedCluster.lng + 0.006).toFixed(4)}]</div>
                    <div>P3: [{(selectedCluster.lat + 0.004).toFixed(4)}, {(selectedCluster.lng - 0.007).toFixed(4)}]</div>
                    <div>Buffer Radius: {selectedCluster.radius}m radial zone</div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Adjust Geofence Perimeter Radius</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={selectedCluster.radius}
                      onChange={(e) => {
                        const newR = Number(e.target.value);
                        setClusters((prev) =>
                          prev.map((c) => (c.id === selectedCluster.id ? { ...c, radius: newR } : c))
                        );
                      }}
                      className="w-full"
                    />
                    <span className="text-xs font-mono font-bold text-slate-800 w-16 text-right">
                      {selectedCluster.radius}m
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBannerNotice(`Updated spatial geofence buffer for ${selectedCluster.name}.`);
                    setTimeout(() => setBannerNotice(null), 3000);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Save Geofence Polygon Changes
                </button>
              </div>
            )}

            {dossierTab === 'qr' && (
              <div className="flex flex-col gap-3 items-center text-center">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm inline-block">
                  <div className="w-40 h-40 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[64px] text-white">qr_code_2</span>
                    <span className="text-[10px] font-mono tracking-widest mt-1 uppercase">{selectedCluster.code}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block">{selectedCluster.name} Area Beacon</span>
                  Point mobile cameras or NFC devices to trigger VEMTAP cluster rewards within this perimeter.
                </div>
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      setBannerNotice('Downloaded high-resolution SVG standee beacon.');
                      setTimeout(() => setBannerNotice(null), 3000);
                    }}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download SVG</span>
                  </button>
                  <button
                    onClick={() => {
                      setBannerNotice('Triggered batch standee print queue for merchant fleet.');
                      setTimeout(() => setBannerNotice(null), 3000);
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Batch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Register New Cluster */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">add_location_alt</span>
                <h3 className="font-bold text-slate-900 text-base">Register New Retail Cluster</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterCluster} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Cluster Name *</label>
                <input
                  type="text"
                  required
                  value={newClusterForm.name}
                  onChange={(e) => setNewClusterForm({ ...newClusterForm, name: e.target.value })}
                  placeholder="e.g. Ikeja City Mall & Alausa Corridor"
                  className="h-9 px-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">State / Territory</label>
                  <select
                    value={newClusterForm.state}
                    onChange={(e) => setNewClusterForm({ ...newClusterForm, state: e.target.value })}
                    className="h-9 px-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Lagos State">Lagos State</option>
                    <option value="Abuja FCT">Abuja FCT</option>
                    <option value="Rivers State">Rivers State</option>
                    <option value="Kano State">Kano State</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">LGA / District</label>
                  <input
                    type="text"
                    value={newClusterForm.lga}
                    onChange={(e) => setNewClusterForm({ ...newClusterForm, lga: e.target.value })}
                    placeholder="e.g. Ikeja LGA"
                    className="h-9 px-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newClusterForm.lat}
                    onChange={(e) => setNewClusterForm({ ...newClusterForm, lat: parseFloat(e.target.value) || 0 })}
                    className="h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newClusterForm.lng}
                    onChange={(e) => setNewClusterForm({ ...newClusterForm, lng: parseFloat(e.target.value) || 0 })}
                    className="h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Radius (m)</label>
                  <input
                    type="number"
                    step="100"
                    value={newClusterForm.radius}
                    onChange={(e) => setNewClusterForm({ ...newClusterForm, radius: parseInt(e.target.value, 10) || 1000 })}
                    className="h-9 px-3 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Lead Field Officer</label>
                <input
                  type="text"
                  value={newClusterForm.leadOfficer}
                  onChange={(e) => setNewClusterForm({ ...newClusterForm, leadOfficer: e.target.value })}
                  placeholder="Officer name"
                  className="h-9 px-3 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5">info</span>
                <span>
                  Registering a cluster automatically initializes a sovereign GIS geofence and notifies all POS hardware
                  beacons within the buffer radius.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-9 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Create & Initialize Cluster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
