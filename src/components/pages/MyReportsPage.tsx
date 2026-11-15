import React, { useMemo, useState } from 'react';
import { ClipboardList, Edit3, Eye, RotateCcw, Trash2 } from 'lucide-react';
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
import { CAMPUS_LOCATIONS } from '../../data/itemAssets';
import { formatDisplayDate, portalApi } from '../../lib/api';
import type { AppView, LostFoundItem } from '../../types';

interface MyReportsPageProps {
  reports: LostFoundItem[];
  onNavigate: (view: AppView, itemId?: string) => void;
  onItemUpdated: (item: LostFoundItem) => void;
  onItemDeleted: (id: string) => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export const MyReportsPage: React.FC<MyReportsPageProps> = ({
  reports,
  onNavigate,
  onItemUpdated,
  onItemDeleted,
  onNotify,
}) => {
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LostFoundItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSpot, setEditSpot] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const visibleReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.type === filter);
  }, [reports, filter]);

  const openEdit = (item: LostFoundItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditLocation(item.location);
    setEditSpot(item.specificSpot);
    setEditDescription(item.description);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const res = await portalApi.updateItem(editingItem.id, {
        title: editTitle,
        location: editLocation,
        specificSpot: editSpot,
        description: editDescription,
      });
      onItemUpdated(res.item);
      setEditingItem(null);
      onNotify('Report details updated.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to update report.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReturned = async (item: LostFoundItem) => {
    try {
      const res = await portalApi.updateItem(item.id, { status: 'returned' });
      onItemUpdated(res.item);
      onNotify(`${item.accessionCode} marked as Returned.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to update status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await portalApi.deleteItem(deletingItem.id);
      onItemDeleted(deletingItem.id);
      setDeletingItem(null);
      onNotify('Report removed from registry.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to delete report.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center p-1 bg-white border border-[#E8E4DA] rounded-md self-start">
          {(['all', 'lost', 'found'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#172B45] text-white'
                  : 'text-[#777777] hover:text-[#252A32]'
              }`}
            >
              {tab === 'all' ? 'All My Reports' : tab === 'lost' ? 'Lost Reports' : 'Found Reports'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('report-lost')}>
            Report Lost Item
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate('report-found')}>
            Report Found Item
          </Button>
        </div>
      </div>

      {visibleReports.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-5 h-5" />}
          title="No reports filed in this category"
          description="Items you report as lost or found will appear here so you can monitor claims and update resolution status."
          action={
            <Button variant="primary" onClick={() => onNavigate('report-lost')}>
              File a Report
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {visibleReports.map((item) => (
            <Card key={item.id} padding="md">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="w-full md:w-44 aspect-[4/3] rounded-md overflow-hidden border border-[#E8E4DA] bg-[#F8F6F0] shrink-0">
                  <ItemThumbnail
                    imageKey={item.imageKey}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    category={item.category}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-[#777777] tabular-nums">
                      {item.accessionCode}
                    </span>
                    <StatusBadge status={item.type} />
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#172B45]">
                    {item.title}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#777777]">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{formatDisplayDate(item.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {item.location} ({item.specificSpot})
                    </span>
                  </div>

                  <p className="mt-2.5 text-sm text-[#252A32]/90 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {item.confidentialDetails && (
                    <p className="mt-2 text-xs text-[#777777]">
                      <strong className="text-[#252A32]">Private verification note:</strong>{' '}
                      {item.confidentialDetails}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('item-details', item.id)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Listing</span>
                  </Button>
                  {item.status !== 'returned' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(item)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkReturned(item)}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#B99A55]" />
                        <span>Mark Returned</span>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingItem(item)}
                    className="text-[#813D42] hover:bg-[#F7ECEC]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Report Details"
        subtitle={editingItem?.accessionCode}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <FormLabel htmlFor="edit-title" required>
              Item Name
            </FormLabel>
            <input
              id="edit-title"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={inputBaseClasses}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="edit-loc" required>
                Campus Location
              </FormLabel>
              <select
                id="edit-loc"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className={inputBaseClasses}
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FormLabel htmlFor="edit-spot">Specific Spot</FormLabel>
              <input
                id="edit-spot"
                type="text"
                value={editSpot}
                onChange={(e) => setEditSpot(e.target.value)}
                className={inputBaseClasses}
              />
            </div>
          </div>
          <div>
            <FormLabel htmlFor="edit-desc" required>
              Description
            </FormLabel>
            <textarea
              id="edit-desc"
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className={inputBaseClasses}
              required
            />
          </div>
          <div className="pt-4 border-t border-[#E8E4DA] flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Remove Report"
        subtitle={deletingItem?.accessionCode}
        maxWidth="md"
      >
        <p className="text-sm text-[#252A32] leading-relaxed">
          Are you sure you want to remove <strong>{deletingItem?.title}</strong> from the campus
          registry? Any associated pending claims will also be closed.
        </p>
        <div className="mt-6 pt-4 border-t border-[#E8E4DA] flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingItem(null)}>
            Cancel
          </Button>
          <Button variant="burgundy" onClick={handleConfirmDelete} loading={saving}>
            Remove Listing
          </Button>
        </div>
      </Modal>
    </div>
  );
};
