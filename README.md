<h1 align="center">
  <span style="color: #7c3aed"></span> 
  <span style="color: #8b5cf6">C</span><span style="color: #7c3aed">o</span><span style="color: #6d28d9">W</span><span style="color: #5b21b6">r</span><span style="color: #4c1d95">i</span><span style="color: #6d28d9">t</span><span style="color: #7c3aed">e</span><span style="color: #8b5cf6">X</span>
</h1>

<h3 align="center">
  <span style="color: #a78bfa">🤖 Human-in-the-Loop AI Research Writing Assistant</span>
</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white&labelColor=4c1d95&color=7c3aed" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=white&labelColor=4c1d95&color=7c3aed" />
  <img src="https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=4c1d95&color=7c3aed" />
  <img src="https://img.shields.io/badge/TipTap-Editor-8b5cf6?style=for-the-badge&labelColor=4c1d95&color=7c3aed" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ENSIA-National%20Higher%20School%20of%20AI-7c3aed?style=flat-square" />
  <img src="https://img.shields.io/badge/Department-Intelligent%20Systems%20Engineering-8b5cf6?style=flat-square" />
</p>

---

<p align="center">
  <b>Team:</b> Bouaziz Zineb • Djabir Houaria • Meriche Yasmine • Haddoud Mehdi<br/>
  <b>Supervisor:</b> Dr. HADJ AMEUR
</p>

---

## <span style="color: #7c3aed">📖</span> Overview

> *"Co — Collaborative Human–AI Partnership | Write — End-to-End Academic Writing | X — Extended Intelligence"*

CoWriteX is a collaborative Human-AI research writing platform that integrates specialized AI agents into a unified pipeline, enhancing productivity while preserving researcher authority and academic integrity.

<table align="center">
  <tr>
    <td align="center"><span style="color: #a78bfa; font-size: 1.5em;">⚡</span><br/><b>70%</b><br/>writing time reduction</td>
    <td align="center"><span style="color: #a78bfa; font-size: 1.5em;">🛡️</span><br/><b>0%</b><br/>hallucination rate</td>
    <td align="center"><span style="color: #a78bfa; font-size: 1.5em;">✅</span><br/><b>100%</b><br/>structural compliance</td>
    <td align="center"><span style="color: #a78bfa; font-size: 1.5em;">⚡</span><br/><b>280ms</b><br/>suggestion latency</td>
  </tr>
</table>

---

## <span style="color: #7c3aed">🧩</span> Tech Stack

| **Layer** | **Technology** |
|:---:|:---:|
|  Framework | Next.js 14 (App Router) |
|  UI | React 18 + Tailwind CSS |
|  Editor | TipTap Editor |
|  Backend | FastAPI + LangGraph |
|  Database | PostgreSQL + ChromaDB |
|  Retrieval | FAISS + all-MiniLM-L6-v2 |

---

## <span style="color: #7c3aed">🚀</span> Getting Started

### <span style="color: #8b5cf6"> Prerequisites</span>

```bash
Node.js 18+
npm | yarn | pnpm
```

### <span style="color: #8b5cf6"> Installation</span>

```bash
# Clone the repository
git clone https://github.com/zinebbouaziz/FRONT.git
cd cowritex-frontend

# Install dependencies
npm install
```

### <span style="color: #8b5cf6"> Environment Variables</span>

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tgtspjokqesecyfsqknd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndHNwam9rcWVzZWN5ZnNxa25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjE5MzIsImV4cCI6MjA5MTUzNzkzMn0.e3nKfMX6L0pMqK40ETK3cRhIX7mj3V46gmW-feVvG64
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### <span style="color: #8b5cf6"> Run Development Server</span>

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉



## <span style="color: #7c3aed"></span> Key Features

<table>
  <tr>
    <td>🤖</td>
    <td><b>AI Writing Assistant</b></td>
    <td>Multi-stage academic generation with IMRAD normalization</td>
  </tr>
  <tr>
    <td>💡</td>
    <td><b>Inline Suggestions</b></td>
    <td>Real-time refinement with ~280ms latency</td>
  </tr>
  <tr>
    <td>📚</td>
    <td><b>Literature Retrieval</b></td>
    <td>Grounded search using researcher-provided PDFs only</td>
  </tr>
  <tr>
    <td>🔖</td>
    <td><b>Citation Management</b></td>
    <td>Hallucination-free citations with provenance tracking</td>
  </tr>
  <tr>
    <td>📊</td>
    <td><b>Scientific Visualization</b></td>
    <td>Automated charts and Mermaid diagram export</td>
  </tr>
  <tr>
    <td>👤</td>
    <td><b>Human-in-the-Loop</b></td>
    <td>All AI outputs require researcher validation</td>
  </tr>
  <tr>
    <td>📤</td>
    <td><b>Export</b></td>
    <td>PDF and LaTeX supported</td>
  </tr>
</table>

---

## <span style="color: #7c3aed">🔄</span> Workflow

```
1️⃣ Researcher creates a structured academic document
         ↓
2️⃣ User requests AI assistance (writing, refinement, retrieval, visualization)
         ↓
3️⃣ LangGraph orchestrator classifies intent & dispatches to specialized agents
         ↓
4️⃣ Human-in-the-Loop review → Approve / Modify / Reject
         ↓
5️⃣ Approved outputs stored with provenance metadata → Export to PDF/LaTeX
```

---

## <span style="color: #7c3aed">🤖</span> AI Agents

| **Agent** | **Function** |
|:---|:---|
|  Writing Agent | Multi-stage academic generation with contextual grounding |
|  Suggestion Agent | Real-time inline refinement & low-latency assistance |
|  Literature & Citation Agent | RAG using researcher-provided PDFs |
|  Search Engine | Multi-source academic retrieval with semantic ranking |
|  Visualization Module | Scientific charts + Mermaid diagrams |

---

## <span style="color: #7c3aed"></span> Current Limitations

- 🔌 Dependence on external LLM providers (latency, privacy, cost)
- 📊 Visualization limited to standard scientific chart types
- 👥 No real-time collaborative editing yet
- 📄 Large-document scalability remains challenging

---

## <span style="color: #7c3aed"></span> Future Work

- 🎯 Sentence-level evidence tracing
- 📊 Interactive dashboards & statistical inference
- 🔍 Automated scientific review & inconsistency detection
- 🧬 Domain-specific fine-tuning (biomedical, engineering, social sciences)
- 📡 Offline and edge deployment support

---

<p align="center">
  <br/>
  <span style="color: #8b5cf6; font-size: 1.2em;"><b>⚡ CoWriteX — Collaborative Human-AI Partnership for Trustworthy Academic Writing ⚡</b></span>
  <br/><br/>
  <span style="color: #a78bfa">ENSIA • Intelligent Systems Engineering • 2024/2025</span>
</p>
