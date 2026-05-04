'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Folder, TrendingUp, FileText, BookOpen, X, Check, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────
interface Project {
  id: string;
  title: string;
  status: 'active' | 'archived';
  progress: number;
  created_at: string;
  updated_at?: string;
  description?: string;
}

interface UserProfile {
  full_name: string;
  academic_position?: string;
  department?: string;
  organization?: string;
}

type NewPaperForm = {
  title: string;
  language: 'English' | 'French';
  writingStyle: string;
  citationStyle: 'IEEE' | 'APA';
  restrictToLibrary: boolean;
};

type FilterType = 'all' | 'in_progress' | 'completed' | 'recent' | 'shared';

// ─── Section Templates per Writing Style ──────────────────────────
const WRITING_STYLE_SECTIONS: Record<string, string[]> = {
  'IMRaD structure': [
    'Introduction',
    'Methods',
    'Results',
    'Discussion',
    'Conclusion',
  ],
  'Problem–Solution research structure': [
    'Introduction',
    'Problem Definition',
    'Proposed Solution',
    'Implementation',
    'Evaluation',
    'Conclusion',
  ],
  'Experimental research structure': [
    'Introduction',
    'Literature Review',
    'Methodology',
    'Results',
    'Discussion',
    'Conclusion',
  ],
  'Engineering system paper structure': [
    'Introduction',
    'System Requirements',
    'System Design',
    'Implementation',
    'Testing & Evaluation',
    'Results',
    'Conclusion',
  ],
  'Survey (Literature Review) structure': [
    'Introduction',
    'Literature Review',
    'Methodology',
    'Results',
    'Discussion',
    'Conclusion',
  ],
};

// ─── Allowed type values (based on backend enum – adapt after checking) ──
// Use 'abstract' as a safe fallback for now.
const DEFAULT_SECTION_TYPE = 'abstract';

// ─── Main Dashboard Component ─────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [form, setForm] = useState<NewPaperForm>({
    title: '',
    language: 'English',
    writingStyle: 'IMRaD structure',
    citationStyle: 'IEEE',
    restrictToLibrary: false,
  });
  const [creating, setCreating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // ─── Fetch user profile ─────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }
        const token = session.access_token;

        const userRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error('Failed to fetch user profile');
        const userData: UserProfile = await userRes.json();
        setUser(userData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchUser();
  }, [router, API_URL]);

  // ─── Fetch projects ─────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const res = await fetch(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch projects');

      const data = await res.json();
      const projectsData = data.data || data.items || data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [API_URL, router]);

  useEffect(() => {
    const init = async () => {
      await fetchProjects();
      setLoading(false);
    };
    init();
  }, [fetchProjects]);

  // ─── Derived stats ──────────────────────────────────────────────
  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'archived');
  const totalSources = 0;

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: Folder,
      color: 'text-brand-500 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-900/30',
    },
    {
      label: 'In Progress',
      value: activeProjects.length,
      icon: TrendingUp,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Completed',
      value: completedProjects.length,
      icon: FileText,
      color: 'text-green-500 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      label: 'Total Sources',
      value: totalSources,
      icon: BookOpen,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
    },
  ];

  // ─── Filters ────────────────────────────────────────────────────
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  const getFilteredProjects = () => {
    switch (activeFilter) {
      case 'in_progress':
        return activeProjects;
      case 'completed':
        return completedProjects;
      case 'recent':
        return [...projects].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime()
        );
      case 'shared':
        return projects;
      default:
        return projects;
    }
  };

  const filteredProjects = getFilteredProjects();

  // ─── Create Project + Seed Sections ────────────────────────────
  const handleCreatePaper = async () => {
    setCreating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        router.push('/auth/login');
        return;
      }

      // 1. Create project
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim() || 'Untitled Research Paper',
          description: `${form.writingStyle} • ${form.language} • ${form.citationStyle}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to create project');
      }

      const newProject = await res.json();
      const projectId = newProject.data?.id || newProject.id || newProject.project?.id;
      if (!projectId) throw new Error('Project created but no ID returned');

      // 2. Seed sections – all use a safe default type ('abstract')
      const sectionTitles = WRITING_STYLE_SECTIONS[form.writingStyle] || [];
      let failedCount = 0;

      if (sectionTitles.length > 0) {
        for (let i = 0; i < sectionTitles.length; i++) {
          const title = sectionTitles[i];
          const position = i + 1;

          const response = await fetch(
            `${API_URL}/projects/${projectId}/sections`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                type: DEFAULT_SECTION_TYPE,   // safe fallback
                title,
                position,
              }),
            }
          );

          if (!response.ok) {
            // Log error but continue; display warning if needed
            console.error(`Failed to create section "${title}"`, await response.text());
            failedCount++;
          }
        }
      }

      // Refresh project list
      await fetchProjects();

      // Close modal, reset form
      setShowModal(false);
      setForm(prev => ({ ...prev, title: '' }));

      if (failedCount > 0) {
        setError(`Project created, but ${failedCount} section(s) failed. Check console.`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ─── Loading / Error states ─────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !user && projects.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm underline">
          Retry
        </button>
      </div>
    );
  }

  // ─── Writing styles (from template map) ─────────────────────────
  const writingStyles = Object.keys(WRITING_STYLE_SECTIONS);

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto min-h-screen flex flex-col">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-purple p-6 md:p-8 flex-shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full bg-white transform -translate-x-1/2 translate-y-1/3" />
        </div>

        <div className="relative z-10">
          <p className="text-brand-100 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-1">
            {user?.full_name || 'Researcher'}
          </h1>
          <p className="text-brand-200 text-sm">
            {user?.academic_position && `${user.academic_position} · `}
            {user?.department || ''}
          </p>
          {user?.organization && (
            <p className="text-brand-200/80 text-xs mt-1">{user.organization}</p>
          )}
          <p className="text-brand-200/80 text-xs mt-2">
            Continue your research or start something new
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 flex-shrink-0">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary dark:text-white leading-none">
                  {value}
                </p>
                <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-0.5">
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Grid Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="font-display font-bold text-lg text-text-primary dark:text-white">
            Research Projects
          </h2>
          <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-0.5">
            All your papers in one place
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex-shrink-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 p-1 bg-surface-secondary dark:bg-dark-card rounded-xl border border-surface-border dark:border-dark-border w-fit min-w-max">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeFilter === key
                  ? 'bg-white dark:bg-dark-surface text-text-primary dark:text-white shadow-card'
                  : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-6">
        {/* New Project CTA Card */}
        <button
          onClick={() => setShowModal(true)}
          className="group flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-surface-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-600 bg-transparent hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all duration-200 text-center h-48"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 flex items-center justify-center transition-colors">
            <Plus className="w-7 h-7 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary dark:text-white">
              New Research Paper
            </p>
            <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-1">
              Start from scratch or use a template
            </p>
          </div>
        </button>

        {/* Project Cards */}
        {filteredProjects.map(project => (
          <div
            key={project.id}
            onClick={() => router.push(`/workspace?projectId=${project.id}`)}
            className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border p-3 shadow-card hover:shadow-lg transition-all cursor-pointer h-50 flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-base text-text-primary dark:text-white line-clamp-2">
                {project.title}
              </h3>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  project.status === 'active'
                    ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30'
                    : 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
                }`}
              >
                {project.status === 'active' ? 'In Progress' : 'Completed'}
              </span>
            </div>

            {project.description && (
              <p className="text-xs text-text-secondary dark:text-text-secondary line-clamp-2 mb-3">
                {project.description}
              </p>
            )}

            {/* Progress bar */}
            <div className="mt-auto">
              <div className="flex justify-between text-xs text-text-tertiary mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-border dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-text-tertiary mt-3">
              Updated {new Date(project.updated_at || project.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Create Paper Modal ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-surface-border dark:border-dark-border shadow-modal w-full max-w-md overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border dark:border-dark-border">
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary dark:text-white">
                  Create New Paper
                </h3>
                <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-0.5">
                  Configure your research project settings
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-text-secondary mb-1.5 uppercase tracking-wide">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter paper title..."
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition-all"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-text-secondary mb-1.5 uppercase tracking-wide">
                  Language
                </label>
                <div className="relative">
                  <select
                    value={form.language}
                    onChange={e => setForm({ ...form, language: e.target.value as 'English' | 'French' })}
                    className="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition-all cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500 dark:text-brand-400 pointer-events-none" />
                </div>
              </div>

              {/* Writing Style */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-text-secondary mb-1.5 uppercase tracking-wide">
                  Writing Style
                </label>
                <div className="relative">
                  <select
                    value={form.writingStyle}
                    onChange={e => setForm({ ...form, writingStyle: e.target.value })}
                    className="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition-all cursor-pointer"
                  >
                    {writingStyles.map(style => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500 dark:text-brand-400 pointer-events-none" />
                </div>
              </div>

              {/* Citation Style */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary dark:text-text-secondary mb-1.5 uppercase tracking-wide">
                  Citation Style
                </label>
                <div className="relative">
                  <select
                    value={form.citationStyle}
                    onChange={e => setForm({ ...form, citationStyle: e.target.value as 'IEEE' | 'APA' })}
                    className="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition-all cursor-pointer"
                  >
                    <option value="IEEE">IEEE</option>
                    <option value="APA">APA</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500 dark:text-brand-400 pointer-events-none" />
                </div>
              </div>

              {/* Knowledge Restriction Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary dark:bg-dark-card border border-surface-border dark:border-dark-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary dark:text-white">
                    Restrict to project library only
                  </p>
                  <p className="text-[11px] text-text-tertiary dark:text-text-tertiary mt-0.5">
                    No internet access for AI suggestions
                  </p>
                </div>
                <button
                  onClick={() => setForm({ ...form, restrictToLibrary: !form.restrictToLibrary })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    form.restrictToLibrary ? 'bg-brand-500' : 'bg-surface-border dark:bg-dark-border'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      form.restrictToLibrary ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-border dark:border-dark-border bg-surface-secondary/50 dark:bg-dark-card/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-surface-secondary dark:hover:bg-dark-card transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePaper}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-brand hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Paper
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show inline error for creation failures */}
      {error && user && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}