import { useNavigate } from 'react-router-dom';
import { formatDate, timeUntil, categoryColors, computeStatus } from '../../utils/dateUtils';
import { format } from 'date-fns';

export default function EchoCard({ echo }) {
  const navigate = useNavigate();
  const status = computeStatus(echo);

  const statusConfig = {
    locked: {
      label: 'Locked',
      dot: 'bg-ink-300',
      text: 'text-ink-400',
      ring: 'border-[var(--border)]'
    },
    unlocked: {
      label: 'Ready to open',
      dot: 'bg-warm-500 animate-pulse-soft',
      text: 'text-warm-700',
      ring: 'border-warm-300 shadow-sm shadow-warm-100'
    },
    opened: {
      label: 'Opened',
      dot: 'bg-green-400',
      text: 'text-green-600',
      ring: 'border-[var(--border)] opacity-60'
    }
  };

  const cfg = statusConfig[status];

  return (
    <button
      onClick={() => navigate(`/echo/${echo._id}`)}
      className={`w-full text-left card p-4 transition-all duration-150 active:scale-[0.98] ${cfg.ring}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-medium text-ink-900 truncate">
            {echo.title || (echo.messageType === 'voice' ? '🎙 Voice Echo' : 'Untitled Echo')}
          </p>
        </div>
        <div className={`flex-shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-mono ${
          categoryColors[echo.category] || categoryColors.Other
        }`}>
          {echo.category}
        </div>
      </div>

      {status === 'locked' && echo.messageType === 'text' && echo.textContent && (
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3 blur-[3px] select-none">
          {echo.textContent}
        </p>
      )}

      {status !== 'locked' && echo.messageType === 'text' && echo.textContent && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
          {echo.textContent}
        </p>
      )}

      {echo.messageType === 'voice' && (
        <div className="flex items-center gap-2 mb-3 text-[var(--text-muted)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="1.75" />
            <path d="M5 10V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M12 19V23M9 23H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-mono">Voice message</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-mono ${cfg.text}`}>{cfg.label}</span>
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {status === 'locked'
            ? `Opens ${format(new Date(echo.deliveryDate), 'MMM d, yyyy')}`
            : status === 'unlocked'
            ? `Arrived ${format(new Date(echo.deliveryDate), 'MMM d, yyyy')}`
            : `Opened ${format(new Date(echo.openedAt || echo.deliveryDate), 'MMM d')}`
          }
        </span>
      </div>
    </button>
  );
}
