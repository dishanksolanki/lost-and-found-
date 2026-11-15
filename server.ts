import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

type UserRole = 'student' | 'admin';
type UserStatus = 'active' | 'suspended';
type ItemType = 'lost' | 'found';
type ItemStatus = 'open' | 'claimed' | 'returned' | 'archived';
type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'returned';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  phone: string;
  residence: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  createdAt: string;
}

interface StoredItem {
  id: string;
  accessionCode: string;
  type: ItemType;
  title: string;
  category: string;
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
  linkView?: string;
  linkId?: string;
  createdAt: string;
}

interface StoredActivity {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetCode: string;
  detail: string;
  createdAt: string;
}

interface PortalDatabase {
  users: StoredUser[];
  items: StoredItem[];
  claims: StoredClaim[];
  notifications: StoredNotification[];
  activities: StoredActivity[];
  sequences: {
    item: number;
    claim: number;
  };
}

interface AuthenticatedRequest extends Request {
  authUser?: StoredUser;
}

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'portal-db.json');
const TOKEN_SECRET = process.env.SESSION_SECRET || 'aldenbrook-campus-lost-found-registry-2026';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function signToken(userId: string, role: UserRole): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid: userId,
      role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): { uid: string; role: UserRole } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid: string;
      role: UserRole;
      exp: number;
    };
    if (!decoded.uid || decoded.exp < Date.now()) return null;
    return { uid: decoded.uid, role: decoded.role };
  } catch {
    return null;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return `${parts[0][0]?.toUpperCase() || 'U'}.`;
  return `${parts[0][0]?.toUpperCase() || ''}. ${parts[parts.length - 1][0]?.toUpperCase() || ''}.`;
}

function sanitizeUser(user: StoredUser) {
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
  const studentPassword = hashPassword('Student2026!');
  const adminPassword = hashPassword('Admin2026!');

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
      passwordHash: studentPassword,
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
      passwordHash: studentPassword,
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
      passwordHash: studentPassword,
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
      passwordHash: adminPassword,
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
      identifyingDetails: 'Tan leather snap-closure sleeve, subtle brass snap hardware, USB-C ports on left flank.',
      confidentialDetails: 'Serial suffix ends in X9K2; lockscreen displays an architectural line drawing of Florence Cathedral.',
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
      identifyingDetails: 'Dark espresso stitched leather bifold accompanied by one brass carabiner key fob.',
      confidentialDetails: 'Contains a student transit pass ending in 4189 and a folded receipt from Harbor Books.',
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
      identifyingDetails: 'Matte deep navy earcups, braided navy cable, minor scuff on left headband slider.',
      confidentialDetails: 'Bluetooth device name is registered as "Clara Studio Cans"; inside right ear cushion has tiny ink mark.',
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
      identifyingDetails: 'Navy clothbound hardcover with gilt spine lettering, hexagonal raw brass fountain pen.',
      confidentialDetails: 'Front flyleaf has pencil annotations dated Oct 12; pen uses dark blue archival ink.',
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
      confidentialDetails: 'Small dent near the base rim; lanyard clasp has white cross-stitch reinforcement.',
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
      confidentialDetails: 'Prescription progressive lenses; subtle silver diamond rivets on temple hinges.',
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
      confidentialDetails: 'Drawings inside are titled "Harbor Pavilion Elevation — Studio IV".',
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
      distinguishingMarks: 'The brass key belongs to my Barton Hall studio locker and has a slight patina near the bow.',
      contactPhone: '(555) 234-8910',
      preferredPickup: 'Founders Hall Office — Afternoon (2:00 PM - 5:00 PM)',
      status: 'approved',
      reviewerNotes: 'Verified transit pass digits and Harbor Books receipt against custody inventory.',
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
      ownershipProof: 'Silver MacBook Pro 14-inch left in Sterling Library second floor on Thursday afternoon.',
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
      ownershipProof: 'Navy leather tag carries my initials N.P. stamped in gold foil on the back.',
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
      ownershipProof: 'Brushed steel water bottle with small dent at bottom edge and navy lanyard.',
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

  const activities: StoredActivity[] = [
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

let dbCache: PortalDatabase | null = null;

async function loadDb(): Promise<PortalDatabase> {
  if (dbCache) return dbCache;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DB_PATH, 'utf8');
    dbCache = JSON.parse(raw) as PortalDatabase;
    return dbCache;
  } catch {
    const seed = createSeedDatabase();
    dbCache = seed;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return dbCache;
  }
}

async function saveDb(db: PortalDatabase): Promise<void> {
  dbCache = db;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function presentItem(item: StoredItem, db: PortalDatabase, viewer?: StoredUser) {
  const reporter = db.users.find((u) => u.id === item.reporterId);
  const canSeeConfidential =
    viewer && (viewer.role === 'admin' || viewer.id === item.reporterId);
  const claimCount = db.claims.filter((c) => c.itemId === item.id).length;

  return {
    id: item.id,
    accessionCode: item.accessionCode,
    type: item.type,
    title: item.title,
    category: item.category,
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

function presentClaim(claim: StoredClaim, db: PortalDatabase, viewer: StoredUser) {
  const item = db.items.find((i) => i.id === claim.itemId);
  const claimant = db.users.find((u) => u.id === claim.claimantId);
  return {
    id: claim.id,
    claimCode: claim.claimCode,
    itemId: claim.itemId,
    itemTitle: item?.title || 'Unknown Item',
    itemAccessionCode: item?.accessionCode || 'LF-UNKNOWN',
    itemType: item?.type,
    itemCategory: item?.category,
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

async function attachOptionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const parsed = verifyToken(header.slice(7));
    if (parsed) {
      const db = await loadDb();
      const user = db.users.find((u) => u.id === parsed.uid);
      if (user && user.status === 'active') {
        req.authUser = user;
      }
    }
  }
  next();
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  const parsed = verifyToken(header.slice(7));
  if (!parsed) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }
  const db = await loadDb();
  const user = db.users.find((u) => u.id === parsed.uid);
  if (!user) {
    res.status(401).json({ error: 'Account not found.' });
    return;
  }
  if (user.status !== 'active') {
    res.status(403).json({ error: 'This account is suspended. Contact Campus Property Office.' });
    return;
  }
  req.authUser = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.authUser || req.authUser.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges required.' });
    return;
  }
  next();
}

async function startServer() {
  await loadDb();
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  // Auth Routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password, portalRole } = req.body as {
      email?: string;
      password?: string;
      portalRole?: UserRole;
    };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const db = await loadDb();
    const normalizedEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid institutional email or password.' });
      return;
    }
    if (user.status !== 'active') {
      res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
      return;
    }
    if (portalRole === 'admin' && user.role !== 'admin') {
      res.status(403).json({ error: 'This account does not have administrator access.' });
      return;
    }
    const token = signToken(user.id, user.role);
    res.json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { name, email, studentId, department, phone, residence, password } = req.body as {
      name?: string;
      email?: string;
      studentId?: string;
      department?: string;
      phone?: string;
      residence?: string;
      password?: string;
    };

    if (!name || !email || !studentId || !password) {
      res.status(400).json({ error: 'Full name, university email, student ID, and password are required.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const db = await loadDb();
    const normalizedEmail = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      res.status(409).json({ error: 'An account with this university email already exists.' });
      return;
    }

    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name: name.trim(),
      email: normalizedEmail,
      studentId: studentId.trim().toUpperCase(),
      department: department?.trim() || 'Undergraduate Studies',
      phone: phone?.trim() || 'Not provided',
      residence: residence?.trim() || 'Campus Residence',
      role: 'student',
      status: 'active',
      passwordHash: hashPassword(password),
      createdAt: now,
    };

    db.users.push(newUser);
    db.notifications.unshift({
      id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
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
      id: `act-${crypto.randomUUID().slice(0, 8)}`,
      actorName: newUser.name,
      actorRole: 'student',
      action: 'Registered Account',
      targetCode: newUser.studentId,
      detail: `New student profile activated (${newUser.department})`,
      createdAt: now,
    });

    await saveDb(db);
    const token = signToken(newUser.id, newUser.role);
    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    const { email, newPassword } = req.body as { email?: string; newPassword?: string };
    if (!email) {
      res.status(400).json({ error: 'Please enter your institutional email address.' });
      return;
    }
    const db = await loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      res.status(404).json({ error: 'No campus account was found for that email address.' });
      return;
    }
    if (newPassword) {
      if (newPassword.length < 8) {
        res.status(400).json({ error: 'New password must be at least 8 characters.' });
        return;
      }
      user.passwordHash = hashPassword(newPassword);
      await saveDb(db);
      res.json({
        resetComplete: true,
        message: 'Your password has been updated. You may now sign in with your new credentials.',
      });
      return;
    }
    res.json({
      verified: true,
      message: `Identity confirmed for ${user.name} (${user.studentId}). Enter a new password below to complete recovery.`,
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: sanitizeUser(req.authUser!) });
  });

  app.patch('/api/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { name, department, phone, residence } = req.body as {
      name?: string;
      department?: string;
      phone?: string;
      residence?: string;
    };
    const db = await loadDb();
    const user = db.users.find((u) => u.id === req.authUser!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (name && name.trim().length >= 2) user.name = name.trim();
    if (department !== undefined) user.department = department.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (residence !== undefined) user.residence = residence.trim();

    await saveDb(db);
    res.json({ user: sanitizeUser(user) });
  });

  // Stats & Overview
  app.get('/api/stats', attachOptionalAuth, async (_req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const totalLost = db.items.filter((i) => i.type === 'lost').length;
    const totalFound = db.items.filter((i) => i.type === 'found').length;
    const returnedCount = db.items.filter((i) => i.status === 'returned').length;
    const openCount = db.items.filter((i) => i.status === 'open').length;
    const pendingClaimsCount = db.claims.filter((c) => c.status === 'pending').length;
    const totalResolved = returnedCount + db.items.filter((i) => i.status === 'claimed').length;
    const recoveryRate = db.items.length > 0 ? Math.round((totalResolved / db.items.length) * 100) : 0;

    res.json({
      totalLost,
      totalFound,
      returnedCount,
      openCount,
      pendingClaimsCount,
      recoveryRate,
    });
  });

  // Items Routes
  app.get('/api/items', attachOptionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const { type, category, location, status, q, dateFrom, dateTo, sort, mine } = req.query as Record<
      string,
      string | undefined
    >;

    let results = [...db.items];
    if (mine === 'true' && req.authUser) {
      results = results.filter((i) => i.reporterId === req.authUser!.id);
    } else if (req.authUser?.role !== 'admin') {
      results = results.filter((i) => i.status !== 'archived');
    }

    if (type && type !== 'all') {
      results = results.filter((i) => i.type === type);
    }
    if (category && category !== 'all') {
      results = results.filter((i) => i.category === category);
    }
    if (location && location !== 'all') {
      results = results.filter((i) => i.location === location);
    }
    if (status && status !== 'all') {
      results = results.filter((i) => i.status === status);
    }
    if (dateFrom) {
      results = results.filter((i) => i.date >= dateFrom);
    }
    if (dateTo) {
      results = results.filter((i) => i.date <= dateTo);
    }
    if (q && q.trim()) {
      const needle = q.trim().toLowerCase();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(needle) ||
          i.description.toLowerCase().includes(needle) ||
          i.location.toLowerCase().includes(needle) ||
          i.category.toLowerCase().includes(needle) ||
          i.accessionCode.toLowerCase().includes(needle)
      );
    }

    if (sort === 'oldest') {
      results.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sort === 'title') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    res.json({
      items: results.map((item) => presentItem(item, db, req.authUser)),
    });
  });

  app.get('/api/items/:id', attachOptionalAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const item = db.items.find((i) => i.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Item record not found.' });
      return;
    }
    res.json({ item: presentItem(item, db, req.authUser) });
  });

  app.post('/api/items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const {
      type,
      title,
      category,
      description,
      location,
      specificSpot,
      date,
      imageUrl,
      identifyingDetails,
      confidentialDetails,
      dropoffLocation,
    } = req.body as Partial<StoredItem>;

    if (!type || !title || !category || !description || !location || !date) {
      res.status(400).json({ error: 'Please complete all required item fields.' });
      return;
    }

    const db = await loadDb();
    db.sequences.item += 1;
    const accessionCode = `LF-2026-${String(db.sequences.item).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newItem: StoredItem = {
      id: `itm-${crypto.randomUUID().slice(0, 8)}`,
      accessionCode,
      type: type === 'lost' ? 'lost' : 'found',
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location.trim(),
      specificSpot: specificSpot?.trim() || 'Main Floor',
      date,
      status: 'open',
      imageUrl: imageUrl || undefined,
      identifyingDetails: identifyingDetails?.trim() || 'Standard campus item description provided.',
      confidentialDetails: confidentialDetails?.trim() || 'No confidential marker recorded.',
      dropoffLocation:
        type === 'found'
          ? dropoffLocation?.trim() || 'Founders Hall Campus Property Office, Room 102'
          : undefined,
      reporterId: req.authUser!.id,
      createdAt: now,
      updatedAt: now,
    };

    db.items.unshift(newItem);
    db.activities.unshift({
      id: `act-${crypto.randomUUID().slice(0, 8)}`,
      actorName: req.authUser!.name,
      actorRole: req.authUser!.role,
      action: newItem.type === 'lost' ? 'Reported Lost Item' : 'Reported Found Item',
      targetCode: accessionCode,
      detail: `${newItem.title} at ${newItem.location}`,
      createdAt: now,
    });

    // Notify admins of new listing
    const admins = db.users.filter((u) => u.role === 'admin');
    for (const admin of admins) {
      if (admin.id !== req.authUser!.id) {
        db.notifications.unshift({
          id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
          userId: admin.id,
          title: `New ${newItem.type === 'lost' ? 'Lost' : 'Found'} Report — ${accessionCode}`,
          message: `${req.authUser!.name} logged "${newItem.title}" (${newItem.location}).`,
          type: 'report',
          read: false,
          linkView: 'admin-listings',
          linkId: newItem.id,
          createdAt: now,
        });
      }
    }

    await saveDb(db);
    res.status(201).json({ item: presentItem(newItem, db, req.authUser) });
  });

  app.patch('/api/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const item = db.items.find((i) => i.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }
    const isOwner = item.reporterId === req.authUser!.id;
    const isAdmin = req.authUser!.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'You do not have permission to edit this report.' });
      return;
    }

    const { status, title, description, location, specificSpot, identifyingDetails, dropoffLocation } =
      req.body as Partial<StoredItem>;
    if (status && ['open', 'claimed', 'returned', 'archived'].includes(status)) {
      item.status = status;
    }
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (location) item.location = location.trim();
    if (specificSpot) item.specificSpot = specificSpot.trim();
    if (identifyingDetails) item.identifyingDetails = identifyingDetails.trim();
    if (dropoffLocation !== undefined) item.dropoffLocation = dropoffLocation.trim();
    item.updatedAt = new Date().toISOString();

    if (status === 'returned') {
      db.activities.unshift({
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        actorName: req.authUser!.name,
        actorRole: req.authUser!.role,
        action: 'Marked Returned',
        targetCode: item.accessionCode,
        detail: `${item.title} updated to Returned`,
        createdAt: item.updatedAt,
      });
    }

    await saveDb(db);
    res.json({ item: presentItem(item, db, req.authUser) });
  });

  app.delete('/api/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const index = db.items.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }
    const item = db.items[index];
    if (item.reporterId !== req.authUser!.id && req.authUser!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to remove this listing.' });
      return;
    }
    db.items.splice(index, 1);
    db.claims = db.claims.filter((c) => c.itemId !== item.id);
    await saveDb(db);
    res.json({ deleted: true });
  });

  // Claims Routes
  app.get('/api/claims', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const list =
      req.authUser!.role === 'admin'
        ? db.claims
        : db.claims.filter((c) => c.claimantId === req.authUser!.id);
    const sorted = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({
      claims: sorted.map((c) => presentClaim(c, db, req.authUser!)),
    });
  });

  app.post('/api/claims', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { itemId, ownershipProof, distinguishingMarks, contactPhone, preferredPickup } = req.body as {
      itemId?: string;
      ownershipProof?: string;
      distinguishingMarks?: string;
      contactPhone?: string;
      preferredPickup?: string;
    };

    if (!itemId || !ownershipProof || !distinguishingMarks) {
      res.status(400).json({ error: 'Ownership proof and distinguishing details are required.' });
      return;
    }

    const db = await loadDb();
    const item = db.items.find((i) => i.id === itemId);
    if (!item) {
      res.status(404).json({ error: 'Referenced item was not found.' });
      return;
    }
    if (item.status === 'returned' || item.status === 'archived') {
      res.status(400).json({ error: 'This item has already been resolved and cannot be claimed.' });
      return;
    }
    const existingActive = db.claims.find(
      (c) =>
        c.itemId === itemId &&
        c.claimantId === req.authUser!.id &&
        (c.status === 'pending' || c.status === 'approved')
    );
    if (existingActive) {
      res.status(409).json({ error: 'You already have an active claim submitted for this item.' });
      return;
    }

    db.sequences.claim += 1;
    const claimCode = `CLM-2026-${String(db.sequences.claim).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newClaim: StoredClaim = {
      id: `clm-${crypto.randomUUID().slice(0, 8)}`,
      claimCode,
      itemId,
      claimantId: req.authUser!.id,
      ownershipProof: ownershipProof.trim(),
      distinguishingMarks: distinguishingMarks.trim(),
      contactPhone: contactPhone?.trim() || req.authUser!.phone,
      preferredPickup: preferredPickup?.trim() || 'Founders Hall Campus Property Office',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    db.claims.unshift(newClaim);
    db.activities.unshift({
      id: `act-${crypto.randomUUID().slice(0, 8)}`,
      actorName: req.authUser!.name,
      actorRole: req.authUser!.role,
      action: 'Submitted Claim',
      targetCode: claimCode,
      detail: `Ownership claim filed for ${item.accessionCode} (${item.title})`,
      createdAt: now,
    });

    // Notify admins
    const admins = db.users.filter((u) => u.role === 'admin');
    for (const admin of admins) {
      db.notifications.unshift({
        id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
        userId: admin.id,
        title: `New Claim Awaiting Verification — ${claimCode}`,
        message: `${req.authUser!.name} submitted proof for ${item.title} (${item.accessionCode}).`,
        type: 'claim',
        read: false,
        linkView: 'admin-claims',
        linkId: newClaim.id,
        createdAt: now,
      });
    }

    await saveDb(db);
    res.status(201).json({ claim: presentClaim(newClaim, db, req.authUser!) });
  });

  app.patch(
    '/api/claims/:id/review',
    requireAuth,
    requireAdmin,
    async (req: AuthenticatedRequest, res: Response) => {
      const { status, reviewerNotes, pickupInstructions } = req.body as {
        status?: ClaimStatus;
        reviewerNotes?: string;
        pickupInstructions?: string;
      };
      if (!status || !['approved', 'rejected', 'returned', 'pending'].includes(status)) {
        res.status(400).json({ error: 'Valid claim status is required.' });
        return;
      }

      const db = await loadDb();
      const claim = db.claims.find((c) => c.id === req.params.id);
      if (!claim) {
        res.status(404).json({ error: 'Claim not found.' });
        return;
      }
      const item = db.items.find((i) => i.id === claim.itemId);
      const now = new Date().toISOString();

      claim.status = status;
      claim.reviewerNotes = reviewerNotes?.trim() || claim.reviewerNotes;
      claim.pickupInstructions = pickupInstructions?.trim() || claim.pickupInstructions;
      claim.reviewedBy = req.authUser!.name;
      claim.reviewedAt = now;
      claim.updatedAt = now;

      if (item) {
        if (status === 'approved') {
          item.status = 'claimed';
          item.updatedAt = now;
        } else if (status === 'returned') {
          item.status = 'returned';
          item.updatedAt = now;
        } else if (status === 'rejected' && item.status === 'claimed') {
          item.status = 'open';
          item.updatedAt = now;
        }
      }

      const actionLabel =
        status === 'approved'
          ? 'Approved Claim'
          : status === 'rejected'
          ? 'Rejected Claim'
          : status === 'returned'
          ? 'Marked Returned'
          : 'Updated Claim';

      db.activities.unshift({
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        actorName: req.authUser!.name,
        actorRole: 'admin',
        action: actionLabel,
        targetCode: claim.claimCode,
        detail: `${actionLabel} for ${item?.accessionCode || claim.itemId}`,
        createdAt: now,
      });

      const claimantTitle =
        status === 'approved'
          ? `Ownership Claim Approved — ${claim.claimCode}`
          : status === 'rejected'
          ? `Claim Review Outcome — ${claim.claimCode}`
          : `Item Marked Returned — ${claim.claimCode}`;

      const claimantMsg =
        status === 'approved'
          ? `Your ownership proof for ${item?.title || 'the item'} was verified. ${
              claim.pickupInstructions || 'Present your Student ID at Founders Hall Room 102.'
            }`
          : status === 'rejected'
          ? `Your claim for ${item?.title || 'the item'} was not approved. ${
              claim.reviewerNotes || 'Verification details did not match custody records.'
            }`
          : `${item?.title || 'Your item'} has been signed out and recorded as Returned.`;

      db.notifications.unshift({
        id: `ntf-${crypto.randomUUID().slice(0, 8)}`,
        userId: claim.claimantId,
        title: claimantTitle,
        message: claimantMsg,
        type: 'status',
        read: false,
        linkView: 'my-claims',
        linkId: claim.id,
        createdAt: now,
      });

      await saveDb(db);
      res.json({ claim: presentClaim(claim, db, req.authUser!) });
    }
  );

  // Notifications Routes
  app.get('/api/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const list = db.notifications
      .filter((n) => n.userId === req.authUser!.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ notifications: list });
  });

  app.patch('/api/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    for (const n of db.notifications) {
      if (n.userId === req.authUser!.id) n.read = true;
    }
    await saveDb(db);
    res.json({ ok: true });
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const db = await loadDb();
    const ntf = db.notifications.find((n) => n.id === req.params.id && n.userId === req.authUser!.id);
    if (!ntf) {
      res.status(404).json({ error: 'Notification not found.' });
      return;
    }
    ntf.read = true;
    await saveDb(db);
    res.json({ notification: ntf });
  });

  // Admin Overview & Users Routes
  app.get(
    '/api/admin/overview',
    requireAuth,
    requireAdmin,
    async (_req: AuthenticatedRequest, res: Response) => {
      const db = await loadDb();
      const users = db.users.map((u) => ({
        ...sanitizeUser(u),
        reportsCount: db.items.filter((i) => i.reporterId === u.id).length,
        claimsCount: db.claims.filter((c) => c.claimantId === u.id).length,
      }));
      res.json({
        users,
        activities: db.activities.slice(0, 20),
      });
    }
  );

  app.patch(
    '/api/admin/users/:id',
    requireAuth,
    requireAdmin,
    async (req: AuthenticatedRequest, res: Response) => {
      const { status, role } = req.body as { status?: UserStatus; role?: UserRole };
      const db = await loadDb();
      const target = db.users.find((u) => u.id === req.params.id);
      if (!target) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      if (target.id === req.authUser!.id && status === 'suspended') {
        res.status(400).json({ error: 'You cannot suspend your own active administrator session.' });
        return;
      }
      if (status && ['active', 'suspended'].includes(status)) {
        target.status = status;
      }
      if (role && ['student', 'admin'].includes(role)) {
        target.role = role;
      }
      const now = new Date().toISOString();
      db.activities.unshift({
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        actorName: req.authUser!.name,
        actorRole: 'admin',
        action: 'Updated User Access',
        targetCode: target.studentId,
        detail: `${target.name} set to ${target.role} (${target.status})`,
        createdAt: now,
      });
      await saveDb(db);
      res.json({ user: sanitizeUser(target) });
    }
  );

  // Vite or static serving
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*path', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lost & Found Portal server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Lost & Found Portal server:', err);
  process.exit(1);
});
