import React, { useState } from 'react';
import { Building2, Edit3, Mail, Phone, RotateCcw, Shield, User as UserIcon } from 'lucide-react';
import {
  Button,
  Card,
  FormLabel,
  Modal,
  StatusBadge,
  inputBaseClasses,
} from '../ui/DesignSystem';
import { formatDisplayDate, portalApi } from '../../lib/api';
import type { ClaimRecord, LostFoundItem, User } from '../../types';

interface ProfilePageProps {
  user: User;
  myReports: LostFoundItem[];
  myClaims: ClaimRecord[];
  onProfileUpdated: (user: User) => void;
  onResetDemoData: () => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  myReports,
  myClaims,
  onProfileUpdated,
  onResetDemoData,
  onNotify,
}) => {
  const [editing, setEditing] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [phone, setPhone] = useState(user.phone);
  const [residence, setResidence] = useState(user.residence);
  const [saving, setSaving] = useState(false);

  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      onNotify('Please enter your full legal name.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await portalApi.updateProfile({
        name: name.trim(),
        department: department.trim(),
        phone: phone.trim(),
        residence: residence.trim(),
      });
      onProfileUpdated(res.user);
      setEditing(false);
      onNotify('Profile details updated.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setDepartment(user.department);
    setPhone(user.phone);
    setResidence(user.residence);
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#E8E4DA]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#172B45] text-white border-2 border-[#B99A55] flex items-center justify-center font-serif text-2xl font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-2xl font-semibold text-[#172B45]">{user.name}</h2>
                <StatusBadge status={user.role} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#777777]">
                <span className="font-mono text-[#252A32]">{user.studentId}</span>
                <span aria-hidden="true">·</span>
                <span>{user.department}</span>
                <span aria-hidden="true">·</span>
                <span>Member since {formatDisplayDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {!editing && (
            <Button variant="secondary" size="md" onClick={() => setEditing(true)}>
              <Edit3 className="w-4 h-4 text-[#B99A55]" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>

        {!editing ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B99A55] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[#777777]">
                    University Email
                  </div>
                  <div className="text-sm font-medium text-[#252A32] mt-0.5">{user.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B99A55] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[#777777]">
                    Contact Telephone
                  </div>
                  <div className="text-sm font-medium text-[#252A32] mt-0.5">{user.phone}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-[#B99A55] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[#777777]">
                    Campus Residence / Office
                  </div>
                  <div className="text-sm font-medium text-[#252A32] mt-0.5">{user.residence}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-[#B99A55] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-[#777777]">
                    Account Status
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={user.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="prof-name" required>
                  Full Name
                </FormLabel>
                <input
                  id="prof-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
              </div>

              <div>
                <FormLabel htmlFor="prof-dept" required>
                  Academic Department / Office
                </FormLabel>
                <input
                  id="prof-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
              </div>

              <div>
                <FormLabel htmlFor="prof-phone">Contact Telephone</FormLabel>
                <input
                  id="prof-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <FormLabel htmlFor="prof-res">Campus Residence / Office</FormLabel>
                <input
                  id="prof-res"
                  type="text"
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  className={inputBaseClasses}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4DA] flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Account Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-[#777777] uppercase tracking-wider">
            <span>Filed Reports</span>
            <UserIcon className="w-4 h-4 text-[#B99A55]" />
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#172B45] tabular-nums">
            {myReports.length}
          </div>
        </Card>

        <Card padding="md">
          <div className="text-xs text-[#777777] uppercase tracking-wider">
            Ownership Claims
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#172B45] tabular-nums">
            {myClaims.length}
          </div>
        </Card>

        <Card padding="md">
          <div className="text-xs text-[#777777] uppercase tracking-wider">
            Verified Returns
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold text-[#215A38] tabular-nums">
            {myClaims.filter((c) => c.status === 'returned' || c.status === 'approved').length}
          </div>
        </Card>
      </div>

      {/* Demonstration Data Reset */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#172B45]">
              Browser Demonstration Storage
            </h3>
            <p className="text-xs text-[#777777] mt-1 leading-relaxed">
              All accounts, item reports, claims, and notifications are stored locally in your
              browser. Restore the original campus sample data at any time.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            className="shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#813D42]" />
            <span>Reset Demo Data</span>
          </Button>
        </div>
      </Card>

      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Demonstration Data"
        subtitle="Restore default campus registry records"
        maxWidth="md"
      >
        <p className="text-sm text-[#252A32] leading-relaxed">
          This will clear all locally saved reports, claims, and custom registered accounts from
          your browser and restore the initial Aldenbrook University sample dataset. You will be
          returned to the sign-in screen.
        </p>
        <div className="mt-6 pt-4 border-t border-[#E8E4DA] flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="burgundy"
            onClick={() => {
              setResetModalOpen(false);
              onResetDemoData();
            }}
          >
            Confirm Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
};
