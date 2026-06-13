import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { echoService } from '../services/echoService';
import EchoCard from '../components/ui/EchoCard';
import { getGreeting, computeStatus } from '../utils/dateUtils';

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

  return (
    <div className="px-5 pt-8 max-w-md mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-xs font-mono text-[var(--text-muted)] mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-display text-3xl font-medium text-ink-900">
          {getGreeting()}, {firstName}.
        </h1>
      </div>

      {/* Quick create */}
      <button
        onClick={() => navigate('/create')}
        className="w-full card p-5 mb-8 text-left transition-all duration-150 active:scale-[0.98] bg-ink-900 border-ink-900 group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-warm-50 font-medium mb-1">Write to your future self</p>
            <p className="text-xs font-mono text-warm-200">Create a new Echo →</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-warm-50/10 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="#fdfaf6" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </button>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 h-24 animate-pulse bg-ink-50" />
          ))}
        </div>
      ) : (
        <>
          {/* Ready to open */}
          {readyToOpen.length > 0 && (
            <div className="mb-8 animate-fade-up">
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
          <div className="mb-8 animate-fade-up">
            <h2 className="section-label mb-3">Upcoming Echoes</h2>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map(echo => (
                  <EchoCard key={echo._id} echo={echo} />
                ))}
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-sm text-[var(--text-muted)]">No Echoes waiting in time.</p>
              </div>
            )}
          </div>

          {/* Recently opened */}
          {recentlyOpened.length > 0 && (
            <div className="mb-8 animate-fade-up">
              <h2 className="section-label mb-3">Recently Opened</h2>
              <div className="space-y-3">
                {recentlyOpened.map(echo => (
                  <EchoCard key={echo._id} echo={echo} />
                ))}
              </div>
            </div>
          )}

          {echoes.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7117 18.3097 17.8964 16.9645 18.7218C15.6193 19.5473 14.0721 19.9856 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.01442 9.92796 4.45271 8.38807 5.27814 7.04297C6.10357 5.69788 7.28837 4.6131 8.7 3.90745C9.87812 3.31238 11.1801 3.00401 12.5 3.00745H13C15.0843 3.0731 17.0628 3.9445 18.5868 5.41441C20.1107 6.88432 21.0589 8.85029 21.1 11V11.5Z"
                    stroke="#9a8c6e" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-display text-lg text-ink-700 mb-1">Nothing here yet</p>
              <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
                Write your first message to the person you'll become.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
