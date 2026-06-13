import { useNavigate } from 'react-router-dom';
import { formatDate, categoryColors, computeStatus } from '../../utils/dateUtils';
import { format, formatDistanceToNowStrict } from 'date-fns';

export default function EchoCard({ echo }) {
  const navigate = useNavigate();
  const status = computeStatus(echo);

  const statusConfig = {
    locked: {
      label: 'Locked',
      iconBg: 'bg-warm-100',
      iconColor: '#8f6730',
      labelColor: 'text-warm-700',
      ring: 'border-[var(--border)]'
    },
    unlocked: {
      label: 'Ready to open',
      iconBg: 'bg-green-50',
      iconColor: '#4d7c5f',
      labelColor: 'text-green-700',
      ring: 'border-warm-300 shadow-sm shadow-warm-100'
    },
    opened: {
      label: 'Opened',
      iconBg: 'bg-purple-50',
      iconColor: '#7c5fa6',
      labelColor: 'text-purple-700',
      ring: 'border-[var(--border)] opacity-70'
    }
  };

  const cfg = statusConfig[status];

  const relativeTime = () => {
    if (status === 'locked') {
      return `Opens in ${formatDistanceToNowStrict(new Date(echo.deliveryDate))}`;
    }
    if (status === 'unlocked') return 'Ready now';
    return `Opened ${formatDistanceToNowStrict(new Date(echo.openedAt || echo.deliveryDate), { addSuffix: true })}`;
  };

  const dateLine = () => {
    if (status === 'opened') {
      return format(new Date(echo.openedAt || echo.deliveryDate), 'MMM d, yyyy');
    }
    return format(new Date(echo.deliveryDate), 'MMM d, yyyy');
  };

  return (
    <button
      onClick={() => navigate(`/echo/${echo._id}`)}
      className={`w-full text-left card p-4 transition-all duration-150 active:scale-[0.98] ${cfg.ring}`}
    >
      {/* Top row: title, category, chevron */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-display text-base font-medium text-ink-900 truncate">
            {echo.title || (echo.messageType === 'voice' ? 'Voice Echo' : 'Untitled Echo')}
          </p>
          <div className={`flex-shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-mono ${
            categoryColors[echo.category] || categoryColors.Other
          }`}>
            {echo.category}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)] flex-shrink-0">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Written date */}
      <p className="text-xs font-mono text-[var(--text-muted)] mb-3">
        Written on {format(new Date(echo.createdAt), 'MMM d, yyyy')}
      </p>

      {/* Content preview */}
      {echo.messageType === 'voice' ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)] mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="1.75" />
            <path d="M5 10V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M12 19V23M9 23H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-mono">Voice message</span>
        </div>
      ) : echo.textContent ? (
        <p className={`text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 ${status === 'locked' ? 'blur-[3px] select-none' : ''}`}>
          {echo.textContent}
        </p>
      ) : null}

      {/* Bottom row: status pill + dates */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
            {status === 'locked' && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="11" width="16" height="9" rx="2" stroke={cfg.iconColor} strokeWidth="2" />
                <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={cfg.iconColor} strokeWidth="2" />
              </svg>
            )}
            {status === 'unlocked' && (
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
            )}
            {status === 'opened' && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M3 7L10.5 12.5C11.4 13.1667 12.6 13.1667 13.5 12.5L21 7" stroke={cfg.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="5" width="18" height="14" rx="2" stroke={cfg.iconColor} strokeWidth="2" />
              </svg>
            )}
          </div>
          <span className={`text-xs font-mono font-medium ${cfg.labelColor}`}>{relativeTime()}</span>
        </div>

        <span className="text-xs font-mono text-[var(--text-muted)]">{dateLine()}</span>
      </div>
    </button>
  );
}