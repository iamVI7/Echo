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
      <div className="card p-6 mb-6 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-ink-900 text-warm-50 flex items-center justify-center mx-auto mb-3 font-display text-2xl">
          {initial}
        </div>
        <h2 className="font-display text-xl font-medium text-ink-900">{user?.name}</h2>
        <p className="text-sm text-[var(--text-muted)] font-mono mt-0.5">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 animate-fade-up">
        <h2 className="section-label mb-3">Your Echoes</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card p-5 h-20 animate-pulse bg-ink-50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-5">
              <p className="font-display text-3xl font-medium text-ink-900 mb-1">{stats?.total || 0}</p>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">Total Echoes</p>
            </div>
            <div className="card p-5">
              <p className="font-display text-3xl font-medium text-ink-900 mb-1">{stats?.locked || 0}</p>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">Locked</p>
            </div>
            <div className="card p-5">
              <p className="font-display text-3xl font-medium text-warm-600 mb-1">{stats?.unlocked || 0}</p>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">Ready</p>
            </div>
            <div className="card p-5">
              <p className="font-display text-3xl font-medium text-ink-900 mb-1">{stats?.opened || 0}</p>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest">Opened</p>
            </div>
          </div>
        )}
      </div>

      {/* Member since */}
      <div className="card p-5 mb-6 flex items-center justify-between animate-fade-up">
        <span className="section-label">Member Since</span>
        <span className="text-sm font-medium text-ink-800">
          {user?.createdAt ? formatDate(user.createdAt) : '—'}
        </span>
      </div>

      {/* About */}
      <div className="card p-5 mb-6 animate-fade-up">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic font-display">
          "Every Echo is a small act of faith — a belief that the person reading this someday will be glad you wrote it."
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