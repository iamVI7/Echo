import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService, echoService } from '../services/echoService';
import { formatDate } from '../utils/dateUtils';
import ConfirmModal from '../components/ui/ConfirmModal';
import { subDays, format, isSameDay, startOfDay } from 'date-fns';

// ── Activity Heatmap ──────────────────────────────────────────────────────────
function ActivityHeatmap({ echoes }) {
  const WEEKS = 15;
  const DAYS = 7;
  const today = startOfDay(new Date());

  // Build a set of days that have activity
  const activityMap = {};
  echoes.forEach(e => {
    const day = format(startOfDay(new Date(e.createdAt)), 'yyyy-MM-dd');
    activityMap[day] = (activityMap[day] || 0) + 1;
  });

  // Build grid: WEEKS columns, each 7 days (Sun→Sat)
  // Start from (WEEKS*7 - 1) days ago
  const totalDays = WEEKS * DAYS;
  const startDate = subDays(today, totalDays - 1);

  // Pad so grid starts on Sunday
  const startDow = startDate.getDay(); // 0=Sun
  const cells = [];
  for (let i = 0; i < totalDays; i++) {
    const date = subDays(today, totalDays - 1 - i);
    const key = format(date, 'yyyy-MM-dd');
    const count = activityMap[key] || 0;
    cells.push({ date, key, count, isToday: isSameDay(date, today) });
  }

  // Group into weeks (columns)
  const weeks = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(cells.slice(w * DAYS, w * DAYS + DAYS));
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getCellColor = (count, isToday) => {
    if (isToday && count === 0) return 'bg-[var(--border)] ring-1 ring-ink-400';
    if (count === 0) return 'bg-[var(--bg-secondary)]';
    if (count === 1) return 'bg-warm-300';
    if (count === 2) return 'bg-warm-500';
    return 'bg-ink-700';
  };

  return (
    <div className="card p-4 mb-6 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-label">Writing activity</h2>
        <span className="text-xs font-mono text-[var(--text-muted)]">Last {WEEKS} weeks</span>
      </div>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center">
              <span className="text-[8px] font-mono text-[var(--text-muted)]">{i % 2 === 1 ? d : ''}</span>
            </div>
          ))}
        </div>
        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) => (
              <div
                key={cell.key}
                title={`${format(cell.date, 'MMM d')}${cell.count > 0 ? ` · ${cell.count} Echo${cell.count > 1 ? 's' : ''}` : ''}`}
                className={`w-3 h-3 rounded-sm transition-colors duration-150 ${getCellColor(cell.count, cell.isToday)}`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[9px] font-mono text-[var(--text-muted)]">Less</span>
        {['bg-[var(--bg-secondary)]', 'bg-warm-300', 'bg-warm-500', 'bg-ink-700'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[9px] font-mono text-[var(--text-muted)]">More</span>
      </div>
    </div>
  );
}

// ── Edit Name Inline ──────────────────────────────────────────────────────────
function EditNameCard({ user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  const handleSave = async () => {
    if (!name.trim() || name.trim() === user?.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(name.trim());
      setEditing(false);
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 mb-6 flex items-center gap-4 animate-fade-up">
      <div className="w-14 h-14 rounded-full bg-ink-900 text-warm-50 flex items-center justify-center flex-shrink-0 font-display text-xl">
        {initial}
      </div>
      <div className="w-px h-10 bg-[var(--border)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-1.5">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              className="input-field py-2 text-sm font-medium"
              maxLength={50}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-medium text-ink-900 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--border)] transition-all active:scale-[0.97]"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setName(user?.name || ''); }}
                className="text-xs text-[var(--text-muted)] px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-display text-lg font-medium text-ink-900 truncate">{user?.name}</h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5 truncate">{user?.email}</p>
          </>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => { setEditing(true); setName(user?.name || ''); }}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-[0.95]"
          title="Edit name"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10215 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Main Profile ──────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [echoes, setEchoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    Promise.all([
      userService.getProfile(),
      echoService.getAll()
    ]).then(([profile, allEchoes]) => {
      setStats(profile.stats);
      setEchoes(allEchoes);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const handleNameSave = async (name) => {
    const result = await userService.updateName(name);
    setLocalUser(prev => ({ ...prev, name: result.user.name }));
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount();
      logout();
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="px-5 pt-8 max-w-md mx-auto animate-fade-in pb-6">
      <h1 className="font-display text-3xl font-medium text-ink-900 mb-6">Profile</h1>

      {/* Edit Name card */}
      <EditNameCard user={localUser} onSave={handleNameSave} />

      {/* Stats */}
      <div className="mb-6 animate-fade-up">
        <h2 className="section-label mb-3">Your Echoes</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card p-4 h-20 animate-pulse bg-ink-50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {[
              { count: stats?.total || 0, label: 'Total Echoes', iconBg: 'bg-ink-50', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#635847" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M14 2V8H20M8 13H16M8 17H13" stroke="#635847" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { count: stats?.locked || 0, label: 'Locked', iconBg: 'bg-warm-100', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="11" width="16" height="9" rx="2" stroke="#8f6730" strokeWidth="1.5"/>
                  <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#8f6730" strokeWidth="1.5"/>
                  <circle cx="12" cy="15" r="1.25" fill="#8f6730"/>
                </svg>
              )},
              { count: stats?.unlocked || 0, label: 'Ready', iconBg: 'bg-green-50', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#4d7c5f" strokeWidth="1.5"/>
                  <path d="M12 7V12L15.5 14" stroke="#4d7c5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { count: stats?.opened || 0, label: 'Opened', iconBg: 'bg-purple-50', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#7c5fa6" strokeWidth="1.5"/>
                  <path d="M3 7L10.5 12.5C11.4 13.1667 12.6 13.1667 13.5 12.5L21 7" stroke="#7c5fa6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            ].map(({ count, label, iconBg, icon }) => (
              <div key={label} className="card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  {icon}
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-ink-900 leading-none mb-0.5">{count}</p>
                  <p className="text-sm font-medium text-ink-800 leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      {!loading && <ActivityHeatmap echoes={echoes} />}

      {/* Member since */}
      <div className="card p-4 mb-6 flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="#9a8c6e" strokeWidth="1.5"/>
              <path d="M3 9H21M8 3V6M16 3V6" stroke="#9a8c6e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="section-label">Member Since</span>
        </div>
        <span className="text-sm font-medium text-ink-800">
          {localUser?.createdAt ? formatDate(localUser.createdAt) : '—'}
        </span>
      </div>

      {/* Quote */}
      <div className="relative rounded-2xl mb-6 animate-fade-up overflow-hidden bg-ink-900 p-5">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
          <defs>
            <pattern id="quote-grain" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" fill="#fdfaf6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#quote-grain)"/>
        </svg>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-warm-500/15 blur-2xl"/>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-warm-400/70 mb-3 relative">
          <path d="M9 7C6.79086 7 5 8.79086 5 11V17H11V11H7C7 9.89543 7.89543 9 9 9V7Z" fill="currentColor"/>
          <path d="M19 7C16.7909 7 15 8.79086 15 11V17H21V11H17C17 9.89543 17.8954 9 19 9V7Z" fill="currentColor"/>
        </svg>
        <p className="text-base text-warm-50 leading-relaxed font-display font-medium relative">
          Every Echo is a small act of faith — a belief that the person reading this someday will be glad you wrote it.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button onClick={() => setShowLogoutModal(true)} className="btn-secondary flex-1 text-red-600 border-red-200">
          Sign out
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          aria-label="Delete account"
          className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-red-500 flex-shrink-0 transition-all duration-150 active:scale-[0.95]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6"
              stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

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
      <ConfirmModal
        open={showDeleteModal}
        title="Delete account?"
        message="This permanently deletes your account and all sealed Echoes. This cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete account'}
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}