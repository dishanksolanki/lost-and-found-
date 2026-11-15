import React, { useEffect, useMemo, useState } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import {
  Button,
  Card,
  CardGridSkeleton,
  EmptyState,
  ItemThumbnail,
  StatusBadge,
  inputBaseClasses,
} from '../ui/DesignSystem';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../../data/itemAssets';
import { formatDisplayDate } from '../../lib/api';
import type { AppView, ItemStatus, LostFoundItem } from '../../types';

interface BrowseItemsPageProps {
  items: LostFoundItem[];
  loading: boolean;
  initialSearchQuery?: string;
  onNavigate: (view: AppView, itemId?: string) => void;
}

export const BrowseItemsPage: React.FC<BrowseItemsPageProps> = ({
  items,
  loading,
  initialSearchQuery = '',
  onNavigate,
}) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  useEffect(() => {
    setSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = items.filter((item) => {
      if (item.status === 'archived') return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (locationFilter !== 'all' && item.location !== locationFilter) return false;
      if (dateFilter && item.date < dateFilter) return false;
      if (q) {
        const hay = `${item.title} ${item.description} ${item.location} ${item.category} ${item.accessionCode} ${item.identifyingDetails}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    }
    return sorted;
  }, [items, search, typeFilter, statusFilter, categoryFilter, locationFilter, dateFilter, sortBy]);

  const hasActiveFilters =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    locationFilter !== 'all' ||
    dateFilter !== '';

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setLocationFilter('all');
    setDateFilter('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Filter & Discovery Toolbar */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DA]">
          {/* Segmented Lost / Found Filter */}
          <div className="inline-flex items-center p-1 bg-[#F8F6F0] border border-[#E8E4DA] rounded-md self-start">
            {(['all', 'found', 'lost'] as const).map((val) => {
              const active = typeFilter === val;
              const label = val === 'all' ? 'All Listings' : val === 'found' ? 'Found Items' : 'Lost Reports';
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTypeFilter(val)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#172B45] text-white'
                      : 'text-[#777777] hover:text-[#252A32]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#777777]">
            <span className="tabular-nums font-medium text-[#252A32]">
              {filteredItems.length} {filteredItems.length === 1 ? 'listing' : 'listings'} found
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[#813D42] hover:underline font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Search + Dropdown Filters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-3 relative">
            <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items or code..."
              aria-label="Search listings"
              className={`${inputBaseClasses} pl-10`}
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className={inputBaseClasses}
            >
              <option value="all">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ItemStatus)}
              aria-label="Filter by status"
              className={inputBaseClasses}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Case</option>
              <option value="claimed">Claim in Review</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="Filter by campus location"
              className={inputBaseClasses}
            >
              <option value="all">All Locations</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter reported on or after date"
              title="Reported on or after date"
              className={`${inputBaseClasses} tabular-nums`}
            />
          </div>

          <div className="lg:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              aria-label="Sort listings"
              className={inputBaseClasses}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A–Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-5 h-5" />}
          title="No matching items found"
          description="Try broadening your search keywords, selecting all campus locations, or clearing the date filter."
          action={
            <Button variant="primary" size="md" onClick={resetFilters}>
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} padding="none" className="overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-[#F8F6F0] border-b border-[#E8E4DA] overflow-hidden">
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
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-[#172B45] leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#777777]">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatDisplayDate(item.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{item.location}</span>
                  </div>

                  <p className="mt-3 text-xs text-[#252A32]/85 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8E4DA] flex items-center justify-between gap-2">
                  <span className="text-xs text-[#777777] truncate">
                    {item.specificSpot}
                  </span>
                  <Button
                    variant="primary"
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
    </div>
  );
};
