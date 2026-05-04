'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  BarChart3, LineChart, ScatterChart, BoxSelect, Grid3X3, LayoutGrid,
  Upload, ClipboardPaste, Wand2, Download, FileImage, ChevronDown,
  RefreshCcw, Settings2, Sparkles, X, PanelRightClose, PanelRightOpen,
  CheckCircle2, ThumbsUp, ThumbsDown, AlertCircle, Trash2,
} from 'lucide-react';

/* ─────────────────────────────────────────
   API helpers
───────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

/** Retrieve the Supabase JWT from wherever your app stores it.
 *  Adjust this to match your auth setup (context, localStorage key, etc.). */
async function getToken(): Promise<string> {
  // Works with @supabase/ssr and the default localStorage key pattern.
  // If you expose a useAuth() hook, replace this body with: return useAuth().token
  const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  if (keys.length) {
    try {
      const session = JSON.parse(localStorage.getItem(keys[0]) ?? '{}');
      return session?.access_token ?? '';
    } catch { /* fall through */ }
  }
  return '';
}

async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Visualization {
  id: string;
  title?: string;
  type?: string;
  file_path?: string;
  created_at?: string;
}

interface RunResponse {
  thread_id: string;
  agent_output: string | null;
  intents: string[];
  status: string;
}

interface ResumeResponse {
  thread_id: string;
  agent_output: string | null;
  status: string;
}

/* ─────────────────────────────────────────
   Reusable small components (UI unchanged)
───────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-text-tertiary dark:text-text-tertiary uppercase tracking-widest mb-2">
      {children}
    </p>
  );
}

function ToggleChip({
  label, active, onClick, icon: Icon,
}: { label: string; active: boolean; onClick: () => void; icon?: React.ElementType }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
        active
          ? 'bg-brand-500 text-white border-brand-500 shadow-brand'
          : 'bg-white dark:bg-dark-card border-surface-border dark:border-dark-border text-text-secondary dark:text-text-secondary hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-500 dark:hover:text-brand-400'
      }`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </button>
  );
}

function SliderField({ label, value, onChange, min = 6, max = 24 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-text-secondary dark:text-text-secondary font-medium">{label}</span>
        <span className="text-xs font-semibold text-brand-500 dark:text-brand-400">{value} cm</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-brand-500"
        style={{ background: `linear-gradient(to right, #6550e8 ${((value - min) / (max - min)) * 100}%, #e4e7f0 0%)` }}
      />
    </div>
  );
}

function TextareaField({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 text-xs rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/40 transition-all resize-none leading-relaxed"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 pr-8 text-xs rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 transition-all cursor-pointer"
        >
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-tertiary pointer-events-none" />
      </div>
    </div>
  );
}

/* ─── CSV Paste Modal ─── */
function CSVPasteModal({ isOpen, onClose, onLoad }: {
  isOpen: boolean; onClose: () => void; onLoad: (data: string) => void;
}) {
  const [csvText, setCsvText] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border dark:border-dark-border">
          <h2 className="text-base font-semibold text-text-primary dark:text-white">Paste CSV Data</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={"Paste your CSV data here...\nExample:\nLabel,Value\nU-Net,0.82\nAttention U-Net,0.85\nOurs,0.89"}
            rows={10}
            className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border dark:border-dark-border bg-surface-secondary dark:bg-dark-card text-text-primary dark:text-white placeholder-text-tertiary focus:outline-none focus:border-brand-400 font-mono resize-y"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium border border-surface-border dark:border-dark-border text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card">
              Cancel
            </button>
            <button onClick={() => { onLoad(csvText); onClose(); }} className="px-4 py-2 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600">
              Load Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini Bar Chart Preview ─── */
function BarChartPreview({ data, customColor }: { data: { labels: string[]; values: number[] }; customColor: string }) {
  const max = Math.max(...data.values);
  const generateColorPalette = (base: string, count: number): string[] => {
    const colors = [base];
    for (let i = 1; i < count; i++) colors.push(`color-mix(in srgb, ${base} 70%, white 30%)`);
    return colors;
  };
  const colorPalette = generateColorPalette(customColor, data.labels.length);
  return (
    <div className="flex items-end gap-3 h-40 px-4 py-2">
      {data.labels.map((label, i) => {
        const pct = (data.values[i] / max) * 100;
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-text-secondary dark:text-text-secondary">{data.values[i].toFixed(2)}</span>
            <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${pct}%`, background: colorPalette[i] ?? customColor }} />
            <span className="text-[9px] text-text-tertiary dark:text-text-tertiary text-center leading-tight">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const CHART_TYPES = [
  { id: 'bar',      label: 'Bar',     icon: BarChart3    },
  { id: 'line',     label: 'Line',    icon: LineChart    },
  { id: 'scatter',  label: 'Scatter', icon: ScatterChart },
  { id: 'box',      label: 'Box',     icon: BoxSelect    },
  { id: 'heatmap',  label: 'Heatmap', icon: Grid3X3      },
  { id: 'table',    label: 'Table',   icon: Grid3X3      },
  { id: 'other',    label: 'Other',   icon: LayoutGrid   },
];
const COLOR_SCHEMES  = ['IEEE Blue', 'Nature', 'Grayscale', 'Vibrant', 'Pastel'];
const EXPORT_FORMATS = ['PNG (300 DPI)', 'PDF (Vector)', 'SVG', 'TIFF'];
const EXPORT_SIZES   = ['Journal Column', 'Full Page', 'A4', 'Custom'];

const AI_SUGGESTIONS = [
  { id: 's1', text: 'Add individual data points (·) to show distribution', icon: Wand2 },
  { id: 's2', text: 'Use log scale on Y-axis for better spread',           icon: Sparkles },
];

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function VisualizationStudioPage() {
  const params = useParams();
  const projectId = params?.project_id as string | undefined;

  /* ── UI state ── */
  const [chartType,     setChartType]     = useState('bar');
  const [colorScheme,   setColorScheme]   = useState('IEEE Blue');
  const [exportFormat,  setExportFormat]  = useState('PNG (300 DPI)');
  const [exportSize,    setExportSize]    = useState('Journal Column');
  const [size,          setSize]          = useState(8);
  const [extraDetails,  setExtraDetails]  = useState('Add error bars from 5-fold cross-validation');
  const [otherType,     setOtherType]     = useState('');
  const [customColor,   setCustomColor]   = useState('#6550e8');
  const [isFigureBarVisible, setIsFigureBarVisible] = useState(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Record<string, boolean>>({});
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chartData, setChartData] = useState({
    labels: ['U-Net', 'Attention U-Net', 'Ours'],
    values: [0.82, 0.85, 0.89],
  });

  /* ── API / backend state ── */
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [selectedVis,    setSelectedVis]    = useState<Visualization | null>(null);
  const [loadingVis,     setLoadingVis]     = useState(false);

  // Generation / HITL state
  const [generating,     setGenerating]    = useState(false);
  const [pendingThread,  setPendingThread] = useState<string | null>(null);
  const [agentOutput,    setAgentOutput]   = useState<string | null>(null);
  const [runStatus,      setRunStatus]     = useState<'idle' | 'pending_review' | 'completed' | 'error'>('idle');
  const [resuming,       setResuming]      = useState(false);
  const [apiError,       setApiError]      = useState<string | null>(null);

  /* ── Fetch visualizations ── */
  const fetchVisualizations = useCallback(async () => {
    if (!projectId) return;
    setLoadingVis(true);
    try {
      const data = await apiFetch<Visualization[]>(`/projects/${projectId}/visualizations`);
      setVisualizations(data ?? []);
      if (!selectedVis && data?.length) setSelectedVis(data[0]);
    } catch (err) {
      console.error('Failed to load visualizations', err);
    } finally {
      setLoadingVis(false);
    }
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchVisualizations(); }, [fetchVisualizations]);

  /* ── Build the user message from current settings ── */
  const buildUserMessage = () => {
    const dataDesc = chartData.labels.map((l, i) => `${l}: ${chartData.values[i]}`).join(', ');
    let msg = `Create a ${chartType === 'other' ? otherType || 'custom' : chartType} chart`;
    msg += ` with data: ${dataDesc}.`;
    msg += ` Color scheme: ${colorScheme}, primary color: ${customColor}.`;
    msg += ` Width: ${size} cm.`;
    if (extraDetails) msg += ` Additional instructions: ${extraDetails}.`;
    return msg;
  };

  /* ── Generate ── */
  const handleGenerate = async () => {
    if (!projectId) { setApiError('No project selected.'); return; }
    setGenerating(true);
    setRunStatus('idle');
    setApiError(null);
    setAgentOutput(null);
    setPendingThread(null);
    try {
      const res = await apiFetch<RunResponse>(`/projects/${projectId}/run`, {
        method: 'POST',
        body: JSON.stringify({ user_message: buildUserMessage() }),
      });
      setPendingThread(res.thread_id);
      setAgentOutput(res.agent_output);
      setRunStatus('pending_review');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Generation failed.');
      setRunStatus('error');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Resume (HITL actions) ── */
  const handleResume = async (
    hitl_action: 'approve' | 'reject' | 'regenerate',
    hitl_feedback?: string,
  ) => {
    if (!projectId || !pendingThread) return;
    setResuming(true);
    setApiError(null);
    try {
      const res = await apiFetch<ResumeResponse>(
        `/projects/${projectId}/run/${pendingThread}/resume`,
        {
          method: 'POST',
          body: JSON.stringify({ hitl_action, hitl_feedback }),
        },
      );
      if (res.status === 'completed') {
        setRunStatus('completed');
        setAgentOutput(res.agent_output);
        setPendingThread(null);
        // Refresh the figures panel
        await fetchVisualizations();
      } else {
        // regenerate looped back → still pending
        setAgentOutput(res.agent_output);
        setRunStatus('pending_review');
        setPendingThread(res.thread_id ?? pendingThread);
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Resume failed.');
    } finally {
      setResuming(false);
    }
  };

  /* ── Download ── */
  const handleDownload = async (vizId: string) => {
    if (!vizId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/visualizations/${vizId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `figure-${vizId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  /* ── Delete visualization ── */
  const handleDeleteViz = async (vizId: string) => {
    try {
      await apiFetch(`/visualizations/${vizId}`, { method: 'DELETE' });
      setVisualizations(prev => prev.filter(v => v.id !== vizId));
      if (selectedVis?.id === vizId) setSelectedVis(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  /* ── CSV helpers ── */
  const handleLoadCSV = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return;
      const labels: string[] = [];
      const values: number[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 2) { labels.push(parts[0]); values.push(parseFloat(parts[1])); }
      }
      if (labels.length && !values.some(isNaN)) setChartData({ labels, values });
    } catch (err) { console.error('CSV parse error', err); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => handleLoadCSV(ev.target?.result as string);
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Reset ── */
  const resetAll = () => {
    setChartType('bar'); setColorScheme('IEEE Blue'); setExportFormat('PNG (300 DPI)');
    setExportSize('Journal Column'); setSize(8); setExtraDetails('Add error bars from 5-fold cross-validation');
    setOtherType(''); setCustomColor('#6550e8'); setAppliedSuggestions({});
    setChartData({ labels: ['U-Net', 'Attention U-Net', 'Ours'], values: [0.82, 0.85, 0.89] });
    setRunStatus('idle'); setPendingThread(null); setAgentOutput(null); setApiError(null);
    if (visualizations.length) setSelectedVis(visualizations[0]);
  };

  /* ── Derived display helpers ── */
  const isGenerated = runStatus === 'completed' || runStatus === 'pending_review';
  const chartTypeLabel = chartType.charAt(0).toUpperCase() + chartType.slice(1);

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <div className="flex h-full w-full overflow-hidden animate-fade-in">
      <CSVPasteModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} onLoad={handleLoadCSV} />
      <input type="file" ref={fileInputRef} accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={handleFileUpload} />

      {/* ── Left Panel: Controls ── */}
      <aside
        className="flex-shrink-0 h-full overflow-y-auto border-r border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface flex flex-col"
        style={{ flexBasis: '40%', maxWidth: '40%', minWidth: '280px' }}
      >
        <div className="px-4 py-4">
          <h1 className="font-display font-bold text-2xl text-text-primary dark:text-white">Visualization Studio</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Data Source */}
          <div>
            <SectionLabel>Data Source</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setIsCSVModalOpen(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-dashed border-surface-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-600 bg-surface-secondary dark:bg-dark-card hover:bg-brand-50 dark:hover:bg-brand-900/10 text-text-tertiary hover:text-brand-500 dark:hover:text-brand-400 transition-all">
                <ClipboardPaste className="w-4 h-4" />
                <span className="text-[10px] font-medium text-center leading-tight">Paste CSV</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-dashed border-surface-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-600 bg-surface-secondary dark:bg-dark-card hover:bg-brand-50 dark:hover:bg-brand-900/10 text-text-tertiary hover:text-brand-500 dark:hover:text-brand-400 transition-all">
                <Upload className="w-4 h-4" />
                <span className="text-[10px] font-medium text-center leading-tight">Upload Files</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-dashed border-surface-border dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-600 bg-surface-secondary dark:bg-dark-card hover:bg-brand-50 dark:hover:bg-brand-900/10 text-text-tertiary hover:text-brand-500 dark:hover:text-brand-400 transition-all">
                <Grid3X3 className="w-4 h-4" />
                <span className="text-[10px] font-medium text-center leading-tight">Example</span>
              </button>
            </div>
          </div>

          {/* Chart Type */}
          <div>
            <SectionLabel>Visualization Type</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {CHART_TYPES.map(({ id, label, icon: Icon }) => (
                <ToggleChip key={id} label={label} active={chartType === id} onClick={() => setChartType(id)} icon={Icon} />
              ))}
            </div>
          </div>

          {chartType === 'other' && (
            <TextareaField label="Describe your custom chart" placeholder="Describe the type of visualization you need..." value={otherType} onChange={setOtherType} />
          )}

          {/* Color Scheme */}
          <div>
            <SectionLabel>Color Scheme</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {COLOR_SCHEMES.map(c => (
                <ToggleChip key={c} label={c} active={colorScheme === c} onClick={() => setColorScheme(c)} />
              ))}
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary mb-1.5">Custom Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} className="w-8 h-8 rounded-md border border-surface-border dark:border-dark-border cursor-pointer" />
                <span className="text-xs text-text-secondary dark:text-text-secondary">{customColor}</span>
              </div>
            </div>
          </div>

          <SliderField label="Size (Width)" value={size} onChange={setSize} min={4} max={20} />

          <TextareaField label="Extra Details" placeholder="Any other customization details..." value={extraDetails} onChange={setExtraDetails} />

          {/* API error banner */}
          {apiError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !projectId}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white text-sm font-semibold shadow-brand hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-150"
          >
            {generating ? (
              <><RefreshCcw className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Generate</>
            )}
          </button>

          {/* HITL Actions — shown while pending_review */}
          {runStatus === 'pending_review' && pendingThread && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">Review AI Output</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResume('approve')}
                  disabled={resuming}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold disabled:opacity-60 transition-colors"
                >
                  {resuming ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                  Approve
                </button>
                <button
                  onClick={() => handleResume('regenerate', 'Please try a different approach.')}
                  disabled={resuming}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-surface-border dark:border-dark-border text-xs font-medium text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card disabled:opacity-60 transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" /> Regenerate
                </button>
                <button
                  onClick={() => handleResume('reject')}
                  disabled={resuming}
                  className="flex items-center justify-center p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 transition-colors"
                  title="Reject"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div>
            <SectionLabel>Export Options</SectionLabel>
            <SelectField label="Format" value={exportFormat} onChange={setExportFormat} options={EXPORT_FORMATS} />
            <SelectField label="Export Size" value={exportSize} onChange={setExportSize} options={EXPORT_SIZES} />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-surface-border dark:border-dark-border text-xs font-medium text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card hover:text-text-primary dark:hover:text-white transition-colors">
                <FileImage className="w-3.5 h-3.5" /> Insert Into Doc
              </button>
              <button
                onClick={() => selectedVis && handleDownload(selectedVis.id)}
                disabled={!selectedVis}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors shadow-brand disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main: Preview ── */}
      <main className="flex-1 flex flex-col overflow-hidden dark:bg-dark-surface" style={{ flexBasis: '60%', minWidth: 0 }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-dark-surface dark:border-dark-border">
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setIsFigureBarVisible(!isFigureBarVisible)}
              className="ml-2 p-1.5 rounded-lg border border-surface-border dark:border-dark-border text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card transition-colors"
              title={isFigureBarVisible ? 'Hide figures panel' : 'Show figures panel'}
            >
              {isFigureBarVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-5">
            {/* Chart preview card */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-surface-border dark:border-dark-border">
                <div>
                  <p className="text-sm font-semibold text-text-primary dark:text-white">
                    {selectedVis?.title ?? 'Dice Score Comparison Across Methods'}
                  </p>
                  <p className="text-[10px] text-text-tertiary dark:text-text-tertiary mt-0.5">
                    {chartTypeLabel} · {colorScheme}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                    runStatus === 'completed'      ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'   :
                    runStatus === 'pending_review' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'   :
                    runStatus === 'error'          ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'           :
                    'bg-surface-secondary text-text-tertiary dark:bg-dark-card'
                  }`}>
                    {runStatus === 'completed'      ? '● Ready'          :
                     runStatus === 'pending_review' ? '◐ Pending Review' :
                     runStatus === 'error'          ? '✕ Error'          : '○ Pending'}
                  </span>
                  <button className="p-1.5 rounded-lg hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary transition-colors">
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas body */}
              {generating ? (
                <div className="min-h-[280px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-brand-200 dark:border-brand-800 border-t-brand-500 animate-spin" />
                    <p className="text-xs text-text-tertiary dark:text-text-tertiary">Generating visualisation…</p>
                  </div>
                </div>
              ) : isGenerated ? (
                <div className="p-5 min-h-[280px]">
                  {/* Agent output text (shown when pending review or just completed) */}
                  {agentOutput && runStatus !== 'completed' && (
                    <div className="mb-4 p-3 rounded-lg bg-surface-secondary dark:bg-dark-card text-xs text-text-secondary dark:text-text-secondary border border-surface-border dark:border-dark-border whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {agentOutput}
                    </div>
                  )}

                  {chartType === 'other' ? (
                    <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-6">
                      <LayoutGrid className="w-8 h-8 text-text-tertiary dark:text-text-tertiary mb-3" />
                      <p className="text-sm font-medium text-text-primary dark:text-white mb-1">Custom Visualization</p>
                      <p className="text-xs text-text-secondary dark:text-text-secondary">
                        {otherType ? `Type: ${otherType}` : 'Describe your custom chart in the field on the left.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-[10px] text-text-tertiary dark:text-text-tertiary mb-1">
                        <span>{Math.min(...chartData.values).toFixed(2)}</span>
                        <span>{((Math.max(...chartData.values) + Math.min(...chartData.values)) / 2).toFixed(2)}</span>
                        <span>{Math.max(...chartData.values).toFixed(2)}</span>
                      </div>
                      <BarChartPreview data={chartData} customColor={customColor} />
                      <div className="flex items-center justify-center gap-6 mt-3">
                        {chartData.labels.map((l, i) => (
                          <div key={l} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: i === 0 ? customColor : `color-mix(in srgb, ${customColor} 70%, white 30%)` }} />
                            <span className="text-[10px] text-text-secondary dark:text-text-secondary">{l}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-text-tertiary dark:text-text-tertiary text-center mt-2 italic">
                        Figure 1: Dice Score Comparison — BraTS 2024
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="min-h-[280px] flex items-center justify-center text-text-tertiary dark:text-text-tertiary text-sm">
                  Click Generate to render a chart
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            <div className="bg-surface-secondary dark:bg-dark-card rounded-xl border border-surface-border dark:border-dark-border overflow-hidden">
              <div className="px-4 py-2 border-b border-surface-border dark:border-dark-border bg-white/50 dark:bg-dark-surface/50">
                <SectionLabel>AI Suggestions</SectionLabel>
              </div>
              <div className="p-3 space-y-3">
                {AI_SUGGESTIONS.map((suggestion) => {
                  const isApplied = appliedSuggestions[suggestion.id];
                  const IconComponent = suggestion.icon;
                  return (
                    <div key={suggestion.id} className="text-[11px] text-text-secondary dark:text-text-secondary leading-relaxed flex items-start gap-2">
                      <IconComponent className="w-3 h-3 text-brand-500 mt-0.5 flex-shrink-0" />
                      <span className="flex-1">{suggestion.text}</span>
                      {isApplied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <button
                          onClick={() => setAppliedSuggestions(prev => ({ ...prev, [suggestion.id]: true }))}
                          className="text-brand-500 dark:text-brand-400 font-semibold hover:underline text-[10px] flex-shrink-0"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right rail: Project figures ── */}
          {isFigureBarVisible && (
            <aside className="w-52 flex-shrink-0 border-l border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface overflow-y-auto p-3 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[10px] font-bold text-text-tertiary dark:text-text-tertiary uppercase tracking-widest">
                  Project Figures
                </p>
                <button onClick={() => setIsFigureBarVisible(false)} className="p-1 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary transition-colors" title="Close panel">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {loadingVis && (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-200 dark:border-brand-800 border-t-brand-500 animate-spin" />
                  </div>
                )}

                {!loadingVis && visualizations.length === 0 && (
                  <p className="text-[10px] text-text-tertiary dark:text-text-tertiary text-center py-4">No figures yet.</p>
                )}

                {visualizations.map(vis => (
                  <div key={vis.id} className="group relative">
                    <button
                      onClick={() => setSelectedVis(vis)}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-150 ${
                        selectedVis?.id === vis.id
                          ? 'border-brand-300 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-surface-border dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-700 bg-transparent'
                      }`}
                    >
                      <div className="w-full h-16 bg-surface-secondary dark:bg-dark-card rounded-lg mb-2 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-text-tertiary dark:text-text-tertiary" />
                      </div>
                      <p className="text-[11px] font-medium text-text-primary dark:text-white leading-snug line-clamp-2">
                        {vis.title ?? 'Untitled Figure'}
                      </p>
                      <p className="text-[10px] text-text-tertiary dark:text-text-tertiary mt-0.5 capitalize">
                        {vis.type ?? 'chart'}
                      </p>
                    </button>
                    {/* Delete button — appears on hover */}
                    <button
                      onClick={() => handleDeleteViz(vis.id)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete figure"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={resetAll}
                  className="w-full border border-dashed border-surface-border dark:border-dark-border rounded-xl p-3 text-[11px] text-text-tertiary dark:text-text-tertiary hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>+</span> New Figure
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>

      <style jsx global>{`
        select option:hover, select option:focus, select option:checked { background-color:#6550e8!important; color:white!important; }
        select option { background-color:white; color:#1e293b; }
        .dark select option { background-color:#1e293b; color:#e2e8f0; }
        .dark select option:hover, .dark select option:focus, .dark select option:checked { background-color:#6550e8!important; color:white!important; }
      `}</style>
    </div>
  );
}