export type UserRole = 'student' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  phone: string;
  residence: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'returned' | 'archived';

export type ItemCategory =
  | 'Electronics'
  | 'Wallets & IDs'
  | 'Books & Notes'
  | 'Accessories'
  | 'Keys'
  | 'Bags & Apparel'
  | 'Everyday Gear';

export interface LostFoundItem {
  id: string;
  accessionCode: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  description: string;
  location: string;
  specificSpot: string;
  date: string;
  status: ItemStatus;
  imageKey?: string;
  imageUrl?: string;
  identifyingDetails: string;
  confidentialDetails?: string;
  dropoffLocation?: string;
  reporterId: string;
  reporterInitials: string;
  reporterRoleLabel: string;
  claimCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export interface ClaimRecord {
  id: string;
  claimCode: string;
  itemId: string;
  itemTitle?: string;
  itemAccessionCode?: string;
  itemType?: ItemType;
  itemCategory?: ItemCategory;
  itemLocation?: string;
  itemImageKey?: string;
  itemImageUrl?: string;
  itemConfidentialDetails?: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantStudentId: string;
  ownershipProof: string;
  distinguishingMarks: string;
  contactPhone: string;
  preferredPickup: string;
  status: ClaimStatus;
  reviewerNotes?: string;
  pickupInstructions?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'claim' | 'status' | 'report' | 'system';
  read: boolean;
  linkView?: AppView;
  linkId?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetCode: string;
  detail: string;
  createdAt: string;
}

export interface DashboardStats {
  totalLost: number;
  totalFound: number;
  returnedCount: number;
  openCount: number;
  pendingClaimsCount: number;
  recoveryRate: number;
}

export interface AdminUserSummary extends User {
  reportsCount: number;
  claimsCount: number;
}

export type AppView =
  | 'dashboard'
  | 'browse'
  | 'report-lost'
  | 'report-found'
  | 'item-details'
  | 'my-reports'
  | 'my-claims'
  | 'notifications'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-listings'
  | 'admin-claims'
  | 'admin-users';
