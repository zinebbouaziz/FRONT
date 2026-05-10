'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  BarChart3, LineChart, ScatterChart, BoxSelect, Grid3X3, LayoutGrid,
  Upload, ClipboardPaste, Wand2, Download, ChevronDown,
  RefreshCcw, Settings2, X, PanelRightClose, PanelRightOpen,
  ThumbsUp, ThumbsDown, AlertCircle, Trash2, CheckCircle2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

async function getToken(): Promise<string> {
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
  if (res.status === 204) return undefined as T;
  return res.json();
}

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-text-tertiary dark:text-text-tertiary uppercase tracking-widest mb-2">{children}</p>;
}

function ToggleChip({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon?: React.ElementType }) {
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
            placeholder="Paste your CSV data here...\nExample:\nLabel,Value\nU-Net,0.82\nAttention U-Net,0.85\nOurs,0.89"
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

const CHART_TYPES = [
  { id: 'bar', label: 'Bar', icon: BarChart3 },
  { id: 'line', label: 'Line', icon: LineChart },
  { id: 'scatter', label: 'Scatter', icon: ScatterChart },
  { id: 'box', label: 'Box', icon: BoxSelect },
  { id: 'heatmap', label: 'Heatmap', icon: Grid3X3 },
  { id: 'table', label: 'Table', icon: Grid3X3 },
  { id: 'other', label: 'Other', icon: LayoutGrid },
];
const COLOR_SCHEMES = ['IEEE Blue', 'Nature', 'Grayscale', 'Vibrant', 'Pastel'];
const EXPORT_FORMATS = ['PNG (300 DPI)', 'PDF (Vector)', 'SVG', 'TIFF'];
const EXPORT_SIZES = ['Journal Column', 'Full Page', 'A4', 'Custom'];

export default function VisualizationStudioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for project ID with better initialization
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [noProjectError, setNoProjectError] = useState(false);

  // Resolve project ID on mount
  useEffect(() => {
    let resolvedId: string | null = null;

    // Priority 1: Search params (from navigation)
    if (searchParams) {
      const paramId = searchParams.get('projectId');
      if (paramId) resolvedId = paramId;
    }

    // Priority 2: URL path params
    if (!resolvedId && params?.project_id) {
      resolvedId = params.project_id as string;
    }

    // Priority 3: localStorage
    if (!resolvedId && typeof window !== 'undefined') {
      const stored = localStorage.getItem('cowritex:lastProjectId');
      if (stored) resolvedId = stored;
    }

    if (resolvedId) {
      setProjectId(resolvedId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cowritex:lastProjectId', resolvedId);
      }
      setNoProjectError(false);
    } else {
      setNoProjectError(true);
    }

    setIsResolving(false);
    console.log('Visualization Studio - Resolved projectId:', resolvedId);
  }, [searchParams, params?.project_id]);

  // Redirect if no project found after resolving
  useEffect(() => {
    if (noProjectError && !isResolving) {
      // If truly no project found, redirect to workspace
      const timer = setTimeout(() => {
        router.push('/workspace');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [noProjectError, isResolving, router]);

  // UI state
  const [chartType, setChartType] = useState('bar');
  const [colorScheme, setColorScheme] = useState('IEEE Blue');
  const [exportFormat, setExportFormat] = useState('PNG (300 DPI)');
  const [exportSize, setExportSize] = useState('Journal Column');
  const [size, setSize] = useState(8);
  const [otherType, setOtherType] = useState('');
  const [customColor, setCustomColor] = useState('#6550e8');
  const [isFigureBarVisible, setIsFigureBarVisible] = useState(true);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chartData, setChartData] = useState({
    labels: ['U-Net', 'Attention U-Net', 'Ours'],
    values: [0.82, 0.85, 0.89],
  });

  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [selectedVis, setSelectedVis] = useState<Visualization | null>(null);
  const [loadingVis, setLoadingVis] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [pendingThread, setPendingThread] = useState<string | null>(null);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<'idle' | 'pending_review' | 'completed' | 'error'>('idle');
  const [resuming, setResuming] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [csvData, setCsvData] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchVisualizations = useCallback(async () => {
    if (!projectId) return;
    setLoadingVis(true);
    try {
      const data = await apiFetch<Visualization[]>(`/projects/${projectId}/visualizations`);
      setVisualizations(data ?? []);
      if (data && data.length > 0 && !selectedVis) {
        setSelectedVis(data[0]);
      }
    } catch (err) {
      console.error('Failed to load visualizations', err);
    } finally {
      setLoadingVis(false);
    }
  }, [projectId, selectedVis]);

  useEffect(() => {
    if (projectId) fetchVisualizations();
  }, [fetchVisualizations, projectId]);

  const buildUserMessage = () => {
    const dataDesc = chartData.labels.map((l, i) => `${l}: ${chartData.values[i]}`).join(', ');
    let msg = `Create a ${chartType === 'other' ? otherType || 'custom' : chartType} chart`;
    msg += ` with data: ${dataDesc}.`;
    msg += ` Color scheme: ${colorScheme}, primary color: ${customColor}.`;
    msg += ` Width: ${size} cm.`;
    return msg;
  };

  const handleGenerate = async () => {
    if (!projectId) {
      setApiError('No project selected.');
      return;
    }
    if (!isDataLoaded) {
      setApiError('Please load CSV data first (upload or paste).');
      return;
    }
    setGenerating(true);
    setRunStatus('idle');
    setApiError(null);
    setAgentOutput(null);
    setPendingThread(null);
    try {
      const res = await apiFetch<RunResponse>(`/projects/${projectId}/run`, {
        method: 'POST',
        body: JSON.stringify({
          user_message: buildUserMessage(),
          csv_data: csvData,
          chart_config: {
            chart_type: chartType,
            color_scheme: colorScheme,
            custom_color: customColor,
            width_cm: size,
          },
        }),
      });
      setPendingThread(res.thread_id);
      setAgentOutput(res.agent_output);
      setRunStatus('pending_review');
      
      // Auto-fetch visualizations and select the latest one
      setTimeout(async () => {
        try {
          const freshData = await apiFetch<Visualization[]>(`/projects/${projectId}/visualizations`);
          if (freshData && freshData.length > 0) {
            setVisualizations(freshData);
            // Select the most recent (first in the reversed list)
            setSelectedVis(freshData[0]);
          }
        } catch (err) {
          console.error('Failed to fetch updated visualizations', err);
        }
      }, 500);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Generation failed.');
      setRunStatus('error');
    } finally {
      setGenerating(false);
    }
  };

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
        { method: 'POST', body: JSON.stringify({ hitl_action, hitl_feedback }) },
      );
      if (res.status === 'completed') {
        setRunStatus('completed');
        setAgentOutput(res.agent_output);
        setPendingThread(null);
        await fetchVisualizations();
        setTimeout(async () => {
          const freshData = await apiFetch<Visualization[]>(`/projects/${projectId}/visualizations`);
          if (freshData && freshData.length > 0) {
            setVisualizations(freshData);
            setSelectedVis(freshData[0]);
          }
        }, 500);
      } else {
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

  const handleDownload = async (vizId: string) => {
    if (!vizId) {
      setApiError('No visualization selected');
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/visualizations/${vizId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `figure-${vizId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      setApiError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteViz = async (vizId: string) => {
    try {
      await apiFetch(`/visualizations/${vizId}`, { method: 'DELETE' });
      setVisualizations(prev => prev.filter(v => v.id !== vizId));
      if (selectedVis?.id === vizId) setSelectedVis(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleLoadCSV = (csvText: string) => {
    console.log('Loading CSV, length:', csvText.length);
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setApiError('CSV must have header row and data rows');
        return;
      }
      const labels: string[] = [];
      const values: number[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const value = parseFloat(parts[1]);
          if (!isNaN(value)) {
            labels.push(parts[0]);
            values.push(value);
          }
        }
      }
      if (labels.length === 0) {
        setApiError('No valid data found in CSV');
        return;
      }
      setChartData({ labels, values });
      setCsvData(csvText);
      setIsDataLoaded(true);
      setApiError(null);
      console.log('CSV loaded successfully:', { labels, values });
    } catch (err) {
      console.error('CSV parse error:', err);
      setApiError('Failed to parse CSV file');
      setIsDataLoaded(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csvContent = ev.target?.result as string;
      handleLoadCSV(csvContent);
    };
    reader.onerror = () => setApiError('Failed to read file');
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadExampleData = () => {
    const exampleCSV = `Label,Value
U-Net,0.82
Attention U-Net,0.85
Ours,0.89
TransUNet,0.87
SwinUNETR,0.88`;
    handleLoadCSV(exampleCSV);
  };

  const resetAll = () => {
    setChartType('bar');
    setColorScheme('IEEE Blue');
    setExportFormat('PNG (300 DPI)');
    setExportSize('Journal Column');
    setSize(8);
    setOtherType('');
    setCustomColor('#6550e8');
    setChartData({ labels: ['U-Net', 'Attention U-Net', 'Ours'], values: [0.82, 0.85, 0.89] });
    setRunStatus('idle');
    setPendingThread(null);
    setAgentOutput(null);
    setApiError(null);
    setCsvData(null);
    setIsDataLoaded(false);
    if (visualizations.length) setSelectedVis(visualizations[0]);
  };

  const isGenerated = runStatus === 'completed' || runStatus === 'pending_review';
  const chartTypeLabel = chartType.charAt(0).toUpperCase() + chartType.slice(1);

  // Loading state while resolving project ID
  if (isResolving) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-dark-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-brand-200 dark:border-brand-800 border-t-brand-500 animate-spin" />
          <p className="text-sm text-text-secondary dark:text-text-secondary">Loading visualization studio...</p>
        </div>
      </div>
    );
  }

  if (noProjectError || !projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Project Selected</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please open a project from the workspace first and navigate to visualization studio.
          </p>
          <button
            onClick={() => router.push('/workspace')}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden animate-fade-in">
      <CSVPasteModal isOpen={isCSVModalOpen} onClose={() => setIsCSVModalOpen(false)} onLoad={handleLoadCSV} />
      <input type="file" ref={fileInputRef} accept=".pdf,application/pdf" className="hidden" onChange={handleFileUpload} />

      <aside className="flex-shrink-0 h-full overflow-y-auto border-r border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface flex flex-col" style={{ flexBasis: '40%', maxWidth: '40%', minWidth: '280px' }}>
        <div className="px-4 py-4 border-b border-surface-border dark:border-dark-border">
          <h1 className="font-display font-bold text-2xl text-text-primary dark:text-white">Visualization Studio</h1>
          {projectId && (
            <p className="text-xs text-text-tertiary dark:text-text-tertiary mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              Project ID: {projectId.substring(0, 8)}...
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
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
            </div>
            {isDataLoaded && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Data loaded: {chartData.labels.length} rows
              </div>
            )}
          </div>

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

          {apiError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !projectId || !isDataLoaded}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white text-sm font-semibold shadow-brand hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-150"
          >
            {generating ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Generating…</> : <><Wand2 className="w-4 h-4" /> Generate</>}
          </button>

          {runStatus === 'pending_review' && pendingThread && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">Review AI Output</p>
              <div className="flex gap-2">
                <button onClick={() => handleResume('approve')} disabled={resuming} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold disabled:opacity-60 transition-colors">
                  {resuming ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />} Approve
                </button>
                <button onClick={() => handleResume('regenerate', 'Please try a different approach.')} disabled={resuming} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-surface-border dark:border-dark-border text-xs font-medium text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card disabled:opacity-60 transition-colors">
                  <RefreshCcw className="w-3 h-3" /> Regenerate
                </button>
                <button onClick={() => handleResume('reject')} disabled={resuming} className="flex items-center justify-center p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 transition-colors" title="Reject">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden dark:bg-dark-surface" style={{ flexBasis: '60%', minWidth: 0 }}>
        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-dark-surface dark:border-dark-border">
          <div className="flex gap-1 ml-auto">
            <button onClick={() => setIsFigureBarVisible(!isFigureBarVisible)} className="ml-2 p-1.5 rounded-lg border border-surface-border dark:border-dark-border text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card transition-colors" title={isFigureBarVisible ? 'Hide figures panel' : 'Show figures panel'}>
              {isFigureBarVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-5">
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-surface-border dark:border-dark-border shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-surface-border dark:border-dark-border">
                <div>
                  <p className="text-sm font-semibold text-text-primary dark:text-white">{selectedVis?.title ?? 'Dice Score Comparison Across Methods'}</p>
                  <p className="text-[10px] text-text-tertiary dark:text-text-tertiary mt-0.5">{chartTypeLabel} · {colorScheme}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${runStatus === 'completed' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : runStatus === 'pending_review' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : runStatus === 'error' ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400' : 'bg-surface-secondary text-text-tertiary dark:bg-dark-card'}`}>
                    {runStatus === 'completed' ? '● Ready' : runStatus === 'pending_review' ? '◐ Pending Review' : runStatus === 'error' ? '✕ Error' : '○ Pending'}
                  </span>
                </div>
              </div>

              {generating ? (
                <div className="min-h-[280px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-brand-200 dark:border-brand-800 border-t-brand-500 animate-spin" />
                    <p className="text-xs text-text-tertiary dark:text-text-tertiary">Generating visualisation…</p>
                  </div>
                </div>
              ) : isGenerated && selectedVis?.file_path ? (
                <div className="p-5 min-h-[280px]">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${API_BASE}${selectedVis.file_path}`} alt={selectedVis.title || 'Generated figure'} className="w-full h-auto rounded-lg shadow-lg" onError={(e) => { console.error('Failed to load image:', selectedVis.file_path); e.currentTarget.style.display = 'none'; }} />
                    <div className="flex justify-center gap-2 mt-4">
                      <button onClick={() => handleDownload(selectedVis.id)} className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Figure
                      </button>
                    </div>
                  </div>
                </div>
              ) : isGenerated && chartType === 'other' ? (
                <div className="p-5 min-h-[280px] flex flex-col items-center justify-center text-center">
                  <LayoutGrid className="w-8 h-8 text-text-tertiary dark:text-text-tertiary mb-3" />
                  <p className="text-sm font-medium text-text-primary dark:text-white mb-1">Custom Visualization</p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary">{otherType ? `Type: ${otherType}` : 'Describe your custom chart in the field on the left.'}</p>
                </div>
              ) : (
                <div className="p-5 min-h-[280px] flex items-center justify-center text-text-tertiary dark:text-text-tertiary text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 opacity-50" />
                  Click Generate to render a chart
                </div>
              )}
            </div>
          </div>

          {isFigureBarVisible && (
            <aside className="w-52 flex-shrink-0 border-l border-surface-border dark:border-dark-border bg-white dark:bg-dark-surface overflow-y-auto p-3 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[10px] font-bold text-text-tertiary dark:text-text-tertiary uppercase tracking-widest">Project Figures</p>
                <div className="flex gap-1">
                  <button onClick={() => fetchVisualizations()} className="p-1 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary transition-colors" title="Refresh figures">
                    <RefreshCcw className="w-3 h-3" />
                  </button>
                  <button onClick={() => setIsFigureBarVisible(false)} className="p-1 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-card text-text-tertiary transition-colors" title="Close panel">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {loadingVis && <div className="flex justify-center py-6"><div className="w-5 h-5 rounded-full border-2 border-brand-200 dark:border-brand-800 border-t-brand-500 animate-spin" /></div>}
                {!loadingVis && visualizations.length === 0 && <p className="text-[10px] text-text-tertiary dark:text-text-tertiary text-center py-4">No figures yet.</p>}
                {visualizations.map(vis => (
                  <div key={vis.id} className="group relative">
                    <button onClick={() => setSelectedVis(vis)} className={`w-full text-left p-3 rounded-xl border transition-all duration-150 ${selectedVis?.id === vis.id ? 'border-brand-300 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'border-surface-border dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-700 bg-transparent'}`}>
                      <div className="w-full h-16 bg-surface-secondary dark:bg-dark-card rounded-lg mb-2 flex items-center justify-center relative">
                        {vis.file_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`${API_BASE}${vis.file_path}`} alt={vis.title || 'Figure'} className="w-full h-full object-cover rounded-lg" onError={(e) => { console.error('Failed to load image:', vis.file_path); e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <BarChart3 className="w-5 h-5 text-text-tertiary dark:text-text-tertiary" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-text-primary dark:text-white leading-snug line-clamp-2">{vis.title ?? 'Untitled Figure'}</p>
                      <p className="text-[10px] text-text-tertiary dark:text-text-tertiary mt-0.5 capitalize">{vis.type ?? 'chart'}</p>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDownload(vis.id); }} className="absolute top-2 right-2 p-1 rounded-md bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-50 dark:hover:bg-brand-900/20" title="Download figure">
                      <Download className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteViz(vis.id); }} className="absolute bottom-2 right-2 p-1 rounded-md bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete figure">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={resetAll} className="w-full border border-dashed border-surface-border dark:border-dark-border rounded-xl p-3 text-[11px] text-text-tertiary dark:text-text-tertiary hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center justify-center gap-1.5 mt-2">
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