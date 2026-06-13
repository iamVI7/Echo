import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ink-900 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="white" strokeWidth="1.75" />
              <path d="M8 12C8 12 9.5 9 12 9C14.5 9 16 12 16 12C16 12 14.5 15 12 15C9.5 15 8 12 8 12Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.3" />
              <circle cx="12" cy="12" r="2" fill="white" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-ink-900">Project Echo</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-mono">Send a message to the person you'll become.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="section-label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="section-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
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
