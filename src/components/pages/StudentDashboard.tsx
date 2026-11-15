import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  FilePlus2,
  FolderSearch,
  Search,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  ItemThumbnail,
  StatusBadge,
} from '../ui/DesignSystem';
import { formatDisplayDate } from '../../lib/api';
import type {
  AppView,
  ClaimRecord,
  DashboardStats,
  LostFoundItem,
  User,
} from '../../types';

interface StudentDashboardProps {
  user: User;
  stats: DashboardStats;
  items: LostFoundItem[];
  myReports: LostFoundItem[];
  myClaims: ClaimRecord[];
  onNavigate: (view: AppView, id?: string) => void;
  onQuickSearch: (query: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  stats,
  items,
  myReports,
  myClaims,
  onNavigate,
  onQuickSearch,
}) => {
  const [quickQuery, setQuickQuery] = useState('');
  const firstName = user.name.split(' ')[0] || user.name;

  const latestListings = items.filter((i) => i.status !== 'archived').slice(0, 6);
  const activeReports = myReports.filter((r) => r.status !== 'returned' && r.status !== 'archived');
  const pendingClaims = myClaims.filter((c) => c.status === 'pending' || c.status === 'approved');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch(quickQuery);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Primary Actions */}
      <Card padding="lg" className="bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-widest text-[#B99A55] mb-2">
              Campus Belongings Desk · Aldenbrook University
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#172B45] leading-snug">
              Welcome back, {firstName}.
            </h2>
            <p className="text-sm text-[#777777] mt-2 leading-relaxed">
              Search verified campus property records, file a misplaced item report, or log found
              belongings to help return them safely to their owners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="burgundy"
              size="lg"
              onClick={() => onNavigate('report-lost')}
            >
              <FolderSearch className="w-4 h-4" />
              <span>Report Lost Item</span>
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('report-found')}
            >
              <FilePlus2 className="w-4 h-4 text-[#B99A55]" />
              <span>Report Found Item</span>
            </Button>
          </div>
        </div>

        {/* Quick Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 pt-6 border-t border-[#E8E4DA] flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search by item name, library, hall, or accession number (e.g., laptop, wallet, LF-2026)..."
              aria-label="Quick search campus items"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8F6F0] border border-[#E8E4DA] rounded-md text-[#252A32] placeholder:text-[#777777] focus:outline-none focus:bg-white focus:border-[#172B45] transition-colors"
            />
          </div>
          <Button type="submit" variant="secondary" size="lg">
            <span>Search Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* Institutional Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Total Lost Items
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#813D42] tabular-nums">
            {stats.totalLost}
          </div>
          <div className="mt-1 text-xs text-[#777777]">Active &amp; historical loss reports</div>
        </Card>

        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Found Inventory
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#172B45] tabular-nums">
            {stats.totalFound}
          </div>
          <div className="mt-1 text-xs text-[#777777]">Cataloged across campus desks</div>
        </Card>

        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Successfully Returned
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#215A38] tabular-nums">
            {stats.returnedCount}
          </div>
          <div className="mt-1 text-xs text-[#777777]">Verified owner handoffs</div>
        </Card>

        <Card padding="md">
          <div className="text-xs font-medium text-[#777777] uppercase tracking-wider">
            Open Cases
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#172B45] tabular-nums">
            {stats.openCount}
          </div>
          <div className="mt-1 text-xs text-[#777777]">Awaiting identification or claim</div>
        </Card>
      </div>

      {/* My Active Reports & My Pending Claims Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Active Reports */}
        <Card padding="none" className="overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E8E4DA] flex items-center justify-between bg-[#F8F6F0]/50">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#172B45]">
                My Active Reports
              </h3>
              <p className="text-xs text-[#777777]">
                Listings you have filed ({activeReports.length} active)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('my-reports')}
              className="text-xs font-medium text-[#172B45] hover:text-[#B99A55] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E8E4DA] flex-1">
            {activeReports.length === 0 ? (
              <div className="p-8 text-center">
                <ClipboardList className="w-7 h-7 text-[#777777]/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#252A32]">No active reports</p>
                <p className="text-xs text-[#777777] mt-1">
                  File a lost or found report whenever an item goes missing or is recovered.
                </p>
              </div>
            ) : (
              activeReports.slice(0, 3).map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => onNavigate('item-details', report.id)}
                  className="w-full text-left px-6 py-4 hover:bg-[#F8F6F0]/60 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#777777]">
                      <span className="font-mono text-[#172B45]">{report.accessionCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{report.location}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#252A32] truncate mt-0.5">
                      {report.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={report.type} />
                    <StatusBadge status={report.status} />
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* My Pending Claims */}
        <Card padding="none" className="overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E8E4DA] flex items-center justify-between bg-[#F8F6F0]/50">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#172B45]">
                My Active Claims
              </h3>
              <p className="text-xs text-[#777777]">
                Ownership verifications in progress ({pendingClaims.length})
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('my-claims')}
              className="text-xs font-medium text-[#172B45] hover:text-[#B99A55] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Track claims</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E8E4DA] flex-1">
            {pendingClaims.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-7 h-7 text-[#777777]/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#252A32]">No pending claims</p>
                <p className="text-xs text-[#777777] mt-1">
                  Browse found items to submit an ownership verification request.
                </p>
              </div>
            ) : (
              pendingClaims.slice(0, 3).map((claim) => (
                <button
                  key={claim.id}
                  type="button"
                  onClick={() => onNavigate('my-claims')}
                  className="w-full text-left px-6 py-4 hover:bg-[#F8F6F0]/60 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#777777]">
                      <span className="font-mono text-[#172B45]">{claim.claimCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{claim.itemAccessionCode}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#252A32] truncate mt-0.5">
                      {claim.itemTitle}
                    </div>
                    {claim.status === 'approved' && (
                      <div className="text-xs text-[#215A38] mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Ready for campus desk pickup</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={claim.status} />
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Latest Lost & Found Listings */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#172B45]">
              Recently Reported Listings
            </h3>
            <p className="text-sm text-[#777777] mt-1">
              Latest lost and found items logged across Aldenbrook University buildings.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('browse')}>
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {latestListings.length === 0 ? (
          <EmptyState
            icon={<Search className="w-5 h-5" />}
            title="No listings recorded yet"
            description="Recently reported lost and found items will appear here as soon as they are filed."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {latestListings.map((item) => (
              <Card key={item.id} padding="none" className="overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-[#F8F6F0] border-b border-[#E8E4DA] overflow-hidden relative">
                  <ItemThumbnail
                    imageKey={item.imageKey}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    category={item.category}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[11px] text-[#777777] tabular-nums">
                        {item.accessionCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={item.type} />
                        {item.status !== 'open' && <StatusBadge status={item.status} />}
                      </div>
                    </div>
                    <h4 className="font-serif text-lg font-semibold text-[#172B45] leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#777777]">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatDisplayDate(item.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#E8E4DA] flex items-center justify-between">
                    <span className="text-xs text-[#777777]">
                      Reported by {item.reporterInitials}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigate('item-details', item.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
