import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './components/pages/AuthPage';
import { StudentDashboard } from './components/pages/StudentDashboard';
import { BrowseItemsPage } from './components/pages/BrowseItemsPage';
import { ReportItemPage } from './components/pages/ReportItemPage';
import { ItemDetailsPage } from './components/pages/ItemDetailsPage';
import { MyReportsPage } from './components/pages/MyReportsPage';
import { MyClaimsPage } from './components/pages/MyClaimsPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import {
  AdminClaimsView,
  AdminDashboardView,
  AdminListingsView,
  AdminUsersView,
} from './components/pages/AdminPages';
import { CardGridSkeleton, ToastBanner } from './components/ui/DesignSystem';
import { getStoredToken, portalApi, setStoredToken } from './lib/api';
import type {
  ActivityLog,
  AdminUserSummary,
  AppView,
  ClaimRecord,
  DashboardStats,
  LostFoundItem,
  PortalNotification,
  User,
} from './types';

const VIEW_TITLES: Record<AppView, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Student Dashboard',
    subtitle: 'Campus belongings overview, quick actions, and recent reports',
  },
  browse: {
    title: 'Browse Campus Items',
    subtitle: 'Search verified lost and found listings across university buildings',
  },
  'report-lost': {
    title: 'Report Lost Item',
    subtitle: 'File a missing property record for campus matching',
  },
  'report-found': {
    title: 'Report Found Item',
    subtitle: 'Catalog found belongings for rightful owner verification',
  },
  'item-details': {
    title: 'Item Record Details',
    subtitle: 'Inspection sheet and ownership claim submission',
  },
  'my-reports': {
    title: 'My Reports',
    subtitle: 'Manage listings you have submitted to the registry',
  },
  'my-claims': {
    title: 'My Claims',
    subtitle: 'Track ownership verification status and pickup instructions',
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Registry updates, claim reviews, and campus alerts',
  },
  profile: {
    title: 'Account Profile',
    subtitle: 'Institutional identification and contact preferences',
  },
  'admin-dashboard': {
    title: 'Administrator Overview',
    subtitle: 'Campus Property Office operational summary & audit ledger',
  },
  'admin-claims': {
    title: 'Verify Ownership Claims',
    subtitle: 'Review submitted proofs against confidential custody records',
  },
  'admin-listings': {
    title: 'Manage Lost & Found Listings',
    subtitle: 'Control campus catalog statuses and inventory records',
  },
  'admin-users': {
    title: 'Manage Campus Users',
    subtitle: 'Directory of student and administrator portal accounts',
  },
};

const EMPTY_STATS: DashboardStats = {
  totalLost: 0,
  totalFound: 0,
  returnedCount: 0,
  openCount: 0,
  pendingClaimsCount: 0,
  recoveryRate: 0,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [adminActivities, setAdminActivities] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadPortalData = useCallback(async (currentUser: User) => {
    setLoadingData(true);
    try {
      const [statsRes, itemsRes, claimsRes, notifRes] = await Promise.all([
        portalApi.getStats(),
        portalApi.getItems(),
        portalApi.getClaims(),
        portalApi.getNotifications(),
      ]);
      setStats(statsRes);
      setItems(itemsRes.items);
      setClaims(claimsRes.claims);
      setNotifications(notifRes.notifications);

      if (currentUser.role === 'admin') {
        const adminRes = await portalApi.getAdminOverview();
        setAdminUsers(adminRes.users);
        setAdminActivities(adminRes.activities);
      } else {
        setAdminUsers([]);
        setAdminActivities([]);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to refresh portal data.', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }
    portalApi
      .getMe()
      .then((res) => {
        setUser(res.user);
        setActiveView(res.user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
        return loadPortalData(res.user);
      })
      .catch(() => {
        setStoredToken(null);
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, [loadPortalData]);

  const handleAuthSuccess = async (token: string, authedUser: User) => {
    setStoredToken(token);
    setUser(authedUser);
    setActiveView(authedUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    await loadPortalData(authedUser);
  };

  const handleLogout = () => {
    setStoredToken(null);
    setUser(null);
    setItems([]);
    setClaims([]);
    setNotifications([]);
    setSelectedItemId(null);
    setBrowseSearchQuery('');
  };

  const handleResetDemoData = () => {
    portalApi.resetDemoData();
    handleLogout();
    showToast('Demo data restored to initial campus records.');
  };

  const handleNavigate = (view: AppView, targetId?: string) => {
    if (view === 'item-details' && targetId) {
      setSelectedItemId(targetId);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSearch = (query: string) => {
    setBrowseSearchQuery(query);
    setActiveView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const myReports = useMemo(
    () => (user ? items.filter((i) => i.reporterId === user.id) : []),
    [items, user]
  );

  const myClaims = useMemo(
    () => (user ? claims.filter((c) => c.claimantId === user.id) : []),
    [claims, user]
  );

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || items[0] || null,
    [items, selectedItemId]
  );

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await portalApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // Ignore silent read error
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await portalApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to mark notifications.', 'error');
    }
  };

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-6">
          <div className="h-8 w-56 bg-[#EAE5D9] rounded animate-pulse" />
          <CardGridSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const headerMeta = VIEW_TITLES[activeView] || VIEW_TITLES.dashboard;

  return (
    <AppShell
      user={user}
      activeView={activeView}
      pageTitle={headerMeta.title}
      pageSubtitle={headerMeta.subtitle}
      notifications={notifications}
      searchQuery={browseSearchQuery}
      onSearchSubmit={handleQuickSearch}
      onNavigate={handleNavigate}
      onMarkNotificationRead={handleMarkNotificationRead}
      onLogout={handleLogout}
    >
      {activeView === 'dashboard' && (
        <StudentDashboard
          user={user}
          stats={stats}
          items={items}
          myReports={myReports}
          myClaims={myClaims}
          onNavigate={handleNavigate}
          onQuickSearch={handleQuickSearch}
        />
      )}

      {activeView === 'browse' && (
        <BrowseItemsPage
          items={items}
          loading={loadingData}
          initialSearchQuery={browseSearchQuery}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'report-lost' && (
        <ReportItemPage
          mode="lost"
          onCancel={() => handleNavigate('dashboard')}
          onNavigate={handleNavigate}
          onCreated={async (created) => {
            await loadPortalData(user);
            showToast(`Lost report ${created.accessionCode} filed successfully.`);
            handleNavigate('item-details', created.id);
          }}
        />
      )}

      {activeView === 'report-found' && (
        <ReportItemPage
          mode="found"
          onCancel={() => handleNavigate('dashboard')}
          onNavigate={handleNavigate}
          onCreated={async (created) => {
            await loadPortalData(user);
            showToast(`Found listing ${created.accessionCode} published.`);
            handleNavigate('item-details', created.id);
          }}
        />
      )}

      {activeView === 'item-details' && selectedItem && (
        <ItemDetailsPage
          item={selectedItem}
          currentUser={user}
          existingClaim={myClaims.find((c) => c.itemId === selectedItem.id)}
          onBack={() => handleNavigate('browse')}
          onNavigate={handleNavigate}
          onClaimSubmitted={async (claim) => {
            await loadPortalData(user);
            showToast(`Ownership claim ${claim.claimCode} submitted for review.`);
            handleNavigate('my-claims');
          }}
        />
      )}

      {activeView === 'my-reports' && (
        <MyReportsPage
          reports={myReports}
          onNavigate={handleNavigate}
          onItemUpdated={async () => {
            await loadPortalData(user);
          }}
          onItemDeleted={async () => {
            await loadPortalData(user);
          }}
          onNotify={showToast}
        />
      )}

      {activeView === 'my-claims' && (
        <MyClaimsPage claims={myClaims} onNavigate={handleNavigate} />
      )}

      {activeView === 'notifications' && (
        <NotificationsPage
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'profile' && (
        <ProfilePage
          user={user}
          myReports={myReports}
          myClaims={myClaims}
          onProfileUpdated={(updated) => setUser(updated)}
          onResetDemoData={handleResetDemoData}
          onNotify={showToast}
        />
      )}

      {activeView === 'admin-dashboard' && user.role === 'admin' && (
        <AdminDashboardView
          stats={stats}
          claims={claims}
          items={items}
          activities={adminActivities}
          users={adminUsers}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'admin-claims' && user.role === 'admin' && (
        <AdminClaimsView
          claims={claims}
          onClaimReviewed={() => loadPortalData(user)}
          onNotify={showToast}
        />
      )}

      {activeView === 'admin-listings' && user.role === 'admin' && (
        <AdminListingsView
          items={items}
          onNavigate={handleNavigate}
          onItemUpdated={() => loadPortalData(user)}
          onItemDeleted={() => loadPortalData(user)}
          onNotify={showToast}
        />
      )}

      {activeView === 'admin-users' && user.role === 'admin' && (
        <AdminUsersView
          users={adminUsers}
          currentUser={user}
          onUserUpdated={() => loadPortalData(user)}
          onNotify={showToast}
        />
      )}

      {toast && (
        <ToastBanner
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </AppShell>
  );
}
