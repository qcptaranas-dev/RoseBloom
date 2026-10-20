import React, { useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { User, Mail, Lock, ShieldCheck, Check, AlertCircle, ArrowLeft, LogOut } from 'lucide-react';

interface AccountSettingsPageProps {
  user: UserProfile;
  onNavigateHome: () => void;
  onNavigateSites: () => void;
  onSignOut: () => void;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  user,
  onNavigateHome,
  onNavigateSites,
  onSignOut,
}) => {
  // Update Email state
  const [newEmail, setNewEmail] = useState<string>(user.email);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [nextPassword, setNextPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [passLoading, setPassLoading] = useState<boolean>(false);

  // Google account link state
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [googleStatus, setGoogleStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus(null);
    setEmailLoading(true);
    try {
      await authService.updateEmail(newEmail);
      setEmailStatus({ type: 'success', msg: 'Email address successfully updated.' });
    } catch (err: unknown) {
      setEmailStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to update email.' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus(null);
    if (nextPassword !== confirmPassword) {
      setPassStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    setPassLoading(true);
    try {
      await authService.changePassword(currentPassword, nextPassword);
      setPassStatus({ type: 'success', msg: 'Password changed successfully.' });
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPassStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to change password.' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleToggleGoogleLink = async () => {
    setGoogleStatus(null);
    setGoogleLoading(true);
    try {
      if (user.googleLinked) {
        await authService.unlinkGoogleAccount();
        setGoogleStatus({ type: 'success', msg: 'Google account unlinked.' });
      } else {
        await authService.linkGoogleAccount(user.email);
        setGoogleStatus({ type: 'success', msg: 'Google account linked successfully.' });
      }
    } catch (err: unknown) {
      setGoogleStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Could not update Google link.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-rose-100">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-rose-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Monthsary Home</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateSites}
            className="text-xs font-medium text-rose-700 hover:text-rose-900 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            My Work Dashboard
          </button>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-rose-950">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans-custom">
          Manage your credentials, email address, and linked Google account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-rose-200 overflow-hidden bg-rose-50 mb-3 shadow-sm flex items-center justify-center">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-cormorant text-xl font-bold text-rose-950">{user.name}</h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{user.email}</p>

            <div className="mt-4 pt-4 border-t border-rose-50 text-[11px] text-stone-500 flex flex-col gap-1.5 text-left font-sans-custom">
              <div className="flex justify-between">
                <span>Account ID:</span>
                <span className="font-mono text-stone-700">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span className="text-stone-700">{user.createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings Sections */}
        <div className="md:col-span-2 space-y-6 font-sans-custom">
          {/* Section 1: Update Email */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-50">
              <Mail className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-stone-900">Email Address</h2>
            </div>

            {emailStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  emailStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {emailStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{emailStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1 font-medium">
                  Primary Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={emailLoading || newEmail === user.email}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  {emailLoading ? 'Updating...' : 'Save Email Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Change Password */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-50">
              <Lock className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-stone-900">Change Password</h2>
            </div>

            {passStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1 font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-600 mb-1 font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={nextPassword}
                    onChange={(e) => setNextPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1 font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={passLoading || !nextPassword}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Manage Linked Google Account */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-rose-50">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-stone-900">Linked Google Account</h2>
            </div>

            {googleStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  googleStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{googleStatus.msg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-900">Google Account</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        user.googleLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {user.googleLinked ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-mono">
                    {user.googleLinked ? user.googleEmail || user.email : 'No Google account linked'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleGoogleLink}
                disabled={googleLoading}
                className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-xs ${
                  user.googleLinked
                    ? 'border border-stone-300 bg-white hover:bg-stone-100 text-stone-700'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {googleLoading
                  ? 'Processing...'
                  : user.googleLinked
                  ? 'Disconnect Google'
                  : 'Connect Google Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
