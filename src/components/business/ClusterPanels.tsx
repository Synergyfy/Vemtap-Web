import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { TextField } from './FormPrimitives';
import { ClusterQrCode } from '../ClusterQrCode';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { branchService } from '../../services/branchService';
import {
  clustersService,
  type ClusterCard,
  type ClusterKind,
  type ClusterMember,
  type MyCluster,
  type ShowcaseItem,
  type ShowcasePreference,
} from '../../services/clustersService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira } from '../../utils/format';

const clusterKeys = {
  all: ['business-cluster'] as const,
  detect: (branchId?: string) => ['business-cluster', 'detect', branchId ?? 'own'] as const,
  mine: (branchId?: string) => ['business-cluster', 'mine', branchId ?? 'own'] as const,
  members: (clusterId: string, q: string) => ['business-cluster', 'members', clusterId, q] as const,
  member: (clusterId: string, id: string) => ['business-cluster', 'member', clusterId, id] as const,
  showcase: (branchId?: string) => ['business-cluster', 'showcase', branchId ?? 'own'] as const,
  chat: (clusterId: string, id: string) => ['business-cluster', 'chat', clusterId, id] as const,
};

const KINDS: Array<{ value: ClusterKind; label: string }> = [
  { value: 'mall', label: 'Mall' },
  { value: 'plaza', label: 'Plaza' },
  { value: 'market', label: 'Market' },
  { value: 'commercial-axis', label: 'Commercial axis' },
  { value: 'strip', label: 'Shopping strip' },
];

const card = 'rounded-xl bg-surface-canvas border border-border-subtle p-space-md';
const primaryButton =
  'h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center justify-center gap-1 disabled:opacity-60';
const secondaryButton =
  'h-10 px-space-md rounded-lg border border-border-subtle bg-surface-canvas font-label-md text-label-md text-text-primary inline-flex items-center justify-center gap-1 disabled:opacity-60';

/**
 * The live cluster system: detect/join/propose when the active branch has no
 * cluster, otherwise the cluster overview with members (profiles + chat) and
 * the showcase (what the branch shows in the cluster).
 */
export function ClusterSystemPanel({ onCreateDeal }: { onCreateDeal?: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const mine = useQuery({
    queryKey: clusterKeys.mine(activeBranchId),
    queryFn: () => clustersService.mine(activeBranchId),
    retry: false,
  });

  if (mine.isLoading) return <LoadingRows rows={4} label="Loading your cluster" />;
  if (mine.isError) {
    // 404 = not in a cluster yet; anything else is a real error.
    const status = (mine.error as { status?: number } | null)?.status;
    if (status === 404) return <ClusterOnboardingPanel />;
    return <ErrorState title="Could not load your cluster" error={mine.error} onRetry={() => mine.refetch()} />;
  }
  if (!mine.data) return <ClusterOnboardingPanel />;
  return <MyClusterView cluster={mine.data} onCreateDeal={onCreateDeal} />;
}

/** Not in a cluster: join the detected one or propose a new one. */
export function ClusterOnboardingPanel() {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const detect = useQuery({ queryKey: clusterKeys.detect(activeBranchId), queryFn: () => clustersService.detect(activeBranchId) });
  const join = useMutation({
    mutationFn: (clusterId: string) => clustersService.join(clusterId, activeBranchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clusterKeys.all }),
  });
  const [proposing, setProposing] = useState(false);

  if (detect.isLoading) return <LoadingRows rows={3} label="Looking for your cluster" />;
  if (detect.isError) return <ErrorState title="Could not check for a cluster" error={detect.error} onRetry={() => detect.refetch()} />;
  const result = detect.data;

  return (
    <div className="flex flex-col gap-space-md max-w-3xl">
      {result?.scenario === 'detected' && result.cluster ? (
        <section className={`${card} flex flex-col gap-space-sm`}>
          <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">Cluster found</span>
          <ClusterSummary cluster={result.cluster} />
          <p className="font-body-md text-body-md text-text-secondary">
            Your branch sits inside {result.cluster.name}. Join to show your deals to everyone who scans the cluster QR.
          </p>
          <div className="flex flex-wrap gap-space-xs">
            <button type="button" className={primaryButton} disabled={join.isPending} onClick={() => join.mutate(result.cluster!.id)}>
              <Icon name="group_add" className="text-[18px]" />
              {join.isPending ? 'Joining…' : `Join ${result.cluster.name}`}
            </button>
            <button type="button" className={secondaryButton} onClick={() => setProposing(true)}>
              This isn’t my place
            </button>
          </div>
          {join.isError ? <span className="font-caption text-caption text-error">{apiErrorMessage(join.error)}</span> : null}
        </section>
      ) : (
        <section className={`${card} flex flex-col gap-space-xs`}>
          <h3 className="font-heading-sm text-heading-sm text-text-primary">No cluster covers your branch yet</h3>
          <p className="font-body-md text-body-md text-text-secondary">
            {result?.reason ?? 'Propose the mall, plaza or market you trade in. VEMTAP reviews it and then other businesses there can join.'}
          </p>
          {!proposing ? (
            <button type="button" className={`${primaryButton} self-start`} onClick={() => setProposing(true)}>
              <Icon name="add_location_alt" className="text-[18px]" /> Propose a cluster
            </button>
          ) : null}
        </section>
      )}
      {proposing ? <ProposeClusterForm onDone={() => setProposing(false)} /> : null}
    </div>
  );
}

function ClusterSummary({ cluster }: { cluster: ClusterCard }) {
  return (
    <div className="flex items-start gap-space-sm">
      <span className="w-11 h-11 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
        <Icon name="storefront" className="text-[22px]" />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="font-heading-sm text-heading-sm text-text-primary truncate">{cluster.name}</span>
        <span className="font-caption text-caption text-text-secondary">
          {[cluster.kind, cluster.address, cluster.city].filter(Boolean).join(' · ')}
        </span>
      </div>
      {cluster.status === 'review' ? (
        <span className="ml-auto px-2 py-0.5 rounded-full bg-surface-subtle text-text-secondary font-caption text-caption">Under review</span>
      ) : null}
    </div>
  );
}

function ProposeClusterForm({ onDone }: { onDone: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const branch = useQuery({
    queryKey: ['business-cluster', 'branch', activeBranchId],
    queryFn: () => branchService.get(activeBranchId as string),
    enabled: Boolean(activeBranchId),
  });
  const [name, setName] = useState('');
  const [kind, setKind] = useState<ClusterKind>('plaza');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const lat = Number(branch.data?.latitude);
  const lng = Number(branch.data?.longitude);
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

  useEffect(() => {
    if (branch.data?.address && !address) setAddress(branch.data.address);
  }, [branch.data?.address, address]);

  const propose = useMutation({
    mutationFn: () =>
      clustersService.propose(
        {
          name: name.trim(),
          kind,
          address: address.trim() || undefined,
          city: branch.data?.city ?? undefined,
          state: branch.data?.state ?? undefined,
          latitude: lat,
          longitude: lng,
        },
        activeBranchId,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clusterKeys.all });
      onDone();
    },
    onError: (e) => setError(apiErrorMessage(e, 'Could not propose the cluster.')),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError('Give the cluster a name.');
    if (!hasLocation) return setError('Set your branch location first — the cluster is centred on it.');
    setError(null);
    propose.mutate();
  };

  return (
    <form onSubmit={submit} className={`${card} flex flex-col gap-space-sm`}>
      <h3 className="font-heading-sm text-heading-sm text-text-primary">Propose a cluster</h3>
      <TextField id="cluster-name" label="Name" value={name} onChange={setName} placeholder="e.g. Amaka Mall" />
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm text-text-secondary">Type</span>
        <div className="flex flex-wrap gap-space-xs">
          {KINDS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setKind(option.value)}
              className={`h-9 px-space-sm rounded-full font-label-sm text-label-sm ${
                kind === option.value ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <TextField id="cluster-address" label="Address" value={address} onChange={setAddress} placeholder="Street or landmark" />
      <p className="font-caption text-caption text-text-tertiary">
        {hasLocation ? 'Centred on your branch location.' : 'Your branch has no map location yet.'}
      </p>
      {error ? <span className="font-caption text-caption text-error">{error}</span> : null}
      <div className="flex gap-space-xs">
        <button type="submit" className={primaryButton} disabled={propose.isPending}>
          {propose.isPending ? 'Submitting…' : 'Submit for review'}
        </button>
        <button type="button" className={secondaryButton} onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

type ClusterTab = 'members' | 'showcase';

function MyClusterView({ cluster, onCreateDeal }: { cluster: MyCluster; onCreateDeal?: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ClusterTab>('members');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const leave = useMutation({
    mutationFn: () => clustersService.leave(activeBranchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clusterKeys.all }),
  });
  const stats = [
    { label: 'Businesses', value: cluster.stats.totalBusinesses },
    { label: 'Active', value: cluster.stats.activeBusinesses },
    { label: 'Deals in pool', value: cluster.stats.totalDealsInPool },
    { label: 'QR scans', value: cluster.stats.totalScans },
  ];

  return (
    <div className="flex flex-col gap-space-md max-w-5xl">
      <section className={`${card} flex flex-col md:flex-row gap-space-md`}>
        <div className="flex flex-col gap-space-sm flex-1 min-w-0">
          <ClusterSummary cluster={cluster} />
          {cluster.status === 'review' ? (
            <p className="font-caption text-caption text-text-secondary">
              VEMTAP is reviewing this cluster. Other businesses can join once it is approved.
            </p>
          ) : null}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-surface-subtle p-space-xs flex flex-col">
                <span className="font-caption text-caption text-text-secondary">{stat.label}</span>
                <span className="font-heading-sm text-heading-sm text-text-primary">{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-space-xs">
            {onCreateDeal ? (
              <button type="button" className={secondaryButton} onClick={onCreateDeal}>
                <Icon name="sell" className="text-[18px]" /> Create a deal
              </button>
            ) : null}
            {!confirmLeave ? (
              <button type="button" className={secondaryButton} onClick={() => setConfirmLeave(true)}>
                Leave cluster
              </button>
            ) : (
              <>
                <button type="button" className="h-10 px-space-md rounded-lg bg-error text-on-error font-label-md text-label-md" onClick={() => leave.mutate()}>
                  {leave.isPending ? 'Leaving…' : 'Confirm leave'}
                </button>
                <button type="button" className={secondaryButton} onClick={() => setConfirmLeave(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
          {leave.isError ? <span className="font-caption text-caption text-error">{apiErrorMessage(leave.error)}</span> : null}
        </div>
        {cluster.qrCode.isActive ? (
          <div className="shrink-0 flex justify-center">
            <ClusterQrCode url={cluster.qrCode.url} clusterName={cluster.name} displayCode={cluster.qrCode.displayCode} size={150} />
          </div>
        ) : null}
      </section>

      <FilterChips
        options={[
          { key: 'members', label: 'Members' },
          { key: 'showcase', label: 'What we show' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'members' ? <MembersPanel clusterId={cluster.id} /> : <ShowcasePanel />}
    </div>
  );
}

function MembersPanel({ clusterId }: { clusterId: string }) {
  const { activeBranchId } = useBusinessBranch();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ClusterMember | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  const members = useQuery({
    queryKey: clusterKeys.members(clusterId, query),
    queryFn: () => clustersService.members(clusterId, { q: query || undefined, limit: 50, branchId: activeBranchId }),
  });

  if (selected) return <MemberDetail clusterId={clusterId} member={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="flex flex-col gap-space-sm">
      <TextField id="cluster-member-search" label="Search members" value={search} onChange={setSearch} placeholder="Business name" />
      {members.isLoading ? (
        <LoadingRows rows={3} label="Loading members" />
      ) : members.isError ? (
        <ErrorState title="Could not load members" error={members.error} onRetry={() => members.refetch()} />
      ) : !members.data?.data.length ? (
        <EmptyState icon="groups" title="No members found" body={query ? 'Try another name.' : 'You are the first business here.'} />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {members.data.data.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                disabled={member.isSelf}
                onClick={() => setSelected(member)}
                className="w-full rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex items-center gap-space-sm text-left disabled:cursor-default"
              >
                {member.logoUrl ? (
                  <img src={member.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                    <Icon name="store" className="text-[20px]" />
                  </span>
                )}
                <span className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold truncate">
                    {member.businessName}
                    {member.isSelf ? ' (you)' : ''}
                  </span>
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {[member.category, member.branchName].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="font-caption text-caption text-text-secondary shrink-0">{member.dealsCount} deals</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MemberDetail({ clusterId, member, onBack }: { clusterId: string; member: ClusterMember; onBack: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const detail = useQuery({
    queryKey: clusterKeys.member(clusterId, member.branchId),
    queryFn: () => clustersService.member(clusterId, member.branchId, activeBranchId),
  });
  return (
    <div className="flex flex-col gap-space-sm">
      <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary">
        <Icon name="arrow_back" className="text-[18px]" /> All members
      </button>
      <section className={`${card} flex flex-col gap-space-xs`}>
        <span className="font-heading-sm text-heading-sm text-text-primary">{member.businessName}</span>
        <span className="font-caption text-caption text-text-secondary">
          {[member.category, member.unitOrSuite, member.phone].filter(Boolean).join(' · ')}
        </span>
        {member.bio ? <p className="font-body-md text-body-md text-text-secondary">{member.bio}</p> : null}
        {detail.data?.topOffers.length ? (
          <div className="flex flex-col gap-1 pt-space-xs">
            <span className="font-label-md text-label-md text-text-primary font-semibold">Live deals</span>
            {detail.data.topOffers.map((offer) => (
              <span key={offer.id} className="flex justify-between font-body-md text-body-md text-text-secondary">
                <span className="truncate">{offer.title}</span>
                <span>{formatNaira(offer.price)}</span>
              </span>
            ))}
          </div>
        ) : null}
      </section>
      <ClusterChat clusterId={clusterId} member={member} />
    </div>
  );
}

function ClusterChat({ clusterId, member }: { clusterId: string; member: ClusterMember }) {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const chat = useQuery({
    queryKey: clusterKeys.chat(clusterId, member.branchId),
    queryFn: () => clustersService.chat(clusterId, member.branchId, activeBranchId),
    refetchInterval: 15_000,
  });
  const send = useMutation({
    mutationFn: (body: string) => clustersService.send(clusterId, member.branchId, body, activeBranchId),
    onSuccess: () => {
      setDraft('');
      void queryClient.invalidateQueries({ queryKey: clusterKeys.chat(clusterId, member.branchId) });
    },
  });
  // The API answers newest first; show oldest at the top.
  const thread = useMemo(() => [...(chat.data?.data ?? [])].reverse(), [chat.data]);

  return (
    <section className={`${card} flex flex-col gap-space-sm`}>
      <h3 className="font-label-md text-label-md text-text-primary font-semibold">Message {member.businessName}</h3>
      {chat.isLoading ? (
        <LoadingRows rows={2} label="Loading messages" />
      ) : thread.length ? (
        <div className="flex flex-col gap-space-2xs max-h-80 overflow-y-auto">
          {thread.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] rounded-xl px-space-sm py-space-2xs font-body-md text-body-md ${
                message.isSelf ? 'self-end bg-primary-container text-on-primary' : 'self-start bg-surface-subtle text-text-primary'
              }`}
            >
              {message.text}
              <span className="block font-caption text-caption opacity-70">
                {new Date(message.timestamp).toLocaleString('en-NG', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-caption text-caption text-text-tertiary">No messages yet. Say hello to a neighbour.</p>
      )}
      <form
        className="flex gap-space-xs"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim()) send.mutate(draft.trim());
        }}
      >
        <input
          value={draft}
          maxLength={2000}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          className="flex-1 h-10 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md outline-none"
        />
        <button type="submit" className={primaryButton} disabled={send.isPending || !draft.trim()}>
          <Icon name="send" className="text-[18px]" />
        </button>
      </form>
      {send.isError ? <span className="font-caption text-caption text-error">{apiErrorMessage(send.error)}</span> : null}
    </section>
  );
}

const PREFERENCES: Array<{ key: ShowcasePreference; label: string }> = [
  { key: 'all', label: 'Everything' },
  { key: 'deals', label: 'Deals' },
  { key: 'products', label: 'Products' },
  { key: 'services', label: 'Services' },
  { key: 'profile', label: 'Profile only' },
];

function ShowcasePanel() {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const showcase = useQuery({ queryKey: clusterKeys.showcase(activeBranchId), queryFn: () => clustersService.showcase(activeBranchId) });
  const toggle = useMutation({
    mutationFn: (item: ShowcaseItem) =>
      clustersService.updateShowcase([{ type: item.entityType, id: item.id, show: !item.showInCluster }], activeBranchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clusterKeys.showcase(activeBranchId) }),
  });
  const preference = useMutation({
    mutationFn: (value: ShowcasePreference) => clustersService.setPreference(value, activeBranchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clusterKeys.all }),
  });

  if (showcase.isLoading) return <LoadingRows rows={4} label="Loading your items" />;
  if (showcase.isError || !showcase.data) return <ErrorState title="Could not load your items" error={showcase.error} onRetry={() => showcase.refetch()} />;

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm text-text-secondary">Feature in the cluster</span>
        <FilterChips
          options={PREFERENCES}
          value={showcase.data.preference}
          onChange={(value) => preference.mutate(value)}
        />
      </div>
      <p className="font-caption text-caption text-text-tertiary">
        Live deals show in the cluster unless you hide them; products and services show only when you switch them on.
      </p>
      {!showcase.data.items.length ? (
        <EmptyState icon="inventory_2" title="Nothing to show yet" body="Create a deal or add products to your catalogue." />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {showcase.data.items.map((item) => (
            <li key={`${item.entityType}:${item.id}`} className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex items-center gap-space-sm">
              {item.image ? (
                <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="w-10 h-10 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
                  <Icon name={item.entityType === 'deal' ? 'sell' : 'inventory_2'} className="text-[20px] text-text-tertiary" />
                </span>
              )}
              <span className="flex flex-col flex-1 min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{item.title}</span>
                <span className="font-caption text-caption text-text-secondary capitalize">
                  {item.entityType} · {formatNaira(item.price)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => toggle.mutate(item)}
                disabled={toggle.isPending}
                className={`h-8 px-space-sm rounded-full font-label-sm text-label-sm font-semibold ${
                  item.showInCluster ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-subtle text-text-secondary'
                }`}
              >
                {item.showInCluster ? 'Shown' : 'Hidden'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {toggle.isError ? <span className="font-caption text-caption text-error">{apiErrorMessage(toggle.error)}</span> : null}
    </div>
  );
}
