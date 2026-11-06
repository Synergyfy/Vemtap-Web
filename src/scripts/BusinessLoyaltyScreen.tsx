import { useState, useMemo } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessModeHeader } from './BusinessModeHeader';
import {
  INITIAL_LOYALTY_MEMBERS,
  INITIAL_PRODUCT_ASSIGNMENTS,
  INITIAL_LOYALTY_TRANSACTIONS,
  type LoyaltyMember,
  type LoyaltyPointAssignment,
  type LoyaltyTransaction,
} from './loyaltyProgrammeData';

interface BusinessLoyaltyScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenRewards: () => void;
}

type LoyaltyViewMode = 'action-picker' | 'give-points' | 'setup-rewards';
type SetupTab = 'rules' | 'rewards' | 'products';
type MemberTierFilter = 'all' | 'VIP' | 'Gold' | 'Silver' | 'Bronze';

const EARNING_RULES = [
  { key: 'spend', label: '₦100 spent = 1 point', desc: 'Earned on every settled basket above ₦500', enabled: true },
  { key: 'birthday', label: '2x birthday week bonus', desc: 'Auto-applied during member birthday week', enabled: true },
  { key: 'review', label: '+100 points for reviews', desc: 'Awarded once per verified Google/Vemtap review', enabled: true },
  { key: 'referral', label: '+250 points for referrals', desc: 'When a referred guest makes their first order', enabled: true },
  { key: 'checkin', label: '+50 points for walk-in tap', desc: 'On-premise NFC/QR counter check-in', enabled: false },
];

const REWARDS_CATALOG = [
  { id: 'rew-01', name: 'Free Appetiser', cost: 500, desc: 'Any classic starter menu item', redeemed: 86, active: true },
  { id: 'rew-02', name: '₦5,000 Dining Voucher', cost: 1200, desc: 'Applies to bills above ₦15,000', redeemed: 41, active: true },
  { id: 'rew-03', name: 'Complimentary Dessert', cost: 650, desc: 'Chef selection dessert, dine-in only', redeemed: 23, active: true },
  { id: 'rew-04', name: 'Sunday Brunch Upgrade', cost: 2400, desc: 'Free sparkling mocktail + dessert pair', redeemed: 12, active: true },
];

export function BusinessLoyaltyScreen({ onTab, onOpenRewards }: BusinessLoyaltyScreenProps) {
  const [viewMode, setViewMode] = useState<LoyaltyViewMode>('action-picker');
  const [setupTab, setSetupTab] = useState<SetupTab>('rules');

  // Customer Loyalty State
  const [members, setMembers] = useState<LoyaltyMember[]>(INITIAL_LOYALTY_MEMBERS);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>(INITIAL_LOYALTY_TRANSACTIONS);
  const [searchMember, setSearchMember] = useState('');
  const [tierFilter, setTierFilter] = useState<MemberTierFilter>('all');

  // Modal States
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
  const [pointsDelta, setPointsDelta] = useState<number>(100);
  const [pointsMode, setPointsMode] = useState<'award' | 'deduct'>('award');
  const [pointsReason, setPointsReason] = useState('Counter Purchase');
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustTier, setNewCustTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'VIP'>('Bronze');
  const [newCustBonus, setNewCustBonus] = useState('100');

  // Product & Service Points State
  const [assignments, setAssignments] = useState<LoyaltyPointAssignment[]>(INITIAL_PRODUCT_ASSIGNMENTS);
  const [searchProduct, setSearchProduct] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTarget, setBulkTarget] = useState<'all' | 'product' | 'service'>('all');
  const [bulkPointsValue, setBulkPointsValue] = useState('50');

  // Earning Rules State
  const [rules, setRules] = useState(EARNING_RULES);
  const [programmeActive, setProgrammeActive] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (tierFilter !== 'all' && m.tier !== tierFilter) return false;
      if (searchMember.trim()) {
        const q = searchMember.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesPhone = m.phone.toLowerCase().includes(q);
        const matchesId = m.id.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesId) return false;
      }
      return true;
    });
  }, [members, tierFilter, searchMember]);

  // Filtered Products & Services
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (searchProduct.trim()) {
        const q = searchProduct.toLowerCase().trim();
        return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [assignments, typeFilter, searchProduct]);

  // Total summary stats
  const totalPoints = useMemo(() => members.reduce((sum, m) => sum + m.points, 0), [members]);

  const handleOpenAwardModal = (member: LoyaltyMember) => {
    setSelectedMember(member);
    setPointsDelta(100);
    setPointsMode('award');
    setPointsReason('Counter Purchase');
    setIsAwardModalOpen(true);
  };

  const handleConfirmPoints = () => {
    if (!selectedMember || pointsDelta <= 0) return;
    const finalDelta = pointsMode === 'award' ? pointsDelta : -pointsDelta;

    setMembers((prev) =>
      prev.map((m) => (m.id === selectedMember.id ? { ...m, points: Math.max(0, m.points + finalDelta) } : m))
    );

    const newTx: LoyaltyTransaction = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      points: finalDelta,
      reason: pointsReason,
      staff: 'Current Till Cashier',
      date: 'Just now',
    };
    setTransactions((prev) => [newTx, ...prev]);

    setIsAwardModalOpen(false);
    showToast(`${pointsMode === 'award' ? 'Awarded' : 'Deducted'} ${pointsDelta} pts for ${selectedMember.name}`);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showToast('Name and phone number are required');
      return;
    }

    const bonus = parseInt(newCustBonus, 10) || 0;
    const newMember: LoyaltyMember = {
      id: `CUST-${Math.floor(4000 + Math.random() * 900)}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || undefined,
      tier: newCustTier,
      points: bonus,
      totalSpent: 0,
      lastVisit: 'Just joined',
      joinedDate: 'Today',
    };

    setMembers((prev) => [newMember, ...prev]);

    if (bonus > 0) {
      setTransactions((prev) => [
        {
          id: `TX-${Date.now().toString().slice(-4)}`,
          memberId: newMember.id,
          memberName: newMember.name,
          points: bonus,
          reason: 'Welcome Signup Bonus',
          staff: 'Till Cashier',
          date: 'Just now',
        },
        ...prev,
      ]);
    }

    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    showToast(`Registered ${newMember.name} (+${bonus} welcome pts)`);
  };

  const handleBulkAssign = () => {
    const val = parseInt(bulkPointsValue, 10) || 0;
    setAssignments((prev) =>
      prev.map((item) => {
        if (bulkTarget === 'all' || item.type === bulkTarget) {
          return { ...item, points: val };
        }
        return item;
      })
    );
    setIsBulkModalOpen(false);
    showToast(`Assigned ${val} points to ${bulkTarget === 'all' ? 'all catalog items' : bulkTarget + 's'}`);
  };

  const handleUpdateItemPoints = (id: string, pts: number) => {
    setAssignments((prev) => prev.map((item) => (item.id === id ? { ...item, points: Math.max(0, pts) } : item)));
  };

  return (
    <AppScreen>
      <BusinessModeHeader title="Loyalty & Rewards" />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* ========================================================================= */}
        {/* VIEW 1: ACTION PICKER (WHAT WOULD YOU LIKE TO DO?) */}
        {/* ========================================================================= */}
        {viewMode === 'action-picker' && (
          <div className="flex flex-col gap-3.5 px-margin pt-space-sm animate-in fade-in duration-200">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-canvas rounded-xl p-2.5 shadow-2xs border border-border/50 text-left">
                <span className="text-[10px] text-text-tertiary block font-medium">Members</span>
                <span className="text-[14px] font-bold text-on-surface">{members.length}</span>
                <span className="text-[9px] text-primary block font-medium">+3 this week</span>
              </div>
              <div className="bg-surface-canvas rounded-xl p-2.5 shadow-2xs border border-border/50 text-left">
                <span className="text-[10px] text-text-tertiary block font-medium">Points Held</span>
                <span className="text-[14px] font-bold text-primary">{totalPoints.toLocaleString()}</span>
                <span className="text-[9px] text-text-tertiary block font-medium">In circulation</span>
              </div>
              <div className="bg-surface-canvas rounded-xl p-2.5 shadow-2xs border border-border/50 text-left">
                <span className="text-[10px] text-text-tertiary block font-medium">Rewards</span>
                <span className="text-[14px] font-bold text-on-surface">{REWARDS_CATALOG.length}</span>
                <span className="text-[9px] text-badge-discount-text block font-medium">Active perks</span>
              </div>
            </div>

            {/* Prompt Heading */}
            <div className="pt-1">
              <h2 className="text-[14px] font-bold text-on-surface">What would you like to do?</h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Award points to visiting customers or configure rewards &amp; product points.
              </p>
            </div>

            {/* Action Cards */}
            <div className="flex flex-col gap-2.5">
              {/* Option 1: Give Points to Customer */}
              <button
                type="button"
                onClick={() => setViewMode('give-points')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-surface-tint-blue/40 via-surface-canvas to-surface-canvas border border-primary/25 shadow-xs hover:shadow-md active:scale-[0.99] transition-all text-left flex items-start gap-3 group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Icon name="stars" className="text-[24px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary text-white">
                      Customer Points
                    </span>
                    <span className="text-[10px] text-text-tertiary font-medium">• Search &amp; Award</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-on-surface mt-1">Give Points to Customer</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
                    Search customer list, add new customers, award bonus points, deduct redemptions, and view live point balances.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-primary text-[11px] font-bold">
                    <span>Open Customer Points</span>
                    <Icon name="arrow_forward" className="text-[14px]" />
                  </div>
                </div>
              </button>

              {/* Option 2: Setup Reward & Point Rules */}
              <button
                type="button"
                onClick={() => setViewMode('setup-rewards')}
                className="w-full p-3.5 rounded-2xl bg-surface-canvas border border-border/80 shadow-xs hover:shadow-md active:scale-[0.99] transition-all text-left flex items-start gap-3 group"
              >
                <div className="w-11 h-11 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon name="tune" className="text-[22px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                      Configuration
                    </span>
                    <span className="text-[10px] text-text-tertiary font-medium">• Products &amp; Perks</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-on-surface mt-1">Setup Reward &amp; Point Rules</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
                    Set up earning formulas, redeemable reward perks, and assign bonus points to products and services individually or in bulk.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-secondary text-[11px] font-bold">
                    <span>Configure Rewards &amp; Points</span>
                    <Icon name="arrow_forward" className="text-[14px]" />
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Point Activity Preview */}
            <div className="mt-2 bg-surface-canvas rounded-xl p-3 border border-border/60 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-on-surface">Recent Point Activity</span>
                <span className="text-[10px] text-text-tertiary">{transactions.length} events</span>
              </div>
              <div className="divide-y divide-border/50">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="py-2 flex items-center justify-between text-[11px] gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">{tx.memberName}</p>
                      <span className="text-[10px] text-text-tertiary truncate block">{tx.reason}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-bold block text-[11px] ${
                          tx.points > 0 ? 'text-badge-discount-text' : 'text-error'
                        }`}
                      >
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                      <span className="text-[9px] text-text-tertiary">{tx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: GIVE POINTS TO CUSTOMER */}
        {/* ========================================================================= */}
        {viewMode === 'give-points' && (
          <div className="flex flex-col gap-2.5 px-margin pt-space-xs animate-in fade-in duration-200">
            {/* Top Navigation Strip */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setViewMode('action-picker')}
                className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                <Icon name="arrow_back" className="text-[14px]" />
                <span>Back to Options</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(true)}
                className="h-7 px-2.5 rounded-lg bg-primary text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
              >
                <Icon name="person_add" className="text-[14px]" />
                <span>Add Customer</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-tertiary"
              />
              <input
                type="search"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search customer by name, phone, email, or ID..."
                className="w-full h-8 pl-9 pr-7 rounded-xl border border-border bg-surface-container-lowest text-[12px] text-on-surface placeholder:text-text-tertiary focus:outline-hidden focus:border-primary transition-all"
              />
              {searchMember && (
                <button
                  type="button"
                  onClick={() => setSearchMember('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary p-0.5"
                >
                  <Icon name="close" className="text-[14px]" />
                </button>
              )}
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { key: 'all' as const, label: 'All Members', count: members.length },
                { key: 'VIP' as const, label: 'VIP Spenders', count: members.filter((m) => m.tier === 'VIP').length },
                { key: 'Gold' as const, label: 'Gold Tier', count: members.filter((m) => m.tier === 'Gold').length },
                { key: 'Silver' as const, label: 'Silver', count: members.filter((m) => m.tier === 'Silver').length },
                { key: 'Bronze' as const, label: 'Bronze', count: members.filter((m) => m.tier === 'Bronze').length },
              ].map((tier) => {
                const active = tierFilter === tier.key;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setTierFilter(tier.key)}
                    className={`shrink-0 h-7 px-2.5 rounded-full text-[11px] font-medium active:scale-95 transition-all flex items-center gap-1 border ${
                      active
                        ? 'bg-surface-tint-blue text-primary border-primary/30 font-semibold'
                        : 'bg-surface-container-low text-text-secondary border-transparent'
                    }`}
                  >
                    <span>{tier.label}</span>
                    <span className="text-[10px] opacity-75">({tier.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Customer List */}
            <div className="flex flex-col gap-2 mt-1">
              {filteredMembers.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-xl bg-surface-canvas border border-dashed border-border">
                  <Icon name="person_search" className="text-[28px] text-text-tertiary mx-auto mb-1" />
                  <p className="text-[12px] font-bold text-on-surface">No customers found</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">Try searching with a different name or phone number.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="mt-2.5 px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold"
                  >
                    Register new customer
                  </button>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-surface-canvas border border-border/70 shadow-2xs flex flex-col gap-2 text-left"
                  >
                    {/* Top Row: Name, Phone, Points Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-surface-tint-blue text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[12px] font-bold text-on-surface truncate">{member.name}</span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                member.tier === 'VIP'
                                  ? 'bg-purple-100 text-purple-700'
                                  : member.tier === 'Gold'
                                  ? 'bg-amber-100 text-amber-800'
                                  : member.tier === 'Silver'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {member.tier}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-tertiary block truncate">{member.phone}</span>
                        </div>
                      </div>

                      {/* Points pill */}
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-bold text-[12px]">
                          <Icon name="stars" className="text-[13px]" />
                          <span>{member.points.toLocaleString()} pts</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Last visit & Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                      <span className="text-text-tertiary">
                        Last visit: <span className="text-text-secondary font-medium">{member.lastVisit}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAwardModal(member)}
                        className="h-7 px-3 rounded-lg bg-primary text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                      >
                        <Icon name="add_circle" className="text-[14px]" />
                        <span>Give Points</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SETUP REWARD & POINT RULES */}
        {/* ========================================================================= */}
        {viewMode === 'setup-rewards' && (
          <div className="flex flex-col gap-2.5 px-margin pt-space-xs animate-in fade-in duration-200">
            {/* Top Navigation Strip */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setViewMode('action-picker')}
                className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                <Icon name="arrow_back" className="text-[14px]" />
                <span>Back to Options</span>
              </button>
              <button
                type="button"
                onClick={onOpenRewards}
                className="text-[11px] font-semibold text-text-secondary hover:text-on-surface flex items-center gap-0.5"
              >
                <span>Reward Perks</span>
                <Icon name="chevron_right" className="text-[14px]" />
              </button>
            </div>

            {/* Setup Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-low">
              {[
                { key: 'rules' as const, label: 'Rules' },
                { key: 'rewards' as const, label: 'Rewards' },
                { key: 'products' as const, label: 'Products & Pts' },
              ].map((tab) => {
                const active = setupTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSetupTab(tab.key)}
                    className={`h-7.5 rounded-lg text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-surface-canvas text-primary font-bold shadow-2xs'
                        : 'text-text-secondary hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: RULES */}
            {setupTab === 'rules' && (
              <div className="flex flex-col gap-2.5">
                {/* Programme Switch */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-surface-tint-blue/50 to-surface-canvas border border-primary/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-[12px] font-bold text-on-surface">Loyalty Programme is {programmeActive ? 'Active' : 'Paused'}</h3>
                    <p className="text-[10px] text-text-secondary">Customers earn points automatically on eligible orders</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProgrammeActive((v) => !v);
                      showToast(programmeActive ? 'Programme paused' : 'Programme activated');
                    }}
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${
                      programmeActive ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${
                        programmeActive ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Earning Rules List */}
                <div className="bg-surface-canvas rounded-xl p-2.5 border border-border shadow-2xs flex flex-col divide-y divide-border/60">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider pb-1.5">
                    Points Earning Rules
                  </span>
                  {rules.map((rule) => (
                    <div key={rule.key} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-on-surface block truncate">{rule.label}</span>
                        <span className="text-[10px] text-text-tertiary block truncate">{rule.desc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRules((prev) =>
                            prev.map((r) => (r.key === rule.key ? { ...r, enabled: !r.enabled } : r))
                          );
                        }}
                        className={`w-8 h-4.5 rounded-full relative shrink-0 transition-colors ${
                          rule.enabled ? 'bg-primary' : 'bg-surface-container-highest'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${
                            rule.enabled ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: REWARDS CATALOG */}
            {setupTab === 'rewards' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface">Redeemable Rewards</span>
                  <button
                    type="button"
                    onClick={onOpenRewards}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    + Add New Reward
                  </button>
                </div>
                {REWARDS_CATALOG.map((rew) => (
                  <div
                    key={rew.id}
                    className="p-3 rounded-xl bg-surface-canvas border border-border shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-on-surface truncate">{rew.name}</span>
                        <span className="text-[10px] font-bold text-badge-discount-text px-1.5 py-0.2 rounded bg-badge-discount-bg">
                          {rew.cost} pts
                        </span>
                      </div>
                      <span className="text-[10px] text-text-tertiary block truncate mt-0.5">{rew.desc}</span>
                    </div>
                    <span className="text-[10px] text-text-secondary shrink-0 font-medium">
                      {rew.redeemed} claimed
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: PRODUCT & SERVICE POINT ASSIGNMENTS */}
            {setupTab === 'products' && (
              <div className="flex flex-col gap-2">
                {/* Search & Bulk Action Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Icon
                      name="search"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-text-tertiary"
                    />
                    <input
                      type="search"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      placeholder="Filter product or service..."
                      className="w-full h-7.5 pl-8 pr-2.5 rounded-lg border border-border bg-surface-container-lowest text-[11px] text-on-surface placeholder:text-text-tertiary focus:outline-hidden focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(true)}
                    className="h-7.5 px-2.5 rounded-lg bg-surface-tint-blue text-primary border border-primary/30 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shrink-0"
                  >
                    <Icon name="auto_awesome" className="text-[14px]" />
                    <span>Bulk Assign</span>
                  </button>
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-1">
                  {[
                    { key: 'all' as const, label: 'All Items' },
                    { key: 'product' as const, label: 'Products' },
                    { key: 'service' as const, label: 'Services' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setTypeFilter(f.key)}
                      className={`h-6 px-2 rounded-md text-[10px] font-medium border ${
                        typeFilter === f.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low text-text-secondary border-transparent'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-1.5">
                  {filteredAssignments.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-surface-canvas border border-border/70 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-on-surface truncate">{item.name}</span>
                          <span
                            className={`text-[8px] font-bold uppercase px-1 rounded ${
                              item.type === 'service' ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-tint-blue text-primary'
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-tertiary block">
                          {item.category} • ₦{item.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Points Control */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center border border-border rounded-lg bg-surface-container-lowest overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemPoints(item.id, item.points - 5)}
                            className="w-6 h-6 flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-[11px] font-bold text-primary">
                            {item.points}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemPoints(item.id, item.points + 5)}
                            className="w-6 h-6 flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[9px] text-text-tertiary font-medium">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AWARD / ADJUST POINTS */}
      {/* ========================================================================= */}
      {isAwardModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAwardModalOpen(false)} />
          <div className="relative w-full max-w-[380px] bg-surface rounded-2xl shadow-xl border border-border p-4 flex flex-col gap-3 z-10 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon name="stars" className="text-[18px] text-primary" />
                <h3 className="text-[13px] font-bold text-on-surface">Award Customer Points</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:bg-surface-container"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>

            {/* Member Info Card */}
            <div className="p-2.5 rounded-xl bg-surface-tint-blue/30 border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-on-surface">{selectedMember.name}</p>
                <span className="text-[10px] text-text-tertiary">{selectedMember.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-tertiary block">Current Balance</span>
                <span className="text-[13px] font-bold text-primary">{selectedMember.points} pts</span>
              </div>
            </div>

            {/* Mode: Award (+) vs Deduct (-) */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-container-low">
              <button
                type="button"
                onClick={() => setPointsMode('award')}
                className={`h-7.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  pointsMode === 'award'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-on-surface'
                }`}
              >
                <Icon name="add" className="text-[14px]" />
                <span>Give Points (+)</span>
              </button>
              <button
                type="button"
                onClick={() => setPointsMode('deduct')}
                className={`h-7.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  pointsMode === 'deduct'
                    ? 'bg-error text-white shadow-xs'
                    : 'text-text-secondary hover:text-on-surface'
                }`}
              >
                <Icon name="remove" className="text-[14px]" />
                <span>Deduct Points (-)</span>
              </button>
            </div>

            {/* Quick Points Buttons */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase">Select Points</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPointsDelta(amt)}
                    className={`h-8 rounded-lg text-[11px] font-bold border transition-all ${
                      pointsDelta === amt
                        ? 'bg-surface-tint-blue text-primary border-primary'
                        : 'bg-surface-container-lowest text-text-secondary border-border'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Points Input */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-secondary font-medium">Custom Amount:</span>
              <input
                type="number"
                min="1"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-24 h-7.5 px-2 rounded-lg border border-border bg-surface-container-lowest text-[12px] font-bold text-on-surface text-center focus:outline-hidden focus:border-primary"
              />
              <span className="text-[11px] text-text-tertiary font-bold">pts</span>
            </div>

            {/* Reason Dropdown / Note */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase">Reason / Note</span>
              <select
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                className="w-full h-8 px-2.5 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface focus:outline-hidden focus:border-primary"
              >
                <option value="Counter Purchase">Counter Purchase</option>
                <option value="Referral Reward">Referral Reward</option>
                <option value="Birthday Bonus">Birthday Surprise Bonus</option>
                <option value="Review Bonus">Verified Review Bonus</option>
                <option value="Goodwill Perk">Goodwill Customer Perk</option>
                <option value="Manual Adjustment">Manual Staff Adjustment</option>
              </select>
            </div>

            {/* Balance Preview */}
            <div className="p-2 rounded-lg bg-surface-container-low text-[11px] flex items-center justify-between text-text-secondary">
              <span>New member balance:</span>
              <span className="font-bold text-on-surface">
                {selectedMember.points} →{' '}
                <span className="text-primary font-extrabold">
                  {Math.max(0, selectedMember.points + (pointsMode === 'award' ? pointsDelta : -pointsDelta))} pts
                </span>
              </span>
            </div>

            {/* Action Button */}
            <div className="pt-1 flex items-center gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAwardModalOpen(false)}
                className="flex-1 h-8 rounded-xl border border-border text-[11px] font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPoints}
                className="flex-1 h-8 rounded-xl bg-primary text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              >
                Confirm &amp; Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW CUSTOMER */}
      {/* ========================================================================= */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAddCustomerOpen(false)} />
          <form
            onSubmit={handleAddCustomer}
            className="relative w-full max-w-[380px] bg-surface rounded-2xl shadow-xl border border-border p-4 flex flex-col gap-3 z-10 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon name="person_add" className="text-[18px] text-primary" />
                <h3 className="text-[13px] font-bold text-on-surface">Register Loyalty Customer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:bg-surface-container"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Full Name *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Amina Bello"
                className="w-full h-8 px-2.5 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Phone Number *</label>
              <input
                type="tel"
                required
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="e.g. 0803 456 7890"
                className="w-full h-8 px-2.5 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Email (Optional)</label>
              <input
                type="email"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                placeholder="e.g. amina@example.com"
                className="w-full h-8 px-2.5 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Initial Tier</label>
                <select
                  value={newCustTier}
                  onChange={(e) => setNewCustTier(e.target.value as any)}
                  className="w-full h-8 px-2 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface focus:outline-hidden focus:border-primary"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Welcome Points</label>
                <input
                  type="number"
                  value={newCustBonus}
                  onChange={(e) => setNewCustBonus(e.target.value)}
                  placeholder="100"
                  className="w-full h-8 px-2.5 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 border-t border-border mt-1">
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="flex-1 h-8 rounded-xl border border-border text-[11px] font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-8 rounded-xl bg-primary text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              >
                Save Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BULK ASSIGN POINTS TO PRODUCTS & SERVICES */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsBulkModalOpen(false)} />
          <div className="relative w-full max-w-[380px] bg-surface rounded-2xl shadow-xl border border-border p-4 flex flex-col gap-3 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon name="auto_awesome" className="text-[18px] text-primary" />
                <h3 className="text-[13px] font-bold text-on-surface">Bulk Assign Points</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-tertiary hover:bg-surface-container"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Apply Target</label>
              <select
                value={bulkTarget}
                onChange={(e) => setBulkTarget(e.target.value as any)}
                className="w-full h-8 px-2.5 rounded-xl border border-border bg-surface-container-lowest text-[11px] text-on-surface focus:outline-hidden focus:border-primary"
              >
                <option value="all">All Items (Products &amp; Services)</option>
                <option value="product">Products Only</option>
                <option value="service">Services Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Bonus Points Per Item</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={bulkPointsValue}
                  onChange={(e) => setBulkPointsValue(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-xl border border-border bg-surface-container-lowest text-[12px] font-bold text-on-surface focus:outline-hidden focus:border-primary"
                />
                <span className="text-[11px] text-text-tertiary font-bold shrink-0">points</span>
              </div>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Every customer purchasing an item in this group will earn this bonus amount.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 border-t border-border mt-1">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="flex-1 h-8 rounded-xl border border-border text-[11px] font-semibold text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAssign}
                className="flex-1 h-8 rounded-xl bg-primary text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              >
                Apply to All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-[360px] z-60 rounded-xl bg-inverse-surface text-on-inverse-surface px-4 py-2 text-[11px] font-medium shadow-lg">
          {toast}
        </div>
      )}

      <BusinessTabBar onTab={onTab} />
    </AppScreen>
  );
}
