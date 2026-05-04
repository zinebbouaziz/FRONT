// types/index.ts

export interface User {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  academic_position: string;
  department: string;
  field_interests: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'active' | 'archived' | 'draft';
  thread_id: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectPreference {
  id: string;
  project_id: string;
  writing_style: string;
  tone: string;
  target_journal: string;
  language: string;
  assistance_level: string;
  citation_style: string;
  grounded_only: boolean;
  llm_provider: string;
}

export interface Section {
  id: string;
  project_id: string;
  type: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  section_id: string;
  suggestion_id: string | null;
  content: string;
  version_number: number;
  author_type: 'ai' | 'human';
  is_current: boolean;
  created_at: string;
}

export interface AiSuggestion {
  id: string;
  section_id: string;
  original_text: string;
  suggested_text: string;
  instruction: string;
  status: 'pending' | 'accepted' | 'rejected';
  feedback: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  section_id: string | null;
  role: 'human' | 'ai';
  content: string;
  created_at: string;
}

export interface Source {
  id: string;
  project_id: string;
  title: string;
  authors: string;
  abstract: string;
  url: string;
  doi: string | null;
  citation_count: number;
  relevance_score: number;
  pdf_url: string;
  created_at: string;
}

export interface LiteratureAnalysis {
  id: string;
  project_id: string;
  review_content: string;
  gaps_content: string;
  warnings: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LiteratureCitation {
  id: string;
  literature_analysis_id: string;
  source_id: string;
  formatted_citation: string;
  citation_style: string;
  position: number;
  created_at: string;
}

export interface Visualization {
  id: string;
  project_id: string;
  section_id: string;
  type: string;
  title: string;
  raw_data: Record<string, unknown>;
  config: Record<string, unknown>;
  file_path: string;
  export_format: string;
  export_size: string;
  color_scheme: string;
  details: string;
  created_at: string;
  updated_at: string;
}
