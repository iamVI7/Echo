import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { echoService } from '../services/echoService';
import EchoCard from '../components/ui/EchoCard';
import { getGreeting, computeStatus } from '../utils/dateUtils';
import { formatDistanceToNowStrict, differenceInCalendarDays } from 'date-fns';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [echoes, setEchoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    echoService.getAll()
      .then(setEchoes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = echoes
    .filter(e => computeStatus(e) === 'locked')
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
    .slice(0, 3);

  const readyToOpen = echoes.filter(e => computeStatus(e) === 'unlocked');

  const recentlyOpened = echoes
    .filter(e => computeStatus(e) === 'opened')
    .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt))
    .slice(0, 3);

  const firstName = user?.name?.split(' ')[0] || '';
  const nextEcho = upcoming[0];
  const totalCount = echoes.length;

  // Surprise Me — pick a random opened Echo
  const openedEchoes = echoes.filter(e => computeStatus(e) === 'opened');
  const [surpriseId, setSurpriseId] = useState(null);

  const handleSurpriseMe = () => {
    if (openedEchoes.length === 0) return;
    const pool = openedEchoes.filter(e => e._id !== surpriseId);
    const source = pool.length > 0 ? pool : openedEchoes;
    const random = source[Math.floor(Math.random() * source.length)];
    setSurpriseId(random._id);
    navigate(`/echo/${random._id}`);
  };

  // Momentum: time since the most recently created Echo
  const mostRecent = echoes
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  let streakText = '';
  let streakSubtext = '';
  if (mostRecent) {
    const daysSince = differenceInCalendarDays(new Date(), new Date(mostRecent.createdAt));
    if (daysSince === 0) {
      streakText = 'You wrote an Echo today';
      streakSubtext = 'Nice — your future self will appreciate it.';
    } else if (daysSince === 1) {
      streakText = 'Last Echo: yesterday';
      streakSubtext = 'Keep the habit going — write another today.';
    } else if (daysSince <= 7) {
      streakText = `Last Echo: ${daysSince} days ago`;
      streakSubtext = 'A quiet week — maybe it\'s time for a new one.';
    } else {
      streakText = `It's been ${daysSince} days since your last Echo`;
      streakSubtext = 'Your future self is still waiting to hear from you.';
    }
  }

  return (
    <div className="px-5 pt-8 max-w-md mx-auto animate-fade-in pb-4">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs font-mono text-[var(--text-muted)] mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-display text-3xl font-medium text-ink-900">
          {getGreeting()}, {firstName}.
        </h1>
      </div>

      {/* Quick create + Surprise Me */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate('/create')}
          className="flex-1 card p-5 text-left transition-all duration-150 active:scale-[0.98] bg-ink-900 border-ink-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-base text-warm-50 font-medium mb-1">Write to your future self</p>
              <p className="text-xs font-mono text-warm-200">Create a new Echo →</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-warm-50/10 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="#fdfaf6" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </button>

        {openedEchoes.length > 0 && (
          <button
            onClick={handleSurpriseMe}
            className="card p-4 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.97] min-w-[80px]"
            title="Surprise Me"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="#8f6730" strokeWidth="1.5" strokeLinejoin="round" fill="#8f6730" fillOpacity="0.12" />
            </svg>
            <span className="text-[10px] font-mono text-[var(--text-muted)] leading-tight text-center">Surprise<br />me</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 h-24 animate-pulse bg-ink-50" />
          ))}
        </div>
      ) : (
        <>
          {/* Writing streak — unique to Home, encourages habitual use */}
          {totalCount > 0 && (
            <div className="card p-4 mb-6 flex items-center gap-3 animate-fade-up">
              <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 6 8 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 8 12 2 12 2Z" stroke="#8f6730" strokeWidth="1.5" strokeLinejoin="round" fill="#8f6730" fillOpacity="0.12" />
                  <path d="M12 19C10.3431 19 9 17.6569 9 16C9 14 12 11 12 11C12 11 15 14 15 16C15 17.6569 13.6569 19 12 19Z" stroke="#8f6730" strokeWidth="1.5" fill="#8f6730" fillOpacity="0.2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-800">
                  {streakText}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{streakSubtext}</p>
              </div>
            </div>
          )}

          {/* Ready to open */}
          {readyToOpen.length > 0 && (
            <div className="mb-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warm-500 animate-pulse-soft" />
                <h2 className="section-label">Ready to open</h2>
              </div>
              <div className="space-y-3">
                {readyToOpen.map(echo => (
                  <EchoCard key={echo._id} echo={echo} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-6 animate-fade-up">
              <h2 className="section-label mb-3">Upcoming Echoes</h2>
              <div className="space-y-3">
                {upcoming.map(echo => (
                  <EchoCard key={echo._id} echo={echo} />
                ))}
              </div>
            </div>
          )}

          {/* Recently opened */}
          {recentlyOpened.length > 0 && (
            <div className="mb-6 animate-fade-up">
              <h2 className="section-label mb-3">Recently Opened</h2>
              <div className="space-y-3">
                {recentlyOpened.map(echo => (
                  <EchoCard key={echo._id} echo={echo} />
                ))}
              </div>
            </div>
          )}

          {/* Next echo countdown — gives the page a sense of purpose */}
          {nextEcho && (
            <div className="relative rounded-2xl mb-6 animate-fade-up overflow-hidden bg-ink-900 p-5">
              <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
                <defs>
                  <pattern id="home-grain" width="6" height="6" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.6" fill="#fdfaf6" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#home-grain)" />
              </svg>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-warm-500/15 blur-2xl" />

              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warm-50/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#fdfaf6" strokeWidth="1.5" />
                    <path d="M12 7V12L15 14" stroke="#fdfaf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-mono text-warm-200 uppercase tracking-widest mb-0.5">Your next Echo arrives</p>
                  <p className="font-display text-base font-medium text-warm-50">
                    in {formatDistanceToNowStrict(new Date(nextEcho.deliveryDate))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty state with onboarding guidance */}
          {echoes.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7117 18.3097 17.8964 16.9645 18.7218C15.6193 19.5473 14.0721 19.9856 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.01442 9.92796 4.45271 8.38807 5.27814 7.04297C6.10357 5.69788 7.28837 4.6131 8.7 3.90745C9.87812 3.31238 11.1801 3.00401 12.5 3.00745H13C15.0843 3.0731 17.0628 3.9445 18.5868 5.41441C20.1107 6.88432 21.0589 8.85029 21.1 11V11.5Z"
                    stroke="#9a8c6e" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-display text-lg text-ink-700 mb-1">Nothing here yet</p>
              <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto mb-6">
                Write your first message to the person you'll become.
              </p>

              {/* Onboarding suggestions */}
              <div className="space-y-2.5 text-left">
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-display font-semibold text-warm-700">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">Write something honest</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">A goal, a worry, a memory — anything you'd want to read again.</p>
                  </div>
                </div>
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-display font-semibold text-green-700">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">Pick a delivery date</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Tomorrow, next month, or a year from now — your choice.</p>
                  </div>
                </div>
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-display font-semibold text-purple-700">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">Seal it and wait</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">When the date arrives, your Echo unlocks — ready to read.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gentle prompt when everything is caught up */}
          {echoes.length > 0 && readyToOpen.length === 0 && recentlyOpened.length === 0 && upcoming.length <= 1 && (
            <div className="card p-5 text-center animate-fade-up">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Got something else on your mind? You can write as many Echoes as you like —
                each one a small note to the future.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}