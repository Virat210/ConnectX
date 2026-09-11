import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Camera,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Globe,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';
import { authApi } from '../utils/api';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { playClick, playSuccess } = useSound();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.fullName || user?.name || 'Virat Singh');
  const [email, setEmail] = useState(user?.email || 'viratchauhan1010@gmail.com');
  const [title, setTitle] = useState(user?.title || 'Principal Engineer');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.fullName || user.name || '');
      setEmail(user.email || '');
      setTitle(user.title || 'Member');
    }
  }, [user]);

  const handlePhotoClick = () => {
    playClick();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        title: 'Invalid File',
        description: 'Please select an image file (PNG, JPG, JPEG, WEBP).',
        type: 'error'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 10MB.',
        type: 'error'
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 512;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

            await updateProfile({ avatar: compressedDataUrl });
            playSuccess();
            addToast({
              title: 'Photo Uploaded!',
              description: 'Your profile photo has been updated successfully.',
              type: 'success'
            });
          } catch (err) {
            addToast({
              title: 'Upload Failed',
              description: err.message || 'Failed to save profile picture.',
              type: 'error'
            });
          } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        };

        img.onerror = () => {
          setIsUploadingPhoto(false);
          addToast({
            title: 'Image Error',
            description: 'Failed to process selected image file.',
            type: 'error'
          });
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        setIsUploadingPhoto(false);
        addToast({
          title: 'Read Error',
          description: 'Failed to read image file.',
          type: 'error'
        });
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingPhoto(false);
      addToast({
        title: 'Upload Failed',
        description: err.message || 'An error occurred while uploading photo.',
        type: 'error'
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    playClick();

    try {
      await updateProfile({
        fullName: name,
        title,
      });

      setSavedSuccess(true);
      playSuccess();
      addToast({
        title: 'Profile Updated',
        description: 'Your personal information was saved successfully.',
        type: 'success'
      });
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      addToast({
        title: 'Update Failed',
        description: err.message || 'Failed to update profile.',
        type: 'error'
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    playClick();
    if (!currentPassword || !newPassword) {
      addToast({
        title: 'Error',
        description: 'Please fill out all password fields.',
        type: 'error'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({
        title: 'Error',
        description: 'New passwords do not match.',
        type: 'error'
      });
      return;
    }

    try {
      await authApi.updatePassword(currentPassword, newPassword);
      playSuccess();
      addToast({
        title: 'Password Changed',
        description: 'Your security credentials have been updated.',
        type: 'success'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast({
        title: 'Password Error',
        description: err.message || 'Current password incorrect.',
        type: 'error'
      });
    }
  };

  const handleDeleteAccount = async () => {
    playClick();
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      try {
        await authApi.deleteAccount();
        addToast({
          title: 'Account Deleted',
          description: 'Your account has been deleted permanently.',
          type: 'info'
        });
        logout();
        navigate('/login');
      } catch (err) {
        addToast({
          title: 'Deletion Failed',
          description: err.message || 'Failed to delete account.',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Account & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal information, security preferences, and subscription tier.
        </p>
      </div>

      {/* Top Profile Summary Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-lg transition-opacity ${isUploadingPhoto ? 'opacity-50' : 'opacity-100'}`}
          />
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={isUploadingPhoto}
            className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Upload photo"
          >
            {isUploadingPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.fullName || 'Virat Singh'}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mx-auto sm:mx-0">
              <Shield className="w-3.5 h-3.5" />
              <span>{user?.plan || 'Enterprise Pro'}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {user?.title || 'Principal Engineer'} • {user?.organization || 'Acme Technologies'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user?.email}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {user?.timezone}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Personal Information Form */}
      <form
        onSubmit={handleUpdateProfile}
        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Personal Information
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your public display name and contact credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Professional Role / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Organization
            </label>
            <input
              type="text"
              readOnly
              value={user?.organization || 'Acme Technologies'}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            {savedSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            <span>{savedSuccess ? 'Saved Changes' : 'Save Information'}</span>
          </button>
        </div>
      </form>

      {/* Section 2: Account Settings & Password */}
      <form
        onSubmit={handleChangePassword}
        className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Security & Credentials
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your account password and authentication factors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Section 3: Danger Zone */}
      <div className="rounded-3xl bg-rose-500/5 dark:bg-rose-500/5 border border-rose-500/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-500">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Permanently delete your ConnectX account and all associated conference histories and recordings.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
}
