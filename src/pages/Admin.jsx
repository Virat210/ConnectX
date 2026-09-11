import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  Video,
  Clock,
  TrendingUp,
  Activity,
  Ban,
  CheckCircle,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  Sliders
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';
import { adminApi } from '../utils/api';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { addToast } = useToast();
  const { playClick } = useSound();

  React.useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersData, analyticsData] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getAnalytics(),
        ]);
        if (usersData) setUsers(usersData);
        if (analyticsData) setAnalytics(analyticsData);
      } catch (err) {
        console.warn('Failed to load admin data:', err.message);
      }
    }
    loadAdminData();
  }, []);

  const handleToggleBlock = async (userId) => {
    playClick();
    try {
      const res = await adminApi.toggleStatus(userId);
      const newStatus = res.data?.status;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      addToast({
        title: newStatus === 'Blocked' ? 'User Suspended' : 'User Re-activated',
        description: `Status updated to ${newStatus}.`,
        type: newStatus === 'Blocked' ? 'error' : 'success',
      });
    } catch (err) {
      addToast({
        title: 'Action Failed',
        description: err.message || 'Could not update status.',
        type: 'error',
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Enterprise Admin & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
              SYS-ADMIN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform telemetry, network metrics, and user account management.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            title: 'Total Meetings',
            value: analytics?.kpis?.totalMeetings || '0',
            change: '+18.4% this mo',
            icon: Video,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-950/50'
          },
          {
            title: 'Active Users',
            value: analytics?.kpis?.activeUsers || String(users.length),
            change: '+12.1% this mo',
            icon: Users,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-950/50'
          },
          {
            title: 'Meeting Duration',
            value: analytics?.kpis?.totalMeetingHours || '0 hrs',
            change: '+24.5% vs avg',
            icon: Clock,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-950/50'
          },
          {
            title: 'System Uptime',
            value: analytics?.kpis?.videoUptime || '99.99%',
            change: '0.02% packet loss',
            icon: Activity,
            color: 'text-pink-500',
            bg: 'bg-pink-50 dark:bg-pink-950/50'
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {kpi.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Meeting Volume Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Call Volume & Hours
              </h2>
              <p className="text-xs text-slate-500">Conferences hosted across global regions</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Meetings</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Hours</span>
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            {(analytics?.monthlyVolume || []).map((item) => {
              const maxMeetings = 700;
              const heightPct = Math.round((item.meetings / maxMeetings) * 100);
              const hoursHeightPct = Math.round((item.hours / 1500) * 100);

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Meetings Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-1/2 max-w-[24px] bg-indigo-500 hover:bg-indigo-400 rounded-t-lg transition-all duration-300 relative"
                      title={`${item.month}: ${item.meetings} meetings`}
                    />
                    {/* Hours Bar */}
                    <div
                      style={{ height: `${hoursHeightPct}%` }}
                      className="w-1/2 max-w-[24px] bg-purple-500/70 hover:bg-purple-400 rounded-t-lg transition-all duration-300"
                      title={`${item.month}: ${item.hours} hours`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-400 transition-colors">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Distribution Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Client Platforms
            </h2>
            <p className="text-xs text-slate-500">Attendee client endpoint distribution</p>
          </div>

          <div className="space-y-4 pt-2">
            {(analytics?.deviceDistribution || []).map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.device}</span>
                  <span className="font-bold text-indigo-500">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${
                      i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-purple-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              User Roster & Access Moderation
            </h2>
            <p className="text-xs text-slate-500">
              Manage enterprise directory members, roles, and suspension states.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user or department..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{u.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {u.department}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.role === 'Admin'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        u.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`} />
                      <span>{u.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {u.lastActive}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleBlock(u.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors ${
                        u.status === 'Blocked'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-700 dark:text-slate-300 hover:text-rose-400'
                      }`}
                    >
                      {u.status === 'Blocked' ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No registered members found. Users who register will appear here.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
