import React, { useMemo, useState } from 'react';
import { CheckSquare, Compass, MapPin } from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  ItemThumbnail,
  StatusBadge,
} from '../ui/DesignSystem';
import { formatDisplayDate } from '../../lib/api';
import type { AppView, ClaimRecord, ClaimStatus } from '../../types';

interface MyClaimsPageProps {
  claims: ClaimRecord[];
  onNavigate: (view: AppView, itemId?: string) => void;
}

export const MyClaimsPage: React.FC<MyClaimsPageProps> = ({ claims, onNavigate }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all');

  const filteredClaims = useMemo(() => {
    if (statusFilter === 'all') return claims;
    return claims.filter((c) => c.status === statusFilter);
  }, [claims, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center p-1 bg-white border border-[#E8E4DA] rounded-md self-start">
          {(['all', 'pending', 'approved', 'returned', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#172B45] text-white'
                  : 'text-[#777777] hover:text-[#252A32]'
              }`}
            >
              {status === 'all' ? 'All Claims' : status}
            </button>
          ))}
        </div>

        <Button variant="secondary" size="sm" onClick={() => onNavigate('browse')}>
          <Compass className="w-3.5 h-3.5" />
          <span>Browse Found Items</span>
        </Button>
      </div>

      {filteredClaims.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-5 h-5" />}
          title="No claims matching this status"
          description="When you submit an ownership claim on a found item, you can track administrator verification and pickup instructions here."
          action={
            <Button variant="primary" onClick={() => onNavigate('browse')}>
              Explore Campus Catalog
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <Card key={claim.id} padding="md">
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="w-full lg:w-44 aspect-[4/3] rounded-md overflow-hidden border border-[#E8E4DA] bg-[#F8F6F0] shrink-0">
                  <ItemThumbnail
                    imageKey={claim.itemImageKey}
                    imageUrl={claim.itemImageUrl}
                    title={claim.itemTitle || 'Claimed item'}
                    category={claim.itemCategory || 'Everyday Gear'}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#777777]">
                      <span className="font-mono font-semibold text-[#172B45] tabular-nums">
                        {claim.claimCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{claim.itemAccessionCode}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        Submitted {formatDisplayDate(claim.createdAt)}
                      </span>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#172B45]">
                    {claim.itemTitle}
                  </h3>

                  {claim.itemLocation && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#777777]">
                      <MapPin className="w-3.5 h-3.5 text-[#B99A55]" />
                      <span>{claim.itemLocation}</span>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E8E4DA] text-xs">
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-[#777777] mb-1">
                        Submitted Ownership Proof
                      </div>
                      <p className="text-[#252A32] leading-relaxed">{claim.ownershipProof}</p>
                    </div>
                    <div>
                      <div className="font-semibold uppercase tracking-wider text-[#777777] mb-1">
                        Distinguishing Marks
                      </div>
                      <p className="text-[#252A32] leading-relaxed">{claim.distinguishingMarks}</p>
                    </div>
                  </div>

                  {claim.status === 'approved' && claim.pickupInstructions && (
                    <div className="mt-4 p-3.5 rounded-md bg-[#ECF5EF] border border-[#C4DFCE] text-xs text-[#215A38] leading-relaxed">
                      <strong className="block mb-0.5">Pickup Instructions</strong>
                      {claim.pickupInstructions}
                    </div>
                  )}

                  {claim.reviewerNotes && claim.status !== 'pending' && (
                    <div className="mt-3 p-3.5 rounded-md bg-[#F8F6F0] border border-[#E8E4DA] text-xs text-[#252A32] leading-relaxed">
                      <strong className="text-[#172B45]">Administrator Review Note:</strong>{' '}
                      {claim.reviewerNotes}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex lg:flex-col justify-end lg:justify-start gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('item-details', claim.itemId)}
                  >
                    View Item Record
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
