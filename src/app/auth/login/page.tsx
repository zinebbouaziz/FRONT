'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, FileText, ArrowRight, Github, Chrome, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

/* ─── Animated background (shared with signup) ──────────────────────── */
function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
      <div
        className="absolute rounded-full blur-3xl opacity-25 animate-pulse-slow"
        style={{
          width: 600,
          height: 600,
          top: '-10%',
          left: '-15%',
          background: 'radial-gradient(circle, #6550e8, transparent 70%)',
          animationDuration: '8s',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-15 animate-pulse-slow"
        style={{
          width: 400,
          height: 400,
          bottom: '-5%',
          right: '-10%',
          background: 'radial-gradient(circle, #8b5cf6, transparent 70%)',
          animationDuration: '10s',
          animationDelay: '-4s',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

/* ─── Social button ─────────────────────────────────────────────────── */
function SocialBtn({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all hover:opacity-80 active:scale-95"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ─── Input field ───────────────────────────────────────────────────── */
function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </label>
      <div
        className="flex items-center border-2 rounded-xl overflow-hidden transition-all duration-200"
        style={{
          borderColor: error ? 'var(--text-danger)' : focused ? 'var(--brand)' : 'var(--border)',
          background: 'var(--surface)',
          boxShadow: focused ? '0 0 0 4px rgba(101,80,232,0.12)' : 'none',
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-4 py-3 text-sm bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {suffix && <div className="pr-3">{suffix}</div>}
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--text-danger)' }}>{error}</p>}
    </div>
  );
}

/* ─── Main Login Page ───────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 1. LOGIN WITH SUPABASE
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        setErrors({ general: error?.message || 'Login failed' });
        setLoading(false);
        return;
      }

      const token = data.session.access_token;

      // 2. CALL BACKEND
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setErrors({ general: 'Backend auth failed' });
        setLoading(false);
        return;
      }

      const user = await res.json();
      console.log('USER:', user);

      // 3. REDIRECT
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Unexpected error occurred' });
    }

    setLoading(false);
  };

  return (
    <>
      <AuthBackground />

      <style>{`
        @keyframes pulse-slow { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:.35;transform:scale(1.05)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        .animate-pulse-slow { animation: pulse-slow ease-in-out infinite; }
        .anim-0 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 0ms   both; }
        .anim-1 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 80ms  both; }
        .anim-2 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 160ms both; }
        .anim-3 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 240ms both; }
        .anim-4 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 320ms both; }
        .anim-5 { animation: fade-up 0.6s cubic-bezier(.16,1,.3,1) 400ms both; }
      `}</style>

      <div className="min-h-screen flex">
        {/* ── Left panel (decorative) ── */}
        <div
          className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #3d2fa0 0%, #6550e8 50%, #8b5cf6 100%)' }}
        >
          {/* Decorative orbs */}
          <div className="absolute top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: '#a78bfa' }} />
          <div className="absolute bottom-32 -left-16 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: '#4f46e5' }} />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-sora)' }}>
              CoWritex
            </span>
          </div>

          {/* Quote */}
          <div className="relative">
            <div className="text-5xl text-white/30 font-serif mb-4 leading-none">&ldquo;</div>
            <p className="text-white text-lg leading-relaxed font-medium mb-6" style={{ fontFamily: 'var(--font-sora)' }}>
              The most elegant writing environment I&apos;ve used for academic work. The LaTeX support alone is worth it.
            </p>
            <div className="flex items-center gap-3">


            </div>
          </div>

          {/* Feature pills */}
          <div className="relative flex flex-wrap gap-2">
            {['LaTeX Math', 'AI Assistant', 'Smart Citations', 'rich text editor', 'Dark Mode'].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/15 text-white/90 backdrop-blur-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {mounted && (
              <>
                {/* Header */}
                <div className="mb-8 anim-0">
                  {/* Mobile logo */}
                  <div className="flex items-center gap-2 mb-8 lg:hidden">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}>CoWritex</span>
                  </div>

                  <h1
                    className="text-3xl font-extrabold mb-2"
                    style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
                  >
                    Welcome back
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Sign in to continue your research
                  </p>
                </div>

                {/* Social sign-in (visual only – no handlers to match original behaviour) */}


                {/* Divider */}



                {/* General error */}
                {errors.general && (
                  <div
                    className="mb-4 px-4 py-3 rounded-xl text-sm anim-2"
                    style={{ background: 'var(--background-danger)', color: 'var(--text-danger)' }}
                  >
                    {errors.general}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="anim-3">
                    <Field
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="you@university.edu"
                      error={errors.email}
                    />
                  </div>

                  <div className="anim-4">
                    <Field
                      label="Password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••"
                      error={errors.password}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="p-1 rounded-lg transition-colors"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </div>

                  {/* Remember + forgot (visual only) */}
                  <div className="flex items-center justify-between anim-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded accent-purple-600" />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: 'var(--brand)' }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="anim-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: 'linear-gradient(135deg, #6550e8, #8b5cf6)',
                      boxShadow: '0 6px 24px rgba(101,80,232,0.4)',
                    }}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                    ) : (
                      <>Sign in <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                {/* Sign up link */}
                <p className="mt-6 text-center text-sm anim-5" style={{ color: 'var(--text-secondary)' }}>
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/signup"
                    className="font-semibold transition-opacity hover:opacity-70"
                    style={{ color: 'var(--brand)' }}
                  >
                    Create one free
                  </Link>
                </p>

                {/* Terms note */}
                <p className="mt-4 text-center text-[11px] anim-5" style={{ color: 'var(--text-tertiary)' }}>
                  By signing in you agree to our{' '}
                  <Link href="#" className="underline underline-offset-2">Terms</Link>
                  {' '}and{' '}
                  <Link href="#" className="underline underline-offset-2">Privacy Policy</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}