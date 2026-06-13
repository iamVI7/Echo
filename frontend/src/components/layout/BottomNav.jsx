import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          stroke="currentColor" strokeWidth={active ? "2" : "1.5"} strokeLinejoin="round"
          fill={active ? "currentColor" : "none"} opacity={active ? "0.15" : "1"} />
        <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" fill="none" />
      </svg>
    )
  },
  {
    to: '/create',
    label: 'Create',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"
          fill={active ? "currentColor" : "none"} opacity={active ? "0.12" : "1"} />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    )
  },
  {
    to: '/vault',
    label: 'Vault',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.75"
          fill={active ? "currentColor" : "none"} opacity={active ? "0.12" : "1"} />
        <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="13.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 15.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75"
          fill={active ? "currentColor" : "none"} opacity={active ? "0.15" : "1"} />
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" fill="none" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
          stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    )
  }
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 px-4 flex justify-center">
      <div className="flex items-center gap-1 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/40 rounded-full shadow-lg shadow-ink-900/5 px-2 py-2 max-w-md w-full">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-full transition-all duration-200 ${
                isActive ? 'text-ink-900 bg-white/60' : 'text-[var(--text-muted)]'
              }`}
            >
              {item.icon(isActive)}
              <span className={`text-[9px] font-mono ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}