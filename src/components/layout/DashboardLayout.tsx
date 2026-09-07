import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield, LogOut, Bell, Menu, X, LayoutDashboard, ClipboardList, Users, FileText,
  PlusCircle, Building2, UserCheck, Award, ChevronDown,
  LayoutTemplate
} from 'lucide-react';



interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  page?: string;
  activePages?: string[];
  children?: {
    label: string;
    page: string;
  }[];
}

const roleNavItems: Record<string, NavItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'admin-dashboard' },
    { id: 'enquiries', label: 'All Enquiries', icon: ClipboardList, page: 'admin-enquiries' },
    { id: 'agents', label: 'Field Engineers', icon: UserCheck, page: 'admin-agents' },
    { id: 'engineers', label: 'Tecnical Auditors', icon: Award, page: 'admin-engineers' },
    { id: 'users', label: 'All Users', icon: Users, page: 'admin-users' },
    { id: 'certificates', label: 'Certificates', icon: Shield, page: 'admin-certificates' },
    {
      id: 'templates',
      label: 'Templates',
      icon: LayoutTemplate,
      children: [
        {
          label: 'All Templates',
          page: 'admin-template-list',
        },
        {
          label: 'Create Template',
          page: 'admin-template-wizard',
        },
        
      ],
    },

  ],
  builder: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'client-dashboard' },
    { id: 'enquiries', label: 'My Enquiries', icon: ClipboardList, page: 'client-enquiries' },
    { id: 'new', label: 'New Enquiry', icon: PlusCircle, page: 'client-new-enquiry' },
    { id: 'certificates', label: 'Certificates', icon: Shield, page: 'client-certificates' },
  ],
  buyer: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'client-dashboard' },
    { id: 'enquiries', label: 'My Enquiries', icon: ClipboardList, page: 'client-enquiries' },
    { id: 'new', label: 'New Enquiry', icon: PlusCircle, page: 'client-new-enquiry' },
    { id: 'certificates', label: 'Certificates', icon: Shield, page: 'client-certificates' },
  ],
  field_engineer: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'agent-dashboard' },
    { id: 'assignments', label: 'My Assignments', icon: ClipboardList, page: 'agent-assignments', activePages: [
    "agent-assignments",
    "agent-inspection",
  ], },
    { id: 'completed', label: 'Completed', icon: Building2, page: 'agent-completed' },
  ],
  technical_auditor: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'engineer-dashboard' },
    { id: 'reviews', label: 'Pending Reviews', icon: ClipboardList, page: 'engineer-reviews', activePages: [
    "engineer-reviews",
    "engineer-review-inspection",
  ], },
    { id: 'completed', label: 'Completed', icon: Shield, page: 'engineer-completed' },
  ],
};

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  builder: 'Builder',
  buyer: 'Buyer',
  field_engineer: 'Field Engineer',
  technical_auditor: 'Tecnical Auditos',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-500',
  builder: 'bg-orange-500',
  buyer: 'bg-blue-500',
  field_engineer: 'bg-emerald-500',
  technical_auditor: 'bg-purple-500',
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, navigate, currentPage, getUnreadCount, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
      templates: true,
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!currentUser) return null;

  const navItems = roleNavItems[currentUser.role] || [];
  const unreadCount = getUnreadCount();
  const userNotifications = notifications.slice(0, 10);
  useEffect(() => {
  const expanded: Record<string, boolean> = {};

  navItems.forEach((item) => {
    if (item.children) {
      expanded[item.id] = item.children.some(
        (child) => child.page === currentPage
      );
    }
  });

  setOpenMenus((prev) => ({
    ...prev,
    ...expanded,
  }));
}, [currentPage]);
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/public/images/logo.png" width="200"    alt="Logo"  />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Menu with children
          if (item.children) {
            const isParentActive = item.children?.some(
              (child) => child.page === currentPage
            );
            return (
              <div key={item.id}>
                
                <button
                  onClick={() =>
                    setOpenMenus((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isParentActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>

                  <span>{openMenus[item.id] ? "−" : "+"}</span>
                </button>

                {openMenus[item.id] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.page}
                        onClick={() => {
                          navigate(child.page);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          currentPage === child.page
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          const isActive =
            item.activePages?.includes(currentPage) ||
            currentPage === item.page;
          // Normal menu item
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.page!);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-9 h-9 ${roleColors[currentUser.role]} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{roleLabels[currentUser.role]}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
              {navItems.find(n => n.page === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="font-semibold text-gray-900">
                      Notifications
                    </div>

                    {userNotifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">

                    {userNotifications.length === 0 ? (

                      <div className="p-6 text-center text-gray-400 text-sm">
                        No notifications
                      </div>

                    ) : (

                      userNotifications.map((n: any) => (

                        <button
                          key={n.notification_id}
                          onClick={() => markNotificationRead(n.notification_id)}
                          className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${
                            !n.is_read ? "bg-blue-50" : ""
                          }`}
                        >

                          <div className="flex justify-between">

                            <div className="font-medium text-sm text-gray-900">
                              {n.title}
                            </div>

                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
                            )}

                          </div>

                          <div className="text-xs text-gray-500 mt-1">
                            {n.message}
                          </div>

                          <div className="text-xs text-gray-400 mt-2">
                            {new Date(n.created_at).toLocaleString()}
                          </div>

                        </button>

                      ))

                    )}

                  </div>

                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className={`w-8 h-8 ${roleColors[currentUser.role]} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
                    <div className="text-xs text-gray-500">{currentUser.email}</div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto" onClick={() => { setShowNotifications(false); setShowProfile(false); }}>
          {children}
        </main>
      </div>
    </div>
  );
};
