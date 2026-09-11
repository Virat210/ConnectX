import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Video,
  LogIn,
  Calendar,
  History,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  LifeBuoy
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';
import { useSound } from '../hooks/useSound';

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { soundEnabled, toggleSound, playClick } = useSound();
  const navigate = useNavigate();

  const handleLogout = () => {
    playClick();
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Meeting', path: '/create-meeting', icon: Video },
    { label: 'Join Meeting', path: '/join-meeting', icon: LogIn },
    { label: 'Meeting History', path: '/history', icon: History },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Admin Panel', path: '/admin', icon: ShieldAlert, badge: 'PRO' },
    { label: 'Helpdesk', path: '/helpdesk', icon: LifeBuoy },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#f7f5f0] dark:bg-[#121214] border-r border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-stone-300 transition-colors duration-200">
      {/* Sidebar Header */}
      <div className={`h-20 flex items-center px-5 border-b border-stone-200/80 dark:border-white/10 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <Logo size="default" showText={!collapsed} linkTo="/dashboard" />
        
        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => {
            playClick();
            setCollapsed(!collapsed);
          }}
          className="hidden md:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar width"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                playClick();
                setMobileOpen(false);
              }}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && (
                <span className="flex-1 truncate tracking-wide">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Sound Setting Pill */}
      <div className="px-3 py-2 border-t border-stone-200/80 dark:border-white/10">
        <button
          onClick={() => {
            playClick();
            toggleSound();
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            soundEnabled
              ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
          } ${collapsed ? 'justify-center' : ''}`}
          title={soundEnabled ? 'UI Sounds are active' : 'UI Sounds are muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" /> : <VolumeX className="w-4 h-4 shrink-0 text-stone-400" />}
          {!collapsed && (
            <span>Sounds: <strong className="font-bold">{soundEnabled ? 'ON' : 'OFF'}</strong></span>
          )}
        </button>
      </div>

      {/* User Profile Mini Footer */}
      <div className="p-3 border-t border-stone-200/80 dark:border-white/10">
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User avatar'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-300 dark:ring-stone-700 shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-stone-900 dark:text-white truncate leading-tight">{user?.name || 'Virat'}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">{user?.email || 'virat@connectx.io'}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-300 shrink-0 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="fixed top-0 bottom-0 left-0 w-inherit h-screen transition-all duration-300">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-72 h-full z-10"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
}
