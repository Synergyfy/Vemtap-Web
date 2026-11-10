import { useMemo, useState } from 'react';
import { hasApiConfig } from '../../services/api/client';
import { adminService, type AdminApiCluster } from '../../services/adminService';
import { formatCount, NONE } from './adminLive';
import { adminErrorMessage, useAdminAction, useAdminClusters } from './useAdminData';

interface MapCluster {
  id: string;
  code: string;
  name: string;
  zone: string;
  state: string;
  lga: string;
  lat: number;
  lng: number;
  cx: number; // canvas x
  cy: number; // canvas y
  radius: number;
  merchants: number;
  deals: number;
  tapsPerHour: number;
  beaconCount: number;
  status: 'Operational' | 'Expanding' | 'Sub-optimal';
  /** Live: radius in metres and the API record. */
  radiusMeters?: number;
  raw?: AdminApiCluster;
}

const CANVAS = { left: 70, right: 730, top: 50, bottom: 430 };

/** Places live clusters on the 800×500 canvas by their real coordinates, fitted to the visible set. */
function projectClusters(list: AdminApiCluster[]): MapCluster[] {
  const located = list.filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number');
  if (located.length === 0) return [];
  const lats = located.map((c) => c.latitude as number);
  const lngs = located.map((c) => c.longitude as number);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const spanLat = Math.max(maxLat - minLat, 0.01);
  const spanLng = Math.max(maxLng - minLng, 0.01);
  const midLat = (minLat + maxLat) / 2;
  const metersPerPx = (spanLng * 111_320 * Math.cos((midLat * Math.PI) / 180)) / (CANVAS.right - CANVAS.left);
  return located.map((c) => {
    const lat = c.latitude as number;
    const lng = c.longitude as number;
    const cx = located.length === 1 ? 400 : CANVAS.left + ((lng - minLng) / spanLng) * (CANVAS.right - CANVAS.left);
    const cy = located.length === 1 ? 240 : CANVAS.bottom - ((lat - minLat) / spanLat) * (CANVAS.bottom - CANVAS.top);
    const radiusMeters = c.radiusMeters ?? 0;
    return {
      id: c.id,
      code: c.uniqueCode ?? c.id.slice(0, 8).toUpperCase(),
      name: c.name,
      zone: c.area || NONE,
      state: c.state || NONE,
      lga: c.city || NONE,
      lat,
      lng,
      cx,
      cy,
      radius: Math.min(80, Math.max(10, radiusMeters / Math.max(metersPerPx, 1))),
      merchants: c.branchCount ?? 0,
      deals: c.activeOfferCount ?? 0,
      tapsPerHour: c.scanCount ?? 0,
      beaconCount: 0,
      status: c.isActive ? 'Operational' : 'Sub-optimal',
      radiusMeters,
      raw: c,
    };
  });
}

const MAP_CLUSTERS: MapCluster[] = [
  {
    id: 'c1',
    code: 'CL-LOS-IKV-01',
    name: 'Ikeja Computer Village Hub',
    zone: 'Otigba Tech Zone',
    state: 'Lagos State',
    lga: 'Ikeja LGA',
    lat: 6.5944,
    lng: 3.3421,
    cx: 260,
    cy: 160,
    radius: 46,
    merchants: 284,
    deals: 38,
    tapsPerHour: 840,
    beaconCount: 412,
    status: 'Operational',
  },
  {
    id: 'c2',
    code: 'CL-LOS-LEK-02',
    name: 'Lekki Phase 1 Waterfront & Admiralty',
    zone: 'Admiralty Corridor',
    state: 'Lagos State',
    lga: 'Eti-Osa LGA',
    lat: 6.4474,
    lng: 3.4723,
    cx: 520,
    cy: 330,
    radius: 40,
    merchants: 192,
    deals: 24,
    tapsPerHour: 520,
    beaconCount: 280,
    status: 'Operational',
  },
  {
    id: 'c3',
    code: 'CL-LOS-VIC-03',
    name: 'Victoria Island Central Core',
    zone: 'Financial District',
    state: 'Lagos State',
    lga: 'Eti-Osa LGA',
    lat: 6.4281,
    lng: 3.4219,
    cx: 440,
    cy: 340,
    radius: 52,
    merchants: 412,
    deals: 56,
    tapsPerHour: 1120,
    beaconCount: 560,
    status: 'Operational',
  },
  {
    id: 'c4',
    code: 'CL-LOS-YAB-04',
    name: 'Yaba Tech Corridor',
    zone: 'Herbert Macaulay',
    state: 'Lagos State',
    lga: 'Lagos Mainland',
    lat: 6.5173,
    lng: 3.3742,
    cx: 350,
    cy: 240,
    radius: 36,
    merchants: 126,
    deals: 15,
    tapsPerHour: 340,
    beaconCount: 190,
    status: 'Expanding',
  },
];

export function AdminClusterMapScreen() {
  const live = hasApiConfig();
  const [selectedState, setSelectedState] = useState(live ? 'all' : 'lagos');
  const [viewMode, setViewMode] = useState<'heatmap' | 'polygons' | 'beacons'>('polygons');
  const [selectedClusterId, setSelectedClusterId] = useState<string>(live ? '' : 'c1');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBeacons, setShowBeacons] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [radiusDraft, setRadiusDraft] = useState<Record<string, number>>({});

  // Live API: clusters placed by their real coordinates.
  const clustersQuery = useAdminClusters({ page: 1, limit: 200 });
  const liveAll = useMemo(() => clustersQuery.data?.data ?? [], [clustersQuery.data]);
  const stateOptions = useMemo(() => {
    const counts = new Map<string, number>();
    liveAll.forEach((c) => counts.set(c.state || NONE, (counts.get(c.state || NONE) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [liveAll]);
  const liveVisible = useMemo(
    () => projectClusters(selectedState === 'all' ? liveAll : liveAll.filter((c) => (c.state || NONE) === selectedState)),
    [liveAll, selectedState],
  );
  const mapClusters = live ? liveVisible : MAP_CLUSTERS;
  const selectedCluster: MapCluster | undefined = mapClusters.find((c) => c.id === selectedClusterId) || mapClusters[0];
  const liveRadius = selectedCluster ? radiusDraft[selectedCluster.id] ?? selectedCluster.radiusMeters ?? 0 : 0;
  const footprintKm2 = liveVisible.reduce((sum, c) => sum + Math.PI * ((c.radiusMeters ?? 0) / 1000) ** 2, 0);

  const autoAssign = useAdminAction(() => adminService.autoAssignClusters());
  const updateRadius = useAdminAction(({ id, radiusMeters }: { id: string; radiusMeters: number }) =>
    adminService.updateCluster(id, { radiusMeters }),
  );
  const notify = (message: string) => {
    setBannerNotice(message);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleRecalculateBuffers = () => {
    if (live) {
      setActionError(null);
      autoAssign.mutate(undefined, {
        onSuccess: (result) =>
          notify(result?.enqueued ? 'Branch auto-assignment queued.' : `Auto-assigned ${result?.assigned ?? 0} branch(es).`),
        onError: (error) => setActionError(adminErrorMessage(error)),
      });
      return;
    }
    setBannerNotice('Recalculated GIS buffers with dynamic footfall density parameters.');
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleEmergencyGeoPush = () => {
    if (!selectedCluster) return;
    setBannerNotice(`Dispatched high-priority geofence broadcast to all ${selectedCluster.beaconCount} beacons in ${selectedCluster.name}.`);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const handleExportKML = () => {
    if (!selectedCluster) return;
    if (live) {
      const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Placemark><name>${selectedCluster.name.replace(/[<&>]/g, '')}</name>
<description>Radius ${selectedCluster.radiusMeters ?? 0} m</description>
<Point><coordinates>${selectedCluster.lng},${selectedCluster.lat},0</coordinates></Point></Placemark></kml>`;
      const url = URL.createObjectURL(new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `vemtap-cluster-${selectedCluster.code}.kml`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    setBannerNotice(`Exported spatial KML geometry for ${selectedCluster.name}.`);
    setTimeout(() => setBannerNotice(null), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-5">
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
      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Command & Filter Deck */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              {live ? 'Cluster Coordinates' : 'Vector Basemap Engine v4.2'}
            </span>
            <span className="text-xs text-slate-400">• GPS Lat/Long WGS84</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Geospatial Cluster Map & Coverage
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial monitoring of active geofence buffers, NFC standee beacon density, and real-time footfall taps.
          </p>
        </div>

        {/* Global Map Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* State Selector */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {live ? (
              <>
                <option value="all">All States ({liveAll.length} Clusters)</option>
                {stateOptions.map(([state, count]) => (
                  <option key={state} value={state}>
                    {state} ({count} Cluster{count === 1 ? '' : 's'})
                  </option>
                ))}
              </>
            ) : (
              <>
                <option value="lagos">Lagos State (48 Clusters)</option>
                <option value="fct">Abuja FCT (18 Clusters)</option>
                <option value="rivers">Rivers State (12 Clusters)</option>
              </>
            )}
          </select>

          {/* View Mode Switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setViewMode('polygons');
                setShowHeatmap(false);
                setShowBeacons(true);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'polygons' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Polygons
            </button>
            <button
              onClick={() => {
                setViewMode('heatmap');
                setShowHeatmap(true);
                setShowBeacons(true);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'heatmap' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heatmap
            </button>
{!live && (
<>
            <button
              onClick={() => {
                setViewMode('beacons');
                setShowHeatmap(false);
                setShowBeacons(true);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'beacons' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Beacons
            </button>
</>
)}
          </div>

          <button
            onClick={handleRecalculateBuffers}
            type="button"
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] ${autoAssign.isPending ? 'animate-spin' : ''}`}>sync</span>
            <span>{live ? 'Auto-assign Branches' : 'Recalculate Buffers'}</span>
          </button>
        </div>
      </div>

      {/* Telemetry Strip (4 Dense Metric Cells) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Geofence Area</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{live ? footprintKm2.toFixed(1) : '142.8'} km²</span>
          </div>
          <span className="material-symbols-outlined text-blue-600 text-[24px]">polyline</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {live ? 'Cluster QR Scans' : 'Real-Time Beacon Pings'}
            </span>
            <span className="text-xl font-bold text-emerald-600 font-mono">
              {live ? formatCount(liveVisible.reduce((sum, c) => sum + c.tapsPerHour, 0)) : '4,120 / min'}
            </span>
          </div>
          <span className="material-symbols-outlined text-emerald-600 text-[24px]">sensors</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {live ? 'Branches Mapped' : 'Cross-Cluster Handoffs'}
            </span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {live ? formatCount(liveVisible.reduce((sum, c) => sum + c.merchants, 0)) : '18,400 / day'}
            </span>
          </div>
          <span className="material-symbols-outlined text-purple-600 text-[24px]">swap_horiz</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {live ? 'Clusters Shown' : 'Edge Network Latency'}
            </span>
            <span className="text-xl font-bold text-blue-700 font-mono">
              {live ? `${liveVisible.length}${liveAll.length > liveVisible.length ? ` / ${liveAll.length}` : ''}` : '14ms'}
            </span>
          </div>
          <span className="material-symbols-outlined text-amber-600 text-[24px]">bolt</span>
        </div>
      </div>

      {/* Cartographic Canvas & Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Map Frame & Interactive Stage (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden relative">
          {/* Map Toolbar Overlay */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Lagos Metro GIS Canvas</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-300">WGS84 6.5244° N, 3.3792° E</span>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-md">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
              title="Reset View"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>

          {/* SVG Vector Map Canvas */}
          <div className="w-full h-[520px] relative overflow-hidden bg-[#0d1527] flex items-center justify-center cursor-grab active:cursor-grabbing">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Radial Glows for Heatmap */}
                <radialGradient id="heatIkeja" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatVI" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatLekki" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="500" fill="url(#grid)" />

{!live && (
<>
              {/* Waterway (Lagos Lagoon & Atlantic) */}
              <path
                d="M 120 400 C 220 380, 280 320, 360 310 C 440 300, 500 270, 680 250 L 800 270 L 800 500 L 0 500 L 0 420 Z"
                fill="#0f233f"
                stroke="#1e3a5f"
                strokeWidth="1.5"
              />

              {/* Atlantic Ocean coastline at bottom */}
              <path
                d="M 380 430 C 480 420, 620 410, 800 400 L 800 500 L 380 500 Z"
                fill="#09182b"
                opacity="0.8"
              />

              {/* Arterial Highways */}
              <g stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round">
                {/* Third Mainland Bridge */}
                <path d="M 350 240 C 370 270, 400 310, 440 340" stroke="#475569" strokeDasharray="4 2" />
                {/* Lekki-Epe Expressway */}
                <path d="M 440 340 Q 520 330 750 320" stroke="#475569" />
                {/* Ikorodu Road */}
                <path d="M 260 160 Q 300 200 350 240" stroke="#475569" />
              </g>
</>
)}

              {/* Heatmap Layer */}
              {live && showHeatmap && (
                <g className="transition-opacity duration-300">
                  {liveVisible.map((c) => {
                    const max = Math.max(1, ...liveVisible.map((x) => x.tapsPerHour));
                    return (
                      <circle
                        key={`heat-${c.id}`}
                        cx={c.cx}
                        cy={c.cy}
                        r={c.radius + 20 + (c.tapsPerHour / max) * 60}
                        fill="url(#heatVI)"
                        opacity={0.25 + (c.tapsPerHour / max) * 0.4}
                      />
                    );
                  })}
                </g>
              )}
              {!live && showHeatmap && (
                <g className="transition-opacity duration-300">
                  <circle cx="260" cy="160" r="80" fill="url(#heatIkeja)" opacity="0.6" />
                  <circle cx="440" cy="340" r="90" fill="url(#heatVI)" opacity="0.5" />
                  <circle cx="520" cy="330" r="75" fill="url(#heatLekki)" opacity="0.5" />
                  <circle cx="350" cy="240" r="60" fill="url(#heatVI)" opacity="0.4" />
                </g>
              )}

              {/* Geofence Polygons & Clusters */}
              {mapClusters.map((c) => {
                const isSelected = c.id === selectedClusterId;
                return (
                  <g
                    key={c.id}
                    onClick={() => setSelectedClusterId(c.id)}
                    className="cursor-pointer group"
                  >
                    {/* Outer Buffer Ring */}
                    <circle
                      cx={c.cx}
                      cy={c.cy}
                      r={c.radius}
                      fill={isSelected ? '#3b82f6' : '#1e40af'}
                      fillOpacity={isSelected ? 0.25 : 0.12}
                      stroke={isSelected ? '#60a5fa' : '#3b82f6'}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? 'none' : '4 2'}
                    />

                    {/* Centroid Beacon Node */}
                    <circle
                      cx={c.cx}
                      cy={c.cy}
                      r={isSelected ? 8 : 6}
                      fill={isSelected ? '#60a5fa' : '#3b82f6'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Beacon Pulse Ring */}
                    <circle
                      cx={c.cx}
                      cy={c.cy}
                      r={isSelected ? 14 : 10}
                      fill="none"
                      stroke={isSelected ? '#60a5fa' : '#3b82f6'}
                      strokeWidth="1"
                      opacity="0.6"
                      className="animate-ping"
                    />

                    {/* Label */}
                    <rect
                      x={c.cx - 60}
                      y={c.cy + c.radius + 6}
                      width="120"
                      height="22"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.85"
                      stroke="#334155"
                      strokeWidth="0.75"
                    />
                    <text
                      x={c.cx}
                      y={c.cy + c.radius + 20}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {live ? (c.name.length > 18 ? `${c.name.slice(0, 17)}…` : c.name) : `${c.name.split(' ')[0]} Hub`}
                    </text>
                  </g>
                );
              })}

              {/* Beacons markers (micro dots) */}
              {!live && showBeacons && (
                <g fill="#10b981" opacity="0.8">
                  <circle cx="250" cy="155" r="2" />
                  <circle cx="270" cy="165" r="2" />
                  <circle cx="255" cy="170" r="2" />
                  <circle cx="435" cy="335" r="2" />
                  <circle cx="450" cy="345" r="2" />
                  <circle cx="510" cy="325" r="2" />
                  <circle cx="530" cy="335" r="2" />
                </g>
              )}
            </svg>

            {live && mapClusters.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-300">
                {clustersQuery.isLoading
                  ? 'Loading clusters…'
                  : clustersQuery.isError
                    ? `Couldn't load clusters: ${adminErrorMessage(clustersQuery.error)}`
                    : 'No clusters with coordinates.'}
              </div>
            )}

            {/* Bottom Layer Legend */}
            <div className="absolute bottom-3 left-4 z-20 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Heatmap</span>
              </label>
{!live && (
<>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBeacons}
                  onChange={(e) => setShowBeacons(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Beacons</span>
              </label>
</>
)}
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Click node to inspect</span>
            </div>
          </div>
        </div>

        {/* Focused Node Inspector (4 Cols) */}
        {!selectedCluster ? (
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-xs text-slate-500">
            Select a cluster on the map.
          </div>
        ) : (
        <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Focused Node
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  !live || selectedCluster.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {live ? (selectedCluster.status === 'Operational' ? 'Active' : 'Inactive') : 'Geofence Valid'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{selectedCluster.name}</h2>
            <div className="text-xs text-slate-500 font-mono">
              Cluster ID: {selectedCluster.code} • {live ? [selectedCluster.lga, selectedCluster.state].filter((v) => v !== NONE).join(', ') || NONE : `Zone 1 ${selectedCluster.status}`}
            </div>
          </div>

          {/* Coordinates & Geometry Metrics */}
          <div className="p-4 flex flex-col gap-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Centroid GPS</span>
                <span className="font-mono font-semibold text-slate-800">
                  {selectedCluster.lat.toFixed(4)}°, {selectedCluster.lng.toFixed(4)}°
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Perimeter</span>
                <span className="font-mono font-semibold text-slate-800">
                  {live ? `${((2 * Math.PI * (selectedCluster.radiusMeters ?? 0)) / 1000).toFixed(2)} km` : '3.24 km'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{live ? 'Branches' : 'Mapped Merchants'}</span>
                <span className="font-bold text-blue-600">
                  {selectedCluster.merchants} {live ? '' : 'Active'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Deals</span>
                <span className="font-bold text-emerald-600">{selectedCluster.deals} Live</span>
              </div>
            </div>

            {/* Tap Velocity Gauge */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">{live ? 'QR Scans (all time)' : 'Peak Tap Velocity'}</span>
                <span className="font-mono font-bold text-blue-900">
                  {selectedCluster.tapsPerHour.toLocaleString()} {live ? 'scans' : 'taps / hr'}
                </span>
              </div>
              {!live && (
                <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '74%' }}></div>
                </div>
              )}
            </div>

{!live && (
<>
            {/* Beacon Status */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">sensors</span>
                <div>
                  <div className="font-bold text-slate-800">{selectedCluster.beaconCount} Beacons Online</div>
                  <div className="text-[11px] text-slate-500">98.4% uptime across fleet</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">ONLINE</span>
            </div>
</>
)}

            {/* Quick Polygon Adjuster */}
            <div className="flex flex-col gap-1 pt-1">
              <label className="text-[11px] font-bold text-slate-700">Quick Buffer Radius Adjuster</label>
              <div className="flex items-center gap-2">
                {live ? (
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={liveRadius}
                    onChange={(e) => setRadiusDraft((prev) => ({ ...prev, [selectedCluster.id]: Number(e.target.value) }))}
                    className="w-full"
                  />
                ) : (
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={selectedCluster.radius}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    selectedCluster.radius = r;
                  }}
                  className="w-full"
                />
                )}
                <span className="font-mono font-bold text-slate-800 w-12 text-right">
                  {live ? liveRadius : selectedCluster.radius * 40}m
                </span>
              </div>
              {live && (
                <button
                  type="button"
                  disabled={updateRadius.isPending || liveRadius === (selectedCluster.radiusMeters ?? 0)}
                  onClick={() => {
                    setActionError(null);
                    updateRadius.mutate(
                      { id: selectedCluster.id, radiusMeters: liveRadius },
                      {
                        onSuccess: () => notify(`Radius for ${selectedCluster.name} saved (${liveRadius} m).`),
                        onError: (error) => setActionError(adminErrorMessage(error)),
                      },
                    );
                  }}
                  className="w-full h-8 mt-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  Save Radius
                </button>
              )}
            </div>

            {/* Administrative Action Group */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
{!live && (
<>
              <button
                onClick={handleEmergencyGeoPush}
                type="button"
                className="w-full h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span>Deploy Emergency Geo-Push</span>
              </button>
</>
)}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportKML}
                  type="button"
                  className="h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">file_download</span>
                  <span>Export KML</span>
                </button>
{!live && (
<>
                <button
                  onClick={() => {
                    setBannerNotice('Beacon calibration command dispatched to all POS terminals.');
                    setTimeout(() => setBannerNotice(null), 3000);
                  }}
                  type="button"
                  className="h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">settings_backup_restore</span>
                  <span>Calibrate Fleet</span>
                </button>
</>
)}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

