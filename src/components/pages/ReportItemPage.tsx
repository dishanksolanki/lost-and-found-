import React, { useState } from 'react';
import { CheckCircle2, ImagePlus, Trash2, Upload } from 'lucide-react';
import {
  Button,
  Card,
  FormLabel,
  inputBaseClasses,
} from '../ui/DesignSystem';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../../data/itemAssets';
import { portalApi } from '../../lib/api';
import type { AppView, ItemCategory, LostFoundItem } from '../../types';

interface ReportItemPageProps {
  mode: 'lost' | 'found';
  onCreated: (item: LostFoundItem) => void;
  onCancel: () => void;
  onNavigate: (view: AppView, id?: string) => void;
}

export const ReportItemPage: React.FC<ReportItemPageProps> = ({
  mode,
  onCreated,
  onCancel,
}) => {
  const isLost = mode === 'lost';
  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [specificSpot, setSpecificSpot] = useState('');
  const [date, setDate] = useState(today);
  const [dropoffLocation, setDropoffLocation] = useState(
    'Founders Hall Campus Property Office, Room 102'
  );
  const [identifyingDetails, setIdentifyingDetails] = useState('');
  const [confidentialDetails, setConfidentialDetails] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImageFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid JPG, PNG, or WebP image.' }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be under 3 MB.' }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 4) {
      next.title = 'Please enter a descriptive item name (at least 4 characters).';
    }
    if (description.trim().length < 15) {
      next.description = 'Provide a clear description (at least 15 characters).';
    }
    if (!location) {
      next.location = 'Select the campus building or area.';
    }
    if (!date) {
      next.date = 'Select the relevant date.';
    }
    if (identifyingDetails.trim().length < 5) {
      next.identifyingDetails = 'Include color, brand, or visible traits for catalog matching.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await portalApi.createItem({
        type: mode,
        title: title.trim(),
        category,
        description: description.trim(),
        location,
        specificSpot: specificSpot.trim() || 'General Floor / Common Area',
        date,
        imageUrl: imageUrl || undefined,
        identifyingDetails: identifyingDetails.trim(),
        confidentialDetails: confidentialDetails.trim(),
        dropoffLocation: isLost ? undefined : dropoffLocation.trim(),
      });
      onCreated(res.item);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card padding="lg">
        <div className="pb-5 mb-6 border-b border-[#E8E4DA]">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#B99A55] mb-1.5">
            {isLost ? 'Student Loss Filing' : 'Found Property Intake'}
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#172B45]">
            {isLost ? 'Report a Lost Belonging' : 'Report a Found Item'}
          </h2>
          <p className="text-sm text-[#777777] mt-1 leading-relaxed">
            {isLost
              ? 'Provide accurate details of where and when the item went missing. Your contact information remains private.'
              : 'Log an item discovered on campus so its rightful owner can verify ownership through the Campus Property Office.'}
          </p>
        </div>

        {submitError && (
          <div
            role="alert"
            className="mb-6 px-4 py-3 rounded-md bg-[#F7ECEC] border border-[#E5C8CA] text-sm text-[#813D42]"
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FormLabel htmlFor="item-title" required>
                Item Name
              </FormLabel>
              <input
                id="item-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isLost
                    ? 'e.g., Navy Leather Portfolio & Fountain Pen'
                    : 'e.g., Silver Graphing Calculator in Black Case'
                }
                className={inputBaseClasses}
              />
              {errors.title && <p className="text-xs text-[#813D42] mt-1">{errors.title}</p>}
            </div>

            <div>
              <FormLabel htmlFor="item-category" required>
                Category
              </FormLabel>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className={inputBaseClasses}
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <FormLabel
              htmlFor="item-description"
              required
              hint="Describe brand, size, material, and condition without disclosing private verification codes."
            >
              Detailed Description
            </FormLabel>
            <textarea
              id="item-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item clearly to assist campus matching..."
              className={inputBaseClasses}
            />
            {errors.description && (
              <p className="text-xs text-[#813D42] mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <FormLabel htmlFor="item-location" required>
                {isLost ? 'Last Seen Building' : 'Found Building / Area'}
              </FormLabel>
              <select
                id="item-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
              <FormLabel htmlFor="item-spot">Specific Room or Spot</FormLabel>
              <input
                id="item-spot"
                type="text"
                value={specificSpot}
                onChange={(e) => setSpecificSpot(e.target.value)}
                placeholder="e.g., 2nd Floor Reading Table"
                className={inputBaseClasses}
              />
            </div>

            <div>
              <FormLabel htmlFor="item-date" required>
                {isLost ? 'Date Lost' : 'Date Found'}
              </FormLabel>
              <input
                id="item-date"
                type="date"
                max={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputBaseClasses} tabular-nums`}
              />
              {errors.date && <p className="text-xs text-[#813D42] mt-1">{errors.date}</p>}
            </div>
          </div>

          {!isLost && (
            <div>
              <FormLabel
                htmlFor="item-dropoff"
                hint="Indicate where the item was turned in or is currently held."
              >
                Custody / Drop-off Desk
              </FormLabel>
              <input
                id="item-dropoff"
                type="text"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className={inputBaseClasses}
              />
            </div>
          )}

          {/* Identifying Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#E8E4DA]">
            <div>
              <FormLabel
                htmlFor="item-public-id"
                required
                hint="Visible publicly on the listing (color, brand, strap, cover type)."
              >
                Public Identifying Details
              </FormLabel>
              <textarea
                id="item-public-id"
                rows={3}
                value={identifyingDetails}
                onChange={(e) => setIdentifyingDetails(e.target.value)}
                placeholder="e.g., Matte navy cover, brass clasp, medium notebook size"
                className={inputBaseClasses}
              />
              {errors.identifyingDetails && (
                <p className="text-xs text-[#813D42] mt-1">{errors.identifyingDetails}</p>
              )}
            </div>

            <div>
              <FormLabel
                htmlFor="item-private-id"
                hint="Kept strictly confidential for administrators to verify rightful ownership."
              >
                Confidential Verification Detail (Private)
              </FormLabel>
              <textarea
                id="item-private-id"
                rows={3}
                value={confidentialDetails}
                onChange={(e) => setConfidentialDetails(e.target.value)}
                placeholder="e.g., Engraved initials inside, lockscreen photo, serial suffix, or contents"
                className={inputBaseClasses}
              />
            </div>
          </div>

          {/* Photograph Upload Area */}
          <div>
            <FormLabel
              hint="Optional but strongly recommended for faster visual recognition (JPG, PNG, up to 3 MB)."
            >
              Upload Photograph
            </FormLabel>

            {!imageUrl ? (
              <label className="flex flex-col items-center justify-center border border-dashed border-[#B99A55] bg-[#F8F6F0]/60 hover:bg-[#F8F6F0] rounded-lg px-6 py-8 text-center cursor-pointer transition-colors">
                <div className="w-11 h-11 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center mb-3 text-[#172B45]">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#172B45]">
                  Click to upload an item photograph
                </span>
                <span className="text-xs text-[#777777] mt-1">
                  Recommended 4:3 landscape framing · Max 3 MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="border border-[#E8E4DA] rounded-lg p-4 bg-[#F8F6F0]/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-40 aspect-[4/3] rounded overflow-hidden border border-[#E8E4DA] shrink-0 bg-white">
                  <img
                    src={imageUrl}
                    alt="Uploaded item preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#172B45]">
                    <CheckCircle2 className="w-4 h-4 text-[#215A38] shrink-0" />
                    <span className="truncate">{imageName || 'Photograph attached'}</span>
                  </div>
                  <p className="text-xs text-[#777777] mt-1">
                    Photograph ready for institutional catalog publication.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#172B45] hover:text-[#B99A55] cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFile(e.target.files?.[0])}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageName('');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#813D42] hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {errors.image && <p className="text-xs text-[#813D42] mt-1">{errors.image}</p>}
          </div>

          {/* Actions */}
          <div className="pt-5 border-t border-[#E8E4DA] flex flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isLost ? 'burgundy' : 'primary'}
              size="lg"
              loading={submitting}
            >
              {isLost ? 'Submit Lost Item Report' : 'Publish Found Item Listing'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
