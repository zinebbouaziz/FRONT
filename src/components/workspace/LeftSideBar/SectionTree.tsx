'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  Search,
  X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Section {
  id: string;
  title: string;
  depth: number;
  position: number;
  parentId: string | null;
  project_id?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

interface TreeNode extends Section {
  children: TreeNode[];
}

interface SectionTreeProps {
  sections: Section[];
  activeSectionId: string | null;
  onSelectSection: (section: Section) => void;
  onAddSection: (name: string, parentId: string | null, depth: number, position: number) => void;
  onRenameSection?: (id: string, newTitle: string) => void;
  onDeleteSection?: (id: string) => void;
  onReorderSections?: (sections: Section[]) => void;
  sectionSearch: string;
  setSectionSearch: (v: string) => void;
  showSectionSearch: boolean;
  setShowSectionSearch: (v: boolean) => void;
  addingSection: boolean;
  setAddingSection: (v: boolean) => void;
  newSectionName: string;
  setNewSectionName: (v: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildTree(sections: Section[], parentId: string | null): TreeNode[] {
  return sections
    .filter((s) => s.parentId === parentId)
    .sort((a, b) => a.position - b.position)
    .map((s) => ({ ...s, children: buildTree(sections, s.id) }));
}

function getBreadcrumb(sections: Section[], activeSectionId: string | null): Section[] {
  if (!activeSectionId) return [];
  const map = new Map(sections.map((s) => [s.id, s]));
  const path: Section[] = [];
  let current = map.get(activeSectionId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return path;
}

// ─── TreeNode Component ───────────────────────────────────────────────────────

interface NodeProps {
  node: TreeNode;
  depth: number;
  activeSectionId: string | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (section: Section) => void;
  onStartAdd: (parentId: string) => void;
  onStartRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  renamingId: string | null;
  renameValue: string;
  setRenameValue: (v: string) => void;
  onRenameConfirm: (id: string) => void;
  onRenameCancel: () => void;
  draggingId: string | null;
  dragOverId: string | null;
  dragOverPosition: 'before' | 'inside' | 'after' | null;
  onDragStart: (id: string, e: React.DragEvent) => void;
  onDragOver: (id: string, e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (targetId: string, position: 'before' | 'inside' | 'after') => void;
  onDragEnd: () => void;
}

function TreeNodeItem({
  node,
  depth,
  activeSectionId,
  expanded,
  onToggle,
  onSelect,
  onStartAdd,
  onStartRename,
  onDelete,
  renamingId,
  renameValue,
  setRenameValue,
  onRenameConfirm,
  onRenameCancel,
  draggingId,
  dragOverId,
  dragOverPosition,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: NodeProps) {
  const isOpen = expanded.has(node.id);
  const isActive = activeSectionId === node.id;
  const hasChildren = node.children.length > 0;
  const isFolder = hasChildren || node.depth === 0;
  const isRenaming = renamingId === node.id;
  const isDragging = draggingId === node.id;
  const isDropTarget = dragOverId === node.id;
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus();
  }, [isRenaming]);

  const indent = depth * 16;

  return (
    <div className="select-none">
      {/* Drop indicator: before */}
      {isDropTarget && dragOverPosition === 'before' && (
        <div
          className="h-0.5 mx-2 rounded-full"
          style={{ background: 'var(--brand, #6550e8)', marginLeft: 10 + indent }}
        />
      )}

      <div
        draggable
        onDragStart={(e) => onDragStart(node.id, e)}
        onDragOver={(e) => onDragOver(node.id, e)}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(node.id, dragOverPosition ?? 'after');
        }}
        onDragEnd={onDragEnd}
        onClick={() => { if (!isRenaming) onSelect(node); }}
        className={[
          'group relative flex items-center gap-1 rounded-md cursor-pointer transition-all duration-100',
          'text-[12px] leading-none',
          isActive
            ? 'text-[var(--text-primary)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          isActive
            ? 'bg-[var(--background-info,#ede9ff)]'
            : 'hover:bg-[var(--surface-secondary,#f4f6fb)] dark:hover:bg-[var(--dark-border)]',
          isDragging ? 'opacity-40' : '',
          isDropTarget && dragOverPosition === 'inside' ? 'ring-1 ring-[var(--brand)] ring-inset' : '',
        ].join(' ')}
        style={{ paddingLeft: 6 + indent, height: 28 }}
      >
        {/* Drag handle */}
        <span
          className="opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </span>

        {/* Expand arrow */}
        <span
          className="w-4 h-4 flex items-center justify-center shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
        >
          {hasChildren ? (
            isOpen
              ? <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              : <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          ) : (
            <span className="w-3.5" />
          )}
        </span>

        {/* Icon */}
        {isFolder ? (
          isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand)' }} />
          ) : (
            <Folder className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand)' }} />
          )
        ) : (
          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
        )}

        {/* Title or rename input */}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameConfirm(node.id);
              if (e.key === 'Escape') onRenameCancel();
              e.stopPropagation();
            }}
            onBlur={() => onRenameConfirm(node.id)}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 bg-white dark:bg-[var(--surface)] border border-[var(--brand)] rounded px-1 py-0.5 text-[11px] outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        ) : (
          <span className="flex-1 truncate">{node.title}</span>
        )}

        {/* Hover actions */}
        {!isRenaming && (
          <span className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pr-1 shrink-0">
            <button
              title="Rename"
              onClick={(e) => { e.stopPropagation(); onStartRename(node.id, node.title); }}
              className="p-1 rounded hover:bg-[var(--background-secondary)] transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              title="Add section after"
              onClick={(e) => { e.stopPropagation(); onStartAdd(node.id); }}
              className="p-1 rounded hover:bg-[var(--background-secondary)] transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              className="p-1 rounded hover:bg-[var(--background-danger)] transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>

      {/* Drop indicator: after */}
      {isDropTarget && dragOverPosition === 'after' && (
        <div
          className="h-0.5 mx-2 rounded-full"
          style={{ background: 'var(--brand, #6550e8)', marginLeft: 10 + indent }}
        />
      )}

      {/* Recurse into children */}
      {isOpen && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeSectionId={activeSectionId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              onStartAdd={onStartAdd}
              onStartRename={onStartRename}
              onDelete={onDelete}
              renamingId={renamingId}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              onRenameConfirm={onRenameConfirm}
              onRenameCancel={onRenameCancel}
              draggingId={draggingId}
              dragOverId={dragOverId}
              dragOverPosition={dragOverPosition}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline "Add" input ──────────────────────────────────────────────────────

interface AddInputProps {
  depth: number;
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function AddInput({ depth, value, onChange, onConfirm, onCancel }: AddInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div className="flex items-center gap-1.5 px-2 py-1" style={{ paddingLeft: 6 + depth * 16 }}>
      <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onConfirm();
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={onCancel}
        placeholder="Section name..."
        className="flex-1 text-[11px] bg-white dark:bg-[var(--surface)] border border-[var(--brand)] rounded px-2 py-1 outline-none"
        style={{ color: 'var(--text-primary)' }}
      />
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export function SectionBreadcrumb({
  sections,
  activeSectionId,
  onSelect,
}: {
  sections: Section[];
  activeSectionId: string | null;
  onSelect: (s: Section) => void;
}) {
  const crumbs = getBreadcrumb(sections, activeSectionId);
  if (crumbs.length === 0) return null;

  return (
    <div className="flex items-center gap-1 text-[11px] flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 opacity-50" />}
          <button
            onClick={() => onSelect(crumb)}
            className="hover:underline transition-colors"
            style={{
              color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: i === crumbs.length - 1 ? 600 : 400,
            }}
          >
            {crumb.title}
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Main SectionTree Component ───────────────────────────────────────────────

type AddingParentId = string | 'root' | null;

export function SectionTree({
  sections,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onReorderSections,
  sectionSearch,
  setSectionSearch,
  showSectionSearch,
  setShowSectionSearch,
  addingSection,
  setAddingSection,
  newSectionName,
  setNewSectionName,
}: SectionTreeProps) {
  // ── Local state ──
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const roots = new Set(sections.filter((s) => s.depth === 0).map((s) => s.id));
    return roots;
  });
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [addingParentId, setAddingParentId] = useState<AddingParentId>(null);
  const [addingValue, setAddingValue] = useState('');

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'inside' | 'after' | null>(null);

  // ── Derived ──
  const filteredSections = sectionSearch.trim()
    ? sections.filter((s) => s.title.toLowerCase().includes(sectionSearch.toLowerCase()))
    : sections;

  const tree = buildTree(filteredSections, null);

  // ── Helpers to update expanded set ──
  const expandId = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const toggleId = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Select ──
  const handleSelect = useCallback(
    (section: Section) => {
      onSelectSection(section);
      const hasChildren = sections.some((s) => s.parentId === section.id);
      if (hasChildren) expandId(section.id);
    },
    [onSelectSection, sections, expandId]
  );

  // ── Toggle ──
  const handleToggle = useCallback((id: string) => {
    toggleId(id);
  }, [toggleId]);

  // ── Rename ──
  const handleStartRename = useCallback((id: string, title: string) => {
    setRenamingId(id);
    setRenameValue(title);
  }, []);

  const handleRenameConfirm = useCallback(
    (id: string) => {
      const trimmed = renameValue.trim();
      if (trimmed && onRenameSection) {
        onRenameSection(id, trimmed);
      }
      setRenamingId(null);
    },
    [renameValue, onRenameSection]
  );

  const handleRenameCancel = useCallback(() => {
    setRenamingId(null);
    setRenameValue('');
  }, []);

  // ── Delete ──
  const handleDelete = useCallback(
    (id: string) => {
      if (onDeleteSection) onDeleteSection(id);
    },
    [onDeleteSection]
  );

  // ── Add ──
  const handleStartAdd = useCallback((parentId: string) => {
    setAddingParentId(parentId);
    setAddingValue('');
    expandId(parentId);
  }, [expandId]);

  const handleAddConfirm = useCallback(() => {
    const name = addingValue.trim() || newSectionName.trim();
    if (!name) {
      setAddingParentId(null);
      setAddingSection(false);
      return;
    }

    let targetParentId: string | null = null;
    let targetDepth = 0;
    let targetPosition = 1;

    if (addingParentId === 'root' || addingParentId === null) {
      const active = activeSectionId ? sections.find((s) => s.id === activeSectionId) : null;
      if (active && active.depth === 0) {
        targetParentId = null;
        targetDepth = 0;
        targetPosition = active.position + 1;
      } else {
        const rootSiblings = sections.filter((s) => s.parentId === null);
        targetPosition = rootSiblings.length + 1;
      }
    } else {
      const refSection = sections.find((s) => s.id === addingParentId);
      if (refSection) {
        targetParentId = refSection.parentId;
        targetDepth = refSection.depth;
        targetPosition = refSection.position + 1;
      } else {
        const rootSiblings = sections.filter((s) => s.parentId === null);
        targetPosition = rootSiblings.length + 1;
      }
    }

    onAddSection(name, targetParentId, targetDepth, targetPosition);

    if (targetParentId !== null) {
      expandId(targetParentId);
    }

    setAddingParentId(null);
    setAddingValue('');
    setNewSectionName('');
    setAddingSection(false);
  }, [
    addingValue,
    newSectionName,
    addingParentId,
    sections,
    activeSectionId,
    onAddSection,
    setNewSectionName,
    setAddingSection,
    expandId,
  ]);

  const handleAddCancel = useCallback(() => {
    setAddingParentId(null);
    setAddingValue('');
    setNewSectionName('');
    setAddingSection(false);
  }, [setNewSectionName, setAddingSection]);

  // Sync with parent's addingSection prop (keyboard shortcut)
  useEffect(() => {
    if (addingSection && addingParentId === null) {
      setAddingParentId('root');
      setAddingValue('');
    }
  }, [addingSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag & Drop ──
  const handleDragStart = useCallback((id: string, e: React.DragEvent) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback(
    (id: string, e: React.DragEvent) => {
      e.preventDefault();
      if (id === draggingId) return;
      setDragOverId(id);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const relY = e.clientY - rect.top;
      const h = rect.height;
      if (relY < h * 0.25) setDragOverPosition('before');
      else if (relY > h * 0.75) setDragOverPosition('after');
      else setDragOverPosition('inside');
      e.dataTransfer.dropEffect = 'move';
    },
    [draggingId]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
    setDragOverPosition(null);
  }, []);

  const handleDrop = useCallback(
    (targetId: string, dropPosition: 'before' | 'inside' | 'after') => {
      if (!draggingId || draggingId === targetId || !onReorderSections) {
        setDraggingId(null);
        setDragOverId(null);
        setDragOverPosition(null);
        return;
      }

      const draggingSection = sections.find((s) => s.id === draggingId);
      const targetSection = sections.find((s) => s.id === targetId);
      if (!draggingSection || !targetSection) return;

      const isDescendant = (checkParentId: string | null): boolean => {
        if (!checkParentId) return false;
        if (checkParentId === draggingId) return true;
        const parentSection = sections.find((s) => s.id === checkParentId);
        return isDescendant(parentSection?.parentId ?? null);
      };

      if (isDescendant(targetSection.parentId)) return;
      if (dropPosition === 'inside' && targetSection.id === draggingId) return;

      const newParentId: string | null = dropPosition === 'inside'
        ? targetSection.id
        : targetSection.parentId;

      const newDepth: number = dropPosition === 'inside'
        ? targetSection.depth + 1
        : targetSection.depth;

      const updated: Section[] = sections.map((s) =>
        s.id === draggingId ? { ...s, parentId: newParentId, depth: newDepth } : s
      );

      const newSiblings = updated
        .filter((s) => s.parentId === newParentId && s.id !== draggingId)
        .sort((a, b) => a.position - b.position);

      const targetIdx = newSiblings.findIndex((s) => s.id === targetId);
      const insertIdx = dropPosition === 'before' ? targetIdx : targetIdx + 1;

      const movedSection = updated.find((s) => s.id === draggingId)!;

      const reordered: Section[] = [
        ...newSiblings.slice(0, Math.max(0, insertIdx)),
        movedSection,
        ...newSiblings.slice(Math.max(0, insertIdx)),
      ].map((s, i) => ({ ...s, position: i + 1 }));

      const reorderedMap = new Map(reordered.map((s) => [s.id, s]));
      const final: Section[] = updated.map((s) => reorderedMap.get(s.id) ?? s);

      onReorderSections(final);

      if (dropPosition === 'inside') {
        expandId(targetId);
      }

      setDraggingId(null);
      setDragOverId(null);
      setDragOverPosition(null);
    },
    [draggingId, sections, onReorderSections, expandId]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
    setDragOverPosition(null);
  }, []);

  // ── Render tree recursively ──
  const renderTree = (nodes: TreeNode[], depth = 0): React.ReactNode =>
    nodes.map((node) => (
      <div key={node.id}>
        <TreeNodeItem
          node={node}
          depth={depth}
          activeSectionId={activeSectionId}
          expanded={expanded}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onStartAdd={handleStartAdd}
          onStartRename={handleStartRename}
          onDelete={handleDelete}
          renamingId={renamingId}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onRenameConfirm={handleRenameConfirm}
          onRenameCancel={handleRenameCancel}
          draggingId={draggingId}
          dragOverId={dragOverId}
          dragOverPosition={dragOverPosition}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
        {addingParentId === node.id && (
          <AddInput
            depth={depth + 1}
            value={addingValue}
            onChange={setAddingValue}
            onConfirm={handleAddConfirm}
            onCancel={handleAddCancel}
          />
        )}
        {expanded.has(node.id) && node.children.length > 0 && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));

  // ── UI ──
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-9 border-b shrink-0"
        style={{ borderColor: 'var(--border, #e4e7f0)' }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Explorer
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowSectionSearch(!showSectionSearch)}
            title="Search sections"
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--background-secondary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setAddingParentId('root'); setAddingValue(''); }}
            title="New section"
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--background-secondary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search input */}
      {showSectionSearch && (
        <div
          className="px-2 py-1.5 border-b shrink-0"
          style={{ borderColor: 'var(--border, #e4e7f0)' }}
        >
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md border"
            style={{ background: 'var(--background-primary)', borderColor: 'var(--border)' }}
          >
            <Search className="w-3 h-3 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <input
              autoFocus
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              placeholder="Filter sections..."
              className="flex-1 bg-transparent text-[11px] outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            {sectionSearch && (
              <button onClick={() => setSectionSearch('')}>
                <X className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {addingParentId === 'root' && (
          <AddInput
            depth={0}
            value={addingValue}
            onChange={setAddingValue}
            onConfirm={handleAddConfirm}
            onCancel={handleAddCancel}
          />
        )}

        {tree.length === 0 && !addingParentId ? (
          <div className="px-4 py-8 text-center">
            <Folder className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              No sections yet.
              <br />
              Click <strong>+</strong> to add one.
            </p>
          </div>
        ) : (
          renderTree(tree)
        )}
      </div>
    </div>
  );
}