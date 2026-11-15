import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Eye,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  FormLabel,
  ItemThumbnail,
  Modal,
  StatusBadge,
  inputBaseClasses,
} from '../ui/DesignSystem';
import { formatDisplayDate, formatShortTimestamp, portalApi } from '../../lib/api';
import type {
  ActivityLog,
  AdminUserSummary,
  AppView,
  ClaimRecord,
  ClaimStatus,
  DashboardStats,
  ItemStatus,
  LostFoundItem,
  User,
} from '../../types';

// 1. Admin Dashboard Overview
interface AdminDashboardViewProps {
  stats: DashboardStats;
  claims: ClaimRecord[];
  items: LostFoundItem[];
  activities: ActivityLog[];
  users: AdminUserSummary[];
  onNavigate: (view: AppView, itemId?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  claims,
  items,
  activities,
  users,
  onNavigate,
}) => {
  const pendingClaims = claims.filter((c) => c.status === 'pending');
  const approvedClaims = claims.filter((c) => c.status === 'approved');

  return (
    <div className="space-y-8">
      {/* Institutional Banner */}
      <Card padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#B99A55] mb-1.5">
              Campus Property Administration
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#172B45]">
              Registry Operations &amp; Claim Verification
            </h2>
            <p className="text-sm text-[#777777] mt-1.5 max-w-2xl leading-relaxed">
              Review submitted ownership proofs against confidential custody records, manage campus
              inventory statuses, and oversee verified student accounts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Button variant="secondary" onClick={() => onNavigate('admin-listings')}>
              <ClipboardList className="w-4 h-4" />
              <span>Manage Listings</span>
            </Button>
            <Button variant="primary" onClick={() => onNavigate('admin-claims')}>
              <ShieldCheck className="w-4 h-4 text-[#B99A55]" />
              <span>Verify Claims ({pendingClaims.length})</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Admin KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Pending Verification
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#7D6124] tabular-nums">
            {stats.pendingClaimsCount}
          </div>
          <div className="mt-1 text-xs text-[#777777]">
            {approvedClaims.length} awaiting pickup handoff
          </div>
        </Card>

        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Active Campus Listings
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#172B45] tabular-nums">
            {items.length}
          </div>
          <div className="mt-1 text-xs text-[#777777] tabular-nums">
            {stats.totalLost} lost · {stats.totalFound} found
          </div>
        </Card>

        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Items Returned
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#215A38] tabular-nums">
            {stats.returnedCount}
          </div>
          <div className="mt-1 text-xs text-[#777777] tabular-nums">
            {stats.recoveryRate}% overall resolution rate
          </div>
        </Card>

        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Registered Accounts
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#172B45] tabular-nums">
            {users.length}
          </div>
          <div className="mt-1 text-xs text-[#777777]">
            {users.filter((u) => u.status === 'active').length} active campus members
          </div>
        </Card>
      </div>

      {/* Two-Column Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Claims Requiring Action */}
        <Card padding="none" className="lg:col-span-7 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E4DA] flex items-center justify-between bg-[#F8F6F0]/60">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#172B45]">
                Claims Requiring Review
              </h3>
              <p className="text-xs text-[#777777]">
                Pending ownership proofs and approved items ready for release
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin-claims')}
              className="text-xs font-medium text-[#172B45] hover:text-[#B99A55] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Open queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E8E4DA]">
            {[...pendingClaims, ...approvedClaims].slice(0, 5).length === 0 ? (
              <div className="p-8 text-center text-sm text-[#777777]">
                All submitted claims have been processed.
              </div>
            ) : (
              [...pendingClaims, ...approvedClaims].slice(0, 5).map((claim) => (
                <div
                  key={claim.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F6F0]/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#777777]">
                      <span className="font-mono font-semibold text-[#172B45]">
                        {claim.claimCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{claim.claimantName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{claim.claimantStudentId}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#252A32] truncate mt-0.5">
                      {claim.itemTitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusBadge status={claim.status} />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigate('admin-claims')}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Activity & Reports Feed */}
        <Card padding="none" className="lg:col-span-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E4DA] bg-[#F8F6F0]/60 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#172B45]">
                Campus Activity Ledger
              </h3>
              <p className="text-xs text-[#777777]">Recent registry &amp; custody actions</p>
            </div>
            <Activity className="w-4 h-4 text-[#B99A55]" />
          </div>
          <div className="divide-y divide-[#E8E4DA] max-h-[380px] overflow-y-auto">
            {activities.map((act) => (
              <div key={act.id} className="px-6 py-3.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#172B45]">{act.action}</span>
                  <span className="font-mono text-[#777777] tabular-nums">{act.targetCode}</span>
                </div>
                <p className="text-xs text-[#252A32]/85 mt-1 leading-relaxed">{act.detail}</p>
                <div className="text-[11px] text-[#777777] mt-1">
                  {act.actorName} · {formatShortTimestamp(act.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// 2. Admin Claims Verification View
interface AdminClaimsViewProps {
  claims: ClaimRecord[];
  onClaimReviewed: () => Promise<void>;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export const AdminClaimsView: React.FC<AdminClaimsViewProps> = ({
  claims,
  onClaimReviewed,
  onNotify,
}) => {
  const [filter, setFilter] = useState<'all' | ClaimStatus>('all');
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const visibleClaims = useMemo(() => {
    if (filter === 'all') return claims;
    return claims.filter((c) => c.status === filter);
  }, [claims, filter]);

  const openVerificationModal = (claim: ClaimRecord) => {
    setSelectedClaim(claim);
    setReviewerNotes(claim.reviewerNotes || '');
    setPickupInstructions(
      claim.pickupInstructions ||
        'Bring your Aldenbrook Student ID to Founders Hall Room 102 (Mon–Fri, 9:00 AM – 5:00 PM) to sign the release ledger.'
    );
  };

  const handleDecision = async (status: ClaimStatus) => {
    if (!selectedClaim) return;
    setSaving(true);
    try {
      await portalApi.reviewClaim(selectedClaim.id, {
        status,
        reviewerNotes,
        pickupInstructions: status === 'approved' ? pickupInstructions : undefined,
      });
      await onClaimReviewed();
      setSelectedClaim(null);
      onNotify(`Claim ${selectedClaim.claimCode} updated to ${status}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to review claim.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center p-1 bg-white border border-[#E8E4DA] rounded-md">
          {(['all', 'pending', 'approved', 'returned', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded capitalize transition-colors cursor-pointer ${
                filter === status
                  ? 'bg-[#172B45] text-white'
                  : 'text-[#777777] hover:text-[#252A32]'
              }`}
            >
              {status === 'all' ? 'All Claims' : status}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#777777] tabular-nums">
          Showing {visibleClaims.length} claim records
        </span>
      </div>

      {visibleClaims.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-5 h-5" />}
          title="No claims in this queue"
          description="Submitted ownership claims matching this filter will appear here for custody verification."
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E4DA] bg-[#F8F6F0]/80 text-[11px] font-semibold uppercase tracking-wider text-[#777777]">
                  <th className="py-3.5 px-5">Claim ID</th>
                  <th className="py-3.5 px-4">Item &amp; Code</th>
                  <th className="py-3.5 px-4">Claimant</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DA] text-sm">
                {visibleClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-[#F8F6F0]/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#172B45] whitespace-nowrap">
                      {claim.claimCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#252A32] max-w-xs truncate">
                        {claim.itemTitle}
                      </div>
                      <div className="text-xs font-mono text-[#777777]">
                        {claim.itemAccessionCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#252A32]">{claim.claimantName}</div>
                      <div className="text-xs font-mono text-[#777777]">
                        {claim.claimantStudentId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#777777] tabular-nums whitespace-nowrap">
                      {formatDisplayDate(claim.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Button
                        variant={claim.status === 'pending' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => openVerificationModal(claim)}
                      >
                        {claim.status === 'pending'
                          ? 'Verify Proof'
                          : claim.status === 'approved'
                          ? 'Manage Handoff'
                          : 'Inspect'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Claim Verification & Decision Modal */}
      <Modal
        open={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        title="Verify Ownership Proof"
        subtitle={
          selectedClaim
            ? `${selectedClaim.claimCode} · ${selectedClaim.itemAccessionCode}`
            : undefined
        }
        maxWidth="xl"
      >
        {selectedClaim && (
          <div className="space-y-5">
            {/* Item Summary */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-md bg-[#F8F6F0] border border-[#E8E4DA]">
              <div className="w-full sm:w-32 aspect-[4/3] rounded overflow-hidden border border-[#E8E4DA] bg-white shrink-0">
                <ItemThumbnail
                  imageKey={selectedClaim.itemImageKey}
                  imageUrl={selectedClaim.itemImageUrl}
                  title={selectedClaim.itemTitle || 'Item'}
                  category={selectedClaim.itemCategory || 'Everyday Gear'}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#777777]">
                    {selectedClaim.itemAccessionCode}
                  </span>
                  <StatusBadge status={selectedClaim.status} />
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#172B45] mt-0.5">
                  {selectedClaim.itemTitle}
                </h4>
                <div className="mt-2 p-2.5 rounded bg-white border border-[#E8E4DA] text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#813D42] block mb-0.5">
                    Confidential Custody Record (Internal Only)
                  </span>
                  <span className="text-[#252A32]">
                    {selectedClaim.itemConfidentialDetails ||
                      'No confidential note recorded by finder.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Claimant Submission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-md border border-[#E8E4DA]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Claimant Identity
                </div>
                <div className="font-semibold text-[#172B45]">{selectedClaim.claimantName}</div>
                <div className="text-xs font-mono text-[#777777] mt-0.5">
                  {selectedClaim.claimantStudentId}
                </div>
                <div className="text-xs text-[#252A32] mt-1">{selectedClaim.claimantEmail}</div>
                <div className="text-xs text-[#252A32] mt-0.5">{selectedClaim.contactPhone}</div>
              </div>

              <div className="p-4 rounded-md border border-[#E8E4DA]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Preferred Pickup &amp; Marks
                </div>
                <div className="text-xs font-medium text-[#172B45]">
                  {selectedClaim.preferredPickup}
                </div>
                <p className="text-xs text-[#252A32] mt-2 leading-relaxed">
                  <strong>Distinguishing Marks:</strong> {selectedClaim.distinguishingMarks}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-md border border-[#E8E4DA] bg-[#F8F6F0]/40">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1">
                Submitted Ownership Proof
              </div>
              <p className="text-sm text-[#252A32] leading-relaxed">
                {selectedClaim.ownershipProof}
              </p>
            </div>

            {/* Reviewer Controls */}
            <div className="space-y-4 pt-3 border-t border-[#E8E4DA]">
              <div>
                <FormLabel htmlFor="admin-notes">Administrator Verification Notes</FormLabel>
                <textarea
                  id="admin-notes"
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Record verification outcome or reason for rejection..."
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <FormLabel htmlFor="admin-pickup">
                  Pickup Instructions (Sent to Student on Approval)
                </FormLabel>
                <input
                  id="admin-pickup"
                  type="text"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className={inputBaseClasses}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4DA] flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" onClick={() => setSelectedClaim(null)}>
                Close
              </Button>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="burgundy"
                  loading={saving}
                  onClick={() => handleDecision('rejected')}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Claim</span>
                </Button>
                <Button
                  variant="gold"
                  loading={saving}
                  onClick={() => handleDecision('approved')}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Claim</span>
                </Button>
                <Button
                  variant="primary"
                  loading={saving}
                  onClick={() => handleDecision('returned')}
                >
                  <RotateCcw className="w-4 h-4 text-[#B99A55]" />
                  <span>Mark Item Returned</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// 3. Admin Listings Manager
interface AdminListingsViewProps {
  items: LostFoundItem[];
  onNavigate: (view: AppView, itemId?: string) => void;
  onItemUpdated: (item: LostFoundItem) => void;
  onItemDeleted: (id: string) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export const AdminListingsView: React.FC<AdminListingsViewProps> = ({
  items,
  onNavigate,
  onItemUpdated,
  onItemDeleted,
  onNotify,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all');
  const [deletingItem, setDeletingItem] = useState<LostFoundItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (q) {
        const hay = `${i.accessionCode} ${i.title} ${i.location} ${i.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, statusFilter]);

  const handleStatusChange = async (item: LostFoundItem, nextStatus: ItemStatus) => {
    setBusyId(item.id);
    try {
      const res = await portalApi.updateItem(item.id, { status: nextStatus });
      onItemUpdated(res.item);
      onNotify(`${item.accessionCode} status updated to ${nextStatus}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to update listing.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setBusyId(deletingItem.id);
    try {
      await portalApi.deleteItem(deletingItem.id);
      onItemDeleted(deletingItem.id);
      setDeletingItem(null);
      onNotify('Listing permanently removed.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to delete listing.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter listings by code, item name, or hall..."
              className={`${inputBaseClasses} pl-10`}
            />
          </div>

          <div className="inline-flex flex-wrap items-center p-1 bg-[#F8F6F0] border border-[#E8E4DA] rounded-md">
            {(['all', 'open', 'claimed', 'returned', 'archived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#172B45] text-white'
                    : 'text-[#777777] hover:text-[#252A32]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E4DA] bg-[#F8F6F0]/80 text-[11px] font-semibold uppercase tracking-wider text-[#777777]">
                <th className="py-3.5 px-5">Accession</th>
                <th className="py-3.5 px-4">Item Title</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Location &amp; Date</th>
                <th className="py-3.5 px-4">Status Control</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DA] text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F6F0]/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#172B45] whitespace-nowrap">
                    {item.accessionCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#252A32] max-w-xs truncate">{item.title}</div>
                    <div className="text-xs text-[#777777]">{item.category}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.type} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-medium text-[#252A32]">{item.location}</div>
                    <div className="text-xs text-[#777777] tabular-nums">
                      {formatDisplayDate(item.date)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={item.status}
                      disabled={busyId === item.id}
                      onChange={(e) => handleStatusChange(item, e.target.value as ItemStatus)}
                      aria-label={`Change status for ${item.title}`}
                      className="px-2.5 py-1.5 text-xs bg-white border border-[#E8E4DA] rounded text-[#252A32] focus:outline-none focus:border-[#172B45]"
                    >
                      <option value="open">Open Case</option>
                      <option value="claimed">Claim in Review</option>
                      <option value="returned">Returned</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigate('item-details', item.id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingItem(item)}
                        className="text-[#813D42] hover:bg-[#F7ECEC]"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Delete Registry Listing"
        subtitle={deletingItem?.accessionCode}
        maxWidth="md"
      >
        <p className="text-sm text-[#252A32] leading-relaxed">
          Permanently remove <strong>{deletingItem?.title}</strong> and its associated claim
          records? This action cannot be undone.
        </p>
        <div className="mt-6 pt-4 border-t border-[#E8E4DA] flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingItem(null)}>
            Cancel
          </Button>
          <Button
            variant="burgundy"
            onClick={handleDelete}
            loading={busyId === deletingItem?.id}
          >
            Delete Listing
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// 4. Admin Users Directory
interface AdminUsersViewProps {
  users: AdminUserSummary[];
  currentUser: User;
  onUserUpdated: () => Promise<void>;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  currentUser,
  onUserUpdated,
  onNotify,
}) => {
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.name} ${u.email} ${u.studentId} ${u.department}`.toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggleStatus = async (target: AdminUserSummary) => {
    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    setBusyId(target.id);
    try {
      await portalApi.updateAdminUser(target.id, { status: nextStatus });
      await onUserUpdated();
      onNotify(`${target.name} account set to ${nextStatus}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to update account.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const toggleRole = async (target: AdminUserSummary) => {
    const nextRole = target.role === 'admin' ? 'student' : 'admin';
    setBusyId(target.id);
    try {
      await portalApi.updateAdminUser(target.id, { role: nextRole });
      await onUserUpdated();
      onNotify(`${target.name} role updated to ${nextRole}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to update role.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, student ID, or department..."
              className={`${inputBaseClasses} pl-10`}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#777777]">
            <Users className="w-4 h-4 text-[#B99A55]" />
            <span className="tabular-nums">{filtered.length} campus accounts</span>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E4DA] bg-[#F8F6F0]/80 text-[11px] font-semibold uppercase tracking-wider text-[#777777]">
                <th className="py-3.5 px-5">Member</th>
                <th className="py-3.5 px-4">ID &amp; Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DA] text-sm">
              {filtered.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-[#F8F6F0]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#172B45]">{u.name}</div>
                      <div className="text-xs text-[#777777]">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs text-[#252A32]">{u.studentId}</div>
                      <div className="text-xs text-[#777777]">{u.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#777777] tabular-nums whitespace-nowrap">
                      {u.reportsCount} reports · {u.claimsCount} claims
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isSelf || busyId === u.id}
                          onClick={() => toggleRole(u)}
                        >
                          {u.role === 'admin' ? 'Set Student' : 'Grant Admin'}
                        </Button>
                        <Button
                          variant={u.status === 'active' ? 'ghost' : 'primary'}
                          size="sm"
                          disabled={isSelf || busyId === u.id}
                          onClick={() => toggleStatus(u)}
                          className={
                            u.status === 'active'
                              ? 'text-[#813D42] hover:bg-[#F7ECEC]'
                              : ''
                          }
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
