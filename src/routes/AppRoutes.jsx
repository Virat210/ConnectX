import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import CreateMeeting from '../pages/CreateMeeting';
import JoinMeeting from '../pages/JoinMeeting';
import MeetingRoom from '../pages/MeetingRoom';
import Profile from '../pages/Profile';
import MeetingHistory from '../pages/MeetingHistory';
import Settings from '../pages/Settings';
import Admin from '../pages/Admin';
import Helpdesk from '../pages/Helpdesk';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/helpdesk" element={<Helpdesk />} />
        <Route path="/support" element={<Helpdesk />} />
      </Route>

      {/* Auth Screens (Stand-alone with focused centered layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dedicated Fullscreen Meeting Room (Dark mode prioritized) */}
      <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
      <Route path="/meeting" element={<Navigate to="/join-meeting" replace />} />

      {/* Authenticated Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-meeting" element={<CreateMeeting />} />
        <Route path="/join-meeting" element={<JoinMeeting />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<MeetingHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/helpdesk" element={<Helpdesk />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
