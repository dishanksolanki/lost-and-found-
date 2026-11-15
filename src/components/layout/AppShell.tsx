import React, { useState } from 'react';
import {
  Bell,
  CheckSquare,
  ClipboardList,
  Compass,
  FilePlus2,
  FolderSearch,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import type { AppView, PortalNotification, User } from '../../types';
import { formatShortTimestamp } from '../../lib/api';

interface AppShellProps {
  user: User;
  activeView: AppView;
  pageTitle: string;
  pageSubtitle?: string;
  notifications: PortalNotification[];
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  onNavigate: (view: AppView, itemId?: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  user,
  activeView,
  pageTitle,
  pageSubtitle,
  notifications,
  searchQuery,
  onSearchSubmit,
  onNavigate,
  onMarkNotificationRead,
  onLogout,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState(searchQuery);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const studentNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'browse', label: 'Browse Items', icon: <Compass className="w-4 h-4" /> },
    { id: 'report-lost', label: 'Report Lost Item', icon: <FolderSearch className="w-4 h-4" /> },
    { id: 'report-found', label: 'Report Found Item', icon: <FilePlus2 className="w-4 h-4" /> },
    { id: 'my-reports', label: 'My Reports', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'my-claims', label: 'My Claims', icon: <CheckSquare className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badgeCount: unreadCount,
    },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { id: 'admin-dashboard', label: 'Admin Overview', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'admin-claims', label: 'Verify Claims', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'admin-listings', label: 'Manage Listings', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'admin-users', label: 'Manage Users', icon: <Users className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: AppView) => {
    setMobileNavOpen(false);
    setNotifOpen(false);
    onNavigate(view);
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(headerSearch);
  };

  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#172B45] text-white">
      {/* Brand Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <button
          type="button"
          onClick={() => handleNavClick(user.role === 'admin' ? 'admin-dashboard' : 'dashboard')}
          className="text-left w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B99A55] rounded"
        >
          <BrandLogo variant="light" size="md" />
        </button>
        <p className="text-[11px] text-[#E8E4DA]/70 mt-2.5 leading-relaxed">
          Aldenbrook University Campus Registry
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Main navigation">
        {user.role === 'admin' && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-[#B99A55]">
              Administration
            </div>
            <div className="space-y-1">
              {adminNav.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white/12 text-white font-medium border border-[#B99A55]/45'
                        : 'text-[#E8E4DA]/80 hover:bg-white/6 hover:text-white border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? 'text-[#B99A55]' : 'text-[#E8E4DA]/65'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          {user.role === 'admin' && (
            <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-[#E8E4DA]/50">
              Campus Portal
            </div>
          )}
          <div className="space-y-1">
            {studentNav.map((item) => {
              const isActive =
                activeView === item.id ||
                (item.id === 'browse' && activeView === 'item-details');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white/12 text-white font-medium border border-[#B99A55]/45'
                      : 'text-[#E8E4DA]/80 hover:bg-white/6 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className={isActive ? 'text-[#B99A55]' : 'text-[#E8E4DA]/65'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[11px] font-mono tabular-nums font-medium rounded bg-[#B99A55] text-[#172B45]">
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer / Logout */}
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2.5 mb-1.5 rounded-md bg-white/5">
          <div className="text-xs font-medium text-white truncate">{user.name}</div>
          <div className="text-[11px] text-[#E8E4DA]/65 font-mono truncate mt-0.5">
            {user.studentId} · {user.role === 'admin' ? 'Admin' : 'Student'}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#E8E4DA]/80 hover:text-white hover:bg-[#813D42]/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#B99A55]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F6F0] text-[#252A32]">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen border-r border-[#172B45]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#172B45]/50"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 right-3 p-2 text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E8E4DA] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-md text-[#172B45] hover:bg-[#F8F6F0] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-serif text-lg sm:text-xl font-semibold text-[#172B45] truncate leading-tight">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="hidden sm:block text-xs text-[#777777] truncate">{pageSubtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Global Header Search */}
            <form onSubmit={handleHeaderSearchSubmit} className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 pointer-events-none" />
              <input
                type="search"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search items or code..."
                aria-label="Search campus items"
                className="w-56 xl:w-72 pl-9 pr-3 py-1.5 text-sm bg-[#F8F6F0] border border-[#E8E4DA] rounded-md text-[#252A32] placeholder:text-[#777777] focus:outline-none focus:bg-white focus:border-[#172B45] transition-colors"
              />
            </form>

            {/* Notifications Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Open notifications"
                className="relative p-2 rounded-md border border-[#E8E4DA] bg-white text-[#172B45] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#813D42] text-white text-[10px] font-mono font-semibold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotifOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 z-40 bg-white border border-[#E8E4DA] rounded-lg shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E8E4DA] bg-[#F8F6F0]/70 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#172B45]">Notifications</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onNavigate('notifications');
                        }}
                        className="text-xs font-medium text-[#172B45] hover:text-[#B99A55] cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E4DA]">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-[#777777]">
                          No notifications at this time.
                        </div>
                      ) : (
                        notifications.slice(0, 4).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              if (!n.read) onMarkNotificationRead(n.id);
                              setNotifOpen(false);
                              if (n.linkView) {
                                onNavigate(n.linkView, n.linkId);
                              } else {
                                onNavigate('notifications');
                              }
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-[#F8F6F0]/60 transition-colors cursor-pointer ${
                              !n.read ? 'bg-[#F9F4E8]/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-[#172B45] leading-snug">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B99A55] shrink-0">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#777777] mt-1 line-clamp-2">{n.message}</p>
                            <div className="text-[11px] font-mono text-[#777777]/80 mt-1.5">
                              {formatShortTimestamp(n.createdAt)}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Button */}
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-md border border-[#E8E4DA] bg-white hover:bg-[#F8F6F0] transition-colors cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-[#172B45] text-[#F8F6F0] border border-[#B99A55] text-xs font-semibold flex items-center justify-center shrink-0">
                {initials}
              </span>
              <span className="hidden sm:block text-left leading-tight">
                <span className="block text-xs font-semibold text-[#252A32] max-w-[120px] truncate">
                  {user.name}
                </span>
                <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                  {user.role === 'admin' ? 'Administrator' : 'Student'}
                </span>
              </span>
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1360px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
