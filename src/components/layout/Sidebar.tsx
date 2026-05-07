'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PenSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { supabase } from '@/lib/supabaseClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/workspace', icon: PenSquare, label: 'Writing Workspace' },
  { href: '/visualization', icon: BarChart3, label: 'Visualization Studio' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  academic_position: string | null;
  organization: string | null;
}

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

function CoWriteXLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5 text-white" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M4 4l16 16" />
          <path d="M20 4L4 20" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-text-primary dark:text-white leading-none">
            CoWrite<span className="text-indigo-500">X</span>
          </span>
          <span className="text-[10px] text-text-tertiary dark:text-text-tertiary leading-none mt-0.5">
            Collaborative Writing
          </span>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  
  // ─── Real user state ───
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // ─── Fetch user from backend ───
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: UserProfile = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        // Fallback: try to use Supabase user metadata if API fails
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          setUser({
            id: sbUser.id,
            email: sbUser.email || '',
            full_name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
            academic_position: sbUser.user_metadata?.academic_position || null,
            organization: sbUser.user_metadata?.organization || null,
          });
        }
      } finally {
        setUserLoading(false);
      }
    }

    loadUser();
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleVisualizationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const projectId = typeof window !== 'undefined' ? localStorage.getItem('cowritex:lastProjectId') : null;
    if (projectId) {
      router.push(`/visualization?projectId=${projectId}`);
    } else {
      router.push('/visualization');
    }
    onClose?.();
  };

  return (
    <aside 
      className={`relative flex flex-col h-full bg-white dark:bg-dark-surface border-r border-surface-border dark:border-dark-border flex-shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center border-b border-surface-border dark:border-dark-border ${
        collapsed ? 'justify-center px-2 py-5' : 'justify-between px-5 py-5'
      }`}>
        <CoWriteXLogo collapsed={collapsed} />
        
        {!isMobile && !collapsed && (
          <button 
            onClick={toggleCollapse}
            className="p-1.5 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-card text-text-secondary transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        {isMobile && (
          <button onClick={onClose} className="ml-auto p-1 rounded-md hover:bg-surface-secondary dark:hover:bg-dark-card text-text-secondary" aria-label="Close sidebar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Expand Button */}
      {collapsed && !isMobile && (
        <button 
          onClick={toggleCollapse}
          className="absolute -right-3 top-5 w-6 h-6 bg-white dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all text-text-secondary hover:text-text-primary z-10"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 mt-4 space-y-2' : 'px-3 mt-4 space-y-1'}`}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          const isVisualization = href === '/visualization';
          
          return (
            <Link
              key={href}
              href={isVisualization ? '#' : href}
              onClick={isVisualization ? handleVisualizationClick : onClose}
              className={`group relative flex items-center rounded-xl transition-all duration-150 ${
                collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5'
              } ${
                active
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-text-secondary dark:text-text-secondary hover:bg-surface-secondary dark:hover:bg-dark-card hover:text-text-primary dark:hover:text-white'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  active 
                    ? 'text-white' 
                    : 'text-text-tertiary dark:text-text-tertiary group-hover:text-text-primary dark:group-hover:text-white'
                }`}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                  {label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile at Bottom */}
      <div className={`border-t border-surface-border dark:border-dark-border pt-4 mt-2 pb-4 ${
        collapsed ? 'px-2' : 'px-3'
      }`}>
        <div 
          className={`group relative flex items-center rounded-xl hover:bg-surface-secondary dark:hover:bg-dark-card transition-colors cursor-pointer ${
            collapsed ? 'justify-center p-2' : 'gap-3 px-2 py-2'
          }`} 
          title={collapsed ? (user?.full_name || 'User') : undefined}
        >
          {userLoading ? (
            <div className="w-8 h-8 rounded-full bg-surface-secondary dark:bg-dark-card flex items-center justify-center flex-shrink-0 animate-pulse" />
          ) : (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--brand, #6550e8)' }}
            >
              <span className="text-white text-sm font-bold leading-none">
                {(user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </span>
            </div>
          )}
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              {userLoading ? (
                <>
                  <div className="h-4 w-24 bg-surface-secondary dark:bg-dark-card rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-surface-secondary dark:bg-dark-card rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-text-primary dark:text-white truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-[10px] text-text-tertiary dark:text-text-tertiary truncate">
                    {user?.academic_position || user?.organization || user?.email || 'Free plan'}
                  </p>
                </>
              )}
            </div>
          )}
          
          {collapsed && !userLoading && user?.full_name && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
              {user.full_name}
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}