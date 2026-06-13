import { useEffect } from 'react';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm bg-white/70 backdrop-blur-xl backdrop-saturate-150 rounded-t-2xl sm:rounded-2xl border border-white/40 shadow-xl shadow-ink-900/10 p-6 pb-8 sm:pb-6 m-0 sm:m-4 animate-fade-up">
        <div className="w-10 h-1 rounded-full bg-ink-100 mx-auto mb-5 sm:hidden" />

        <h2 className="font-display text-lg font-medium text-ink-900 mb-1.5">
          {title}
        </h2>
        {message && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
            {message}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 font-body font-medium rounded-xl px-6 py-3.5 text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-40 ${
              destructive
                ? 'bg-red-600 text-white'
                : 'bg-ink-900 text-warm-50'
            }`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}