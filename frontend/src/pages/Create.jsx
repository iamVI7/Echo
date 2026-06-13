import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { echoService } from '../services/echoService';
import VoiceRecorder from '../components/ui/VoiceRecorder';
import { formatDate } from '../utils/dateUtils';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

const categories = ['Personal', 'Career', 'Health', 'Learning', 'Project', 'Memory', 'Other'];

const DRAFT_KEY = 'echo_draft';

const deliveryOptions = [
  { label: 'Tomorrow', getValue: () => addDays(new Date(), 1) },
  { label: '1 Week', getValue: () => addWeeks(new Date(), 1) },
  { label: '1 Month', getValue: () => addMonths(new Date(), 1) },
  { label: '3 Months', getValue: () => addMonths(new Date(), 3) },
  { label: '6 Months', getValue: () => addMonths(new Date(), 6) },
  { label: '1 Year', getValue: () => addYears(new Date(), 1) },
];

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    return draft;
  } catch {
    return null;
  }
};

export default function Create() {
  const navigate = useNavigate();
  const draft = loadDraft();

  const [step, setStep] = useState(1); // 1: type+content, 2: details, 3: confirm
  const [messageType, setMessageType] = useState(draft?.messageType || 'text');
  const [title, setTitle] = useState(draft?.title || '');
  const [textContent, setTextContent] = useState(draft?.textContent || '');
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [category, setCategory] = useState(draft?.category || 'Personal');
  const [deliveryDate, setDeliveryDate] = useState(draft?.deliveryDate ? new Date(draft.deliveryDate) : null);
  const [customDate, setCustomDate] = useState(draft?.customDate || '');
  const [selectedOption, setSelectedOption] = useState(draft?.selectedOption || null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sealed, setSealed] = useState(false);
  const [draftRestored, setDraftRestored] = useState(!!draft);

  const handleVoiceComplete = (blob, duration) => {
    setVoiceBlob(blob);
    setVoiceDuration(duration);
  };

  // Auto-save draft (text content, title, category, delivery date) to localStorage
  useEffect(() => {
    if (sealed) return;
    // Don't bother saving an entirely empty draft
    if (!title && !textContent && !deliveryDate && category === 'Personal' && messageType === 'text') {
      return;
    }
    const draftData = {
      messageType,
      title,
      textContent,
      category,
      deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
      customDate,
      selectedOption
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    } catch {
      // ignore storage errors
    }
  }, [messageType, title, textContent, category, deliveryDate, customDate, selectedOption, sealed]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setMessageType('text');
    setTitle('');
    setTextContent('');
    setCategory('Personal');
    setDeliveryDate(null);
    setCustomDate('');
    setSelectedOption(null);
    setDraftRestored(false);
  };

  const canProceedStep1 = messageType === 'text'
    ? textContent.trim().length > 0
    : voiceBlob !== null;

  const handleDeliverySelect = (option) => {
    setSelectedOption(option.label);
    setDeliveryDate(option.getValue());
    setCustomDate('');
  };

  const handleCustomDate = (val) => {
    setCustomDate(val);
    setSelectedOption('Custom Date');
    if (val) setDeliveryDate(new Date(val));
  };

  const handleSeal = async () => {
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('messageType', messageType);
      formData.append('deliveryDate', deliveryDate.toISOString());
      formData.append('category', category);

      if (messageType === 'text') {
        formData.append('textContent', textContent);
      } else {
        formData.append('voice', voiceBlob, 'recording.webm');
        formData.append('voiceDuration', voiceDuration);
      }

      await echoService.create(formData);
      clearDraft();
      setSealed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to seal Echo');
    } finally {
      setSubmitting(false);
    }
  };

  if (sealed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 animate-fade-in">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="15" rx="2" stroke="#8f6730" strokeWidth="1.75" />
              <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="#8f6730" strokeWidth="1.75" />
              <path d="M9 13L11 15L15 11" stroke="#8f6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-ink-900 mb-3">Your Echo is sealed.</h1>
          <p className="text-[var(--text-secondary)] mb-1">This message will arrive on</p>
          <p className="font-display text-xl text-ink-800 mb-8">{formatDate(deliveryDate)}</p>
          <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
            Until then, it will rest quietly in your vault — waiting for the version of you that's ready to read it.
          </p>
          <button onClick={() => navigate('/vault')} className="btn-primary w-full mb-3">
            View in Vault
          </button>
          <button onClick={() => navigate('/')} className="btn-ghost w-full">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all duration-200 ${
              s === step ? 'w-6 bg-ink-900' : s < step ? 'w-6 bg-ink-300' : 'w-6 bg-ink-100'
            }`} />
          ))}
        </div>
        <div className="w-9" />
      </div>

      {/* Content area */}
      <div className="flex-1 px-5 pb-8 flex flex-col mt-6">
        <div className="flex flex-col justify-center min-h-[50vh]">

      {/* Step 1: Content */}
      {step === 1 && (
        <div className="animate-fade-up space-y-6">
          <div>
            <h1 className="font-display text-2xl font-medium text-ink-900 mb-1">Create your Echo</h1>
            <p className="text-sm text-[var(--text-muted)]">Choose how you want to speak to your future self.</p>
          </div>

          {draftRestored && (
            <div className="flex items-center justify-between gap-3 bg-warm-50 border border-warm-200 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-xs text-warm-800 leading-relaxed">
                We restored your unsaved draft.
              </p>
              <button
                onClick={handleDiscardDraft}
                className="text-xs font-mono text-warm-700 underline flex-shrink-0"
              >
                Discard
              </button>
            </div>
          )}

          {/* Message type toggle */}
          <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-xl">
            <button
              onClick={() => setMessageType('text')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                messageType === 'text' ? 'bg-white shadow-sm text-ink-900' : 'text-[var(--text-muted)]'
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setMessageType('voice')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                messageType === 'voice' ? 'bg-white shadow-sm text-ink-900' : 'text-[var(--text-muted)]'
              }`}
            >
              Voice
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="section-label">Title (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Give your Echo a name..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Content area */}
          {messageType === 'text' ? (
            <div className="space-y-1">
              <label className="section-label">Message</label>
              <textarea
                className="input-field min-h-[200px] resize-none leading-relaxed"
                placeholder="Write something to your future self..."
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                maxLength={5000}
              />
              <p className="text-right text-xs font-mono text-[var(--text-muted)]">
                {textContent.length} / 5000
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="section-label">Voice Message</label>
              <VoiceRecorder onRecordingComplete={handleVoiceComplete} />
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="btn-primary w-full"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Delivery + Category */}
      {step === 2 && (
        <div className="animate-fade-up space-y-6">
          <div>
            <h1 className="font-display text-2xl font-medium text-ink-900 mb-1">When should it arrive?</h1>
            <p className="text-sm text-[var(--text-muted)]">Choose a moment in the future to receive this Echo.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {deliveryOptions.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleDeliverySelect(opt)}
                className={`p-4 rounded-xl border text-left transition-all duration-150 active:scale-[0.97] ${
                  selectedOption === opt.label
                    ? 'border-ink-900 bg-ink-900 text-warm-50'
                    : 'border-[var(--border)] bg-white text-ink-800'
                }`}
              >
                <p className="font-display text-base font-medium mb-0.5">{opt.label}</p>
                <p className={`text-xs font-mono ${selectedOption === opt.label ? 'text-warm-200' : 'text-[var(--text-muted)]'}`}>
                  {format(opt.getValue(), 'MMM d, yyyy')}
                </p>
              </button>
            ))}
          </div>

          {/* Custom date */}
          <div className="space-y-1">
            <label className="section-label">Custom Date</label>
            <input
              type="date"
              className={`input-field ${selectedOption === 'Custom Date' ? 'border-ink-900 ring-2 ring-ink-200' : ''}`}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              value={customDate}
              onChange={e => handleCustomDate(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="section-label">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                    category === cat
                      ? 'bg-ink-900 text-warm-50 border-ink-900'
                      : 'bg-white text-ink-700 border-[var(--border)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={!deliveryDate}
            className="btn-primary w-full"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="animate-fade-up space-y-6">
          <div>
            <h1 className="font-display text-2xl font-medium text-ink-900 mb-1">Ready to seal?</h1>
            <p className="text-sm text-[var(--text-muted)]">Once sealed, this Echo cannot be edited — only deleted before it arrives.</p>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="section-label">Type</span>
              <span className="text-sm font-medium text-ink-800 capitalize">{messageType}</span>
            </div>
            {title && (
              <div className="flex items-center justify-between">
                <span className="section-label">Title</span>
                <span className="text-sm font-medium text-ink-800">{title}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="section-label">Category</span>
              <span className="text-sm font-medium text-ink-800">{category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="section-label">Arrives</span>
              <span className="text-sm font-medium text-ink-800">{formatDate(deliveryDate)}</span>
            </div>
          </div>

          {messageType === 'text' && (
            <div className="card p-5">
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap line-clamp-6">
                {textContent}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="bg-warm-50 border border-warm-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9" stroke="#8f6730" strokeWidth="1.5" />
              <path d="M12 8V13M12 16V16.5" stroke="#8f6730" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-xs text-warm-800 leading-relaxed">
              This message will arrive on <strong>{formatDate(deliveryDate)}</strong>. You won't be able to edit it after sealing.
            </p>
          </div>

          <button
            onClick={handleSeal}
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Sealing...' : 'Seal Echo'}
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}