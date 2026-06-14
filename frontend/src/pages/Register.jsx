import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ink-900 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="white" strokeWidth="1.75" />
              <path d="M8 12C8 12 9.5 9 12 9C14.5 9 16 12 16 12C16 12 14.5 15 12 15C9.5 15 8 12 8 12Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
              <circle cx="12" cy="12" r="2" fill="white" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Begin your Echo</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
            A quiet space for your<br />future self.
          </p>
        </div>

        {/* Illustration */}
        <div className="flex justify-center my-2 -mb-2">
          <img
            src="/illustrations/envelope.png"
            alt=""
            className="w-44 h-auto select-none pointer-events-none drop-shadow-sm"
            draggable={false}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="section-label">Name</label>
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4.5 20C4.5 16.4101 7.85786 13.5 12 13.5C16.1421 13.5 19.5 16.4101 19.5 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className="input-field pl-11"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                maxLength={50}
              />
            </div>
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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
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

          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-[var(--border)] accent-ink-900 flex-shrink-0"
            />
            <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
              I agree to the{' '}
              <a href="#" className="text-warm-700 font-medium hover:text-warm-800 transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-warm-700 font-medium hover:text-warm-800 transition-colors">Privacy Policy</a>
            </span>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-ink-700 font-medium hover:text-ink-900 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}