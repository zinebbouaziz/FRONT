'use client';

import {
  User, Cpu, Camera, Save, CheckCircle,
  Plus, X, ChevronDown, Zap, Brain,
  Sun, Moon
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

/* ─── reusable primitives ─── */

function SectionCard({ title, icon: Icon, iconBg, children, action }: {
  title: string;
  icon: React.ElementType;
  iconBg: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-surface-border dark:border-dark-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-text-primary dark:text-white">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-xs font-semibold text-text-secondary dark:text-text-secondary mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {hint && <p className="text-[11px] text-text-tertiary dark:text-text-tertiary mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white placeholder-text-tertiary dark:placeholder-text-tertiary focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition-all"
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card font-medium focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition-all cursor-pointer ${
          hasSelected ? 'text-brand-600 dark:text-brand-400' : 'text-text-primary dark:text-white'
        }`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
          hasSelected ? 'text-brand-500 dark:text-brand-400' : 'text-text-tertiary'
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-xl shadow-lg max-h-56 overflow-y-auto" role="listbox">
          {options.map(option => (
            <div
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              tabIndex={0}
              onClick={() => { onChange(option.value); setHasSelected(true); setIsOpen(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(option.value);
                  setHasSelected(true);
                  setIsOpen(false);
                }
              }}
              className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                option.value === value && hasSelected
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium'
                  : 'text-text-primary dark:text-white hover:bg-surface-tertiary dark:hover:bg-dark-surface'
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SaveButton({ onClick, saved, loading }: { onClick: () => void; saved: boolean; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        saved
          ? 'bg-green-500 text-white shadow-sm'
          : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand hover:-translate-y-0.5 disabled:opacity-60'
      }`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving…
        </>
      ) : saved ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Saved!
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Save Changes
        </>
      )}
    </button>
  );
}

/* ─── AI model cards data ─── */
const AI_MODELS = [
  {
    id: 'gemini',
    name: 'Gemini',
    badge: 'Recommended',
    badgeColor: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400',
    description: 'Strong reasoning and multimodal capabilities.',
    icon: Brain,
    iconBg: 'bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400',
  },
  {
    id: 'grok',
    name: 'Grok',
    badge: 'Fast',
    badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    description: 'High-speed responses with strong reasoning.',
    icon: Zap,
    iconBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400',
  },
  {
    id: 'kimi',
    name: 'Kimi K2',
    badge: 'Long Context',
    badgeColor: 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    description: 'Optimized for long documents and research workflows.',
    icon: Cpu,
    iconBg: 'bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400',
  },
];

/* ─── Page ─── */
export default function SettingsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ─── Profile state ──────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // ─── AI preferences state ───────────────────────────
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [assistantLevel, setAssistantLevel] = useState('moderate');
  const [tone, setTone] = useState('academic');

  // ─── Save & loading states ──────────────────────────
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedAI, setSavedAI] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ─── Theme ──────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ─── Fetch user data from backend & metadata on mount ─
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return; // user not logged in

        // 1. Get user profile from backend (PATCHable fields)
        const token = session.access_token;
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFullName(data.full_name || '');
          setEmail(data.email || ''); // may come from Supabase claims, but not editable directly via this endpoint
          setPosition(data.academic_position || '');
          setDepartment(data.organization || ''); // map to department for UI
          setInterests(data.field_interests ? data.field_interests.split(',').map((s: string) => s.trim()) : []);
        }

        // 2. Get AI preferences from Supabase user metadata
        const { data: { user } } = await supabase.auth.getUser();
        const meta = user?.user_metadata?.ai_preferences;
        if (meta) {
          setSelectedModel(meta.selectedModel || 'gemini');
          setAssistantLevel(meta.assistantLevel || 'moderate');
          setTone(meta.tone || 'academic');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  // ─── Theme initialization ───────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  // ─── Save profile via PATCH /auth/me ──────────────
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const token = session.access_token;

      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          academic_position: position,
          organization: department,               // backend field is "organization"
          field_interests: interests.join(', '),   // comma-separated string
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to save profile');
      }

      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (err: any) {
      console.error(err);
      alert('Error saving profile: ' + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Save AI preferences to Supabase user metadata ──
  const handleSaveAI = async () => {
    setAiLoading(true);
    try {
      const prefs = { selectedModel, assistantLevel, tone };
      const { error } = await supabase.auth.updateUser({
        data: { ai_preferences: prefs },
      });

      if (error) throw error;

      setSavedAI(true);
      setTimeout(() => setSavedAI(false), 2500);
    } catch (err: any) {
      console.error(err);
      alert('Error saving AI preferences: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (i: string) => setInterests(interests.filter(x => x !== i));

  // ─── Initials from name ────────────────────────────
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* ── Profile Card with Theme Toggle in Header ── */}
      <SectionCard
        title="Personal Information"
        icon={User}
        iconBg="bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400"
        action={
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-card transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        }
      >
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-surface-border dark:border-dark-border">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-purple flex items-center justify-center shadow-brand flex-shrink-0">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <button className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          <div>
            <p className="font-semibold text-text-primary dark:text-white">{fullName}</p>
            <p className="text-sm text-text-secondary dark:text-text-secondary mt-0.5">
              {position}{position && department ? ' · ' : ''}{department}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label="Full Name">
            <Input value={fullName} onChange={setFullName} placeholder="Dr. Emily Chen" />
          </Field>

          <Field label="Email address">
            <Input value={email} onChange={setEmail} placeholder="you@university.edu" type="email"  />
            {/* Email is read-only (managed by Supabase) */}
          </Field>

          <Field label="Academic Position">
            <Select
              value={position}
              onChange={setPosition}
              options={[
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Professor', label: 'Professor' },
                { value: 'PhD Student', label: 'PhD Student' },
                { value: 'Postdoc', label: 'Postdoc' },
                { value: 'Researcher', label: 'Researcher' },
              ]}
            />
          </Field>

          <Field label="Department">
            <Input value={department} onChange={setDepartment} placeholder="Computer Science" />
          </Field>
        </div>

        {/* Research interests */}
        <Field label="Research Interests">
          <div className="flex flex-wrap gap-2 mb-2.5 min-h-[36px]">
            {interests.map(interest => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs rounded-xl border border-brand-100 dark:border-brand-800 font-medium"
              >
                {interest}
                <button onClick={() => removeInterest(interest)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newInterest}
              onChange={e => setNewInterest(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addInterest()}
              placeholder="Add new interest…"
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40"
            />

            <button
              onClick={addInterest}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 text-brand-500 text-xs font-medium hover:bg-brand-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </Field>

        <div className="flex justify-end mt-4 pt-4 border-t border-surface-border dark:border-dark-border">
          <SaveButton onClick={handleSaveProfile} saved={savedProfile} loading={profileLoading} />
        </div>
      </SectionCard>

      {/* ── AI Preferences ── */}
      <SectionCard title="AI Preferences" icon={Cpu} iconBg="bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400">
        <Field label="AI Model">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AI_MODELS.map(model => {
              const Icon = model.icon;
              const active = selectedModel === model.id;

              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                    active
                      ? 'border-brand-500 dark:border-brand-400 bg-brand-50 dark:bg-brand-900/20 shadow-brand'
                      : 'border-surface-border dark:border-dark-border bg-white dark:bg-dark-card'
                  }`}
                >
                  {active && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </span>
                  )}

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${model.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary dark:text-white">{model.name}</span>
                  </div>

                  <p className="text-[11px] text-text-tertiary dark:text-text-tertiary">
                    {model.description}
                  </p>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Assistant Level">
          <Select
            value={assistantLevel}
            onChange={setAssistantLevel}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'full', label: 'Full' },
            ]}
          />
        </Field>

        <Field label="Tone">
          <Select
            value={tone}
            onChange={setTone}
            options={[
              { value: 'academic', label: 'Academic' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'concise', label: 'Concise' },
            ]}
          />
        </Field>

        <div className="flex justify-end mt-4 pt-4 border-t border-surface-border dark:border-dark-border">
          <SaveButton onClick={handleSaveAI} saved={savedAI} loading={aiLoading} />
        </div>
      </SectionCard>
    </div>
  );
}