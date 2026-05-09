'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES — Modern Clean Purple & Blue Only
═══════════════════════════════════════════════════════ */
const G = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    :root {
      /* ── Purple & Blue Palette Only ── */
      --ink: #0f0f1a;
      --ink-light: #1a1a2e;
      --ink-muted: #2d2d4a;

      --purple-50: #f5f3ff;
      --purple-100: #ede9fe;
      --purple-200: #ddd6fe;
      --purple-300: #c4b5fd;
      --purple-400: #a78bfa;
      --purple-500: #8b5cf6;
      --purple-600: #7c3aed;
      --purple-700: #6d28d9;
      --purple-800: #5b21b6;
      --purple-900: #4c1d95;

      --blue-50: #eff6ff;
      --blue-100: #dbeafe;
      --blue-200: #bfdbfe;
      --blue-300: #93c5fd;
      --blue-400: #60a5fa;
      --blue-500: #3b82f6;
      --blue-600: #2563eb;
      --blue-700: #1d4ed8;
      --blue-800: #1e40af;
      --blue-900: #1e3a8a;

      --brand: #6366f1;
      --brand-light: #818cf8;
      --brand-dark: #4f46e5;
      --brand-glow: rgba(99, 102, 241, 0.4);

      --surface: #ffffff;
      --surface-elevated: #fafaff;
      --surface-hover: #f5f3ff;

      --text-primary: #0f0f1a;
      --text-secondary: #4b4b6a;
      --text-tertiary: #7c7c9e;
      --text-inverse: #ffffff;

      --border: #e2e0f0;
      --border-light: #f0eff5;
      --border-focus: #6366f1;
    }

    body { cursor: none; font-family: var(--font-sora), system-ui, -apple-system, sans-serif; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--purple-300); border-radius: 99px; }

    .f-display { font-family: var(--font-sora), system-ui, sans-serif; }
    .f-mono { font-family: var(--font-jetbrains), 'SF Mono', monospace; }

    /* ── Gradients ── */
    .grad-text {
      background: linear-gradient(135deg, var(--purple-600) 0%, var(--blue-500) 50%, var(--brand) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .grad-text-blue {
      background: linear-gradient(135deg, var(--blue-600) 0%, var(--brand) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .grad-btn {
      background: linear-gradient(135deg, var(--purple-600), var(--brand));
      color: #fff;
      border: none;
      cursor: none;
      box-shadow: 0 4px 24px var(--brand-glow);
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .grad-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,.2), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .grad-btn:hover::before { opacity: 1; }
    .grad-btn:hover {
      box-shadow: 0 8px 40px var(--brand-glow);
      transform: translateY(-2px);
    }
    .grad-btn:active { transform: translateY(0) scale(0.98); }

    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,.3);
      transform: scale(0);
      animation: ripple-anim 0.6s linear;
      pointer-events: none;
    }
    @keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }

    /* ── Cursor ── */
    #cwx-cursor {
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--brand);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
      transition: width 0.2s, height 0.2s, opacity 0.3s;
    }
    #cwx-cursor-ring {
      position: fixed;
      width: 36px;
      height: 36px;
      border: 1.5px solid var(--purple-400);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    /* ── Scroll Progress ── */
    #scroll-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      z-index: 1000;
      background: linear-gradient(90deg, var(--purple-500), var(--blue-500), var(--brand));
      transform-origin: left;
    }

    /* ── Mesh drift animations ── */
    @keyframes md1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,55px) scale(1.07)} 66%{transform:translate(28px,-28px) scale(.95)} }
    @keyframes md2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(48px,-38px) scale(1.05)} 66%{transform:translate(-18px,48px) scale(.97)} }
    @keyframes md3 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-28px,-48px) scale(1.04)} 66%{transform:translate(38px,18px) scale(1.02)} }

    /* ── Logo ── */
    @keyframes logo-lev { 0%,100%{transform:translateY(0) rotate(0deg)} 30%{transform:translateY(-13px) rotate(1.4deg)} 70%{transform:translateY(-6px) rotate(-.7deg)} }
    @keyframes halo-p { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.12;transform:scale(1.22)} }
    @keyframes orbit-cw { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes orbit-ccw { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
    @keyframes orb-dot { 0%,100%{box-shadow:0 0 0 0 var(--brand-glow)} 70%{box-shadow:0 0 0 8px rgba(99,102,241,0)} }

    /* ── Reveal animations ── */
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal.show { opacity: 1; transform: translateY(0); }
    .rev-l {
      opacity: 0;
      transform: translateX(-24px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .rev-l.show { opacity: 1; transform: translateX(0); }
    .rev-s {
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .rev-s.show { opacity: 1; transform: scale(1); }

    /* ── Typing cursor ── */
    .cursor-blink {
      display: inline-block;
      width: 3px;
      height: 0.82em;
      background: var(--brand);
      border-radius: 2px;
      margin-left: 3px;
      vertical-align: middle;
      animation: blink 0.85s step-end infinite;
    }
    @keyframes blink { 50% { opacity: 0 } }

    /* ── Badge float ── */
    @keyframes bf { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    .badge-float { animation: bf 3.5s ease-in-out infinite; }

    /* ── Pulse dot ── */
    @keyframes pr { 0%{box-shadow:0 0 0 0 var(--brand-glow)} 70%{box-shadow:0 0 0 8px rgba(99,102,241,0)} 100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} }
    .pulse-dot { animation: pr 2s ease-in-out infinite; }

    /* ── Scroll arrow ── */
    .scroll-arrow {
      display: block;
      width: 1px;
      height: 40px;
      background: linear-gradient(to bottom, var(--brand), transparent);
      margin: 0 auto;
      animation: sa 2s ease-in-out infinite;
    }
    @keyframes sa { 0%,100%{opacity:.3;transform:scaleY(.8)} 50%{opacity:1;transform:scaleY(1.1)} }

    /* ── Section label ── */
    .section-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--purple-50);
      border: 1px solid var(--purple-200);
      color: var(--purple-600);
      border-radius: 99px;
      padding: 6px 18px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-family: var(--font-jetbrains), monospace;
      margin-bottom: 20px;
    }

    /* ── Shimmer ── */
    @keyframes sh { from{background-position:-600px 0} to{background-position:600px 0} }
    .shimmer {
      background: linear-gradient(90deg, var(--purple-50) 25%, rgba(99,102,241,0.15) 50%, var(--purple-50) 75%);
      background-size: 600px 100%;
      animation: sh 2s linear infinite;
    }

    /* ── Feature card ── */
    .feat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px 28px;
      box-shadow: 0 1px 3px rgba(15, 15, 26, 0.04), 0 1px 2px rgba(15, 15, 26, 0.02);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
      cursor: none;
    }
    .feat-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(99, 102, 241, 0.04), transparent 40%);
      opacity: 0;
      transition: opacity 0.4s;
    }
    .feat-card:hover::after { opacity: 1; }
    .feat-card:hover {
      box-shadow: 0 20px 60px rgba(99, 102, 241, 0.1), 0 4px 20px rgba(15, 15, 26, 0.04);
      border-color: var(--purple-300);
      transform: translateY(-4px);
    }

    /* ── Animated glow border ── */
    @keyframes gbt { 0%{background-position:0 0} 100%{background-position:400% 0} }
    .glow-border { position: relative; }
    .glow-border::before {
      content: '';
      position: absolute;
      inset: -1.5px;
      border-radius: 24px;
      padding: 1.5px;
      background: linear-gradient(90deg, var(--purple-500), var(--blue-500), var(--brand), var(--purple-600), var(--purple-500));
      background-size: 400%;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: gbt 4s linear infinite;
      z-index: 0;
    }

    /* ── Stat number ── */
    .stat-num {
      font-family: var(--font-sora), system-ui, sans-serif;
      font-size: 3.2rem;
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      background: linear-gradient(135deg, var(--purple-600), var(--blue-500));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    /* ── Tech pill ── */
    .tech-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 99px;
      padding: 8px 16px;
      font-size: 12px;
      font-family: var(--font-jetbrains), monospace;
      color: var(--text-secondary);
      box-shadow: 0 1px 3px rgba(15, 15, 26, 0.04);
      transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
      cursor: none;
    }
    .tech-pill:hover {
      border-color: var(--purple-300);
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
      color: var(--purple-600);
    }

    /* ── Nav ── */
    .nav-scrolled {
      background: rgba(255, 255, 255, 0.92) !important;
      backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid var(--border) !important;
      box-shadow: 0 4px 32px rgba(99, 102, 241, 0.06) !important;
    }

    /* ── Mockup ── */
    .mockup-card {
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 8px 40px rgba(99, 102, 241, 0.08);
    }
    .mockup-enter { animation: mo 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes mo { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:none} }

    /* ── Noise overlay ── */
    .noise::after {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.012;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    }

    /* ── Stagger ── */
    .stagger > * { opacity: 0; transform: translateY(16px); animation: stg 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .stagger > *:nth-child(1){animation-delay:.08s}
    .stagger > *:nth-child(2){animation-delay:.18s}
    .stagger > *:nth-child(3){animation-delay:.28s}
    .stagger > *:nth-child(4){animation-delay:.38s}
    @keyframes stg { to{opacity:1;transform:translateY(0)} }

    /* ── Grid bg ── */
    .grid-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
    }

    /* ── Anim underline ── */
    .anim-u { position: relative; display: inline-block; }
    .anim-u::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1.5px;
      background: linear-gradient(90deg, var(--purple-500), var(--blue-500));
      border-radius: 99px;
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .anim-u:hover::after { width: 100%; }

    /* ── Line anim ── */
    @keyframes lg { from{transform:scaleX(0)} to{transform:scaleX(1)} }
    .line-grow { animation: lg 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }

    /* ── Marquee ── */
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .marquee-track { display: flex; width: max-content; animation: marquee 32s linear infinite; }

    /* ── Tilt ── */
    .tilt-card { transition: transform 0.1s ease; transform-style: preserve-3d; }

    /* ── Dark mode overrides ── */
    .dark .nav-scrolled { background: rgba(15, 15, 26, 0.92) !important; }
    .dark .feat-card { background: var(--ink-light); border-color: var(--ink-muted); }
    .dark .mockup-card { background: var(--ink-light); }
    .dark .tech-pill { background: var(--ink-light); }

    /* ── Responsive ── */
    @media(max-width:900px){
      .features-grid{grid-template-columns:1fr 1fr !important}
      .how-grid{grid-template-columns:1fr !important}
      .stats-grid{grid-template-columns:1fr 1fr !important}
      .how-visual{display:none !important}
    }
    @media(max-width:600px){
      .features-grid{grid-template-columns:1fr !important}
      .stats-grid{grid-template-columns:1fr !important}
      .hero-cta-wrap{flex-direction:column !important;align-items:center !important}
      .nav-links-wrap{display:none !important}
    }
  `}</style>
);

/* ─── DATA ─────────────────────────────────────────── */
const FEATURES = [
  { num:'01', col:'var(--purple-50)', stroke:'var(--purple-600)', label:'Writing', title:'AI Writing Assistant', desc:'Generate, rephrase, expand, or improve any section with academic tone enforcement and full document context awareness.', icon:'✦' },
  { num:'02', col:'var(--blue-50)', stroke:'var(--blue-600)', label:'Search',  title:'Smart Literature Search', desc:'Multi-source retrieval from Semantic Scholar, arXiv & CrossRef. Relevance-ranked with semantic similarity and citation scoring.', icon:'◎' },
  { num:'03', col:'var(--purple-100)', stroke:'var(--purple-700)', label:'Citations', title:'Citation Manager', desc:'Upload PDFs and the Literature Agent embeds and validates every reference. Zero hallucinated citations, only verified entries.', icon:'❝' },
  { num:'04', col:'var(--blue-100)', stroke:'var(--blue-700)', label:'Structure', title:'IMRAD Structure Builder', desc:'Section-aware generation enforces Introduction, Methods, Results, Discussion with coherent cross-section narrative flow.', icon:'▦' },
  { num:'05', col:'var(--purple-50)', stroke:'var(--brand)', label:'Control',  title:'Human-in-the-Loop Editing', desc:'Every AI output pauses for your review. Accept, modify, or reject with side-by-side diff view and full audit history.', icon:'⟲' },
  { num:'06', col:'var(--blue-50)', stroke:'var(--blue-500)', label:'Visual',   title:'Data Visualization', desc:'Auto-generate charts, heatmaps, and Mermaid diagrams from CSVs or PDFs. Export PNG, PDF, or LaTeX publication-ready.', icon:'◈' },
];

const STEPS = [
  { num:'01', title:'Upload & Start Writing',
    desc:'Import reference PDFs, set writing preferences, and open the structured editor. Start anywhere — IMRAD or custom format.',
    mockup: (
      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{background:'var(--purple-50)',borderBottom:'1px solid var(--purple-200)',padding:'10px 16px',display:'flex',alignItems:'center',gap:6}}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}
          <span style={{fontSize:11,color:'var(--text-tertiary)',marginLeft:8,fontFamily:'JetBrains Mono'}}>New Document · IMRAD Template</span>
        </div>
        <div style={{padding:18,flex:1,display:'flex',flexDirection:'column',gap:9}}>
          <div style={{fontSize:11,color:'var(--purple-600)',fontFamily:'JetBrains Mono',marginBottom:3,fontWeight:500}}>§ Introduction</div>
          {[100,78,100,52].map((w,i)=><div key={i} className="shimmer" style={{height:8,borderRadius:4,width:w+'%'}}/>)}
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,padding:'7px 11px',background:'var(--blue-50)',border:'1px solid var(--blue-200)',borderRadius:8}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'var(--blue-500)'}}/>
            <span style={{fontSize:11,color:'var(--blue-600)',fontFamily:'JetBrains Mono'}}>3 PDFs indexed ✓</span>
          </div>
          <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>
          <div style={{fontSize:11,color:'var(--purple-600)',fontFamily:'JetBrains Mono',marginBottom:3,fontWeight:500}}>§ Methodology</div>
          {[100,58].map((w,i)=><div key={i} className="shimmer" style={{height:8,borderRadius:4,width:w+'%'}}/>)}
        </div>
      </div>
    ),
  },
  { num:'02', title:'AI Assists, You Decide',
    desc:'Select any text and request improvements grounded in your uploaded literature. Accept, modify, or reject every suggestion.',
    mockup: (
      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{background:'var(--purple-50)',borderBottom:'1px solid var(--purple-200)',padding:'10px 16px',display:'flex',alignItems:'center',gap:6}}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}
          <span style={{fontSize:11,color:'var(--text-tertiary)',marginLeft:8,fontFamily:'JetBrains Mono'}}>Writing Agent · Suggestion</span>
        </div>
        <div style={{padding:18,flex:1,display:'flex',flexDirection:'column',gap:9}}>
          <div style={{fontSize:10,color:'var(--text-tertiary)',fontFamily:'JetBrains Mono',marginBottom:1}}>Original</div>
          {[100,68].map((w,i)=><div key={i} style={{height:8,borderRadius:4,background:'var(--purple-100)',width:w+'%'}}/>)}
          <div style={{borderLeft:'3px solid var(--brand)',paddingLeft:11,marginTop:3,padding:'10px 11px',background:'var(--purple-50)',borderRadius:'0 10px 10px 0'}}>
            <div style={{fontSize:10,color:'var(--brand)',marginBottom:7,fontFamily:'JetBrains Mono',fontWeight:500}}>✦ AI Suggestion</div>
            {[100,88,58].map((w,i)=><div key={i} style={{height:8,borderRadius:4,background:'var(--purple-200)',width:w+'%',marginBottom:5}}/>)}
          </div>
          <div style={{display:'flex',gap:7,marginTop:3,flexWrap:'wrap'}}>
            {[['✓ Accept','var(--blue-50)','var(--blue-300)','var(--blue-600)'],['✎ Edit','var(--purple-50)','var(--purple-300)','var(--purple-600)'],['✕ Reject','var(--purple-50)','var(--purple-300)','var(--purple-700)']].map(([l,bg,b,c])=>(
              <div key={l} style={{padding:'6px 11px',background:bg,border:`1px solid ${b}`,borderRadius:7,fontSize:11,color:c,fontWeight:600,cursor:'none',fontFamily:'JetBrains Mono'}}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  { num:'03', title:'Review, Refine & Export',
    desc:'Full version history with one-click rollback. Export to PDF or LaTeX with citation formatting and embedded figures.',
    mockup: (
      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{background:'var(--purple-50)',borderBottom:'1px solid var(--purple-200)',padding:'10px 16px',display:'flex',alignItems:'center',gap:6}}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}
          <span style={{fontSize:11,color:'var(--text-tertiary)',marginLeft:8,fontFamily:'JetBrains Mono'}}>Export · Version 3 of 3</span>
        </div>
        <div style={{padding:18,flex:1,display:'flex',flexDirection:'column',gap:9}}>
          {[['✓ Structure: 100% IMRAD compliant','var(--blue-50)','var(--blue-300)','var(--blue-600)'],['↗ Citations: 14 of 14 verified','var(--purple-50)','var(--purple-300)','var(--purple-600)']].map(([l,bg,b,c])=>(
            <div key={l} style={{padding:'8px 13px',background:bg,border:`1px solid ${b}`,borderRadius:9,fontSize:12,color:c,fontWeight:500,fontFamily:'JetBrains Mono'}}>{l}</div>
          ))}
          <div style={{height:1,background:'var(--border)',margin:'2px 0'}}/>
          {[100,72].map((w,i)=><div key={i} style={{height:8,borderRadius:4,background:'var(--purple-100)',width:w+'%'}}/>)}
          <div style={{display:'flex',gap:8,marginTop:6}}>
            {[['↓ Export PDF','var(--purple-600)',true],['↓ LaTeX','var(--text-tertiary)',false]].map(([l,c,primary])=>(
              <div key={String(l)} style={{padding:'8px 14px',background:primary?'var(--purple-50)':'var(--surface-elevated)',border:`1px solid ${primary?'var(--purple-300)':'var(--border)'}`,borderRadius:8,fontSize:11,color:String(c),fontFamily:'JetBrains Mono',cursor:'none',fontWeight:500}}>{String(l)}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

const STATS = [
  { val:'70',   suffix:'%',  label:'Reduction in writing time', sub:'vs. unaided researchers' },
  { val:'Zero', suffix:'',   label:'Hallucinated citations', sub:'library-locked mode' },
  { val:'100',  suffix:'%',  label:'IMRAD compliance', sub:'structural enforcement' },
  { val:'280',  suffix:'ms', label:'Avg. suggestion latency', sub:'Groq-accelerated inference' },
];

const TECH: [string,string][] = [
  ['React 18','var(--purple-500)'],['TipTap Editor','var(--purple-500)'],['FastAPI','var(--blue-500)'],['LangGraph','var(--blue-500)'],
  ['LLaMA-3 / Groq','var(--purple-600)'],['Kimi K2','var(--purple-600)'],['ChromaDB','var(--blue-400)'],['FAISS','var(--blue-400)'],
  ['PostgreSQL','var(--purple-700)'],['Supabase','var(--purple-700)'],['Semantic Scholar','var(--blue-600)'],['arXiv API','var(--blue-600)'],
  ['Sentence Transformers','var(--blue-500)'],['Matplotlib','var(--purple-400)'],['Mermaid.js','var(--blue-600)'],['PyMuPDF','var(--purple-500)'],
];

const MARQUEE_ITEMS = ['AI Research Writing','Literature Review','Citation Manager','IMRAD Structure','Human-in-the-Loop','Vector Search','Version History','LaTeX Export','PDF Analysis','Semantic Scholar'];

/* ─── HOOKS ─────────────────────────────────────────── */
function useIntersection(ref: React.RefObject<HTMLElement | null>, opts?: IntersectionObserverInit) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, opts);
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return v;
}

function Reveal({ children, delay=0, type='reveal', style={}, className='' }: {
  children:React.ReactNode; delay?:number; type?:'reveal'|'rev-l'|'rev-s'; style?:React.CSSProperties; className?:string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useIntersection(ref, { threshold:0.08 });
  return <div ref={ref} className={`${type}${v?' show':''} ${className}`} style={{transitionDelay:`${delay}s`,...style}}>{children}</div>;
}

/* ─── ANIMATED COUNTER ───────────────────────────────── */
function Counter({ target, suffix='' }: { target:string; suffix?:string }) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useIntersection(ref, { threshold:0.5 });
  const [n, setN] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!v || started.current) return;
    if (isNaN(Number(target))) return;
    started.current = true;
    const num = Number(target), dur = 1800;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / dur, 1);
      setN(Math.floor((1 - Math.pow(1-p, 4)) * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [v]);
  return <div ref={ref} className="stat-num">{isNaN(Number(target)) ? target : n}{isNaN(Number(target))?'':suffix}</div>;
}

/* ─── CURSOR ─────────────────────────────────────────── */
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const cur = useRef({x:0,y:0});
  const rng = useRef({x:0,y:0});
  useEffect(() => {
    const move = (e: MouseEvent) => {
      cur.current = {x:e.clientX,y:e.clientY};
      if (dot.current) { dot.current.style.left=e.clientX+'px'; dot.current.style.top=e.clientY+'px'; }
    };
    const tick = () => {
      rng.current.x += (cur.current.x - rng.current.x) * .11;
      rng.current.y += (cur.current.y - rng.current.y) * .11;
      if (ring.current) { ring.current.style.left=rng.current.x+'px'; ring.current.style.top=rng.current.y+'px'; }
      requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', move);
    requestAnimationFrame(tick);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <>
      <div id="cwx-cursor" ref={dot}/>
      <div id="cwx-cursor-ring" ref={ring}/>
    </>
  );
}

/* ─── SCROLL BAR ─────────────────────────────────────── */
function ScrollBar() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = () => {
      const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    window.addEventListener('scroll', fn, {passive:true});
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return <div id="scroll-bar" ref={bar} style={{width:'100%'}}/>;
}

/* ─── PARTICLE CANVAS ────────────────────────────────── */
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const COLS = ['rgba(99,102,241,', 'rgba(139,92,246,', 'rgba(59,130,246,', 'rgba(124,58,237,'];
    let W=0,H=0,raf=0;
    const pts = Array.from({length:40},()=>({
      x:Math.random()*2000, y:Math.random()*1200,
      vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2,
      r:Math.random()*1.5+.3,
      col:COLS[Math.floor(Math.random()*COLS.length)],
      a:Math.random()*.12+.04,
    }));
    const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;};
    resize(); window.addEventListener('resize',resize);
    const frame=()=>{
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.col+p.a+')';ctx.fill();
      });
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(99,102,241,${.04*(1-d/100)})`;ctx.lineWidth=.4;ctx.stroke();}
      }
      raf=requestAnimationFrame(frame);
    };
    frame();
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  },[]);
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>;
}

/* ─── RIPPLE HELPER ──────────────────────────────────── */
function ripple(e: React.MouseEvent<HTMLAnchorElement>) {
  const b = e.currentTarget, r = b.getBoundingClientRect();
  const s = Math.max(r.width,r.height), el = document.createElement('span');
  el.className='ripple';
  el.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px;`;
  b.appendChild(el); setTimeout(()=>el.remove(),700);
}

/* ─── TILT CARD ──────────────────────────────────────── */
function TiltCard({ children, style={}, className='' }: {children:React.ReactNode;style?:React.CSSProperties;className?:string}) {
  const ref = useRef<HTMLDivElement>(null);
  const mm = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el=ref.current; if(!el) return;
    const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    el.style.transform=`perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg) scale(1.01)`;
    el.style.setProperty('--mx',`${(e.clientX-r.left)/r.width*100}%`);
    el.style.setProperty('--my',`${(e.clientY-r.top)/r.height*100}%`);
  },[]);
  const ml = useCallback(()=>{ const el=ref.current; if(el) el.style.transform=''; },[]);
  return <div ref={ref} onMouseMove={mm} onMouseLeave={ml} className={`feat-card tilt-card ${className}`} style={style}>{children}</div>;
}

/* ─── NAVBAR ─────────────────────────────────────────── */
function Navbar() {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const fn=()=>setSc(window.scrollY>40);
    window.addEventListener('scroll',fn,{passive:true});
    return ()=>window.removeEventListener('scroll',fn);
  },[]);
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'14px 0',transition:'all .4s cubic-bezier(.16,1,.3,1)'}} className={sc?'nav-scrolled':''}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="" style={{display:'flex',alignItems:'center',gap:11,textDecoration:'none',cursor:'none'}}>
          <div style={{position:'relative',width:52,height:52}}>
            <div style={{position:'absolute',inset:-3,borderRadius:'50%',background:'rgba(99,102,241,.12)',animation:'halo-p 3s ease-in-out infinite'}}/>
            <img src="/logo.png" alt="CoWriteX" style={{width:52,height:52,objectFit:'contain',filter:'drop-shadow(0 3px 12px rgba(99,102,241,.3))',position:'relative',zIndex:1,transition:'filter .3s'}}
              onMouseOver={e=>e.currentTarget.style.filter='drop-shadow(0 5px 20px rgba(99,102,241,.5))'}
              onMouseOut={e=>e.currentTarget.style.filter='drop-shadow(0 3px 12px rgba(99,102,241,.3))'}/>
          </div>
          <span className="f-display" style={{fontSize:'1.35rem',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-.03em'}}>
            Co<span style={{color:'var(--brand)'}}>Write</span>X
          </span>
        </a>
        <div className="nav-links-wrap" style={{display:'flex',alignItems:'center',gap:32}}>
          {[['Features','#features'],['How It Works','#how-it-works'],['Impact','#impact'],['Tech','#tech']].map(([l,h])=>(
            <a key={l} href={h} className="anim-u" style={{color:'var(--text-secondary)',textDecoration:'none',fontSize:13,fontWeight:500,cursor:'none',transition:'color .2s'}}
              onMouseOver={e=>e.currentTarget.style.color='var(--text-primary)'}
              onMouseOut={e=>e.currentTarget.style.color='var(--text-secondary)'}
            >{l}</a>
          ))}
        </div>
        <div style={{display:'flex',gap:10}}>
          <a href="auth/login" style={{padding:'9px 20px',borderRadius:10,border:'1px solid var(--border)',color:'var(--text-secondary)',fontSize:13,textDecoration:'none',background:'transparent',fontWeight:500,cursor:'none',transition:'all .25s'}}
            onMouseOver={e=>{e.currentTarget.style.background='var(--purple-50)';e.currentTarget.style.borderColor='var(--purple-300)';e.currentTarget.style.color='var(--purple-600)';}}
            onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}>Login</a>
          <a href="auth/signup" className="grad-btn" onClick={ripple} style={{padding:'9px 22px',borderRadius:10,color:'white',fontSize:13,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6,fontWeight:500}}>
            Sign Up Free
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── HERO ───────────────────────────────────────────── */
function Hero() {
  const phrases = ['Faster with AI','Without Hallucinations','With Full Control','That Keeps You in Charge'];
  const [typed, setTyped] = useState(phrases[0]);
  const parallax = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let pi=0,ci=phrases[0].length,del=false,t:ReturnType<typeof setTimeout>;
    function tick(){
      const ph=phrases[pi];
      if(!del){setTyped(ph.slice(0,ci+1));ci++;if(ci>=ph.length){del=true;t=setTimeout(tick,2400);return;}}
      else{setTyped(ph.slice(0,ci-1));ci--;if(ci<=0){del=false;pi=(pi+1)%phrases.length;}}
      t=setTimeout(tick,del?38:78);
    }
    t=setTimeout(tick,1800);
    return ()=>clearTimeout(t);
  },[]);

  useEffect(() => {
    const fn=()=>{ if(parallax.current) parallax.current.style.transform=`translateY(${window.scrollY*.14}px)`; };
    window.addEventListener('scroll',fn,{passive:true});
    return ()=>window.removeEventListener('scroll',fn);
  },[]);

  return (
    <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'160px 24px 100px',position:'relative',overflow:'hidden',
      background:'linear-gradient(155deg, #ffffff 0%, var(--purple-50) 25%, var(--blue-50) 55%, #ffffff 100%)'}}>
      <Particles/>
      <div className="grid-bg"/>

      <div ref={parallax} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        {[
          {w:720,h:520,t:-110,l:-160,c:'radial-gradient(ellipse,rgba(99,102,241,.08),transparent 70%)',d:'18s',an:'md1'},
          {w:520,h:420,t:100, r:-90, c:'radial-gradient(ellipse,rgba(139,92,246,.06),transparent 70%)',d:'14s',an:'md2'},
          {w:420,h:420,b:-90, l:'22%',c:'radial-gradient(ellipse,rgba(59,130,246,.05),transparent 70%)',d:'12s',an:'md3'},
          {w:360,h:360,t:'38%',r:'12%',c:'radial-gradient(ellipse,rgba(124,58,237,.04),transparent 70%)',d:'16s',an:'md1'},
        ].map((o:any,i)=>(
          <div key={i} style={{position:'absolute',width:o.w,height:o.h,background:o.c,filter:'blur(72px)',animation:`${o.an} ${o.d} ease-in-out infinite`,animationDelay:`${i*-3}s`,top:o.t,left:o.l,right:o.r,bottom:o.b}}/>
        ))}
        {[340,460,580].map((s,i)=>(
          <div key={s} style={{position:'absolute',width:s,height:s,borderRadius:'50%',border:`1px solid rgba(99,102,241,${.04-i*.01})`,top:'50%',left:'50%',transform:'translate(-50%,-52%)',animation:`orbit-cw ${22+i*7}s linear infinite`}}/>
        ))}
      </div>

      <div style={{position:'relative',zIndex:2,maxWidth:940,margin:'0 auto',display:'flex',flexDirection:'column',alignItems:'center'}}>

        <div className="badge-float" style={{display:'inline-flex',alignItems:'center',gap:8,background:'var(--purple-50)',border:'1px solid var(--purple-200)',borderRadius:99,padding:'6px 18px',fontSize:12,color:'var(--purple-600)',fontWeight:600,letterSpacing:'.05em',marginBottom:36,fontFamily:'JetBrains Mono'}}>
          <div className="pulse-dot" style={{width:6,height:6,borderRadius:'50%',background:'var(--brand)'}}/>
          Human-in-the-Loop AI · Research Writing Platform
        </div>

        <div className="stagger" style={{marginBottom:8}}>
          <h1 className="f-display" style={{fontSize:'clamp(3.2rem,8.5vw,6.5rem)',fontWeight:700,lineHeight:.95,letterSpacing:'-.04em',color:'var(--text-primary)'}}>
            Write Research Papers
          </h1>
          <h1 className="f-display" style={{fontSize:'clamp(3.2rem,8.5vw,6.5rem)',fontWeight:700,lineHeight:.95,letterSpacing:'-.04em'}}>
            <span className="grad-text">{typed}</span><span className="cursor-blink"/>
          </h1>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12,margin:'26px 0 22px'}}>
          <div className="line-grow" style={{width:48,height:1.5,background:'linear-gradient(90deg,transparent,var(--brand))',transformOrigin:'right'}}/>
          <div style={{width:6,height:6,borderRadius:'50%',background:'var(--blue-400)',boxShadow:'0 0 10px var(--blue-400)'}}/>
          <div className="line-grow" style={{width:48,height:1.5,background:'linear-gradient(90deg,var(--brand),transparent)'}}/>
        </div>

        <p style={{fontSize:'clamp(1rem,2vw,1.15rem)',color:'var(--text-secondary)',fontWeight:300,maxWidth:560,margin:'0 auto 50px',lineHeight:1.82}}>
          CoWriteX keeps you in full control — AI suggests, you decide. Literature, citations, structure, and visualizations. All unified.
        </p>

        <div className="hero-cta-wrap" style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:64}}>
          <a href="auth/signup" className="grad-btn" onClick={ripple}
            style={{padding:'17px 38px',borderRadius:14,color:'white',fontSize:15,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:10,letterSpacing:'.01em'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Start Writing Free
          </a>
          <a href="#how-it-works" style={{padding:'17px 38px',borderRadius:14,border:'1px solid var(--border)',color:'var(--text-secondary)',background:'var(--surface)',fontSize:15,textDecoration:'none',transition:'all .3s',display:'inline-flex',alignItems:'center',gap:8,fontWeight:500,cursor:'none'}}
            onMouseOver={e=>{e.currentTarget.style.background='var(--purple-50)';e.currentTarget.style.borderColor='var(--purple-300)';e.currentTarget.style.color='var(--purple-600)';e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseOut={e=>{e.currentTarget.style.background='var(--surface)';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';e.currentTarget.style.transform='';}}
          >
            See How It Works
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:20,color:'var(--text-tertiary)',fontSize:13,flexWrap:'wrap',justifyContent:'center'}}>
          <div style={{display:'flex'}}>
            {['var(--purple-500)','var(--blue-500)','var(--purple-600)','var(--blue-600)','var(--brand)'].map((c,i)=>(
              <div key={c} style={{width:30,height:30,borderRadius:'50%',background:c,border:'2.5px solid var(--surface)',marginLeft:i>0?-9:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'white',fontWeight:700,boxShadow:'0 2px 8px rgba(15,15,26,.1)'}}>
                {['A','B','C','D','E'][i]}
              </div>
            ))}
          </div>
          <span>Trusted by <strong style={{color:'var(--text-primary)',fontWeight:600}}>1,200+</strong> researchers</span>
          <div style={{height:18,width:1,background:'var(--border)'}}/>
          <div style={{display:'flex',gap:2}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:'var(--blue-400)',fontSize:15}}>★</span>)}</div>
          <span>4.9 / 5</span>
        </div>
      </div>

      <div style={{position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:10,color:'var(--text-tertiary)',fontSize:10,letterSpacing:'.14em',zIndex:2}}>
        SCROLL<span className="scroll-arrow"/>
      </div>
    </section>
  );
}

/* ─── MARQUEE ────────────────────────────────────────── */
function MarqueeBand() {
  return (
    <div style={{overflow:'hidden',background:'linear-gradient(90deg, var(--purple-600), var(--brand), var(--blue-600))',padding:'14px 0',position:'relative',zIndex:2}}>
      <div className="marquee-track">
        {[...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((item,i)=>(
          <span key={i} style={{display:'inline-flex',alignItems:'center',gap:20,padding:'0 28px',fontSize:11,color:'rgba(255,255,255,.75)',fontFamily:'JetBrains Mono',whiteSpace:'nowrap',letterSpacing:'.08em',textTransform:'uppercase'}}>
            {item}<span style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,.3)',display:'inline-block'}}/>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURES ───────────────────────────────────────── */
function Features() {
  return (
    <section id="features" style={{padding:'130px 0',background:'var(--surface)',position:'relative'}}>
      <svg style={{position:'absolute',top:0,left:0,width:'100%'}} viewBox="0 0 1440 70" preserveAspectRatio="none" fill="var(--surface)">
        <path d="M0 70V35Q360 0 720 35Q1080 70 1440 35V70Z"/>
      </svg>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px'}}>
        <Reveal style={{textAlign:'center',marginBottom:76}}>
          <div style={{display:'flex',justifyContent:'center'}}><div className="section-label">Features</div></div>
          <h2 className="f-display" style={{fontSize:'clamp(2.4rem,5.5vw,4rem)',fontWeight:700,letterSpacing:'-.03em',color:'var(--text-primary)',lineHeight:1.05,marginBottom:16}}>
            Everything researchers need,<br/>nothing they don't
          </h2>
          <p style={{fontSize:16,color:'var(--text-secondary)',fontWeight:300,maxWidth:500,margin:'0 auto',lineHeight:1.82}}>
            Six specialized AI agents collaborate so you focus on ideas, not infrastructure.
          </p>
        </Reveal>
        <div className="features-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:22}}>
          {FEATURES.map((f,i)=>(
            <Reveal key={f.num} delay={(i%3)*.1} type="rev-s">
              <TiltCard style={{height:'100%'}}>
                <div style={{position:'absolute',top:0,right:0,width:90,height:90,background:`radial-gradient(circle at top right,${f.col},transparent 75%)`,borderRadius:'0 20px',pointerEvents:'none'}}/>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
                  <div style={{width:48,height:48,borderRadius:14,background:f.col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:f.stroke,border:`1px solid ${f.stroke}22`}}>{f.icon}</div>
                  <span className="f-mono" style={{fontSize:11,color:'var(--text-tertiary)',fontWeight:500,paddingTop:4}}>{f.num}</span>
                </div>
                <div style={{display:'inline-block',background:f.col,color:f.stroke,fontSize:10,fontWeight:600,padding:'3px 10px',borderRadius:99,letterSpacing:'.07em',textTransform:'uppercase',fontFamily:'JetBrains Mono',marginBottom:10}}>{f.label}</div>
                <div className="f-display" style={{fontSize:18,fontWeight:700,color:'var(--text-primary)',marginBottom:10,letterSpacing:'-.02em',lineHeight:1.2}}>{f.title}</div>
                <div style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.78,fontWeight:300}}>{f.desc}</div>
              </TiltCard>
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
    <section id="how-it-works" style={{padding:'120px 0',background:'linear-gradient(180deg,var(--surface),var(--purple-50))'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px'}}>
        <div className="how-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <Reveal type="rev-l"><div className="section-label">How It Works</div></Reveal>
            <Reveal type="rev-l" delay={.08}>
              <h2 className="f-display" style={{fontSize:'clamp(2.4rem,5.5vw,4rem)',fontWeight:700,letterSpacing:'-.03em',color:'var(--text-primary)',lineHeight:1.05,marginBottom:16}}>
                From blank page<br/>to publication-ready
              </h2>
            </Reveal>
            <Reveal type="rev-l" delay={.14}>
              <p style={{fontSize:15,color:'var(--text-secondary)',fontWeight:300,marginBottom:48,lineHeight:1.82}}>Three stages. Infinite refinement. You stay in control.</p>
            </Reveal>
            {STEPS.map((s,i)=>(
              <Reveal key={s.num} delay={i*.1} type="rev-l">
                <div onClick={()=>setActive(i)} style={{display:'flex',gap:18,padding:'22px 0',borderBottom:'1px solid var(--border)',cursor:'none',transition:'all .25s',...(i===0?{borderTop:'1px solid var(--border)'}:{})}}>
                  <div className="f-mono" style={{width:42,height:42,borderRadius:12,flexShrink:0,background:i===active?'var(--purple-50)':'var(--surface)',border:`1px solid ${i===active?'var(--purple-300)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:i===active?'var(--purple-600)':'var(--text-tertiary)',transition:'all .3s',boxShadow:i===active?'0 4px 16px rgba(99,102,241,.1)':'none'}}>
                    {s.num}
                  </div>
                  <div>
                    <div className="f-display" style={{fontSize:18,fontWeight:700,color:i===active?'var(--text-primary)':'var(--text-tertiary)',marginBottom:5,letterSpacing:'-.02em',transition:'color .3s'}}>{s.title}</div>
                    <div style={{fontSize:13,color:'var(--text-tertiary)',lineHeight:1.72,fontWeight:300,maxHeight:i===active?'80px':'0',overflow:'hidden',transition:'max-height .4s cubic-bezier(.16,1,.3,1), opacity .4s',opacity:i===active?1:0}}>{s.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="how-visual" style={{height:440}}>
            <Reveal type="rev-s">
              <div key={active} className="mockup-card mockup-enter" style={{height:440,overflow:'hidden',display:'flex',flexDirection:'column'}}>
                {STEPS[active].mockup}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── IMPACT ─────────────────────────────────────────── */
function Impact() {
  return (
    <section id="impact" style={{padding:'100px 0',background:'var(--purple-50)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px'}}>
        <Reveal>
          <div className="glow-border" style={{borderRadius:24}}>
            <div style={{position:'relative',borderRadius:24,background:'linear-gradient(135deg,var(--purple-50) 0%,var(--surface) 45%,var(--blue-50) 100%)',border:'1px solid var(--border)',padding:'72px 60px',textAlign:'center',overflow:'hidden',boxShadow:'0 24px 80px rgba(99,102,241,.08)'}}>
              <Particles/>
              <div style={{position:'absolute',top:-70,left:'50%',transform:'translateX(-50%)',width:560,height:220,background:'radial-gradient(ellipse,rgba(99,102,241,.08),transparent 70%)',pointerEvents:'none'}}/>
              <div style={{display:'flex',justifyContent:'center',position:'relative',zIndex:1}}><div className="section-label">Measured Impact</div></div>
              <h2 className="f-display" style={{fontSize:'clamp(2.2rem,5vw,3.4rem)',fontWeight:700,letterSpacing:'-.03em',color:'var(--text-primary)',lineHeight:1.05,position:'relative',zIndex:1}}>
                Numbers that speak for themselves
              </h2>
              <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,marginTop:56,position:'relative',zIndex:1}}>
                {STATS.map((s,i)=>(
                  <Reveal key={i} delay={i*.1}>
                    <div style={{padding:'24px 16px',background:'var(--surface)',borderRadius:18,border:'1px solid var(--border)',boxShadow:'0 4px 20px rgba(99,102,241,.06)'}}>
                      <Counter target={s.val} suffix={s.suffix}/>
                      <div style={{fontSize:13,color:'var(--text-primary)',lineHeight:1.5,fontWeight:600,marginBottom:5}}>{s.label}</div>
                      <div style={{fontSize:11,color:'var(--text-tertiary)',lineHeight:1.4,fontWeight:400,fontFamily:'JetBrains Mono'}}>{s.sub}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── TECH ───────────────────────────────────────────── */
function Tech() {
  return (
    <section id="tech" style={{padding:'100px 0',background:'linear-gradient(180deg,var(--purple-50),var(--surface))'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px'}}>
        <Reveal style={{marginBottom:52}}>
          <div className="section-label">Tech Stack</div>
          <h2 className="f-display" style={{fontSize:'clamp(2.4rem,5.5vw,4rem)',fontWeight:700,letterSpacing:'-.03em',color:'var(--text-primary)',lineHeight:1.05,marginBottom:14}}>
            Built on proven,<br/>modern infrastructure
          </h2>
          <p style={{fontSize:15,color:'var(--text-secondary)',fontWeight:300,lineHeight:1.8}}>Every layer chosen for reliability, speed, and academic rigor.</p>
        </Reveal>
        <Reveal delay={.1}>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {TECH.map(([name,color])=>(
              <div key={name} className="tech-pill">
                <div style={{width:7,height:7,borderRadius:'50%',background:color,flexShrink:0,boxShadow:`0 0 8px ${color}90`}}/>
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
    <section id="cta" style={{padding:'120px 0',background:'var(--surface)',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 60% at 50% 100%,rgba(99,102,241,.06),transparent)',pointerEvents:'none'}}/>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px'}}>
        <Reveal>
          <div style={{borderRadius:28,padding:'104px 52px',position:'relative',overflow:'hidden',border:'1px solid var(--purple-200)',textAlign:'center',
            background:'linear-gradient(145deg,var(--surface) 0%,var(--purple-50) 55%,var(--blue-50) 100%)',
            boxShadow:'0 40px 120px rgba(99,102,241,.1),0 8px 32px rgba(15,15,26,.04)'}}>
            <Particles/>
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:700,height:420,background:'radial-gradient(ellipse,rgba(99,102,241,.06),transparent 70%)',pointerEvents:'none'}}/>

            <div style={{display:'flex',justifyContent:'center',marginBottom:40,position:'relative',zIndex:1}}>
              <div style={{position:'relative',width:100,height:100}}>
                {[1,2].map(i=>(
                  <div key={i} style={{position:'absolute',inset:-(i*14),borderRadius:'50%',border:'1px dashed rgba(99,102,241,.15)',animation:i===1?'orbit-cw 9s linear infinite':'orbit-ccw 6s linear infinite'}}/>
                ))}
                <img src="/logo.png" alt="CoWriteX" style={{width:100,height:100,objectFit:'contain',animation:'logo-lev 5.5s ease-in-out infinite',filter:'drop-shadow(0 10px 28px rgba(99,102,241,.35))',position:'relative',zIndex:1}}/>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'center',position:'relative',zIndex:1}}><div className="section-label" style={{marginBottom:20}}>Get Started Today</div></div>
            <h2 className="f-display" style={{fontSize:'clamp(2.6rem,6.5vw,4.6rem)',fontWeight:700,letterSpacing:'-.04em',lineHeight:1,marginBottom:20,color:'var(--text-primary)',position:'relative',zIndex:1}}>
              Start writing smarter.<br/><span className="grad-text">Stay in control.</span>
            </h2>
            <p style={{fontSize:16,color:'var(--text-secondary)',fontWeight:300,maxWidth:460,margin:'0 auto 48px',lineHeight:1.82,position:'relative',zIndex:1}}>
              Join researchers who write better, faster, and more accurately with CoWriteX.
            </p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',position:'relative',zIndex:1}}>
              <a href="auth/signup" className="grad-btn" onClick={ripple}
                style={{padding:'17px 42px',borderRadius:14,color:'white',fontSize:15,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:9}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Sign Up Free
              </a>
              <a href="auth/login" style={{padding:'17px 42px',borderRadius:14,border:'1px solid var(--border)',color:'var(--text-secondary)',background:'var(--surface)',fontSize:15,textDecoration:'none',transition:'all .3s',display:'inline-flex',alignItems:'center',gap:8,fontWeight:500,cursor:'none'}}
                onMouseOver={e=>{e.currentTarget.style.background='var(--purple-50)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='var(--purple-300)';e.currentTarget.style.color='var(--purple-600)';}}
                onMouseOut={e=>{e.currentTarget.style.background='var(--surface)';e.currentTarget.style.transform='';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}>
                Login to Dashboard
              </a>
            </div>
            <p style={{marginTop:24,fontSize:12,color:'var(--text-tertiary)',position:'relative',zIndex:1,fontFamily:'JetBrains Mono'}}>No credit card required · Academic institution accounts available</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{borderTop:'1px solid var(--border)',padding:'52px 0',background:'var(--surface)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:24}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
            <div style={{position:'relative'}}>
              <div style={{position:'absolute',inset:-3,borderRadius:'50%',background:'rgba(99,102,241,.1)',animation:'halo-p 3s ease-in-out infinite'}}/>
              <img src="/logo.png" alt="CoWriteX" style={{width:40,height:40,objectFit:'contain',filter:'drop-shadow(0 2px 8px rgba(99,102,241,.25))',position:'relative'}}/>
            </div>
            <span className="f-display" style={{fontSize:'1.25rem',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-.02em'}}>
              Co<span style={{color:'var(--brand)'}}>Write</span>X
            </span>
          </div>
          <div style={{fontSize:12,color:'var(--text-tertiary)',fontFamily:'JetBrains Mono'}}>Write Together. Think Further.</div>
        </div>
        <div style={{display:'flex',gap:28}}>
          {['Privacy','Terms','GitHub','Contact'].map(l=>(
            <a key={l} href="#" className="anim-u" style={{fontSize:13,color:'var(--text-tertiary)',textDecoration:'none',transition:'color .2s',cursor:'none'}}
              onMouseOver={e=>e.currentTarget.style.color='var(--purple-600)'}
              onMouseOut={e=>e.currentTarget.style.color='var(--text-tertiary)'}>{l}</a>
          ))}
        </div>
        <div style={{fontSize:12,color:'var(--text-tertiary)',fontFamily:'JetBrains Mono'}}>© 2025–2026 CoWriteX · ENSIA</div>
      </div>
    </footer>
  );
}

/* ─── ROOT ───────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="noise">
      <G/>
      <Cursor/>
      <ScrollBar/>
      <Navbar/>
      <Hero/>
      <MarqueeBand/>
      <Features/>
      <HowItWorks/>
      <Impact/>
      <Tech/>
      <CTA/>
      <Footer/>
    </div>
  );
}