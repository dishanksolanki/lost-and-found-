import type {
  ActivityLog,
  AdminUserSummary,
  AppView,
  ClaimRecord,
  ClaimStatus,
  DashboardStats,
  ItemCategory,
  ItemStatus,
  ItemType,
  LostFoundItem,
  PortalNotification,
  User,
  UserRole,
  UserStatus,
} from '../types';

const DB_STORAGE_KEY = 'lf_portal_db_v1';
const TOKEN_STORAGE_KEY = 'lf_portal_token_v1';

interface StoredUser extends User {
  password: string;
}

interface StoredItem {
  id: string;
  accessionCode: string;
  type: ItemType;
  title: string;
  category: ItemCategory | string;
  description: string;
  location: string;
  specificSpot: string;
  date: string;
  status: ItemStatus;
  imageKey?: string;
  imageUrl?: string;
  identifyingDetails: string;
  confidentialDetails: string;
  dropoffLocation?: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredClaim {
  id: string;
  claimCode: string;
  itemId: string;
  claimantId: string;
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

interface StoredNotification {
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

interface PortalDatabase {
  users: StoredUser[];
  items: StoredItem[];
  claims: StoredClaim[];
  notifications: StoredNotification[];
  activities: ActivityLog[];
  sequences: {
    item: number;
    claim: number;
  };
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return `${parts[0][0]?.toUpperCase() || 'U'}.`;
  return `${parts[0][0]?.toUpperCase() || ''}. ${parts[parts.length - 1][0]?.toUpperCase() || ''}.`;
}

function sanitizeUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    department: user.department,
    phone: user.phone,
    residence: user.residence,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function createSeedDatabase(): PortalDatabase {
  const users: StoredUser[] = [
    {
      id: 'usr-student-1',
      name: 'Clara Vance',
      email: 'clara.vance@aldenbrook.edu',
      studentId: 'AU-2026-4189',
      department: 'School of Architecture',
      phone: '(555) 234-8910',
      residence: 'Barton Hall, Suite 304',
      role: 'student',
      status: 'active',
      password: 'Student2026!',
      createdAt: '2026-09-02T09:15:00.000Z',
    },
    {
      id: 'usr-student-2',
      name: 'Marcus Sterling',
      email: 'marcus.sterling@aldenbrook.edu',
      studentId: 'AU-2025-7821',
      department: 'Department of Economics',
      phone: '(555) 398-4421',
      residence: 'Elmwood Commons 212',
      role: 'student',
      status: 'active',
      password: 'Student2026!',
      createdAt: '2026-09-05T11:30:00.000Z',
    },
    {
      id: 'usr-student-3',
      name: 'Nadia Patel',
      email: 'nadia.patel@aldenbrook.edu',
      studentId: 'AU-2027-1054',
      department: 'Biomedical Engineering',
      phone: '(555) 481-6620',
      residence: 'Northridge House 118',
      role: 'student',
      status: 'active',
      password: 'Student2026!',
      createdAt: '2026-09-10T14:20:00.000Z',
    },
    {
      id: 'usr-admin-1',
      name: 'Eleanor Hawthorne',
      email: 'admin@aldenbrook.edu',
      studentId: 'STAFF-0104',
      department: 'Campus Safety & Property Office',
      phone: '(555) 200-1900',
      residence: 'Founders Hall, Room 102 (Custody Office)',
      role: 'admin',
      status: 'active',
      password: 'Admin2026!',
      createdAt: '2026-08-15T08:00:00.000Z',
    },
  ];

  const items: StoredItem[] = [
    {
      id: 'itm-101',
      accessionCode: 'LF-2026-014',
      type: 'found',
      title: '14-inch Silver Laptop with Tan Leather Sleeve',
      category: 'Electronics',
      description:
        'Silver aluminum notebook computer left inside a stitched saddle-tan leather protective sleeve near the window study carrels on the second floor.',
      location: 'Sterling Memorial Library',
      specificSpot: '2nd Floor Reading Room, Carrel 14B',
      date: '2026-11-12',
      status: 'open',
      imageKey: 'laptop_sleeve',
      identifyingDetails:
        'Tan leather snap-closure sleeve, subtle brass snap hardware, USB-C ports on left flank.',
      confidentialDetails:
        'Serial suffix ends in X9K2; lockscreen displays an architectural line drawing of Florence Cathedral.',
      dropoffLocation: 'Sterling Library Circulation & Security Desk',
      reporterId: 'usr-student-2',
      createdAt: '2026-11-12T16:40:00.000Z',
      updatedAt: '2026-11-12T16:40:00.000Z',
    },
    {
      id: 'itm-102',
      accessionCode: 'LF-2026-013',
      type: 'found',
      title: 'Dark Espresso Leather Bifold Wallet & Brass Key',
      category: 'Wallets & IDs',
      description:
        'Full-grain dark brown leather bifold wallet discovered alongside a single brass key on a circular brass clip near the main café terrace.',
      location: 'Harkness Student Union',
      specificSpot: 'Main Terrace Stone Bench, East Entrance',
      date: '2026-11-11',
      status: 'claimed',
      imageKey: 'leather_wallet',
      identifyingDetails:
        'Dark espresso stitched leather bifold accompanied by one brass carabiner key fob.',
      confidentialDetails:
        'Contains a student transit pass ending in 4189 and a folded receipt from Harbor Books.',
      dropoffLocation: 'Founders Hall Campus Property Office, Room 102',
      reporterId: 'usr-admin-1',
      createdAt: '2026-11-11T14:20:00.000Z',
      updatedAt: '2026-11-13T09:10:00.000Z',
    },
    {
      id: 'itm-103',
      accessionCode: 'LF-2026-012',
      type: 'lost',
      title: 'Matte Navy Over-Ear Wireless Headphones',
      category: 'Electronics',
      description:
        'Noise-cancelling matte navy blue wireless headphones with a coiled braided navy USB-C cable. Misplaced after the afternoon acoustics seminar.',
      location: 'Engineering & Design Center',
      specificSpot: 'Lecture Hall 204, Back Row',
      date: '2026-11-10',
      status: 'open',
      imageKey: 'navy_headphones',
      identifyingDetails:
        'Matte deep navy earcups, braided navy cable, minor scuff on left headband slider.',
      confidentialDetails:
        'Bluetooth device name is registered as "Clara Studio Cans"; inside right ear cushion has tiny ink mark.',
      reporterId: 'usr-student-1',
      createdAt: '2026-11-10T18:05:00.000Z',
      updatedAt: '2026-11-10T18:05:00.000Z',
    },
    {
      id: 'itm-104',
      accessionCode: 'LF-2026-011',
      type: 'found',
      title: 'Clothbound Political Thought Volume & Brass Fountain Pen',
      category: 'Books & Notes',
      description:
        'Hardcover university edition of History of European Political Thought (Vol. II) found with an open cream seminar notebook and hexagonal brass fountain pen.',
      location: 'Founders Humanities Hall',
      specificSpot: 'Seminar Room 312 Oak Table',
      date: '2026-11-09',
      status: 'open',
      imageKey: 'textbook_pen',
      identifyingDetails:
        'Navy clothbound hardcover with gilt spine lettering, hexagonal raw brass fountain pen.',
      confidentialDetails:
        'Front flyleaf has pencil annotations dated Oct 12; pen uses dark blue archival ink.',
      dropoffLocation: 'Founders Hall Campus Property Office, Room 102',
      reporterId: 'usr-student-3',
      createdAt: '2026-11-09T13:15:00.000Z',
      updatedAt: '2026-11-09T13:15:00.000Z',
    },
    {
      id: 'itm-105',
      accessionCode: 'LF-2026-010',
      type: 'found',
      title: 'Brushed Steel Insulated Flask & Navy Lanyard',
      category: 'Everyday Gear',
      description:
        '18oz brushed stainless steel water bottle with black screw cap and a woven navy herringbone lanyard with matte black clasp.',
      location: 'University Athletic Pavilion',
      specificSpot: 'Indoor Track Bleachers, Section C',
      date: '2026-11-08',
      status: 'returned',
      imageKey: 'insulated_flask',
      identifyingDetails: 'Unbranded brushed steel flask, matte black loop cap, woven navy lanyard.',
      confidentialDetails:
        'Small dent near the base rim; lanyard clasp has white cross-stitch reinforcement.',
      dropoffLocation: 'Athletic Pavilion Front Desk',
      reporterId: 'usr-admin-1',
      createdAt: '2026-11-08T10:50:00.000Z',
      updatedAt: '2026-11-10T11:30:00.000Z',
    },
    {
      id: 'itm-106',
      accessionCode: 'LF-2026-009',
      type: 'found',
      title: 'Tortoiseshell Eyeglasses in Charcoal Felt Case',
      category: 'Accessories',
      description:
        'Classic round tortoiseshell optical frames resting with a snap-closure charcoal wool felt case and microfiber cloth.',
      location: 'North Science Atrium',
      specificSpot: 'Lower Level Quiet Bench near Lab 108',
      date: '2026-11-07',
      status: 'open',
      imageKey: 'tortoise_glasses',
      identifyingDetails: 'Warm amber tortoiseshell acetate frames, charcoal heather felt snap case.',
      confidentialDetails:
        'Prescription progressive lenses; subtle silver diamond rivets on temple hinges.',
      dropoffLocation: 'North Science Security Desk',
      reporterId: 'usr-student-2',
      createdAt: '2026-11-07T15:25:00.000Z',
      updatedAt: '2026-11-07T15:25:00.000Z',
    },
    {
      id: 'itm-107',
      accessionCode: 'LF-2026-008',
      type: 'lost',
      title: 'Graphite Architecture Portfolio Tube & Drafting Scale',
      category: 'Bags & Apparel',
      description:
        'Matte charcoal telescoping drawing tube containing rolled vellum site plans and a triangular anodized aluminum metric scale.',
      location: 'West Quad Courtyard',
      specificSpot: 'Covered Arcade Walkway near Studio Annex',
      date: '2026-11-06',
      status: 'open',
      identifyingDetails: 'Black nylon shoulder strap, 36-inch matte graphite tube.',
      confidentialDetails:
        'Drawings inside are titled "Harbor Pavilion Elevation — Studio IV".',
      reporterId: 'usr-student-1',
      createdAt: '2026-11-06T17:10:00.000Z',
      updatedAt: '2026-11-06T17:10:00.000Z',
    },
    {
      id: 'itm-108',
      accessionCode: 'LF-2026-007',
      type: 'found',
      title: 'Set of 3 Dorm Keys on Navy Leather Tag',
      category: 'Keys',
      description:
        'Three brass and silver cylinder keys attached to a monogrammed navy leather fob found near the campus shuttle shelter.',
      location: 'Campus Transit Shuttle Stop',
      specificSpot: 'Northbound Shelter Bench',
      date: '2026-11-05',
      status: 'returned',
      identifyingDetails: 'Three keys on split steel ring with dark navy stitched leather tab.',
      confidentialDetails: 'Gold foil stamped initials "N.P." on reverse side of leather fob.',
      dropoffLocation: 'Founders Hall Campus Property Office, Room 102',
      reporterId: 'usr-admin-1',
      createdAt: '2026-11-05T08:45:00.000Z',
      updatedAt: '2026-11-06T14:00:00.000Z',
    },
  ];

  const claims: StoredClaim[] = [
    {
      id: 'clm-201',
      claimCode: 'CLM-2026-082',
      itemId: 'itm-102',
      claimantId: 'usr-student-1',
      ownershipProof:
        'My transit pass ending in 4189 is inside the inner right slot along with a folded receipt from Harbor Books dated November 9.',
      distinguishingMarks:
        'The brass key belongs to my Barton Hall studio locker and has a slight patina near the bow.',
      contactPhone: '(555) 234-8910',
      preferredPickup: 'Founders Hall Office — Afternoon (2:00 PM - 5:00 PM)',
      status: 'approved',
      reviewerNotes:
        'Verified transit pass digits and Harbor Books receipt against custody inventory.',
      pickupInstructions:
        'Please bring your Aldenbrook Student ID to Founders Hall Room 102 between 9:00 AM and 5:00 PM to sign the release ledger.',
      reviewedBy: 'Eleanor Hawthorne',
      reviewedAt: '2026-11-13T09:10:00.000Z',
      createdAt: '2026-11-12T10:15:00.000Z',
      updatedAt: '2026-11-13T09:10:00.000Z',
    },
    {
      id: 'clm-202',
      claimCode: 'CLM-2026-081',
      itemId: 'itm-101',
      claimantId: 'usr-student-3',
      ownershipProof:
        'Silver MacBook Pro 14-inch left in Sterling Library second floor on Thursday afternoon.',
      distinguishingMarks: 'Tan leather sleeve with snap button.',
      contactPhone: '(555) 481-6620',
      preferredPickup: 'Sterling Library Circulation Desk',
      status: 'pending',
      createdAt: '2026-11-13T11:20:00.000Z',
      updatedAt: '2026-11-13T11:20:00.000Z',
    },
    {
      id: 'clm-203',
      claimCode: 'CLM-2026-079',
      itemId: 'itm-108',
      claimantId: 'usr-student-3',
      ownershipProof:
        'Navy leather tag carries my initials N.P. stamped in gold foil on the back.',
      distinguishingMarks: 'Includes two brass Medeco keys and one smaller mailbox key.',
      contactPhone: '(555) 481-6620',
      preferredPickup: 'Founders Hall Office — Morning',
      status: 'returned',
      reviewerNotes: 'Identity verified via Student ID card; release form signed.',
      pickupInstructions: 'Released to owner on Nov 6, 2026.',
      reviewedBy: 'Eleanor Hawthorne',
      reviewedAt: '2026-11-06T14:00:00.000Z',
      createdAt: '2026-11-05T13:10:00.000Z',
      updatedAt: '2026-11-06T14:00:00.000Z',
    },
    {
      id: 'clm-204',
      claimCode: 'CLM-2026-077',
      itemId: 'itm-105',
      claimantId: 'usr-student-2',
      ownershipProof:
        'Brushed steel water bottle with small dent at bottom edge and navy lanyard.',
      distinguishingMarks: 'White X-stitching on the lanyard clasp tab.',
      contactPhone: '(555) 398-4421',
      preferredPickup: 'Athletic Pavilion Desk',
      status: 'returned',
      reviewerNotes: 'Verified physical dent and lanyard stitching.',
      pickupInstructions: 'Item collected and logged as returned.',
      reviewedBy: 'Eleanor Hawthorne',
      reviewedAt: '2026-11-10T11:30:00.000Z',
      createdAt: '2026-11-08T16:00:00.000Z',
      updatedAt: '2026-11-10T11:30:00.000Z',
    },
    {
      id: 'clm-205',
      claimCode: 'CLM-2026-075',
      itemId: 'itm-106',
      claimantId: 'usr-student-1',
      ownershipProof: 'Lost my reading glasses near North Science Atrium earlier this week.',
      distinguishingMarks: 'Brown plastic frames in a gray case.',
      contactPhone: '(555) 234-8910',
      preferredPickup: 'Founders Hall Office',
      status: 'rejected',
      reviewerNotes:
        'Prescription strength and temple rivet markings did not match the glasses held in custody.',
      reviewedBy: 'Eleanor Hawthorne',
      reviewedAt: '2026-11-09T10:00:00.000Z',
      createdAt: '2026-11-08T09:15:00.000Z',
      updatedAt: '2026-11-09T10:00:00.000Z',
    },
  ];

  const notifications: StoredNotification[] = [
    {
      id: 'ntf-1',
      userId: 'usr-student-1',
      title: 'Ownership Claim Approved — CLM-2026-082',
      message:
        'Your claim for Dark Espresso Leather Bifold Wallet & Brass Key (LF-2026-013) has been approved. Present your Student ID at Founders Hall Room 102.',
      type: 'claim',
      read: false,
      linkView: 'my-claims',
      linkId: 'clm-201',
      createdAt: '2026-11-13T09:10:00.000Z',
    },
    {
      id: 'ntf-2',
      userId: 'usr-student-1',
      title: 'Potential Match Notice — Electronics',
      message:
        'A new Electronics item (LF-2026-014) was logged at Sterling Memorial Library. Review the catalog to check if you recognize any belongings.',
      type: 'report',
      read: false,
      linkView: 'item-details',
      linkId: 'itm-101',
      createdAt: '2026-11-12T16:45:00.000Z',
    },
    {
      id: 'ntf-3',
      userId: 'usr-student-1',
      title: 'Claim Review Outcome — CLM-2026-075',
      message:
        'Your claim for Tortoiseshell Eyeglasses (LF-2026-009) was not approved because the frame verification markings did not match.',
      type: 'status',
      read: true,
      linkView: 'my-claims',
      linkId: 'clm-205',
      createdAt: '2026-11-09T10:05:00.000Z',
    },
    {
      id: 'ntf-4',
      userId: 'usr-admin-1',
      title: 'New Ownership Claim Pending Verification',
      message:
        'Nadia Patel submitted claim CLM-2026-081 for 14-inch Silver Laptop with Tan Leather Sleeve (LF-2026-014).',
      type: 'claim',
      read: false,
      linkView: 'admin-claims',
      linkId: 'clm-202',
      createdAt: '2026-11-13T11:20:00.000Z',
    },
  ];

  const activities: ActivityLog[] = [
    {
      id: 'act-1',
      actorName: 'Nadia Patel',
      actorRole: 'student',
      action: 'Submitted Claim',
      targetCode: 'CLM-2026-081',
      detail: 'Ownership claim filed for LF-2026-014 (Silver Laptop & Sleeve)',
      createdAt: '2026-11-13T11:20:00.000Z',
    },
    {
      id: 'act-2',
      actorName: 'Eleanor Hawthorne',
      actorRole: 'admin',
      action: 'Approved Claim',
      targetCode: 'CLM-2026-082',
      detail: 'Verified ownership proof for LF-2026-013 (Leather Bifold Wallet)',
      createdAt: '2026-11-13T09:10:00.000Z',
    },
    {
      id: 'act-3',
      actorName: 'Marcus Sterling',
      actorRole: 'student',
      action: 'Reported Found Item',
      targetCode: 'LF-2026-014',
      detail: 'Logged Silver Laptop & Tan Leather Sleeve at Sterling Library',
      createdAt: '2026-11-12T16:40:00.000Z',
    },
    {
      id: 'act-4',
      actorName: 'Eleanor Hawthorne',
      actorRole: 'admin',
      action: 'Marked Returned',
      targetCode: 'LF-2026-010',
      detail: 'Released Brushed Steel Flask & Lanyard to verified student owner',
      createdAt: '2026-11-10T11:30:00.000Z',
    },
  ];

  return {
    users,
    items,
    claims,
    notifications,
    activities,
    sequences: {
      item: 14,
      claim: 82,
    },
  };
}

function loadDb(): PortalDatabase {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PortalDatabase;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch {
    // Fall back to fresh seed if storage is corrupted or unavailable
  }
  const seed = createSeedDatabase();
  saveDb(seed);
  return seed;
}

function saveDb(db: PortalDatabase): void {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch {
    throw new Error(
      'Browser storage limit reached. Try removing large uploaded photographs or resetting demo data.'
    );
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

function getCurrentAuthUser(db: PortalDatabase): StoredUser {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Authentication required. Please sign in.');
  }
  const user = db.users.find((u) => u.id === token);
  if (!user) {
    setStoredToken(null);
    throw new Error('Session expired. Please sign in again.');
  }
  if (user.status !== 'active') {
    setStoredToken(null);
    throw new Error('This account is suspended. Contact Campus Property Office.');
  }
  return user;
}

function presentItem(item: StoredItem, db: PortalDatabase, viewer?: StoredUser): LostFoundItem {
  const reporter = db.users.find((u) => u.id === item.reporterId);
  const canSeeConfidential =
    Boolean(viewer) && (viewer!.role === 'admin' || viewer!.id === item.reporterId);
  const claimCount = db.claims.filter((c) => c.itemId === item.id).length;

  return {
    id: item.id,
    accessionCode: item.accessionCode,
    type: item.type,
    title: item.title,
    category: item.category as ItemCategory,
    description: item.description,
    location: item.location,
    specificSpot: item.specificSpot,
    date: item.date,
    status: item.status,
    imageKey: item.imageKey,
    imageUrl: item.imageUrl,
    identifyingDetails: item.identifyingDetails,
    confidentialDetails: canSeeConfidential ? item.confidentialDetails : undefined,
    dropoffLocation: item.dropoffLocation,
    reporterId: item.reporterId,
    reporterInitials: reporter ? getInitials(reporter.name) : 'C. O.',
    reporterRoleLabel: reporter?.role === 'admin' ? 'Campus Property Office' : 'Verified Student',
    claimCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function presentClaim(claim: StoredClaim, db: PortalDatabase, viewer: StoredUser): ClaimRecord {
  const item = db.items.find((i) => i.id === claim.itemId);
  const claimant = db.users.find((u) => u.id === claim.claimantId);
  return {
    id: claim.id,
    claimCode: claim.claimCode,
    itemId: claim.itemId,
    itemTitle: item?.title || 'Unknown Item',
    itemAccessionCode: item?.accessionCode || 'LF-UNKNOWN',
    itemType: item?.type,
    itemCategory: item?.category as ItemCategory | undefined,
    itemLocation: item?.location,
    itemImageKey: item?.imageKey,
    itemImageUrl: item?.imageUrl,
    itemConfidentialDetails: viewer.role === 'admin' ? item?.confidentialDetails : undefined,
    claimantId: claim.claimantId,
    claimantName: claimant?.name || 'Campus Student',
    claimantEmail: claimant?.email || '',
    claimantStudentId: claimant?.studentId || '',
    ownershipProof: claim.ownershipProof,
    distinguishingMarks: claim.distinguishingMarks,
    contactPhone: claim.contactPhone,
    preferredPickup: claim.preferredPickup,
    status: claim.status,
    reviewerNotes: claim.reviewerNotes,
    pickupInstructions: claim.pickupInstructions,
    reviewedBy: claim.reviewedBy,
    reviewedAt: claim.reviewedAt,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  };
}

export const portalApi = {
  resetDemoData(): void {
    const seed = createSeedDatabase();
    saveDb(seed);
    setStoredToken(null);
  },

  async login(payload: { email: string; password: string; portalRole?: UserRole }) {
    const db = loadDb();
    const email = payload.email.trim().toLowerCase();
    if (!email || !payload.password) {
      throw new Error('University email and password are required.');
    }
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || user.password !== payload.password) {
      throw new Error('Invalid institutional email or password.');
    }
    if (user.status !== 'active') {
      throw new Error('Your account has been suspended by an administrator.');
    }
    if (payload.portalRole === 'admin' && user.role !== 'admin') {
      throw new Error('This account does not have administrator privileges.');
    }
    setStoredToken(user.id);
    return { token: user.id, user: sanitizeUser(user) };
  },

  async register(payload: {
    name: string;
    email: string;
    studentId: string;
    department: string;
    phone: string;
    residence: string;
    password: string;
  }) {
    const db = loadDb();
    const email = payload.email.trim().toLowerCase();
    if (!payload.name.trim() || !email || !payload.studentId.trim() || !payload.password) {
      throw new Error('Full name, university email, student ID, and password are required.');
    }
    if (payload.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error('An account with this university email already exists.');
    }

    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: createId('usr'),
      name: payload.name.trim(),
      email,
      studentId: payload.studentId.trim().toUpperCase(),
      department: payload.department.trim() || 'Undergraduate Studies',
      phone: payload.phone.trim() || 'Not provided',
      residence: payload.residence.trim() || 'Campus Residence',
      role: 'student',
      status: 'active',
      password: payload.password,
      createdAt: now,
    };

    db.users.push(newUser);
    db.notifications.unshift({
      id: createId('ntf'),
      userId: newUser.id,
      title: 'Welcome to the Lost & Found Portal',
      message:
        'Your university portal account is active. You can report lost belongings, log found items, and track ownership claims.',
      type: 'system',
      read: false,
      linkView: 'dashboard',
      createdAt: now,
    });
    db.activities.unshift({
      id: createId('act'),
      actorName: newUser.name,
      actorRole: 'student',
      action: 'Registered Account',
      targetCode: newUser.studentId,
      detail: `New student profile activated (${newUser.department})`,
      createdAt: now,
    });

    saveDb(db);
    setStoredToken(newUser.id);
    return { token: newUser.id, user: sanitizeUser(newUser) };
  },

  async forgotPassword(payload: { email: string; newPassword?: string }) {
    const db = loadDb();
    const email = payload.email.trim().toLowerCase();
    if (!email) {
      throw new Error('Please enter your institutional email address.');
    }
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      throw new Error('No campus account was found for that email address.');
    }
    if (payload.newPassword !== undefined) {
      if (payload.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters.');
      }
      user.password = payload.newPassword;
      saveDb(db);
      return {
        resetComplete: true,
        message: 'Your password has been updated. You may now sign in with your new credentials.',
      };
    }
    return {
      verified: true,
      message: `Identity confirmed for ${user.name} (${user.studentId}). Enter a new password below to complete recovery.`,
    };
  },

  async getMe() {
    const db = loadDb();
    const user = getCurrentAuthUser(db);
    return { user: sanitizeUser(user) };
  },

  async updateProfile(payload: {
    name: string;
    department: string;
    phone: string;
    residence: string;
  }) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    if (payload.name.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters.');
    }
    authUser.name = payload.name.trim();
    authUser.department = payload.department.trim() || authUser.department;
    authUser.phone = payload.phone.trim() || 'Not provided';
    authUser.residence = payload.residence.trim() || 'Campus Residence';
    saveDb(db);
    return { user: sanitizeUser(authUser) };
  },

  async getStats(): Promise<DashboardStats> {
    const db = loadDb();
    const totalLost = db.items.filter((i) => i.type === 'lost').length;
    const totalFound = db.items.filter((i) => i.type === 'found').length;
    const returnedCount = db.items.filter((i) => i.status === 'returned').length;
    const openCount = db.items.filter((i) => i.status === 'open').length;
    const pendingClaimsCount = db.claims.filter((c) => c.status === 'pending').length;
    const totalResolved =
      returnedCount + db.items.filter((i) => i.status === 'claimed').length;
    const recoveryRate =
      db.items.length > 0 ? Math.round((totalResolved / db.items.length) * 100) : 0;

    return {
      totalLost,
      totalFound,
      returnedCount,
      openCount,
      pendingClaimsCount,
      recoveryRate,
    };
  },

  async getItems(params?: Record<string, string>) {
    const db = loadDb();
    const token = getStoredToken();
    const viewer = token ? db.users.find((u) => u.id === token && u.status === 'active') : undefined;

    let results = [...db.items];
    if (params?.mine === 'true' && viewer) {
      results = results.filter((i) => i.reporterId === viewer.id);
    } else if (viewer?.role !== 'admin') {
      results = results.filter((i) => i.status !== 'archived');
    }

    if (params?.type && params.type !== 'all') {
      results = results.filter((i) => i.type === params.type);
    }
    if (params?.category && params.category !== 'all') {
      results = results.filter((i) => i.category === params.category);
    }
    if (params?.location && params.location !== 'all') {
      results = results.filter((i) => i.location === params.location);
    }
    if (params?.status && params.status !== 'all') {
      results = results.filter((i) => i.status === params.status);
    }
    if (params?.q && params.q.trim()) {
      const q = params.q.trim().toLowerCase();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.accessionCode.toLowerCase().includes(q)
      );
    }

    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      items: results.map((item) => presentItem(item, db, viewer)),
    };
  },

  async getItemById(id: string) {
    const db = loadDb();
    const token = getStoredToken();
    const viewer = token ? db.users.find((u) => u.id === token && u.status === 'active') : undefined;
    const item = db.items.find((i) => i.id === id);
    if (!item) {
      throw new Error('Item record not found.');
    }
    return { item: presentItem(item, db, viewer) };
  },

  async createItem(payload: {
    type: 'lost' | 'found';
    title: string;
    category: string;
    description: string;
    location: string;
    specificSpot: string;
    date: string;
    imageUrl?: string;
    identifyingDetails: string;
    confidentialDetails: string;
    dropoffLocation?: string;
  }) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);

    if (!payload.title.trim() || !payload.description.trim() || !payload.location || !payload.date) {
      throw new Error('Please complete all required item fields.');
    }

    db.sequences.item += 1;
    const accessionCode = `LF-2026-${String(db.sequences.item).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newItem: StoredItem = {
      id: createId('itm'),
      accessionCode,
      type: payload.type === 'lost' ? 'lost' : 'found',
      title: payload.title.trim(),
      category: payload.category.trim(),
      description: payload.description.trim(),
      location: payload.location.trim(),
      specificSpot: payload.specificSpot.trim() || 'Main Floor',
      date: payload.date,
      status: 'open',
      imageUrl: payload.imageUrl || undefined,
      identifyingDetails:
        payload.identifyingDetails.trim() || 'Standard campus item description provided.',
      confidentialDetails:
        payload.confidentialDetails.trim() || 'No confidential marker recorded.',
      dropoffLocation:
        payload.type === 'found'
          ? payload.dropoffLocation?.trim() || 'Founders Hall Campus Property Office, Room 102'
          : undefined,
      reporterId: authUser.id,
      createdAt: now,
      updatedAt: now,
    };

    db.items.unshift(newItem);
    db.activities.unshift({
      id: createId('act'),
      actorName: authUser.name,
      actorRole: authUser.role,
      action: newItem.type === 'lost' ? 'Reported Lost Item' : 'Reported Found Item',
      targetCode: accessionCode,
      detail: `${newItem.title} at ${newItem.location}`,
      createdAt: now,
    });

    const admins = db.users.filter((u) => u.role === 'admin');
    for (const admin of admins) {
      if (admin.id !== authUser.id) {
        db.notifications.unshift({
          id: createId('ntf'),
          userId: admin.id,
          title: `New ${newItem.type === 'lost' ? 'Lost' : 'Found'} Report — ${accessionCode}`,
          message: `${authUser.name} logged "${newItem.title}" (${newItem.location}).`,
          type: 'report',
          read: false,
          linkView: 'admin-listings',
          linkId: newItem.id,
          createdAt: now,
        });
      }
    }

    saveDb(db);
    return { item: presentItem(newItem, db, authUser) };
  },

  async updateItem(
    id: string,
    payload: Partial<{
      status: ItemStatus;
      title: string;
      description: string;
      location: string;
      specificSpot: string;
      identifyingDetails: string;
      dropoffLocation: string;
    }>
  ) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    const item = db.items.find((i) => i.id === id);
    if (!item) {
      throw new Error('Item not found.');
    }
    if (item.reporterId !== authUser.id && authUser.role !== 'admin') {
      throw new Error('You do not have permission to edit this report.');
    }

    if (payload.status && ['open', 'claimed', 'returned', 'archived'].includes(payload.status)) {
      item.status = payload.status;
    }
    if (payload.title !== undefined && payload.title.trim()) item.title = payload.title.trim();
    if (payload.description !== undefined && payload.description.trim()) {
      item.description = payload.description.trim();
    }
    if (payload.location !== undefined && payload.location.trim()) {
      item.location = payload.location.trim();
    }
    if (payload.specificSpot !== undefined) item.specificSpot = payload.specificSpot.trim();
    if (payload.identifyingDetails !== undefined) {
      item.identifyingDetails = payload.identifyingDetails.trim();
    }
    if (payload.dropoffLocation !== undefined) {
      item.dropoffLocation = payload.dropoffLocation.trim();
    }
    item.updatedAt = new Date().toISOString();

    if (payload.status === 'returned') {
      db.activities.unshift({
        id: createId('act'),
        actorName: authUser.name,
        actorRole: authUser.role,
        action: 'Marked Returned',
        targetCode: item.accessionCode,
        detail: `${item.title} updated to Returned`,
        createdAt: item.updatedAt,
      });
    }

    saveDb(db);
    return { item: presentItem(item, db, authUser) };
  },

  async deleteItem(id: string) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    const index = db.items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error('Item not found.');
    }
    const item = db.items[index];
    if (item.reporterId !== authUser.id && authUser.role !== 'admin') {
      throw new Error('Unauthorized to remove this listing.');
    }
    db.items.splice(index, 1);
    db.claims = db.claims.filter((c) => c.itemId !== item.id);
    saveDb(db);
    return { deleted: true };
  },

  async getClaims() {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    const list =
      authUser.role === 'admin'
        ? db.claims
        : db.claims.filter((c) => c.claimantId === authUser.id);
    const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      claims: sorted.map((c) => presentClaim(c, db, authUser)),
    };
  },

  async submitClaim(payload: {
    itemId: string;
    ownershipProof: string;
    distinguishingMarks: string;
    contactPhone: string;
    preferredPickup: string;
  }) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);

    if (!payload.itemId || !payload.ownershipProof.trim() || !payload.distinguishingMarks.trim()) {
      throw new Error('Ownership proof and distinguishing details are required.');
    }

    const item = db.items.find((i) => i.id === payload.itemId);
    if (!item) {
      throw new Error('Referenced item was not found.');
    }
    if (item.status === 'returned' || item.status === 'archived') {
      throw new Error('This item has already been resolved and cannot be claimed.');
    }
    const existingActive = db.claims.find(
      (c) =>
        c.itemId === payload.itemId &&
        c.claimantId === authUser.id &&
        (c.status === 'pending' || c.status === 'approved')
    );
    if (existingActive) {
      throw new Error('You already have an active claim submitted for this item.');
    }

    db.sequences.claim += 1;
    const claimCode = `CLM-2026-${String(db.sequences.claim).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newClaim: StoredClaim = {
      id: createId('clm'),
      claimCode,
      itemId: payload.itemId,
      claimantId: authUser.id,
      ownershipProof: payload.ownershipProof.trim(),
      distinguishingMarks: payload.distinguishingMarks.trim(),
      contactPhone: payload.contactPhone.trim() || authUser.phone,
      preferredPickup:
        payload.preferredPickup.trim() || 'Founders Hall Campus Property Office',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    db.claims.unshift(newClaim);
    db.activities.unshift({
      id: createId('act'),
      actorName: authUser.name,
      actorRole: authUser.role,
      action: 'Submitted Claim',
      targetCode: claimCode,
      detail: `Ownership claim filed for ${item.accessionCode} (${item.title})`,
      createdAt: now,
    });

    const admins = db.users.filter((u) => u.role === 'admin');
    for (const admin of admins) {
      db.notifications.unshift({
        id: createId('ntf'),
        userId: admin.id,
        title: `New Claim Awaiting Verification — ${claimCode}`,
        message: `${authUser.name} submitted proof for ${item.title} (${item.accessionCode}).`,
        type: 'claim',
        read: false,
        linkView: 'admin-claims',
        linkId: newClaim.id,
        createdAt: now,
      });
    }

    saveDb(db);
    return { claim: presentClaim(newClaim, db, authUser) };
  },

  async reviewClaim(
    id: string,
    payload: {
      status: ClaimStatus;
      reviewerNotes?: string;
      pickupInstructions?: string;
    }
  ) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    if (authUser.role !== 'admin') {
      throw new Error('Administrator privileges required.');
    }
    const claim = db.claims.find((c) => c.id === id);
    if (!claim) {
      throw new Error('Claim record not found.');
    }

    const item = db.items.find((i) => i.id === claim.itemId);
    const now = new Date().toISOString();

    claim.status = payload.status;
    if (payload.reviewerNotes !== undefined) {
      claim.reviewerNotes = payload.reviewerNotes.trim() || claim.reviewerNotes;
    }
    if (payload.pickupInstructions !== undefined) {
      claim.pickupInstructions = payload.pickupInstructions.trim() || claim.pickupInstructions;
    }
    claim.reviewedBy = authUser.name;
    claim.reviewedAt = now;
    claim.updatedAt = now;

    if (item) {
      if (payload.status === 'approved') {
        item.status = 'claimed';
        item.updatedAt = now;
      } else if (payload.status === 'returned') {
        item.status = 'returned';
        item.updatedAt = now;
      } else if (payload.status === 'rejected' && item.status === 'claimed') {
        item.status = 'open';
        item.updatedAt = now;
      }
    }

    const actionLabel =
      payload.status === 'approved'
        ? 'Approved Claim'
        : payload.status === 'rejected'
        ? 'Rejected Claim'
        : payload.status === 'returned'
        ? 'Marked Returned'
        : 'Updated Claim';

    db.activities.unshift({
      id: createId('act'),
      actorName: authUser.name,
      actorRole: 'admin',
      action: actionLabel,
      targetCode: claim.claimCode,
      detail: `${actionLabel} for ${item?.accessionCode || claim.itemId}`,
      createdAt: now,
    });

    const claimantTitle =
      payload.status === 'approved'
        ? `Ownership Claim Approved — ${claim.claimCode}`
        : payload.status === 'rejected'
        ? `Claim Review Outcome — ${claim.claimCode}`
        : `Item Marked Returned — ${claim.claimCode}`;

    const claimantMsg =
      payload.status === 'approved'
        ? `Your ownership proof for ${item?.title || 'the item'} was verified. ${
            claim.pickupInstructions || 'Present your Student ID at Founders Hall Room 102.'
          }`
        : payload.status === 'rejected'
        ? `Your claim for ${item?.title || 'the item'} was not approved. ${
            claim.reviewerNotes || 'Verification details did not match custody records.'
          }`
        : `${item?.title || 'Your item'} has been signed out and recorded as Returned.`;

    db.notifications.unshift({
      id: createId('ntf'),
      userId: claim.claimantId,
      title: claimantTitle,
      message: claimantMsg,
      type: 'status',
      read: false,
      linkView: 'my-claims',
      linkId: claim.id,
      createdAt: now,
    });

    saveDb(db);
    return { claim: presentClaim(claim, db, authUser) };
  },

  async getNotifications() {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    const list = db.notifications
      .filter((n) => n.userId === authUser.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { notifications: list };
  },

  async markNotificationRead(id: string) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    const ntf = db.notifications.find((n) => n.id === id && n.userId === authUser.id);
    if (!ntf) {
      throw new Error('Notification not found.');
    }
    ntf.read = true;
    saveDb(db);
    return { notification: ntf };
  },

  async markAllNotificationsRead() {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    for (const n of db.notifications) {
      if (n.userId === authUser.id) n.read = true;
    }
    saveDb(db);
    return { ok: true };
  },

  async getAdminOverview() {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    if (authUser.role !== 'admin') {
      throw new Error('Administrator privileges required.');
    }
    const users: AdminUserSummary[] = db.users.map((u) => ({
      ...sanitizeUser(u),
      reportsCount: db.items.filter((i) => i.reporterId === u.id).length,
      claimsCount: db.claims.filter((c) => c.claimantId === u.id).length,
    }));
    return {
      users,
      activities: db.activities.slice(0, 20),
    };
  },

  async updateAdminUser(id: string, payload: { status?: UserStatus; role?: UserRole }) {
    const db = loadDb();
    const authUser = getCurrentAuthUser(db);
    if (authUser.role !== 'admin') {
      throw new Error('Administrator privileges required.');
    }
    const target = db.users.find((u) => u.id === id);
    if (!target) {
      throw new Error('User not found.');
    }
    if (target.id === authUser.id && payload.status === 'suspended') {
      throw new Error('You cannot suspend your own active administrator session.');
    }
    if (payload.status && ['active', 'suspended'].includes(payload.status)) {
      target.status = payload.status;
    }
    if (payload.role && ['student', 'admin'].includes(payload.role)) {
      target.role = payload.role;
    }
    const now = new Date().toISOString();
    db.activities.unshift({
      id: createId('act'),
      actorName: authUser.name,
      actorRole: 'admin',
      action: 'Updated User Access',
      targetCode: target.studentId,
      detail: `${target.name} set to ${target.role} (${target.status})`,
      createdAt: now,
    });
    saveDb(db);
    return { user: sanitizeUser(target) };
  },
};

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parsed = dateStr.includes('T') ? new Date(dateStr) : new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortTimestamp(isoStr: string): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return (
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) +
    ' · ' +
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  );
}
