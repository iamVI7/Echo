import { useState, useEffect } from 'react';
import { echoService } from '../services/echoService';
import EchoCard from '../components/ui/EchoCard';
import { computeStatus, categoryColors } from '../utils/dateUtils';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'locked', label: 'Locked' },
  { key: 'unlocked', label: 'Unlocked' },
  { key: 'opened', label: 'Opened' }
];

const categories = ['Personal', 'Career', 'Health', 'Learning', 'Project', 'Memory', 'Other'];

export default function Vault() {
  const [echoes, setEchoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    echoService.getAll()
      .then(setEchoes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const usedCategories = categories.filter(cat =>
    echoes.some(e => e.category === cat)
  );

  const filtered = echoes.filter(e => {
    if (activeTab !== 'all' && computeStatus(e) !== activeTab) return false;
    if (activeCategory !== 'all' && e.category !== activeCategory) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const inTitle = e.title?.toLowerCase().includes(q);
      const inText = e.messageType === 'text' && e.textContent?.toLowerCase().includes(q);
      if (!inTitle && !inText) return false;
    }
    return true;
  }).sort((a, b) => {
    if (activeTab === 'all' || activeTab === 'locked') {
      return new Date(a.deliveryDate) - new Date(b.deliveryDate);
    }
    return new Date(b.deliveryDate) - new Date(a.deliveryDate);
  });

  const counts = {
    all: echoes.length,
    locked: echoes.filter(e => computeStatus(e) === 'locked').length,
    unlocked: echoes.filter(e => computeStatus(e) === 'unlocked').length,
    opened: echoes.filter(e => computeStatus(e) === 'opened').length
  };

  return (
    <div className="px-5 pt-8 max-w-md mx-auto animate-fade-in">
      <h1 className="font-display text-3xl font-medium text-ink-900 mb-6">Vault</h1>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-ink-900 text-warm-50 border-ink-900'
                : 'bg-white text-ink-700 border-[var(--border)]'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-warm-200' : 'text-[var(--text-muted)]'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
          <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search your Echoes..."
          className="input-field pl-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter */}
      {usedCategories.length > 0 && (
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-150 ${
              activeCategory === 'all'
                ? 'bg-ink-800 text-warm-50 border-ink-800'
                : 'bg-white text-[var(--text-muted)] border-[var(--border)]'
            }`}
          >
            All categories
          </button>
          {usedCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-ink-800 text-warm-50 border-ink-800'
                  : `${categoryColors[cat] || categoryColors.Other}`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-4 h-24 animate-pulse bg-ink-50" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3 animate-fade-up">
          {filtered.map(echo => (
            <EchoCard key={echo._id} echo={echo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="15" rx="2" stroke="#9a8c6e" strokeWidth="1.5" />
              <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="#9a8c6e" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {search.trim()
              ? 'No Echoes match your search.'
              : activeCategory !== 'all'
              ? `No ${activeCategory} Echoes${activeTab !== 'all' ? ` in ${activeTab}` : ''}.`
              : activeTab === 'all'
              ? 'Your vault is empty.'
              : `No ${activeTab} Echoes.`}
          </p>
        </div>
      )}
    </div>
  );
}