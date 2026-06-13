import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/echoService';
import { formatDate } from '../utils/dateUtils';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    userService.getProfile()
      .then(data => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="px-5 pt-8 max-w-md mx-auto animate-fade-in">
      <h1 className="font-display text-3xl font-medium text-ink-900 mb-6">Profile</h1>

      {/* User card */}
      <div className="card p-6 mb-6 flex items-center gap-4 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-ink-900 text-warm-50 flex items-center justify-center flex-shrink-0 font-display text-2xl">
          {initial}
        </div>
        <div className="w-px h-12 bg-[var(--border)] flex-shrink-0" />
        <div className="flex-1">
          <h2 className="font-display text-xl font-medium text-ink-900">{user?.name}</h2>
          <p className="text-sm text-[var(--text-muted)] font-mono mt-0.5">{user?.email}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)] flex-shrink-0">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Stats */}
      <div className="mb-6 animate-fade-up">
        <h2 className="section-label mb-3">Your Echoes</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card p-4 h-[88px] animate-pulse bg-ink-50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Total */}
            <div className="card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-ink-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#635847" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 2V8H20" stroke="#635847" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 13H16M8 17H13" stroke="#635847" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-ink-900 leading-none mb-1">{stats?.total || 0}</p>
                <p className="text-sm font-medium text-ink-800 leading-tight">Total Echoes</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Keep writing ✦</p>
              </div>
            </div>

            {/* Locked */}
            <div className="card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="11" width="16" height="9" rx="2" stroke="#8f6730" strokeWidth="1.5" />
                  <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#8f6730" strokeWidth="1.5" />
                  <circle cx="12" cy="15" r="1.25" fill="#8f6730" />
                </svg>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-ink-900 leading-none mb-1">{stats?.locked || 0}</p>
                <p className="text-sm font-medium text-ink-800 leading-tight">Locked</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Waiting for the right time</p>
              </div>
            </div>

            {/* Ready */}
            <div className="card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#4d7c5f" strokeWidth="1.5" />
                  <path d="M12 7V12L15.5 14" stroke="#4d7c5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-ink-900 leading-none mb-1">{stats?.unlocked || 0}</p>
                <p className="text-sm font-medium text-ink-800 leading-tight">Ready</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Open whenever you want</p>
              </div>
            </div>

            {/* Opened */}
            <div className="card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#7c5fa6" strokeWidth="1.5" />
                  <path d="M3 7L10.5 12.5C11.4 13.1667 12.6 13.1667 13.5 12.5L21 7" stroke="#7c5fa6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-ink-900 leading-none mb-1">{stats?.opened || 0}</p>
                <p className="text-sm font-medium text-ink-800 leading-tight">Opened</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Memories unlocked</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member since */}
      <div className="card p-5 mb-6 flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="#9a8c6e" strokeWidth="1.5" />
              <path d="M3 9H21" stroke="#9a8c6e" strokeWidth="1.5" />
              <path d="M8 3V6M16 3V6" stroke="#9a8c6e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="section-label">Member Since</span>
        </div>
        <span className="text-sm font-medium text-ink-800">
          {user?.createdAt ? formatDate(user.createdAt) : '—'}
        </span>
      </div>

      {/* About / quote */}
      <div className="relative rounded-2xl mb-6 animate-fade-up overflow-hidden bg-ink-900 p-5">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
          <defs>
            <pattern id="quote-grain" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" fill="#fdfaf6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#quote-grain)" />
        </svg>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-warm-500/15 blur-2xl" />

        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-warm-400/70 mb-3 relative">
          <path d="M9 7C6.79086 7 5 8.79086 5 11V17H11V11H7C7 9.89543 7.89543 9 9 9V7Z" fill="currentColor" />
          <path d="M19 7C16.7909 7 15 8.79086 15 11V17H21V11H17C17 9.89543 17.8954 9 19 9V7Z" fill="currentColor" />
        </svg>

        <p className="text-base text-warm-50 leading-relaxed font-display font-medium relative">
          Every Echo is a small act of faith — a belief that the person reading this someday will be glad you wrote it.
        </p>
      </div>

      <button onClick={() => setShowLogoutModal(true)} className="btn-secondary w-full text-red-600 border-red-200">
        Sign out
      </button>

      <ConfirmModal
        open={showLogoutModal}
        title="Sign out?"
        message="You'll need to sign in again to access your Echoes."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        destructive
        onConfirm={logout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}