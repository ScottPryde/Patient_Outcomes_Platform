import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import logoSrc from '../../assets/logo_paladin.jpg';
import {
  LayoutDashboard,
  HeartPulse,
  BookOpen,
  FlaskConical,
  Settings,
  HelpCircle,
  User,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Microscope,
  LineChart,
  Table2,
  ListTree,
  ClipboardList,
  Hospital,
  Download,
  SlidersHorizontal,
  NotebookPen,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { PatientSwitcher } from '../caregiver/PatientSwitcher';
import { useUiStore } from '../../store/uiStore';
import { FeatureSuggestionsPanel } from '../suggestions/FeatureSuggestionsPanel';

type NavItem =
  | { separator: true; label: string }
  | { to: string; label: string; icon: React.ElementType; separator?: false };

const NAV_BADGES: Record<string, number> = {
  '/health/prom-history': 2,
  '/trials': 3,
  '/knowledge': 4,
  '/health/charts': 1,
};

function NavBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 bg-[var(--teal)] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
      {count > 9 ? '9+' : count}
    </span>
  );
}

const healthChildren: NavItem[] = [
  { separator: true, label: 'Observations' },
  { to: '/health/analytics', label: 'Health Goals', icon: Microscope },
  { to: '/health/charts', label: 'Health Trends', icon: LineChart },
  { to: '/health/log', label: 'Health Journal', icon: NotebookPen },
  { to: '/health/prom-history', label: 'Outcome Reporting', icon: ClipboardList },
  { to: '/health/reg-history', label: 'Clinical Registry', icon: Hospital },
  { separator: true, label: 'Data' },
  { to: '/health/all-obs', label: 'All Health Data', icon: ListTree },
  { to: '/health/grid', label: 'Data Grid', icon: Table2 },
  { to: '/health/export', label: 'Data Export', icon: Download },
  { to: '/health/dataconfig', label: 'Data Config', icon: SlidersHorizontal },
];

export function InteractiumLayout() {
  const { user, logout, activePatient } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [healthExpanded, setHealthExpanded] = useState(false);
  const { layoutMode, setLayoutMode, features, setHealthSubmenuOpen, healthSubmenuOpen,
    sidebarCollapsed, setSidebarCollapsed, featurePanelOpen, setFeaturePanelOpen } =
    useUiStore();

  if (!user) return null;

  const displayName = activePatient
    ? `${activePatient.firstName} ${activePatient.lastName}`
    : `${user.firstName} ${user.lastName}`;

  const pseudoId = `PSI-${user.id.replace(/-/g, '').slice(0, 12).toUpperCase()}`;

  const navCls = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-11',
      isActive
        ? 'bg-[var(--sidebar-active)] text-[var(--teal)] border-l-[3px] border-[var(--teal)] -ml-px pl-[calc(0.75rem-3px)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] border-l-[3px] border-transparent',
    ].join(' ');

  const bottomNavCls = ({ isActive }: { isActive: boolean }) =>
    [
      'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium min-h-11',
      isActive
        ? 'text-[var(--teal)] border-b-[3px] border-[var(--teal)]'
        : 'text-[var(--text-muted)] border-b-[3px] border-transparent',
    ].join(' ');

  const showSidebar = layoutMode === 'sidebar';
  const healthSectionActive = location.pathname.startsWith('/health');
  const healthBadgeTotal = healthChildren
    .filter((item): item is { to: string; label: string; icon: React.ElementType } => !item.separator)
    .reduce((sum, item) => sum + (NAV_BADGES[item.to] ?? 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-white text-[var(--text-primary)] border-b border-[var(--border-token)] shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--sidebar-hover)] min-w-11 min-h-11 flex items-center justify-center text-[var(--text-secondary)]"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
            <img src={logoSrc} alt="Interactium" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xl font-bold hidden sm:inline text-[var(--text-primary)] tracking-tight">Interactium</span>
          </Link>
          {user.role === 'caregiver' && (
            <div className="hidden md:block ml-2 min-w-0">
              <PatientSwitcher />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden md:flex flex-col items-end mr-2 text-right">
            <span className="text-sm font-medium truncate max-w-[200px] text-[var(--text-primary)]">{displayName}</span>
            <span className="font-pseudo-id text-xs text-[var(--text-muted)]">{pseudoId}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              setLayoutMode(layoutMode === 'sidebar' ? 'bottom-nav' : 'sidebar')
            }
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] min-w-11 min-h-11 flex items-center justify-center text-[var(--text-secondary)]"
            title={
              layoutMode === 'sidebar' ? 'Switch to bottom navigation' : 'Switch to sidebar'
            }
            aria-label="Toggle layout orientation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setFeaturePanelOpen(!featurePanelOpen)}
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] relative min-w-11 min-h-11 flex items-center justify-center text-[var(--text-secondary)]"
            aria-label="Feature suggestions"
            title="Feature suggestions"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] relative min-w-11 min-h-11 flex items-center justify-center text-[var(--text-secondary)]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-5 h-5 px-1 bg-[var(--danger)] text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1 p-2 rounded-lg hover:bg-[var(--sidebar-hover)] min-h-11 text-[var(--text-secondary)]"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--purple)] flex items-center justify-center text-white text-sm font-medium">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
              <ChevronDown className="w-4 h-4 hidden sm:block" />
            </button>
            {userMenuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-white)] text-[var(--text-primary)] rounded-lg shadow-xl border border-[var(--border-token)] py-2 z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border-token)]">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{displayName}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    App Settings
                  </Link>
                  <Link
                    to="/consent"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Consent
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--bg-surface)] text-[var(--danger)] w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {showSidebar && (
          <aside
            className={[
              'fixed lg:sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] bg-[var(--sidebar-bg)] border-r border-[var(--border-token)] overflow-y-auto transition-all duration-200 flex flex-col',
              sidebarCollapsed ? 'w-14' : 'w-[268px]',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            ].join(' ')}
          >
            <nav className="p-3 space-y-1 flex-1 min-w-0" aria-label="Main">
              <NavLink to="/dashboard" end className={navCls} onClick={() => setSidebarOpen(false)}
                title="My Dashboard">
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && 'My Dashboard'}
              </NavLink>

              <div>
                <button
                  type="button"
                  onClick={() => { if (!sidebarCollapsed) setHealthExpanded(!healthExpanded); }}
                  className={[
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium min-h-11 text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]',
                    healthSectionActive ? 'bg-[var(--sidebar-active)] text-[var(--teal)]' : '',
                  ].join(' ')}
                  aria-expanded={healthExpanded}
                  title="My Health Data"
                >
                  <HeartPulse className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">My Health Data</span>
                      <NavBadge count={healthBadgeTotal} />
                      <ChevronRight className={`w-4 h-4 transition-transform ${healthExpanded ? 'rotate-90' : ''} shrink-0`} />
                    </>
                  )}
                </button>
                {healthExpanded && !sidebarCollapsed && (
                  <div className="mt-1 ml-2 pl-2 border-l border-[var(--sidebar-hover)] space-y-0.5">
                    {healthChildren.map((item) => {
                      if (item.separator) {
                        return (
                          <p key={item.label} className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">
                            {item.label}
                          </p>
                        );
                      }
                      const Icon = item.icon;
                      return (
                        <NavLink key={item.to} to={item.to} className={navCls} onClick={() => setSidebarOpen(false)}>
                          <Icon className="w-4 h-4 shrink-0 opacity-80" />
                          <span className="flex-1 min-w-0 truncate">{item.label}</span>
                          <NavBadge count={NAV_BADGES[item.to] ?? 0} />
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>

              {features.knowledgeHub && (
                <NavLink to="/knowledge" className={navCls} onClick={() => setSidebarOpen(false)} title="Knowledge Hub">
                  <BookOpen className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="flex-1">Knowledge Hub</span>}
                  {!sidebarCollapsed && <NavBadge count={NAV_BADGES['/knowledge'] ?? 0} />}
                </NavLink>
              )}
              {features.trialsFinder && (
                <NavLink to="/trials" className={navCls} onClick={() => setSidebarOpen(false)} title="Clinical Trials">
                  <FlaskConical className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && <span className="flex-1">Clinical Trials</span>}
                  {!sidebarCollapsed && <NavBadge count={NAV_BADGES['/trials'] ?? 0} />}
                </NavLink>
              )}
              <NavLink to="/settings" className={navCls} onClick={() => setSidebarOpen(false)} title="App Settings">
                <Settings className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && 'App Settings'}
              </NavLink>
              <NavLink to="/help" className={navCls} onClick={() => setSidebarOpen(false)} title="Help & Support">
                <HelpCircle className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && 'Help \u0026 Support'}
              </NavLink>
              <NavLink to="/account" className={navCls} onClick={() => setSidebarOpen(false)} title="My Account">
                <User className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && 'My Account'}
              </NavLink>
              {user.role === 'administrator' && (
                <NavLink to="/admin" className={navCls} onClick={() => setSidebarOpen(false)} title="Admin">
                  <Shield className="w-5 h-5 shrink-0" />
                  {!sidebarCollapsed && 'Admin'}
                </NavLink>
              )}
            </nav>

            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center gap-2 w-full px-3 py-3 border-t border-[var(--border-token)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-colors text-xs"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed
                ? <ChevronRight className="w-4 h-4" />
                : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>
              }
            </button>
          </aside>
        )}

        {sidebarOpen && showSidebar && (
          <button
            type="button"
            className="fixed inset-0 bg-black/55 z-20 lg:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main
          className={[
            'flex-1 min-w-0 p-4 lg:p-8',
            layoutMode === 'bottom-nav' ? 'pb-24' : '',
          ].join(' ')}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {layoutMode === 'bottom-nav' && (
        <>
          <div
            className={[
              'fixed bottom-16 left-0 right-0 z-30 max-h-[50vh] overflow-y-auto bg-white border border-[var(--border-token)] rounded-t-xl mx-2 shadow-2xl transition-all',
              healthSubmenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
            ].join(' ')}
          >
            <div className="p-3 grid grid-cols-2 gap-1">
              {healthChildren.filter((item) => !item.separator).map((item) => {
                const { to, label, icon: Icon } = item as { to: string; label: string; icon: React.ElementType };
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]"
                    onClick={() => {
                      setHealthSubmenuOpen(false);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          </div>
          <nav
            className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-[var(--border-token)] flex items-stretch justify-around"
            aria-label="Primary"
          >
            <NavLink to="/dashboard" end className={bottomNavCls}>
              <LayoutDashboard className="w-6 h-6" />
              Home
            </NavLink>
            <button
              type="button"
              onClick={() => setHealthSubmenuOpen(!healthSubmenuOpen)}
              className={[
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium min-h-11',
                healthSectionActive || healthSubmenuOpen
                  ? 'text-[var(--teal)] border-b-[3px] border-[var(--teal)]'
                  : 'text-[var(--text-muted)] border-b-[3px] border-transparent',
              ].join(' ')}
              aria-expanded={healthSubmenuOpen}
            >
              <HeartPulse className="w-6 h-6" />
              Health
            </button>
            <NavLink to="/settings" className={bottomNavCls} onClick={() => setHealthSubmenuOpen(false)}>
              <Settings className="w-6 h-6" />
              Settings
            </NavLink>
          </nav>
        </>
      )}

      <NotificationPanel
        open={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {featurePanelOpen && <FeatureSuggestionsPanel />}
    </div>
  );
}
