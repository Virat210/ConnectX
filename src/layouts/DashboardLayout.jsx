import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { Bell, Menu, Search, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';
import { authApi } from '../utils/api';

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();
  const { playClick } = useSound();
  const location = useLocation();

  // Current formatted date
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Dynamic greeting based on real-world local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  useEffect(() => {
    async function loadNotifications() {
      try {
        const items = await authApi.getNotifications();
        setNotifications(items);
      } catch (err) {
        // graceful empty fallback
        setNotifications([]);
      }
    }
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await authApi.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.warn('Failed to mark read:', e);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f5] dark:bg-[#0c0c0d] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Sidebar (Desktop persistent + Mobile drawer) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-[#faf8f5]/85 dark:bg-[#121214]/85 backdrop-blur-md border-b border-stone-200/80 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
          {/* Left: Mobile Toggle & Page Greeting / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClick();
                setMobileSidebarOpen(true);
              }}
              className="md:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 focus:outline-none cursor-pointer"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-white font-display">
                {getGreeting()}, {user?.name || 'Virat'}
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
                Ready to connect with your team?
              </p>
            </div>
          </div>

          {/* Right: Date, Notifications, Theme Toggle, User Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Live Date Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-200/50 dark:bg-stone-800/60 border border-stone-300/50 dark:border-stone-700/60 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{todayDate}</span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  playClick();
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="relative p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors focus:outline-none cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#faf8f5] dark:ring-[#121214]" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#18181a] border border-stone-200 dark:border-stone-800 shadow-xl p-3 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 px-1">
                    <span className="font-bold text-stone-900 dark:text-white">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold cursor-pointer hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800/60 py-1 max-h-64 overflow-y-auto">
                      {notifications.map((item) => (
                        <div key={item.id} className={`p-2.5 rounded-xl transition-colors ${item.read ? 'opacity-70' : 'bg-amber-500/5 dark:bg-amber-500/10 font-medium'}`}>
                          <p className="text-stone-800 dark:text-stone-200">{item.title}</p>
                          {item.message && <p className="text-stone-500 text-[11px] mt-0.5">{item.message}</p>}
                          <p className="text-[10px] text-stone-400 mt-0.5">{item.time}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-stone-400">
                      <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-30 text-stone-400" />
                      <p className="font-medium text-stone-600 dark:text-stone-300">No notifications yet</p>
                      <p className="text-[11px] text-stone-400">You're all caught up!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            <div className="h-6 w-px bg-stone-200 dark:bg-stone-800" />

            {/* User Profile Link */}
            <Link
              to="/profile"
              onClick={playClick}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User avatar'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-300 dark:ring-stone-700"
              />
              <span className="hidden xl:inline text-xs font-semibold text-stone-800 dark:text-stone-200">
                {user?.name || 'Virat'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
            </Link>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
