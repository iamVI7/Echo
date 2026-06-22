import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { type, message, hint }
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const showError = (type, message, hint = null) => {
    // Cancel any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    setError({ type, message, hint });
    // Auto-dismiss after 4 seconds
    timerRef.current = setTimeout(() => {
      setError(null);
      timerRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    // Clear any existing error and its timer before new attempt
    if (timerRef.current) clearTimeout(timerRef.current);
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      const msg = (err.response?.data?.message || '').toLowerCase();
      if (msg.includes('invalid email or password') || msg.includes('user not found') || msg.includes('not found')) {
        showError('not_found', "We couldn't find an account with those details.", "Not registered yet?");
      } else {
        showError('error', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6 py-10">
      <div
        className="w-full max-w-sm transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)' }}
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ink-900 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="white" strokeWidth="1.75" />
              <path d="M8 12C8 12 9.5 9 12 9C14.5 9 16 12 16 12C16 12 14.5 15 12 15C9.5 15 8 12 8 12Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
              <circle cx="12" cy="12" r="2" fill="white" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
            Continue your journey with<br />your future self.
          </p>
        </div>

        {/* Illustration */}
        <div className="flex justify-center my-2 -mb-2">
          <img
            src="/illustrations/mailbox.png"
            alt=""
            className="w-44 h-auto select-none pointer-events-none drop-shadow-sm"
            draggable={false}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 max-w-[88%] mx-auto">

          {/* Error message — rendered outside of loading-dependent re-renders */}
          <div style={{ minHeight: error ? undefined : 0 }}>
            {error && (
              <ErrorBanner
                key={error.message + Date.now()}
                type={error.type}
                message={error.message}
                hint={error.hint}
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="section-label">Email</label>
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 7L10.5 12.5C11.4 13.1667 12.6 13.1667 13.5 12.5L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="email"
                className="input-field pl-11"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="section-label">Password</label>
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pl-11 pr-11"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10.6 10.6C10.2206 10.9794 10 11.4892 10 12C10 13.1046 10.8954 14 12 14C12.5108 14 13.0206 13.7794 13.4 13.4M9.36 5.51C10.18 5.18 11.07 5 12 5C16 5 19.27 7.61 21 12C20.62 13.01 20.13 13.93 19.55 14.74M6.5 6.5C4.5 8 3 10 3 12C4.73 16.39 8 19 12 19C13.18 19 14.31 18.78 15.36 18.39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] accent-ink-900"
              />
              <span className="text-sm text-[var(--text-secondary)]">Remember me</span>
            </label>
            <button type="button" className="text-sm text-warm-700 font-medium hover:text-warm-800 transition-colors">
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          No account yet?{' '}
          <Link to="/register" className="text-ink-700 font-medium hover:text-ink-900 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

// Isolated component so its own mount/unmount is independent of parent re-renders
function ErrorBanner({ type, message, hint }) {
  const [width, setWidth] = useState(100);

  useEffect(() => {
    // Start shrink animation after mount
    const raf = requestAnimationFrame(() => {
      setWidth(0);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`rounded-xl px-4 py-3 overflow-hidden relative ${
      type === 'not_found' || type === 'exists'
        ? 'bg-warm-50 border border-warm-200'
        : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-start gap-3">
        {type === 'not_found' || type === 'exists' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5 text-warm-600">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8V13M12 16V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5 text-red-500">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <div>
          <p className={`text-sm ${type === 'not_found' || type === 'exists' ? 'text-warm-800' : 'text-red-700'}`}>
            {message}
          </p>
          {hint && (
            <p className="text-xs text-warm-600 mt-1">
              {hint}{' '}
              <Link to="/register" className="font-medium underline underline-offset-2 hover:text-warm-800 transition-colors">
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
      {/* Progress bar — shrinks over 4 seconds */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-all ease-linear ${
          type === 'not_found' || type === 'exists' ? 'bg-warm-400' : 'bg-red-400'
        }`}
        style={{
          width: `${width}%`,
          transitionDuration: width === 0 ? '4000ms' : '0ms'
        }}
      />
    </div>
  );
}