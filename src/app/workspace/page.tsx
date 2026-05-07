'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Mathematics from '@tiptap/extension-mathematics';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { createLowlight } from 'lowlight';
import 'katex/dist/katex.min.css';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from '@tiptap/extension-text-style';
import { CustomTableCell } from '@/extentions/CustomTableCell';
import { CustomHighlight } from '@/extentions/CustomHighlight';
import { supabase } from '@/lib/supabaseClient';

import { LeftSidebar } from '@/components/workspace/LeftSideBar';
import { EditorArea } from '@/components/workspace/EditorArea';
import { RightPanel } from '@/components/workspace/RightPanel';
import { LiteratureModal } from '@/components/workspace/Modals/LiteratureModal';

const lowlight = createLowlight();
const LAST_PROJECT_KEY = 'cowritex:lastProjectId';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type WritingStyle =
  | 'IMRaD structure'
  | 'Survey (Literature Review) structure'
  | 'Problem–Solution research structure'
  | 'Experimental research structure'
  | 'Engineering system paper structure';

type Project = {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  created_at?: string;
  updated_at?: string;
};

export type Section = {
  id: string;
  project_id: string;
  type: string;
  title: string;
  position: number;
  depth: number;
  parentId: string | null;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  project_id: string;
  section_id: string | null;
  role: 'human' | 'ai';
  content: string;
  created_at: string;
};

type Suggestion = {
  id: string;
  section_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  content: string;
  original_text?: string;
  suggested_text?: string;
  diff?: Array<{ type: 'equal' | 'add' | 'remove'; text: string }>;
  inlineMeta?: { from: number; to: number };
};

type LitReview = {
  known: string;
  debated: string;
  methodologies: string;
  gaps: string;
};

async function apiFetch(endpoint: string, options?: RequestInit) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('No auth session');

    const url = `${API_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${res.status}: ${err}`);
    }
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err: any) {
    console.error(`[apiFetch] Failed: ${err.message}`);
    throw err;
  }
}

function normalizeSections(raw: any[]): Section[] {
  return raw.map((s) => ({
    id: s.id,
    project_id: s.project_id,
    type: s.type ?? 'other',
    title: s.title,
    position: s.position ?? 1,
    depth: s.depth ?? 0,
    parentId: s.parent_id ?? null,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildWordDiff(original: string, suggestion: string): Array<{ type: 'equal' | 'add' | 'remove'; text: string }> {
  const source = (original || '').trim();
  const target = (suggestion || '').trim();
  if (!source) return [{ type: 'add', text: target }];

  const a = source.split(/\s+/);
  const b = target.split(/\s+/);
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const edits: Array<{ type: 'equal' | 'add' | 'remove'; text: string }> = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
      edits.push({ type: 'equal', text: b[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      edits.push({ type: 'add', text: b[j - 1] });
      j--;
    } else {
      edits.push({ type: 'remove', text: a[i - 1] });
      i--;
    }
  }

  edits.reverse();
  const merged: Array<{ type: 'equal' | 'add' | 'remove'; text: string }> = [];
  edits.forEach((e) => {
    const prev = merged[merged.length - 1];
    if (prev && prev.type === e.type) prev.text += ` ${e.text}`;
    else merged.push({ ...e });
  });
  return merged;
}

export default function WorkspacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectIdFromUrl = searchParams.get('projectId');

  const [authChecked, setAuthChecked] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/auth/login');
      else {
        setAuthChecked(true);
        setAuthToken(session.access_token);
      }
    });
  }, [router]);

  const resolvedProjectId = useMemo(() => {
    if (projectIdFromUrl) return projectIdFromUrl;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LAST_PROJECT_KEY);
      if (stored) return stored;
    }
    return null;
  }, [projectIdFromUrl]);

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    if (!authChecked || !resolvedProjectId) return;
    setProjectLoading(true);
    apiFetch(`/projects/${resolvedProjectId}`)
      .then((data: Project) => {
        setProject(data);
        localStorage.setItem(LAST_PROJECT_KEY, data.id);
        if (!projectIdFromUrl) router.replace(`/workspace?projectId=${data.id}`);
      })
      .catch((err) => {
        setProjectError(err.message);
        if (err.message.includes('404') || err.message.includes('403')) {
          localStorage.removeItem(LAST_PROJECT_KEY);
        }
      })
      .finally(() => setProjectLoading(false));
  }, [authChecked, resolvedProjectId, projectIdFromUrl, router]);

  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const fetchSections = useCallback(async (projectId: string) => {
    setSectionsLoading(true);
    try {
      const data: any[] = await apiFetch(`/projects/${projectId}/sections`);
      const normalized = normalizeSections(data).sort((a, b) => a.position - b.position);
      setSections(normalized);
      setActiveSection((prev) => {
        if (prev && normalized.some((s) => s.id === prev.id)) return prev;
        return normalized[0] ?? null;
      });
    } catch {
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (project?.id) fetchSections(project.id);
  }, [project?.id, fetchSections]);

  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [sectionSearch, setSectionSearch] = useState('');
  const [showSectionSearch, setShowSectionSearch] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const [rightPanel, setRightPanel] = useState('chat');
  const [rightOpen, setRightOpen] = useState(true);

  const [saved, setSaved] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textColor, setTextColor] = useState('#6550e8');

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [hitlThreadId, setHitlThreadId] = useState<string | null>(null);
  const [hitlStatus, setHitlStatus] = useState<'idle' | 'pending_review' | 'error'>('idle');
  const [hitlAgentOutput, setHitlAgentOutput] = useState<string | null>(null);
  const [hitlIntents, setHitlIntents] = useState<string[]>([]);

  const [versions, setVersions] = useState<any[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const [sourcesRefreshKey, setSourcesRefreshKey] = useState(0);

  // --- LITERATURE REVIEW STATE ---
  const [litReview, setLitReview] = useState<LitReview>({
    known: '', debated: '', methodologies: '', gaps: '',
  });
  const [litReviewLoading, setLitReviewLoading] = useState(false);
  const [litReviewError, setLitReviewError] = useState<string | null>(null);
  const [litGenerating, setLitGenerating] = useState(false);
  const [hasPDFs, setHasPDFs] = useState(true);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const [searchOpen, setSearchOpen] = useState(false);

  const syncChatHistory = useCallback(async (projectId: string) => {
    try {
      const data: Message[] = await apiFetch(`/projects/${projectId}/chat`);
      setMessages(data ?? []);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!project?.id) return;
    syncChatHistory(project.id);
  }, [project?.id, syncChatHistory]);

  // ============================================
  // FETCH LITERATURE REVIEW - WITH DEBUG LOGS
  // ============================================
  const fetchLiteratureReview = useCallback(async (projectId: string) => {
    try {
      setLitReviewLoading(true);
      setLitReviewError(null);
      
      console.log('[fetchLiteratureReview] Fetching for project:', projectId);
      
      const analyses = await apiFetch(`/projects/${projectId}/literature`);
      console.log('[fetchLiteratureReview] Raw analyses response:', JSON.stringify(analyses, null, 2));
      
      if (analyses && Array.isArray(analyses) && analyses.length > 0) {
        const latest = analyses[0];
        console.log('[fetchLiteratureReview] Latest analysis ID:', latest.id);
        console.log('[fetchLiteratureReview] Latest analysis preview:', JSON.stringify(latest, null, 2));
        
        const details = await apiFetch(`/literature/${latest.id}`);
        console.log('[fetchLiteratureReview] Full details:', JSON.stringify(details, null, 2));
        
        if (details) {
          // Try all possible field names
          const known = details.known || details.what_is_known || details.summary || '';
          const debated = details.debated || details.what_is_debated || details.controversies || '';
          const methodologies = details.methodologies || details.methods || '';
          const gaps = details.gaps || details.research_gaps || details.future_work || '';
          
          console.log('[fetchLiteratureReview] Extracted fields:', { known, debated, methodologies, gaps });
          
          setLitReview({ known, debated, methodologies, gaps });
        }
      } else if (analyses && !Array.isArray(analyses)) {
        console.log('[fetchLiteratureReview] Single analysis returned:', JSON.stringify(analyses, null, 2));
        const known = analyses.known || analyses.what_is_known || analyses.summary || '';
        const debated = analyses.debated || analyses.what_is_debated || analyses.controversies || '';
        const methodologies = analyses.methodologies || analyses.methods || '';
        const gaps = analyses.gaps || analyses.research_gaps || analyses.future_work || '';
        
        setLitReview({ known, debated, methodologies, gaps });
      } else {
        console.log('[fetchLiteratureReview] No analyses found - empty state');
        setLitReview({ known: '', debated: '', methodologies: '', gaps: '' });
      }
    } catch (err: any) {
      console.error('[fetchLiteratureReview] Error:', err);
      if (!err.message?.includes('404')) {
        setLitReviewError(err.message);
      }
    } finally {
      setLitReviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!project?.id) return;
    fetchLiteratureReview(project.id);
  }, [project?.id, fetchLiteratureReview]);

  // ============================================
  // GENERATE LITERATURE REVIEW
  // ============================================
  const handleGenerateLiteratureReview = useCallback(async () => {
    if (!project?.id) return;

    setLitGenerating(true);
    setLitReviewError(null);

    try {
      console.log('[Generate] Starting literature review generation...');
      
      const res = await apiFetch(`/projects/${project.id}/run`, {
        method: 'POST',
        body: JSON.stringify({
          user_message: 'Generate a comprehensive literature review analysis from the uploaded PDFs. Structure the output with these sections: "What is Known", "What is Debated", "Methodologies", and "Research Gaps".',
          section_id: null,
        }),
      });

      console.log('[Generate] Run response:', JSON.stringify(res, null, 2));

      if (res?.status === 'pending_review' && res?.thread_id) {
        console.log('[Generate] Auto-approving thread:', res.thread_id);
        
        const approveRes = await apiFetch(`/projects/${project.id}/run/${res.thread_id}/resume`, {
          method: 'POST',
          body: JSON.stringify({ hitl_action: 'approve' }),
        });

        console.log('[Generate] Approve response:', JSON.stringify(approveRes, null, 2));

        // Wait for backend to save
        console.log('[Generate] Waiting 2 seconds for backend to save...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('[Generate] Fetching updated literature review...');
        await fetchLiteratureReview(project.id);
        await syncChatHistory(project.id);
        
      } else if (res?.status === 'completed' || res?.agent_output) {
        console.log('[Generate] Content already completed, waiting 1.5s...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        await fetchLiteratureReview(project.id);
        
      } else {
        console.log('[Generate] No expected response, starting polling...');
        let attempts = 0;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            const literature = await apiFetch(`/projects/${project.id}/literature`);
            console.log(`[Generate] Poll attempt ${attempts + 1}:`, literature);
            if (literature && (Array.isArray(literature) ? literature.length > 0 : literature.id)) {
              await fetchLiteratureReview(project.id);
              break;
            }
          } catch (e) {
            console.log(`[Generate] Poll attempt ${attempts + 1} failed`);
          }
          attempts++;
        }
      }
    } catch (err: any) {
      console.error('[Generate Literature Review] Error:', err);
      setLitReviewError(err.message || 'Failed to generate literature review');
    } finally {
      setLitGenerating(false);
    }
  }, [project?.id, fetchLiteratureReview, syncChatHistory]);

  // ============================================
  // REGENERATE LITERATURE REVIEW
  // ============================================
  const handleRegenerateLiteratureReview = useCallback(async () => {
    if (!project?.id) return;

    setLitGenerating(true);
    setLitReviewError(null);

    try {
      console.log('[Regenerate] Starting regeneration...');
      
      const res = await apiFetch(`/projects/${project.id}/run`, {
        method: 'POST',
        body: JSON.stringify({
          user_message: 'Regenerate the literature review analysis with fresh insights. Focus on emerging trends, recent developments, and critical analysis. Structure with: "What is Known", "What is Debated", "Methodologies", and "Research Gaps".',
          section_id: null,
        }),
      });

      console.log('[Regenerate] Run response:', JSON.stringify(res, null, 2));

      if (res?.status === 'pending_review' && res?.thread_id) {
        const approveRes = await apiFetch(`/projects/${project.id}/run/${res.thread_id}/resume`, {
          method: 'POST',
          body: JSON.stringify({ hitl_action: 'approve' }),
        });

        console.log('[Regenerate] Approve response:', JSON.stringify(approveRes, null, 2));
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchLiteratureReview(project.id);
        await syncChatHistory(project.id);
        
      } else if (res?.status === 'completed' || res?.agent_output) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await fetchLiteratureReview(project.id);
      }
    } catch (err: any) {
      console.error('[Regenerate Literature Review] Error:', err);
      setLitReviewError(err.message || 'Failed to regenerate literature review');
    } finally {
      setLitGenerating(false);
    }
  }, [project?.id, fetchLiteratureReview, syncChatHistory]);

  // ============================================
  // FILE UPLOAD
  // ============================================
const handleFileUpload = useCallback(() => {
  if (!project?.id) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${API_URL}/projects/${project.id}/upload/pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      console.log('[Upload] Success:', data.filename);
      
      // Force multiple refreshes with delays
      console.log('[Upload] Triggering refresh sequence...');
      
      // Immediate refresh
      setSourcesRefreshKey(prev => {
        console.log('[Upload] Refresh key before:', prev);
        return prev + 1;
      });
      
      // Delayed refresh (backend might still be processing)
      setTimeout(() => {
        console.log('[Upload] Delayed refresh 1');
        setSourcesRefreshKey(prev => prev + 1);
      }, 1500);
      
      setTimeout(() => {
        console.log('[Upload] Delayed refresh 2');
        setSourcesRefreshKey(prev => prev + 1);
      }, 3000);
      
      alert(`Uploaded: ${data.filename}`);
      
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
  };
  input.click();
}, [project?.id]);

  const fetchVersions = useCallback(async (sectionId: string) => {
    setVersionsLoading(true);
    try {
      const data: any[] = await apiFetch(`/sections/${sectionId}/versions`);
      const sorted = (data ?? []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setVersions(sorted);
    } catch {
      setVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeSection?.id) { setVersions([]); return; }
    fetchVersions(activeSection.id);
  }, [activeSection?.id, fetchVersions]);

  const writingStyle =
    (project?.description?.split('•')[0]?.trim() as WritingStyle) || 'IMRaD structure';

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3, 4, 5] } }),
      Underline, Highlight, FontFamily, FontSize, CustomHighlight,
      Image.configure({ inline: false, allowBase64: true, HTMLAttributes: { class: 'editor-image' } }),
      TaskList, TaskItem.configure({ nested: true }), TextStyle, Color,
      Link.configure({ openOnClick: false, linkOnPaste: true }),
      CodeBlockLowlight.configure({ lowlight }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow, TableCell, TableHeader, CustomTableCell,
      Mathematics.configure({ katexOptions: { throwOnError: false, strict: false } }),
      Superscript, Subscript,
      Placeholder.configure({
        placeholder: 'Start writing here… Use $...$ for inline math and $$...$$ for block equations.',
      }),
    ],
    content: '',
    editorProps: { attributes: { class: 'ProseMirror focus:outline-none' } },
  });

  useEffect(() => {
    if (!editor || !activeSection?.id) return;
    apiFetch(`/sections/${activeSection.id}/versions`)
      .then((versions: any[]) => {
        const current = versions.find((v) => v.is_current);
        editor.commands.setContent(current?.content ?? '');
      })
      .catch(() => editor.commands.setContent(''));
  }, [editor, activeSection?.id]);

  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
  }, []);

  const handleSave = useCallback(() => {
    if (!editor || !activeSection?.id || !project?.id) return;
    const content = editor.getHTML();

    apiFetch(`/sections/${activeSection.id}/content`, {
      method: 'PATCH',
      body: JSON.stringify({
        content: content,
      }),
    })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        fetchVersions(activeSection.id);
      })
      .catch((err) => alert('Save failed: ' + err.message));
  }, [editor, activeSection?.id, project?.id, fetchVersions]);

  const addSection = useCallback(
    async (name: string, parentId: string | null, depth: number, position: number) => {
      if (!name.trim() || !project?.id) return;
      try {
        const res: any = await apiFetch(`/projects/${project.id}/sections`, {
          method: 'POST',
          body: JSON.stringify({
            type: 'other',
            title: name.trim(),
            position,
            parent_id: parentId,
            depth,
          }),
        });
        await fetchSections(project.id);
        const newId = res?.id ?? res?.data?.id;
        if (newId) {
          setActiveSection((prev) => {
            const found = sections.find((s) => s.id === newId);
            return found ?? prev;
          });
        }
      } catch (err: any) {
        alert('Failed to create section: ' + err.message);
      }
    },
    [project?.id, fetchSections, sections]
  );

  const handleRenameSection = useCallback(async (id: string, newTitle: string) => {
    if (!project?.id) return;
    try {
      await apiFetch(`/sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: newTitle }),
      });
      await fetchSections(project.id);
    } catch (err: any) {
      alert('Rename failed: ' + err.message);
    }
  }, [project?.id, fetchSections]);

  const handleDeleteSection = useCallback(async (id: string) => {
    if (!project?.id) return;
    if (!confirm('Delete this section?')) return;
    try {
      await apiFetch(`/sections/${id}`, { method: 'DELETE' });
      await fetchSections(project.id);
      if (activeSection?.id === id) {
        setActiveSection((prev) => {
          const remaining = sections.filter((s) => s.id !== id);
          return remaining[0] ?? null;
        });
      }
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }, [project?.id, fetchSections, activeSection?.id, sections]);

  const handleReorderSections = useCallback(async (reordered: Section[]) => {
    if (!project?.id) return;
    setSections(reordered);
    try {
      await Promise.all(
        reordered.map((s) =>
          apiFetch(`/sections/${s.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              position: s.position,
              parent_id: s.parentId,
              depth: s.depth,
            }),
          })
        )
      );
    } catch (err: any) {
      alert('Reorder failed: ' + err.message);
      await fetchSections(project.id);
    }
  }, [project?.id, fetchSections]);

  const sendMessage = useCallback(() => {
    if (!chatInput.trim() || !project?.id) return;
    const userMsg: Message = {
      id: `cm-${Date.now()}`, project_id: project.id, section_id: activeSection?.id ?? null,
      role: 'human', content: chatInput, created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setHitlThreadId(null);
    setHitlStatus('idle');
    setHitlAgentOutput(null);
    setHitlIntents([]);

    apiFetch(`/projects/${project.id}/run`, {
      method: 'POST',
      body: JSON.stringify({ user_message: chatInput, section_id: activeSection?.id ?? null }),
    })
      .then((res: any) => {
        const aiMsg: Message = {
          id: `cm-${Date.now() + 1}`, project_id: project.id, section_id: activeSection?.id ?? null,
          role: 'ai', content: res.agent_output || 'No response', created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (res.status === 'pending_review' && res.thread_id) {
          setHitlThreadId(res.thread_id);
          setHitlStatus('pending_review');
          setHitlAgentOutput(res.agent_output ?? null);
          setHitlIntents(res.intents ?? []);
        }

        if (res.intents?.includes('search')) {
          setSourcesRefreshKey((k) => k + 1);
        }
      })
      .catch((err) => {
        const errorMsg: Message = {
          id: `cm-${Date.now() + 1}`, project_id: project.id, section_id: activeSection?.id ?? null,
          role: 'ai', content: `Error: ${err.message}`, created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMsg]);
        setHitlStatus('error');
      })
      .finally(() => setChatLoading(false));
  }, [chatInput, project?.id, activeSection?.id]);

  const resumeThread = useCallback(
    async (body: object): Promise<any> => {
      if (!hitlThreadId || !project?.id) return;
      setChatLoading(true);
      try {
        const res = await apiFetch(`/projects/${project.id}/run/${hitlThreadId}/resume`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return res;
      } finally {
        setChatLoading(false);
      }
    },
    [hitlThreadId, project?.id]
  );

  const handleHitlApprove = useCallback(async () => {
    try {
      const res = await resumeThread({ hitl_action: 'approve' });
      const confirmMsg: Message = {
        id: `cm-${Date.now()}`, project_id: project!.id, section_id: activeSection?.id ?? null,
        role: 'ai', content: res?.agent_output ?? '✅ Output approved and saved.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
      setHitlStatus('idle');
      setHitlThreadId(null);
      setHitlAgentOutput(null);
      if (activeSection?.id) fetchVersions(activeSection.id);
      if (project?.id) syncChatHistory(project.id);
      if (hitlIntents.includes('search')) setSourcesRefreshKey((k) => k + 1);
    } catch (err: any) {
      setHitlStatus('error');
    }
  }, [resumeThread, project, activeSection?.id, hitlIntents, fetchVersions, syncChatHistory]);

  const handleHitlEdit = useCallback(async (editedText: string) => {
    if (!editedText.trim()) return;
    try {
      const res = await resumeThread({ hitl_action: 'edit', human_edited_text: editedText });
      const confirmMsg: Message = {
        id: `cm-${Date.now()}`, project_id: project!.id, section_id: activeSection?.id ?? null,
        role: 'ai', content: res?.agent_output ?? '✅ Edited version saved.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
      setHitlStatus('idle');
      setHitlThreadId(null);
      setHitlAgentOutput(null);
      if (activeSection?.id) fetchVersions(activeSection.id);
      if (project?.id) syncChatHistory(project.id);
    } catch (err: any) {
      setHitlStatus('error');
    }
  }, [resumeThread, project, activeSection?.id, fetchVersions, syncChatHistory]);

  const handleHitlRegenerate = useCallback(async (feedback: string) => {
    if (!feedback.trim()) return;
    try {
      const res = await resumeThread({ hitl_action: 'regenerate', hitl_feedback: feedback });
      if (res?.agent_output) {
        const regenMsg: Message = {
          id: `cm-${Date.now()}`, project_id: project!.id, section_id: activeSection?.id ?? null,
          role: 'ai', content: res.agent_output, created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, regenMsg]);
      }
      if (res?.status === 'pending_review') {
        setHitlThreadId(res.thread_id ?? hitlThreadId);
        setHitlAgentOutput(res.agent_output ?? null);
        setHitlStatus('pending_review');
      } else {
        setHitlStatus('idle');
        setHitlThreadId(null);
        setHitlAgentOutput(null);
        if (activeSection?.id) fetchVersions(activeSection.id);
      }
      if (project?.id) syncChatHistory(project.id);
    } catch (err: any) {
      setHitlStatus('error');
    }
  }, [resumeThread, project, activeSection?.id, hitlThreadId, fetchVersions, syncChatHistory]);

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    if (!activeSection?.id) return;
    try {
      await apiFetch(`/sections/${activeSection.id}/versions/restore`, {
        method: 'POST',
        body: JSON.stringify({ version_id: versionId }),
      });
      const versions: any[] = await apiFetch(`/sections/${activeSection.id}/versions`);
      const current = versions.find((v) => v.is_current);
      editor?.commands.setContent(current?.content ?? '');
      setVersions(
        versions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );
    } catch (err: any) {
      alert('Restore failed: ' + err.message);
    }
  }, [activeSection?.id, editor]);

  const handleAccept = useCallback((id: string) => {
    const inlineSuggestion = suggestions.find((s) => s.id === id && !!s.inlineMeta);
    if (inlineSuggestion?.inlineMeta && editor && activeSection?.id) {
      const chunks = (inlineSuggestion.diff && inlineSuggestion.diff.length > 0)
        ? inlineSuggestion.diff
        : buildWordDiff(inlineSuggestion.original_text ?? '', inlineSuggestion.suggested_text ?? inlineSuggestion.content ?? '');
      const html = chunks.map((chunk) => {
        const text = escapeHtml(chunk.text || '');
        if (chunk.type === 'equal') {
          return `<span style="background-color:#bbf7d0;color:#166534;padding:1px 2px;border-radius:3px;">${text}</span>`;
        }
        if (chunk.type === 'add') {
          return `<span style="background-color:#fecaca;color:#991b1b;padding:1px 2px;border-radius:3px;">${text}</span>`;
        }
        return `<span style="background-color:#fecaca;color:#991b1b;padding:1px 2px;border-radius:3px;text-decoration:line-through;">${text}</span>`;
      }).join(' ');

      const { from, to } = inlineSuggestion.inlineMeta;
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, html).run();

      apiFetch(`/sections/${activeSection.id}/content`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editor.getHTML() }),
      })
        .then(() => fetchVersions(activeSection.id))
        .catch((err) => alert('Failed to save inline suggestion: ' + err.message));

      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    apiFetch(`/suggestions/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'accepted' }) })
      .then(() => setSuggestions((prev) => prev.filter((s) => s.id !== id)))
      .catch(() => {});
  }, [suggestions, editor, activeSection?.id, fetchVersions]);

  const handleReject = useCallback((id: string) => {
    const inlineSuggestion = suggestions.find((s) => s.id === id && !!s.inlineMeta);
    if (inlineSuggestion) {
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    apiFetch(`/suggestions/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) })
      .then(() => setSuggestions((prev) => prev.filter((s) => s.id !== id)))
      .catch(() => {});
  }, [suggestions]);

  const insertCitation = useCallback((paper: any) => {
    if (!editor) return;
    const year = paper.created_at ? new Date(paper.created_at).getFullYear() : new Date().getFullYear();
    const authorShort = paper.authors?.split(',')[0]?.trim() || 'Unknown';
    editor.chain().focus().insertContent(`<span class="cite-ref">[${authorShort}, ${year}]</span> `).run();
  }, [editor]);

  const handleInlineSuggestion = useCallback(async () => {
    if (!editor || !activeSection?.id) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to) || '';
    try {
      const res = await apiFetch(`/sections/${activeSection.id}/suggestions/inline`, {
        method: 'POST',
        body: JSON.stringify({
          document: editor.getText(),
          target_text: selectedText,
          section_id: activeSection.id,
        }),
      });

      if (!res?.suggestion) {
        alert('No inline suggestion generated.');
        return;
      }

      const localSuggestion: Suggestion = {
        id: `inline-${Date.now()}`,
        section_id: activeSection.id,
        status: 'pending',
        content: res.suggestion,
        original_text: res.original ?? selectedText,
        suggested_text: res.suggestion,
        diff: res.diff ?? [],
        inlineMeta: { from, to },
      };
      setRightPanel('suggestions');
      setRightOpen(true);
      setSuggestions((prev) => [localSuggestion, ...prev]);
    } catch (err: any) {
      alert('Inline suggestion failed: ' + err.message);
    }
  }, [editor, activeSection?.id]);

  const wordCount = editor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0;
  const charCount = editor?.getText().length ?? 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setAddingSection(true);
      }
      if (e.key === 'Escape') { setAddingSection(false); setShowSectionSearch(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!authChecked) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!resolvedProjectId) return <div className="flex h-screen items-center justify-center"><button onClick={() => router.push('/dashboard')} className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white">Go to Dashboard</button></div>;
  if (projectLoading || sectionsLoading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (projectError) return <div className="flex h-screen items-center justify-center text-red-500">{projectError}</div>;
  if (!project) return <div className="flex h-screen items-center justify-center">Project not found</div>;

  return (
    <div className="flex h-full overflow-hidden bg-[var(--bg)]">
      <LeftSidebar
        projectId={project?.id}
        sections={sections}
        activeSectionId={activeSection?.id ?? null}
        onSelectSection={handleSectionChange}
        onAddSection={addSection}
        onRenameSection={handleRenameSection}
        onDeleteSection={handleDeleteSection}
        onReorderSections={handleReorderSections}
        sectionSearch={sectionSearch}
        setSectionSearch={setSectionSearch}
        showSectionSearch={showSectionSearch}
        setShowSectionSearch={setShowSectionSearch}
        addingSection={addingSection}
        setAddingSection={setAddingSection}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
        onSearchOpen={() => setSearchOpen(true)}
        onInsertCitation={insertCitation}
        onFileUpload={handleFileUpload}
        sourcesRefreshKey={sourcesRefreshKey}
      />
      <EditorArea
        editor={editor} activeSection={activeSection} writingStyle={writingStyle}
        projectTitle={project.title} saved={saved} onSave={handleSave}
        showColorPicker={showColorPicker} setShowColorPicker={setShowColorPicker}
        textColor={textColor} setTextColor={setTextColor}
        wordCount={wordCount} charCount={charCount}
        onInlineSuggestion={handleInlineSuggestion}
      />
<RightPanel
  rightPanel={rightPanel} rightOpen={rightOpen}
  setRightPanel={setRightPanel} setRightOpen={setRightOpen}
  pendingCount={pendingCount} messages={messages}
  chatInput={chatInput} setChatInput={setChatInput}
  sendMessage={sendMessage} chatLoading={chatLoading}
  suggestions={suggestions} onAcceptSuggestion={handleAccept}
  onRejectSuggestion={handleReject} onInsertCitation={insertCitation}
  projectId={project.id}
  token={authToken ?? ''}
  hitlStatus={hitlStatus}
  hitlAgentOutput={hitlAgentOutput}
  hitlIntents={hitlIntents}
  onHitlApprove={handleHitlApprove}
  onHitlEdit={handleHitlEdit}
  onHitlRegenerate={handleHitlRegenerate}
  versions={versions}
  versionsLoading={versionsLoading}
  onRestoreVersion={handleRestoreVersion}
  sectionId={activeSection?.id ?? null}
/>
      <LiteratureModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onInsert={insertCitation}
        projectId={project.id}
        token={authToken ?? ''}
      />
    </div>
  );
}