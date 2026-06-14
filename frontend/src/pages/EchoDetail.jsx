import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { echoService, reflectionService } from '../services/echoService';
import { formatDate, categoryColors, computeStatus, timeUntil } from '../utils/dateUtils';
import { resolveAssetUrl } from '../utils/urlUtils';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function EchoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [echo, setEcho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [reflection, setReflection] = useState(null);
  const [reflectionForm, setReflectionForm] = useState({ aged: '', note: '' });
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    echoService.getOne(id)
      .then(data => {
        setEcho(data);
        if (data.status === 'opened') {
          reflectionService.get(id).then(setReflection).catch(() => {});
        }
      })
      .catch(() => navigate('/vault'))
      .finally(() => setLoading(false));
  }, [id]);

  const status = echo ? computeStatus(echo) : null;

  const handleOpen = async () => {
    setOpening(true);
    setShowUnlockAnim(true);
    setTimeout(async () => {
      try {
        const updated = await echoService.open(id);
        setEcho(updated);
      } catch (err) {
        // noop
      } finally {
        setOpening(false);
      }
    }, 900);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await echoService.delete(id);
      navigate('/vault');
    } catch (err) {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleReflectionSubmit = async (e) => {
    e.preventDefault();
    if (!reflectionForm.aged) return;
    setSubmittingReflection(true);
    try {
      const created = await reflectionService.create({
        echoId: id,
        aged: reflectionForm.aged,
        note: reflectionForm.note
      });
      setReflection(created);
    } catch (err) {
      // noop
    } finally {
      setSubmittingReflection(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!echo) return null;

  return (
    <div className="px-5 pt-8 max-w-md mx-auto pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {status === 'locked' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-red-500"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {status !== 'locked' && <div className="w-9" />}
      </div>

      {/* LOCKED STATE */}
      {status === 'locked' && (
        <div className="flex flex-col items-center text-center min-h-[60vh] justify-center animate-fade-up">
          <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6 relative">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="11" width="16" height="10" rx="2" stroke="#9a8c6e" strokeWidth="1.5" />
              <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#9a8c6e" strokeWidth="1.5" />
              <circle cx="12" cy="16" r="1.5" fill="#9a8c6e" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-ink-900 mb-2">
            {echo.title || 'A sealed Echo'}
          </h1>
          <div className={`px-3 py-1 rounded-full border text-xs font-mono mb-6 ${categoryColors[echo.category] || categoryColors.Other}`}>
            {echo.category}
          </div>
          <p className="text-[var(--text-secondary)] mb-1">This message will arrive on</p>
          <p className="font-display text-xl text-ink-800 mb-1">{formatDate(echo.deliveryDate)}</p>
          <p className="text-xs font-mono text-[var(--text-muted)] mb-8">
            {timeUntil(echo.deliveryDate)} from now
          </p>
          <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
            Sealed on {formatDate(echo.createdAt)}. Come back when the time is right.
          </p>
        </div>
      )}

      {/* UNLOCKED STATE (not yet opened) */}
      {status === 'unlocked' && (
        <div className="flex flex-col items-center text-center pt-8 animate-fade-up">
          {!showUnlockAnim ? (
            <>
              <div className="w-24 h-24 rounded-full bg-warm-100 flex items-center justify-center mb-6 animate-pulse-soft">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="11" width="16" height="10" rx="2" stroke="#8f6730" strokeWidth="1.5" />
                  <path d="M8 11V7C8 4.79086 9.79086 3 12 3C13.5 3 14.8 3.8 15.5 5" stroke="#8f6730" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="#8f6730" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-medium text-ink-900 mb-2">
                A message has arrived.
              </h1>
              <p className="text-[var(--text-secondary)] mb-1">
                You sealed this on {formatDate(echo.createdAt)}
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-8 max-w-xs leading-relaxed">
                Take a breath. This is a message from a version of you that no longer exists.
              </p>
              <button onClick={handleOpen} disabled={opening} className="btn-primary px-10">
                Open Echo
              </button>
            </>
          ) : (
            <div className="py-20 animate-scale-in">
              <div className="w-24 h-24 rounded-full bg-warm-200 flex items-center justify-center mb-6 mx-auto animate-pulse-soft">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="11" width="16" height="10" rx="2" stroke="#8f6730" strokeWidth="1.5" fill="#fdfaf6" />
                  <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7" stroke="#8f6730" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="font-mono text-sm text-[var(--text-muted)]">unsealing...</p>
            </div>
          )}
        </div>
      )}

      {/* OPENED STATE */}
      {status === 'opened' && (
        <div className="animate-fade-up">
          {/* Title and meta */}
          <div className="text-center mb-6">
            {echo.title && (
              <h1 className="font-display text-2xl font-medium text-ink-900 mb-2">{echo.title}</h1>
            )}
            <div className={`inline-block px-3 py-1 rounded-full border text-xs font-mono ${categoryColors[echo.category] || categoryColors.Other}`}>
              {echo.category}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-center gap-6 mb-6 text-xs font-mono text-[var(--text-muted)]">
            <div className="text-center">
              <p className="uppercase tracking-widest mb-1">Written</p>
              <p className="text-ink-700">{formatDate(echo.createdAt)}</p>
            </div>
            <div className="w-px h-8 bg-[var(--border)]" />
            <div className="text-center">
              <p className="uppercase tracking-widest mb-1">Delivered</p>
              <p className="text-ink-700">{formatDate(echo.deliveryDate)}</p>
            </div>
          </div>

          {/* Content */}
          <div className="card p-6 mb-6">
            {echo.messageType === 'text' ? (
              <p className="text-base text-ink-800 leading-relaxed whitespace-pre-wrap font-body">
                {echo.textContent}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="1.75" />
                    <path d="M5 10V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-mono">Voice message</span>
                </div>
                <audio controls src={resolveAssetUrl(echo.voiceUrl)} className="w-full rounded-lg" />
              </div>
            )}
          </div>

          {/* Reflection */}
          {!reflection ? (
            <div className="card p-6 animate-fade-up">
              <h2 className="font-display text-lg font-medium text-ink-900 mb-1">Did this message age well?</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">Take a moment to reflect on how things have changed.</p>

              <form onSubmit={handleReflectionSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'yes', label: 'Yes' },
                    { value: 'partially', label: 'Partially' },
                    { value: 'no', label: 'No' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReflectionForm(f => ({ ...f, aged: opt.value }))}
                      className={`py-3 rounded-xl text-sm font-medium border transition-all duration-150 ${
                        reflectionForm.aged === opt.value
                          ? 'bg-ink-900 text-warm-50 border-ink-900'
                          : 'bg-white text-ink-700 border-[var(--border)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="section-label">How do you feel reading this today?</label>
                  <textarea
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Optional thoughts..."
                    value={reflectionForm.note}
                    onChange={e => setReflectionForm(f => ({ ...f, note: e.target.value }))}
                    maxLength={1000}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!reflectionForm.aged || submittingReflection}
                  className="btn-primary w-full"
                >
                  {submittingReflection ? 'Saving...' : 'Save Reflection'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-6 animate-fade-up mb-6">
              <h2 className="font-display text-lg font-medium text-ink-900 mb-3">Your reflection</h2>
              <div className="flex items-center gap-2 mb-3">
                <span className="section-label">Aged well?</span>
                <span className="text-sm font-medium text-ink-800 capitalize">{reflection.aged}</span>
              </div>
              {reflection.note && (
                <p className="text-sm text-ink-700 leading-relaxed italic">"{reflection.note}"</p>
              )}
            </div>
          )}

          {/* Write again prompt */}
          {reflection && (
            <div className="card p-6 text-center animate-fade-up bg-[var(--bg-secondary)] border-dashed">
              <p className="font-display text-lg font-medium text-ink-900 mb-1">
                Want to write to your future self again?
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Capture how you're feeling right now — for the version of you that's reading this later.
              </p>
              <button onClick={() => navigate('/create')} className="btn-primary px-8">
                Write a new Echo
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        title="Delete this Echo?"
        message="This message will be permanently removed and cannot be recovered."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}