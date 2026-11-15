import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  MapPin,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import {
  Button,
  Card,
  FormLabel,
  ItemThumbnail,
  Modal,
  StatusBadge,
  inputBaseClasses,
} from '../ui/DesignSystem';
import { formatDisplayDate, portalApi } from '../../lib/api';
import type { AppView, ClaimRecord, LostFoundItem, User } from '../../types';

interface ItemDetailsPageProps {
  item: LostFoundItem;
  currentUser: User;
  existingClaim?: ClaimRecord;
  onBack: () => void;
  onClaimSubmitted: (claim: ClaimRecord) => void;
  onNavigate: (view: AppView) => void;
}

export const ItemDetailsPage: React.FC<ItemDetailsPageProps> = ({
  item,
  currentUser,
  existingClaim,
  onBack,
  onClaimSubmitted,
  onNavigate,
}) => {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [ownershipProof, setOwnershipProof] = useState('');
  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [contactPhone, setContactPhone] = useState(currentUser.phone || '');
  const [preferredPickup, setPreferredPickup] = useState(
    item.dropoffLocation || 'Founders Hall Campus Property Office, Room 102'
  );
  const [claimError, setClaimError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwnReport = item.reporterId === currentUser.id;
  const canClaim =
    !isOwnReport &&
    !existingClaim &&
    item.status !== 'returned' &&
    item.status !== 'archived' &&
    (item.type === 'found' || item.status === 'open');

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError('');
    if (ownershipProof.trim().length < 15 || distinguishingMarks.trim().length < 8) {
      setClaimError(
        'Please provide thorough proof of ownership and specific distinguishing marks so administrators can verify your claim.'
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await portalApi.submitClaim({
        itemId: item.id,
        ownershipProof: ownershipProof.trim(),
        distinguishingMarks: distinguishingMarks.trim(),
        contactPhone: contactPhone.trim(),
        preferredPickup: preferredPickup.trim(),
      });
      setClaimModalOpen(false);
      onClaimSubmitted(res.claim);
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Unable to submit ownership claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#172B45] hover:text-[#B99A55] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Large Item Photograph */}
        <div className="lg:col-span-6">
          <Card padding="none" className="overflow-hidden">
            <div className="aspect-[4/3] bg-[#F8F6F0]">
              <ItemThumbnail
                imageKey={item.imageKey}
                imageUrl={item.imageUrl}
                title={item.title}
                category={item.category}
              />
            </div>
            <div className="px-5 py-3.5 bg-[#F8F6F0]/70 border-t border-[#E8E4DA] flex items-center justify-between text-xs text-[#777777]">
              <span>
                Catalog Reference:{' '}
                <strong className="font-mono text-[#172B45]">{item.accessionCode}</strong>
              </span>
              <span>Logged {formatDisplayDate(item.createdAt)}</span>
            </div>
          </Card>
        </div>

        {/* Right: Structured Metadata & Claim Action */}
        <div className="lg:col-span-6 space-y-5">
          <Card padding="lg">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={item.type} />
              <StatusBadge status={item.status} />
              <span className="text-xs text-[#777777] ml-1 inline-flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#B99A55]" />
                {item.category}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#172B45] leading-tight">
              {item.title}
            </h2>

            <p className="mt-4 text-sm text-[#252A32] leading-relaxed">{item.description}</p>

            {/* Accession Metadata Table */}
            <dl className="mt-6 pt-5 border-t border-[#E8E4DA] divide-y divide-[#E8E4DA] text-sm">
              <div className="py-3 flex items-start justify-between gap-4">
                <dt className="text-[#777777] flex items-center gap-2 shrink-0">
                  <MapPin className="w-4 h-4 text-[#B99A55]" />
                  <span>Campus Location</span>
                </dt>
                <dd className="text-right font-medium text-[#252A32]">
                  {item.location}
                  <div className="text-xs font-normal text-[#777777] mt-0.5">
                    {item.specificSpot}
                  </div>
                </dd>
              </div>

              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-[#777777] flex items-center gap-2 shrink-0">
                  <Calendar className="w-4 h-4 text-[#B99A55]" />
                  <span>{item.type === 'lost' ? 'Date Lost' : 'Date Found'}</span>
                </dt>
                <dd className="font-medium text-[#252A32] tabular-nums">
                  {formatDisplayDate(item.date)}
                </dd>
              </div>

              {item.dropoffLocation && (
                <div className="py-3 flex items-start justify-between gap-4">
                  <dt className="text-[#777777] shrink-0">Custody Desk</dt>
                  <dd className="text-right font-medium text-[#172B45]">
                    {item.dropoffLocation}
                  </dd>
                </div>
              )}

              <div className="py-3 flex items-start justify-between gap-4">
                <dt className="text-[#777777] shrink-0">Identifying Features</dt>
                <dd className="text-right text-[#252A32] max-w-xs">{item.identifyingDetails}</dd>
              </div>

              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-[#777777] shrink-0">Reported By</dt>
                <dd className="text-right text-[#252A32]">
                  {item.reporterInitials}{' '}
                  <span className="text-xs text-[#777777]">({item.reporterRoleLabel})</span>
                </dd>
              </div>
            </dl>

            {/* Privacy Protection Notice */}
            <div className="mt-5 p-3.5 rounded-md bg-[#F8F6F0] border border-[#E8E4DA] flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#172B45] shrink-0 mt-0.5" />
              <p className="text-xs text-[#777777] leading-relaxed">
                Private contact details and confidential verification traits are protected by the
                Aldenbrook Campus Property Office and are never exposed publicly.
              </p>
            </div>

            {/* Action Area */}
            <div className="mt-6 pt-5 border-t border-[#E8E4DA]">
              {existingClaim ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-md bg-[#F9F4E8] border border-[#E4D4AA]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#172B45]">
                        {existingClaim.claimCode}
                      </span>
                      <StatusBadge status={existingClaim.status} />
                    </div>
                    <p className="text-xs text-[#252A32] mt-1">
                      You have submitted an ownership claim for this item.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('my-claims')}
                  >
                    Track Claim Status
                  </Button>
                </div>
              ) : isOwnReport ? (
                <div className="flex items-center justify-between gap-3 p-4 rounded-md bg-[#EEF2F6] border border-[#CFD8E3]">
                  <div className="text-xs text-[#172B45]">
                    You filed this report. Manage status or review updates from your reports panel.
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('my-reports')}
                  >
                    Go to My Reports
                  </Button>
                </div>
              ) : item.status === 'returned' ? (
                <div className="flex items-center gap-2.5 text-sm font-medium text-[#215A38]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>This item has already been verified and returned to its owner.</span>
                </div>
              ) : canClaim ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-[#777777]">
                    {item.type === 'found'
                      ? 'Do you recognize this belonging? Submit proof of ownership to claim.'
                      : 'Have you found or recovered this missing item? Submit a coordination claim.'}
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setClaimModalOpen(true)}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#B99A55]" />
                    <span>{item.type === 'found' ? 'Claim Item' : 'Report Match / Claim'}</span>
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>

      {/* Ownership Claim Modal */}
      <Modal
        open={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Submit Ownership Claim"
        subtitle={`${item.accessionCode} · ${item.title}`}
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          {claimError && (
            <div className="p-3 rounded bg-[#F7ECEC] border border-[#E5C8CA] text-xs text-[#813D42]">
              {claimError}
            </div>
          )}

          <div>
            <FormLabel
              htmlFor="claim-proof"
              required
              hint="Describe contents, lockscreen image, engraved initials, serial suffix, or purchase receipt details."
            >
              Proof of Ownership
            </FormLabel>
            <textarea
              id="claim-proof"
              rows={3}
              value={ownershipProof}
              onChange={(e) => setOwnershipProof(e.target.value)}
              placeholder="Provide details only the rightful owner would know..."
              className={inputBaseClasses}
              required
            />
          </div>

          <div>
            <FormLabel
              htmlFor="claim-marks"
              required
              hint="Mention scratches, stickers, case wear, or accompanying accessories."
            >
              Distinguishing Marks &amp; Condition
            </FormLabel>
            <textarea
              id="claim-marks"
              rows={2}
              value={distinguishingMarks}
              onChange={(e) => setDistinguishingMarks(e.target.value)}
              placeholder="Describe unique physical markings..."
              className={inputBaseClasses}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="claim-phone" required>
                Contact Phone (Private to Admin)
              </FormLabel>
              <input
                id="claim-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputBaseClasses}
                required
              />
            </div>

            <div>
              <FormLabel htmlFor="claim-pickup">Preferred Verification Desk</FormLabel>
              <input
                id="claim-pickup"
                type="text"
                value={preferredPickup}
                onChange={(e) => setPreferredPickup(e.target.value)}
                className={inputBaseClasses}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E4DA] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setClaimModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Ownership Claim
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
