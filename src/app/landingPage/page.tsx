'use client';

import React, { useState, useEffect, useRef } from 'react';

/* ─── GLOBAL STYLES ─────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: #F7F5FF;
      color: #1A1033;
      font-family: 'DM Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #F0EDF8; }
    ::-webkit-scrollbar-thumb { background: rgba(91,63,232,0.3); border-radius: 99px; }

    /* ── Fonts ── */
    .font-syne { font-family: 'Syne', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* ── Gradients ── */
    .grad-text {
      background: linear-gradient(135deg, #5B3FE8 0%, #9B6DFF 50%, #D4943A 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .grad-btn {
      background: linear-gradient(135deg, #5B3FE8, #7C5CF4);
      box-shadow: 0 4px 20px rgba(91,63,232,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .grad-btn:hover {
      background: linear-gradient(135deg, #4F35D4, #6B4FE0) !important;
      box-shadow: 0 8px 32px rgba(91,63,232,0.45), inset 0 1px 0 rgba(255,255,255,0.15) !important;
      transform: translateY(-1px);
    }

    /* ── Grid overlay ── */
    .grid-bg {
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(91,63,232,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,63,232,.05) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    /* ── Reveal on scroll ── */
    .reveal {
      opacity: 0; transform: translateY(24px);
      transition: opacity .7s ease, transform .7s ease;
    }
    .reveal.show { opacity: 1; transform: none; }

    /* ── Typing cursor ── */
    .cursor-blink {
      display: inline-block; width: 3px; height: .85em;
      background: #5B3FE8; border-radius: 2px; margin-left: 4px;
      vertical-align: middle; animation: blink .9s step-end infinite;
    }
    @keyframes blink { 50% { opacity: 0 } }

    /* ── Floating orbs (light mode) ── */
    @keyframes orbf {
      0%,100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-28px) scale(1.04); }
    }

    /* ── Logo float ── */
    @keyframes logo-float {
      0%,100% { transform: translateY(0) rotate(0deg); }
      33%      { transform: translateY(-10px) rotate(1deg); }
      66%      { transform: translateY(-5px) rotate(-0.8deg); }
    }
    @keyframes logo-glow {
      0%,100% { filter: drop-shadow(0 8px 32px rgba(91,63,232,0.3)); }
      50%      { filter: drop-shadow(0 16px 48px rgba(91,63,232,0.5)); }
    }
    .hero-logo {
      animation: logo-float 6s ease-in-out infinite, logo-glow 3s ease-in-out infinite;
    }

    /* ── Orbit ring ── */
    @keyframes spin-orbit {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes counter-spin { 
      from { transform: rotate(0deg); }
      to   { transform: rotate(-360deg); }
    }
    .orbit-ring-1 { animation: spin-orbit 8s linear infinite; }
    .orbit-ring-2 { animation: spin-orbit 13s linear infinite reverse; }

    /* ── Scroll arrow ── */
    .scroll-arrow {
      display: block; width: 1px; height: 32px;
      background: linear-gradient(to bottom, rgba(91,63,232,.8), transparent);
      margin: 0 auto;
      animation: scroll-pulse 2s ease-in-out infinite;
    }
    @keyframes scroll-pulse {
      0%,100% { opacity: .5; transform: scaleY(1); }
      50%      { opacity: 1;  transform: scaleY(1.2); }
    }

    /* ── Section label ── */
    .section-label {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(91,63,232,.08); border: 1px solid rgba(91,63,232,.2);
      color: #5B3FE8; border-radius: 99px; padding: 5px 16px;
      font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace; margin-bottom: 18px;
    }

    /* ── Feature card ── */
    .feature-card {
      background: #fff; border: 1px solid rgba(91,63,232,.1);
      border-radius: 20px;
      box-shadow: 0 2px 16px rgba(91,63,232,.06), 0 1px 4px rgba(0,0,0,.04);
      padding: 30px 28px; transition: all .3s ease; position: relative; overflow: hidden;
    }
    .feature-card::before {
      content: ''; position: absolute; inset: 0; opacity: 0;
      background: linear-gradient(135deg, rgba(91,63,232,.04), transparent);
      transition: opacity .3s;
    }
    .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(91,63,232,.15), 0 4px 16px rgba(0,0,0,.06); border-color: rgba(91,63,232,.2); }
    .feature-card:hover::before { opacity: 1; }

    /* ── Glass light ── */
    .glass-light {
      background: rgba(255,255,255,.85); backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,.9);
    }
    .glass-card {
      background: rgba(255,255,255,.6); border: 1px solid rgba(91,63,232,.1);
    }

    /* ── Mockup pane ── */
    .mockup-pane {
      background: #FAFAF8; border-radius: 16px;
      border: 1px solid rgba(91,63,232,.12);
      box-shadow: 0 4px 32px rgba(91,63,232,.1), 0 2px 8px rgba(0,0,0,.04);
    }
    .mockup-enter { animation: mockup-in .35s ease; }
    @keyframes mockup-in {
      from { opacity: 0; transform: translateY(8px) scale(.98); }
      to   { opacity: 1; transform: none; }
    }

    /* ── Step active ── */
    .step-active .step-num-el {
      background: rgba(91,63,232,.12) !important;
      border-color: rgba(91,63,232,.3) !important;
      color: #5B3FE8 !important;
    }

    /* ── Stat numbers ── */
    .stat-num {
      font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800;
      letter-spacing: -.04em; line-height: 1;
      background: linear-gradient(135deg, #5B3FE8, #9B6DFF);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: 10px;
    }

    /* ── Tech pill ── */
    .tech-pill {
      display: inline-flex; align-items: center; gap: 8px;
      background: #fff; border: 1px solid rgba(91,63,232,.12);
      border-radius: 99px; padding: 8px 16px;
      font-size: 13px; font-family: 'JetBrains Mono', monospace; color: #4A3D70;
      box-shadow: 0 2px 8px rgba(91,63,232,.06);
      transition: all .2s;
    }
    .tech-pill:hover { border-color: rgba(91,63,232,.3); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(91,63,232,.12); color: #5B3FE8; }

    /* ── Navbar ── */
    .navbar-scrolled {
      background: rgba(247,245,255,.92) !important;
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(91,63,232,.1) !important;
      box-shadow: 0 4px 24px rgba(91,63,232,.08) !important;
    }

    /* ── Badge pulse ── */
    @keyframes pulse-dot {
      0%,100% { box-shadow: 0 0 0 0 rgba(91,63,232,.4); }
      70%      { box-shadow: 0 0 0 6px rgba(91,63,232,0); }
    }
    .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

    /* ── Shimmer bar ── */
    @keyframes shimmer {
      from { background-position: -400px 0; }
      to   { background-position: 400px 0; }
    }
    .shimmer-bar {
      background: linear-gradient(90deg, rgba(91,63,232,.08) 25%, rgba(91,63,232,.2) 50%, rgba(91,63,232,.08) 75%);
      background-size: 400px 100%;
      animation: shimmer 1.8s linear infinite;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .features-grid { grid-template-columns: 1fr 1fr !important; }
      .how-grid      { grid-template-columns: 1fr !important; }
      .stats-grid    { grid-template-columns: 1fr 1fr !important; }
      .how-visual    { display: none !important; }
    }
    @media (max-width: 600px) {
      .features-grid { grid-template-columns: 1fr !important; }
      .stats-grid    { grid-template-columns: 1fr !important; }
      .hero-cta-wrap { flex-direction: column !important; align-items: center !important; }
      .nav-links-wrap { display: none !important; }
    }
  `}</style>
);

/* ─── DATA ─────────────────────────────────────────── */
const FEATURES = [
  {
    num: '01', col: 'rgba(91,63,232,.1)', stroke: '#5B3FE8',
    title: 'AI Writing Assistant',
    desc: 'Generate, rephrase, expand, or improve any section. Academic tone enforcement and style consistency grounded in your document context.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
  },
  {
    num: '02', col: 'rgba(59,130,246,.1)', stroke: '#3B82F6',
    title: 'Smart Literature Search',
    desc: 'Multi-source retrieval from Semantic Scholar, arXiv, and CrossRef. Relevance-ranked with semantic similarity, citation scores, and recency weighting.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>,
  },
  {
    num: '03', col: 'rgba(20,184,166,.1)', stroke: '#14B8A6',
    title: 'Citation & Reference Manager',
    desc: 'Upload PDFs and the Literature Agent embeds and validates every reference. Zero hallucinated citations — only verified, source-linked entries.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z"/></svg>,
  },
  {
    num: '04', col: 'rgba(245,158,11,.1)', stroke: '#F59E0B',
    title: 'IMRAD Structure Builder',
    desc: 'Section-aware generation enforces Introduction, Methods, Results, Discussion. Configurable per discipline with coherent cross-section flow.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  },
  {
    num: '05', col: 'rgba(236,72,153,.1)', stroke: '#EC4899',
    title: 'Human-in-the-Loop Editing',
    desc: 'Every AI output pauses for your review. Accept, modify, or reject with side-by-side diff view. Full audit log. Your judgment always wins.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    num: '06', col: 'rgba(34,197,94,.1)', stroke: '#22C55E',
    title: 'Data Visualization Module',
    desc: 'Upload CSVs or PDFs. Auto-generate charts, heatmaps, Mermaid diagrams. Export publication-ready PNG, PDF, or LaTeX with zero configuration.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
];

const STEPS = [
  {
    num: '01', title: 'Upload & Start Writing',
    desc: 'Import your reference PDFs, set writing preferences, and open the structured editor. Start with any section — IMRAD or custom format.',
    mockup: (
      <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
        <div style={{ background:'#F0EDF8', borderBottom:'1px solid rgba(91,63,232,.1)', padding:'10px 16px', display:'flex', alignItems:'center', gap:6 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
          <span style={{ fontSize:12, color:'#9B8EC0', marginLeft:8, fontFamily:'JetBrains Mono' }}>New Document · IMRAD Template</span>
        </div>
        <div style={{ padding:20, flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:12, color:'#5B3FE8', fontFamily:'JetBrains Mono', marginBottom:4, fontWeight:500 }}>§ Introduction</div>
          {[100,75,100,55].map((w,i) => <div key={i} className="shimmer-bar" style={{ height:9, borderRadius:5, width:w+'%' }}/>)}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6, padding:'8px 12px', background:'rgba(20,184,166,.08)', border:'1px solid rgba(20,184,166,.2)', borderRadius:8 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#14B8A6' }}/>
            <span style={{ fontSize:12, color:'#14B8A6', fontFamily:'JetBrains Mono' }}>3 PDFs uploaded · Indexed ✓</span>
          </div>
          <div style={{ height:1, background:'rgba(91,63,232,.06)', margin:'6px 0' }}/>
          <div style={{ fontSize:12, color:'#5B3FE8', fontFamily:'JetBrains Mono', marginBottom:4, fontWeight:500 }}>§ Methodology</div>
          {[100,60].map((w,i) => <div key={i} className="shimmer-bar" style={{ height:9, borderRadius:5, width:w+'%' }}/>)}
        </div>
      </div>
    ),
  },
  {
    num: '02', title: 'AI Assists, You Decide',
    desc: 'Select text and request improvements grounded in your uploaded literature. AI generates suggestions — you accept, modify, or reject each one.',
    mockup: (
      <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
        <div style={{ background:'#F0EDF8', borderBottom:'1px solid rgba(91,63,232,.1)', padding:'10px 16px', display:'flex', alignItems:'center', gap:6 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
          <span style={{ fontSize:12, color:'#9B8EC0', marginLeft:8, fontFamily:'JetBrains Mono' }}>AI Suggestion · Writing Agent</span>
        </div>
        <div style={{ padding:20, flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:11, color:'#9B8EC0', fontFamily:'JetBrains Mono', marginBottom:2 }}>Original text</div>
          {[100,70].map((w,i) => <div key={i} style={{ height:9, borderRadius:5, background:'rgba(91,63,232,.08)', width:w+'%' }}/>)}
          <div style={{ borderLeft:'3px solid #5B3FE8', paddingLeft:12, marginTop:4, paddingTop:10, paddingBottom:10, background:'rgba(91,63,232,.06)', borderRadius:'0 10px 10px 0' }}>
            <div style={{ fontSize:11, color:'#5B3FE8', marginBottom:8, fontFamily:'JetBrains Mono', fontWeight:500 }}>✦ AI Suggestion</div>
            {[100,85,60].map((w,i) => <div key={i} style={{ height:9, borderRadius:5, background:'rgba(91,63,232,.2)', width:w+'%', marginBottom:5 }}/>)}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4, flexWrap:'wrap' }}>
            {[['✓ Accept','rgba(34,197,94,.1)','rgba(34,197,94,.3)','#16A34A'],['✎ Modify','rgba(91,63,232,.08)','rgba(91,63,232,.25)','#5B3FE8'],['✕ Reject','rgba(239,68,68,.08)','rgba(239,68,68,.25)','#DC2626']].map(([l,bg,b,c]) => (
              <div key={l} style={{ padding:'7px 12px', background:bg, border:`1px solid ${b}`, borderRadius:8, fontSize:12, color:c, fontWeight:500, cursor:'pointer', fontFamily:'JetBrains Mono' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    num: '03', title: 'Review, Refine & Export',
    desc: 'Accept or reject suggestions with full version history. Export to PDF or LaTeX with citation formatting, embedded figures, and rollback capability.',
    mockup: (
      <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
        <div style={{ background:'#F0EDF8', borderBottom:'1px solid rgba(91,63,232,.1)', padding:'10px 16px', display:'flex', alignItems:'center', gap:6 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
          <span style={{ fontSize:12, color:'#9B8EC0', marginLeft:8, fontFamily:'JetBrains Mono' }}>Export · Version 3</span>
        </div>
        <div style={{ padding:20, flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          {[['✓ Structure compliance: 100%','rgba(34,197,94,.1)','rgba(34,197,94,.25)','#16A34A'],['↗ Citations verified: 14/14','rgba(91,63,232,.08)','rgba(91,63,232,.25)','#5B3FE8']].map(([l,bg,b,c]) => (
            <div key={l} style={{ padding:'9px 14px', background:bg, border:`1px solid ${b}`, borderRadius:9, fontSize:13, color:c, fontWeight:500, fontFamily:'JetBrains Mono' }}>{l}</div>
          ))}
          <div style={{ height:1, background:'rgba(91,63,232,.06)', margin:'4px 0' }}/>
          {[100,75].map((w,i) => <div key={i} style={{ height:9, borderRadius:5, background:'rgba(91,63,232,.08)', width:w+'%' }}/>)}
          <div style={{ display:'flex', gap:10, marginTop:8, flexWrap:'wrap' }}>
            {[['Export PDF','rgba(91,63,232,.12)','rgba(91,63,232,.3)','#5B3FE8'],['Export LaTeX','rgba(0,0,0,.04)','rgba(0,0,0,.12)','#4A3D70']].map(([l,bg,b,c]) => (
              <div key={l} style={{ padding:'8px 14px', background:bg, border:`1px solid ${b}`, borderRadius:8, fontSize:12, color:c, fontFamily:'JetBrains Mono', cursor:'pointer', fontWeight:500 }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

const STATS = [
  { val:'70%',    label:'Reduction in\nwriting time' },
  { val:'Zero',   label:'Hallucinated citations\nin library-locked mode' },
  { val:'100%',   label:'Structural compliance\nwith IMRAD templates' },
  { val:'~280ms', label:'Average suggestion\nlatency' },
];

const TECH: [string,string][] = [
  ['React 18','#5B3FE8'],['TipTap Editor','#5B3FE8'],['FastAPI','#3B82F6'],['LangGraph','#3B82F6'],
  ['LLaMA-3 / Groq','#14B8A6'],['Kimi K2','#14B8A6'],['ChromaDB','#F59E0B'],['FAISS','#F59E0B'],
  ['PostgreSQL','#22C55E'],['Supabase','#22C55E'],['Semantic Scholar','#EC4899'],['arXiv API','#EC4899'],
  ['Sentence Transformers','#3B82F6'],['Matplotlib','#9B6DFF'],['Mermaid.js','#14B8A6'],['PyMuPDF','#F59E0B'],
];

/* ─── HOOKS ─────────────────────────────────────────── */
function useIntersection(ref: React.RefObject<HTMLElement | null>, options = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

/* ─── REVEAL WRAPPER ─────────────────────────────────── */
function Reveal({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref, { threshold: 0.1 });
  return (
    <div ref={ref} className={`reveal${visible ? ' show' : ''} ${className}`}
      style={{ transitionDelay:`${delay}s`, ...style }}>
      {children}
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      padding:'12px 0', transition:'all .35s',
      ...(scrolled ? {} : { background:'transparent' }),
    }} className={scrolled ? 'navbar-scrolled' : ''}>
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {/* Logo */}
        <a href="" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ position:'relative', width:36, height:36 }}>
            <img src="/logo.png" alt="CoWriteX" style={{
              width:36, height:36, objectFit:'contain',
              filter:'drop-shadow(0 2px 8px rgba(91,63,232,.35))',
              transition:'all .3s',
            }} onMouseOver={e => (e.currentTarget.style.filter='drop-shadow(0 4px 16px rgba(91,63,232,.55))')}
              onMouseOut={e => (e.currentTarget.style.filter='drop-shadow(0 2px 8px rgba(91,63,232,.35))')}/>
          </div>
          <span style={{ fontFamily:'Syne, sans-serif', fontSize:'1.25rem', fontWeight:800, color:'#1A1033', letterSpacing:'-.02em' }}>
            Co<span style={{ color:'#5B3FE8' }}>Write</span>X
          </span>
        </a>

        {/* Links */}
        <div className="nav-links-wrap" style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[['Features','#features'],['How It Works','#how-it-works'],['Impact','#impact'],['Tech','#tech']].map(([l,h]) => (
            <a key={l} href={h} style={{ color:'#6B5FA0', textDecoration:'none', fontSize:14, fontWeight:400, transition:'color .2s', letterSpacing:'-.01em' }}
              onMouseOver={e => (e.currentTarget.style.color='#1A1033')}
              onMouseOut={e => (e.currentTarget.style.color='#6B5FA0')}
            >{l}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display:'flex', gap:10 }}>
          <a href="auth/login" style={{ padding:'9px 20px', borderRadius:10, border:'1px solid rgba(91,63,232,.2)', color:'#5B3FE8', fontSize:14, textDecoration:'none', transition:'all .2s', background:'transparent', fontWeight:500 }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(91,63,232,.08)'; e.currentTarget.style.borderColor='rgba(91,63,232,.4)'; }}
            onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(91,63,232,.2)'; }}
          >Login</a>
          <a href="auth/signup" className="grad-btn" style={{ padding:'9px 20px', borderRadius:10, color:'white', fontSize:14, textDecoration:'none', transition:'all .25s', display:'inline-block', fontWeight:500 }}>
            Sign Up Free
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── HERO ───────────────────────────────────────────── */
function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phrases = ['Faster with AI', 'Without Hallucinations', 'With Full Control', 'That Keeps You in Charge'];
  const [typed, setTyped] = useState(phrases[0]);

  useEffect(() => {
    let pi = 0, ci = phrases[0].length, del = false, t: ReturnType<typeof setTimeout>;
    function tick() {
      const phrase = phrases[pi];
      if (!del) { setTyped(phrase.slice(0, ci + 1)); ci++; if (ci >= phrase.length) { del = true; t = setTimeout(tick, 2200); return; } }
      else { setTyped(phrase.slice(0, ci - 1)); ci--; if (ci <= 0) { del = false; pi = (pi+1)%phrases.length; } }
      t = setTimeout(tick, del ? 42 : 82);
    }
    t = setTimeout(tick, 1600);
    return () => clearTimeout(t);
  }, []);

  /* Light-mode particle canvas */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const COLS = ['rgba(91,63,232,','rgba(155,109,255,','rgba(212,148,58,','rgba(20,184,166,'];
    let W: number, H: number, raf: number;
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random()*1400, y: Math.random()*900,
      vx: (Math.random()-.5)*.25, vy: (Math.random()-.5)*.25,
      r: Math.random()*2+.5,
      color: COLS[Math.floor(Math.random()*COLS.length)],
      a: Math.random()*.2+.05,
    }));
    function resize() { W=canvas!.width=canvas!.offsetWidth; H=canvas!.height=canvas!.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);
    function frame() {
      if (!ctx) return; ctx.clearRect(0,0,W,H);
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if (p.x<0||p.x>W) p.vx*=-1;
        if (p.y<0||p.y>H) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.color+p.a+')'; ctx.fill();
      });
      for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if (d<110) {
          ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle=`rgba(91,63,232,${.04*(1-d/110)})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
      raf=requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <section id="hero" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'140px 24px 80px', position:'relative', overflow:'hidden',
      background:'linear-gradient(160deg, #F7F5FF 0%, #EDE8FF 40%, #F5F0FA 70%, #FDF9F0 100%)' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}/>
      <div className="grid-bg"/>

      {/* Ambient blobs */}
      {[
        { s:600, t:-80, l:-120, c:'rgba(91,63,232,.09)', d:'16s', dl:'0s' },
        { s:400, t:200,  r:-60, c:'rgba(155,109,255,.08)', d:'12s', dl:'-5s' },
        { s:320, b:0,    l:'35%', c:'rgba(212,148,58,.06)', d:'10s', dl:'-8s' },
        { s:280, t:'35%',  r:'10%', c:'rgba(20,184,166,.06)', d:'14s', dl:'-3s' },
      ].map((o:any, i) => (
        <div key={i} style={{ position:'absolute', width:o.s, height:o.s, borderRadius:'50%', background:`radial-gradient(circle,${o.c},transparent)`, filter:'blur(70px)', animation:`orbf ${o.d} ease-in-out infinite`, animationDelay:o.dl, pointerEvents:'none', top:o.t, left:o.l, right:o.r, bottom:o.b }}/>
      ))}

      <div style={{ position:'relative', zIndex:2, maxWidth:960, margin:'0 auto', display:'flex', flexDirection:'column', alignItems:'center' }}>

        {/* Animated logo with orbits */}
        <div style={{ position:'relative', width:120, height:120, marginBottom:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {/* Outer orbit ring */}
          <div className="orbit-ring-1" style={{ position:'absolute', inset:-24, borderRadius:'50%', border:'1.5px dashed rgba(91,63,232,.2)', display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#5B3FE8', marginTop:-4, boxShadow:'0 0 12px rgba(91,63,232,.6)' }}/>
          </div>
          {/* Inner orbit ring */}
          <div className="orbit-ring-2" style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'1px dashed rgba(212,148,58,.3)', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'#D4943A', marginRight:-2.5, boxShadow:'0 0 8px rgba(212,148,58,.6)' }}/>
          </div>
          {/* Glow ring */}
          <div style={{ position:'absolute', inset:-6, borderRadius:'50%', background:'radial-gradient(circle, rgba(91,63,232,.15), transparent 70%)', filter:'blur(8px)' }}/>
          {/* Logo */}
          <img src="/logo.png" alt="CoWriteX" className="hero-logo" style={{ width:88, height:88, objectFit:'contain', position:'relative', zIndex:1 }}/>
        </div>

        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(91,63,232,.08)', border:'1px solid rgba(91,63,232,.2)', borderRadius:99, padding:'6px 16px', fontSize:13, color:'#5B3FE8', fontWeight:500, letterSpacing:'.03em', marginBottom:32, fontFamily:'JetBrains Mono' }}>
          <div className="pulse-dot" style={{ width:6, height:6, borderRadius:'50%', background:'#5B3FE8' }}/>
          Human-in-the-Loop AI &nbsp;·&nbsp; Research Writing Assistant
        </div>

        {/* Headline */}
        <h1 className="font-syne" style={{ fontSize:'clamp(2.6rem,7vw,5rem)', fontWeight:800, lineHeight:1.06, letterSpacing:'-.04em', color:'#1A1033', marginBottom:10 }}>
          Write Research Papers<br/>
          <span className="grad-text">{typed}</span>
          <span className="cursor-blink"/>
        </h1>

        <p style={{ fontSize:'clamp(1rem,2vw,1.18rem)', color:'#6B5FA0', fontWeight:300, maxWidth:580, margin:'18px auto 44px', lineHeight:1.75 }}>
          CoWriteX keeps you in full control — AI suggests, you decide. Literature, citations, structure, and visualizations. All in one unified platform.
        </p>

        {/* CTAs */}
        <div className="hero-cta-wrap" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="#features" className="grad-btn" style={{ padding:'15px 34px', borderRadius:13, color:'white', fontSize:16, fontWeight:500, textDecoration:'none', transition:'all .25s', display:'inline-flex', alignItems:'center', gap:8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M10 14 21 3M21 14v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/></svg>
            Start Writing Free
          </a>
          <a href="#how-it-works" style={{ padding:'15px 34px', borderRadius:13, border:'1px solid rgba(91,63,232,.25)', color:'#5B3FE8', background:'rgba(91,63,232,.06)', fontSize:16, textDecoration:'none', transition:'all .2s', display:'inline-block', fontWeight:500 }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(91,63,232,.12)'; e.currentTarget.style.borderColor='rgba(91,63,232,.4)'; }}
            onMouseOut={e => { e.currentTarget.style.background='rgba(91,63,232,.06)'; e.currentTarget.style.borderColor='rgba(91,63,232,.25)'; }}
          >See How It Works</a>
        </div>

        {/* Social proof mini strip */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:52, color:'#9B8EC0', fontSize:13 }}>
          <div style={{ display:'flex', alignItems:'center', gap:-6 }}>
            {['#5B3FE8','#14B8A6','#F59E0B','#EC4899'].map((c,i) => (
              <div key={c} style={{ width:28, height:28, borderRadius:'50%', background:c, border:'2px solid white', marginLeft: i>0 ? -8 : 0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white', fontWeight:700 }}>
                {['A','B','C','D'][i]}
              </div>
            ))}
          </div>
          <span>Trusted by <strong style={{ color:'#1A1033' }}>1,000+</strong> researchers worldwide</span>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:10, color:'#9B8EC0', fontSize:11, letterSpacing:'.12em', zIndex:2 }}>
        SCROLL<span className="scroll-arrow"/>
      </div>
    </section>
  );
}

/* ─── FEATURES ───────────────────────────────────────── */
function Features() {
  return (
    <section id="features" style={{ padding:'120px 0', background:'#FAFAF8', position:'relative' }}>
      {/* Subtle wave top */}
      <div style={{ position:'absolute', top:-1, left:0, right:0, height:60, background:'linear-gradient(to bottom right, #F7F5FF 49%, #FAFAF8 50%)' }}/>

      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px' }}>
        <Reveal style={{ textAlign:'center', marginBottom:64 }}>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className="section-label">Features</div>
          </div>
          <h2 className="font-syne" style={{ fontSize:'clamp(1.9rem,4vw,3rem)', fontWeight:800, letterSpacing:'-.03em', color:'#1A1033', lineHeight:1.12, marginBottom:14 }}>
            Everything researchers need,<br/>nothing they don't
          </h2>
          <p style={{ fontSize:17, color:'#6B5FA0', fontWeight:300, maxWidth:520, margin:'0 auto' }}>
            Six specialized AI agents work together so you can focus on your ideas — not your tools.
          </p>
        </Reveal>

        <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.num} delay={(i%3+1)*0.08}>
              <div className="feature-card" style={{ height:'100%' }}>
                <span className="font-mono" style={{ position:'absolute', top:18, right:22, fontSize:11, color:'rgba(91,63,232,.2)', fontWeight:500 }}>{f.num}</span>
                {/* Icon badge */}
                <div style={{ width:52, height:52, borderRadius:14, background:f.col, border:`1px solid ${f.stroke}22`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, color:f.stroke }}>
                  {f.icon}
                </div>
                <div className="font-syne" style={{ fontSize:17, fontWeight:700, color:'#1A1033', marginBottom:10, letterSpacing:'-.02em' }}>{f.title}</div>
                <div style={{ fontSize:14, color:'#6B5FA0', lineHeight:1.7, fontWeight:300 }}>{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────── */
function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section id="how-it-works" style={{ padding:'120px 0', background:'linear-gradient(180deg,#FAFAF8,#F7F5FF)', position:'relative' }}>
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px' }}>
        <div className="how-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          {/* Left */}
          <div>
            <Reveal><div className="section-label">How It Works</div></Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-syne" style={{ fontSize:'clamp(1.9rem,4vw,3rem)', fontWeight:800, letterSpacing:'-.03em', color:'#1A1033', lineHeight:1.12, marginBottom:14 }}>
                From blank page<br/>to publication-ready
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p style={{ fontSize:16, color:'#6B5FA0', fontWeight:300, marginBottom:44 }}>Three stages. Infinite iterations. You stay in control at every step.</p>
            </Reveal>

            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i*0.07}>
                <div onClick={() => setActive(i)}
                  className={i===active ? 'step-active' : ''}
                  style={{ display:'flex', gap:18, alignItems:'flex-start', padding:'22px 0', borderBottom:'1px solid rgba(91,63,232,.08)', cursor:'pointer', ...(i===0 ? { borderTop:'1px solid rgba(91,63,232,.08)' } : {}), transition:'all .25s' }}>
                  <div className="step-num-el" style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:'#fff', border:'1px solid rgba(91,63,232,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono', fontSize:13, color:'#9B8EC0', transition:'all .3s', boxShadow:'0 2px 8px rgba(91,63,232,.06)' }}>{s.num}</div>
                  <div>
                    <div className="step-title-el font-syne" style={{ fontSize:16, fontWeight:700, color: i===active ? '#1A1033' : '#6B5FA0', marginBottom:6, letterSpacing:'-.02em', transition:'color .3s' }}>{s.title}</div>
                    <div style={{ fontSize:14, color:'#9B8EC0', lineHeight:1.65, fontWeight:300 }}>{s.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Right mockup */}
          <div className="how-visual" style={{ height:420 }}>
            <div key={active} className="mockup-pane mockup-enter" style={{ height:'100%', overflow:'hidden', display:'flex', flexDirection:'column' }}>
              {STEPS[active].mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── IMPACT / STATS ─────────────────────────────────── */
function Impact() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref, { threshold:0.3 });
  const [shown, setShown] = useState(false);
  useEffect(() => { if (visible) setShown(true); }, [visible]);

  return (
    <section id="impact" style={{ padding:'100px 0', background:'#F7F5FF' }}>
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px' }}>
        <Reveal>
          <div ref={ref} style={{ borderRadius:28, background:'linear-gradient(135deg,rgba(91,63,232,.07) 0%,rgba(155,109,255,.05) 50%,rgba(212,148,58,.04) 100%)', border:'1px solid rgba(91,63,232,.15)', padding:'70px 60px', textAlign:'center', position:'relative', overflow:'hidden', boxShadow:'0 8px 48px rgba(91,63,232,.08)' }}>
            <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:400, height:160, background:'radial-gradient(ellipse,rgba(91,63,232,.12),transparent 70%)', pointerEvents:'none' }}/>

            <div style={{ display:'flex', justifyContent:'center' }}><div className="section-label">Measured Impact</div></div>
            <h2 className="font-syne" style={{ fontSize:'clamp(1.9rem,4vw,2.8rem)', fontWeight:800, letterSpacing:'-.03em', color:'#1A1033', lineHeight:1.12 }}>
              Numbers that speak for themselves
            </h2>
            <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40, marginTop:56 }}>
              {STATS.map((s, i) => (
                <div key={i}>
                  <div className="stat-num" style={{ opacity:shown?1:0, transform: shown ? 'translateY(0)' : 'translateY(12px)', transition:`opacity .6s ${i*.12}s, transform .6s ${i*.12}s` }}>{s.val}</div>
                  <div style={{ fontSize:14, color:'#6B5FA0', lineHeight:1.6, fontWeight:300, whiteSpace:'pre-line' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── TECH STACK ─────────────────────────────────────── */
function Tech() {
  return (
    <section id="tech" style={{ padding:'100px 0', background:'#FAFAF8' }}>
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px' }}>
        <Reveal style={{ marginBottom:48 }}>
          <div className="section-label">Tech Stack</div>
          <h2 className="font-syne" style={{ fontSize:'clamp(1.9rem,4vw,3rem)', fontWeight:800, letterSpacing:'-.03em', color:'#1A1033', lineHeight:1.12, marginBottom:12 }}>
            Built on proven,<br/>modern infrastructure
          </h2>
          <p style={{ fontSize:16, color:'#6B5FA0', fontWeight:300 }}>From LLM inference to vector search — every layer chosen for reliability and speed.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {TECH.map(([name, color]) => (
              <div key={name} className="tech-pill">
                <div style={{ width:6, height:6, borderRadius:'50%', background:color, flexShrink:0, boxShadow:`0 0 6px ${color}80` }}/>
                {name}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────── */
function CTA() {
  return (
    <section id="cta" style={{ padding:'120px 0', background:'linear-gradient(180deg,#FAFAF8,#F7F5FF)', position:'relative' }}>
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px' }}>
        <Reveal>
          <div style={{ borderRadius:28, padding:'90px 40px', position:'relative', overflow:'hidden', border:'1px solid rgba(91,63,232,.18)', textAlign:'center',
            background:'linear-gradient(135deg, rgba(91,63,232,.06) 0%, rgba(247,245,255,1) 40%, rgba(255,253,248,1) 100%)',
            boxShadow:'0 16px 64px rgba(91,63,232,.1), 0 4px 16px rgba(0,0,0,.04)' }}>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(91,63,232,.1),transparent 70%)', pointerEvents:'none' }}/>

            {/* Floating logo */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:28, position:'relative', zIndex:1 }}>
              <img src="/logo.png" alt="CoWriteX" className="hero-logo" style={{ width:64, height:64, objectFit:'contain' }}/>
            </div>

            <div style={{ display:'flex', justifyContent:'center', position:'relative', zIndex:1 }}><div className="section-label" style={{ marginBottom:16 }}>Get Started Today</div></div>
            <h2 className="font-syne" style={{ fontSize:'clamp(2rem,5vw,3.6rem)', fontWeight:800, letterSpacing:'-.04em', lineHeight:1.08, marginBottom:20, color:'#1A1033', position:'relative', zIndex:1 }}>
              Start writing smarter.<br/><span className="grad-text">Stay in control.</span>
            </h2>
            <p style={{ fontSize:16, color:'#6B5FA0', fontWeight:300, maxWidth:480, margin:'0 auto 40px', lineHeight:1.75, position:'relative', zIndex:1 }}>
              Join researchers who write better, faster, and more accurately with CoWriteX.
            </p>
            <div className="cta-btns" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:1 }}>
              <a href="auth/signup" className="grad-btn" style={{ padding:'15px 36px', borderRadius:13, color:'white', fontSize:16, fontWeight:500, textDecoration:'none', transition:'all .25s', display:'inline-block' }}>Sign Up Free</a>
              <a href="auth/login" style={{ padding:'15px 36px', borderRadius:13, border:'1px solid rgba(91,63,232,.25)', color:'#5B3FE8', background:'rgba(91,63,232,.06)', fontSize:16, textDecoration:'none', transition:'all .2s', display:'inline-block', fontWeight:500 }}
                onMouseOver={e => { e.currentTarget.style.background='rgba(91,63,232,.12)'; e.currentTarget.style.borderColor='rgba(91,63,232,.4)'; }}
                onMouseOut={e => { e.currentTarget.style.background='rgba(91,63,232,.06)'; e.currentTarget.style.borderColor='rgba(91,63,232,.25)'; }}
              >Login to Dashboard</a>
            </div>
            <p style={{ marginTop:22, fontSize:13, color:'#C4BAE0', position:'relative', zIndex:1 }}>No credit card required · Academic institution accounts available</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop:'1px solid rgba(91,63,232,.1)', padding:'40px 0', background:'#FAFAF8' }}>
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <img src="/logo.png" alt="CoWriteX" style={{ width:28, height:28, objectFit:'contain', filter:'drop-shadow(0 2px 6px rgba(91,63,232,.3))' }}/>
            <span style={{ fontFamily:'Syne, sans-serif', fontSize:'1.1rem', fontWeight:800, color:'#1A1033', letterSpacing:'-.02em' }}>
              Co<span style={{ color:'#5B3FE8' }}>Write</span>X
            </span>
          </div>
          <div style={{ fontSize:13, color:'#C4BAE0' }}>Write Together. Think Further.</div>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          {['Privacy','Terms','GitHub','Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize:13, color:'#C4BAE0', textDecoration:'none', transition:'color .2s' }}
              onMouseOver={e => e.currentTarget.style.color='#5B3FE8'}
              onMouseOut={e => e.currentTarget.style.color='#C4BAE0'}
            >{l}</a>
          ))}
        </div>
        <div style={{ fontSize:13, color:'#C4BAE0' }}>© 2025–2026 CoWriteX · ENSIA Project</div>
      </div>
    </footer>
  );
}

/* ─── PAGE ROOT ──────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <GlobalStyles/>
      <Navbar/>
      <Hero/>
      <Features/>
      <HowItWorks/>
      <Impact/>
      <Tech/>
      <CTA/>
      <Footer/>
    </>
  );
}