// mockData.ts
// Mock data for CoWriteX application — single user with all related entities

export const user = {
  id: 'u1',
  email: 'emily.chen@stanford.edu',
  full_name: 'Dr. Emily Chen',
  password_hash: '$2a$10$examplehash',
  academic_position: 'Associate Professor',
  department: 'Computer Science',
  field_interests: 'Machine Learning, Computer Vision, NLP',
  created_at: '2025-01-15T09:30:00Z',
  updated_at: '2025-03-10T14:22:00Z',
};

export const projects = [
  {
    id: 'p1',
    user_id: 'u1',
    title: 'Attention-Based Medical Image Segmentation with Uncertainty Quantification',
    description: 'Investigating U-Net variants with attention gates and uncertainty estimation for reliable tumor segmentation in MRI.',
    status: 'active',
    thread_id: 'langgraph_thread_med_seg_001',
    progress: 65,
    created_at: '2025-02-10T10:00:00Z',
    updated_at: '2025-04-01T09:20:00Z',
  },
  {
    id: 'p2',
    user_id: 'u1',
    title: 'Explainable AI for Autonomous Driving Decisions',
    description: 'Developing interpretable saliency methods for end-to-end driving policies in simulation.',
    status: 'archived',
    thread_id: 'langgraph_thread_xai_drive_042',
    progress: 100,
    created_at: '2024-11-05T14:30:00Z',
    updated_at: '2025-02-20T11:45:00Z',
  },
];

export const projectPreferences = [
  {
    id: 'pp1',
    project_id: 'p1',
    writing_style: 'technical',
    tone: 'academic',
    target_journal: 'IEEE Transactions on Medical Imaging',
    language: 'English',
    assistance_level: 'moderate',
    citation_style: 'IEEE',
    grounded_only: true,
    llm_provider: 'groq',
  },
  {
    id: 'pp2',
    project_id: 'p2',
    writing_style: 'formal',
    tone: 'neutral',
    target_journal: 'CVPR',
    language: 'English',
    assistance_level: 'light',
    citation_style: 'IEEE',
    grounded_only: false,
    llm_provider: 'gemini',
  },
];

// Sections with proper depth and parentId for hierarchical tree
export const sections = [
  { id: 's1', project_id: 'p1', type: 'abstract', title: 'Abstract', position: 1, depth: 0, parentId: null, created_at: '2025-02-10T10:05:00Z', updated_at: '2025-03-28T08:00:00Z' },
  { id: 's2', project_id: 'p1', type: 'introduction', title: 'Introduction', position: 2, depth: 0, parentId: null, created_at: '2025-02-10T10:05:00Z', updated_at: '2025-03-30T11:15:00Z' },
  { id: 's3', project_id: 'p1', type: 'methodology', title: 'Methodology', position: 3, depth: 0, parentId: null, created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  // Subsections under Methodology
  { id: 's3_1', project_id: 'p1', type: 'subsection', title: 'Dataset', position: 1, depth: 1, parentId: 's3', created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  { id: 's3_2', project_id: 'p1', type: 'subsection', title: 'Model Architecture', position: 2, depth: 1, parentId: 's3', created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  { id: 's3_3', project_id: 'p1', type: 'subsection', title: 'Training Procedure', position: 3, depth: 1, parentId: 's3', created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  // Deeper nesting example
  { id: 's3_2_1', project_id: 'p1', type: 'subsubsection', title: 'Attention Gates', position: 1, depth: 2, parentId: 's3_2', created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  { id: 's3_2_2', project_id: 'p1', type: 'subsubsection', title: 'Skip Connections', position: 2, depth: 2, parentId: 's3_2', created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  // Continue top-level
  { id: 's4', project_id: 'p1', type: 'results', title: 'Results', position: 4, depth: 0, parentId: null, created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  { id: 's5', project_id: 'p1', type: 'discussion', title: 'Discussion', position: 5, depth: 0, parentId: null, created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  { id: 's6', project_id: 'p1', type: 'conclusion', title: 'Conclusion', position: 6, depth: 0, parentId: null, created_at: '2025-02-12T09:20:00Z', updated_at: '2025-03-31T14:40:00Z' },
  // Project 2 sections
  { id: 's7', project_id: 'p2', type: 'abstract', title: 'Abstract', position: 1, depth: 0, parentId: null, created_at: '2024-11-05T14:35:00Z', updated_at: '2025-01-10T10:00:00Z' },
  { id: 's8', project_id: 'p2', type: 'introduction', title: 'Introduction', position: 2, depth: 0, parentId: null, created_at: '2024-11-05T14:35:00Z', updated_at: '2025-01-15T12:30:00Z' },
];

export const documentVersions = [
  { id: 'dv1', section_id: 's1', suggestion_id: 'ai1', content: 'We propose a novel attention-based U-Net architecture with Monte Carlo dropout for uncertainty-aware medical image segmentation. Experiments on the BraTS 2024 dataset show a 7% improvement in Dice score over baseline methods while providing clinically meaningful uncertainty maps.', version_number: 3, author_type: 'ai', is_current: true, created_at: '2025-03-28T08:00:00Z' },
  { id: 'dv2', section_id: 's2', suggestion_id: null, content: '## Introduction\n\nMedical image segmentation is a cornerstone of computer-aided diagnosis...', version_number: 5, author_type: 'human', is_current: true, created_at: '2025-03-30T11:15:00Z' },
  { id: 'dv3', section_id: 's3', suggestion_id: 'ai2', content: '## Methodology\n\n### 3.1 Attention U-Net Architecture\nWe extend the standard U-Net by incorporating additive attention gates...', version_number: 4, author_type: 'ai', is_current: true, created_at: '2025-03-31T14:40:00Z' },
  { id: 'dv3_1', section_id: 's3_1', suggestion_id: null, content: 'The dataset consists of 369 MRI scans from the BraTS 2024 challenge...', version_number: 1, author_type: 'human', is_current: true, created_at: '2025-03-20T11:00:00Z' },
  { id: 'dv3_2', section_id: 's3_2', suggestion_id: null, content: 'Our architecture uses additive attention gates at each skip connection...', version_number: 1, author_type: 'human', is_current: true, created_at: '2025-03-22T14:20:00Z' },
  { id: 'dv1_old', section_id: 's1', suggestion_id: null, content: 'Initial draft of abstract.', version_number: 1, author_type: 'human', is_current: false, created_at: '2025-02-15T09:00:00Z' },
  { id: 'dv1_ai1', section_id: 's1', suggestion_id: 'ai1', content: 'We propose an attention U-Net for medical image segmentation.', version_number: 2, author_type: 'ai', is_current: false, created_at: '2025-03-20T13:20:00Z' },
  { id: 'dv4', section_id: 's7', suggestion_id: null, content: 'This paper presents an explainable AI framework...', version_number: 2, author_type: 'human', is_current: true, created_at: '2025-01-10T10:00:00Z' },
];

export const aiSuggestions = [
  {
    id: 'ai1',
    section_id: 's1',
    original_text: 'Initial draft of abstract.',
    suggested_text: 'We propose a novel attention-based U-Net architecture with Monte Carlo dropout for uncertainty-aware medical image segmentation. Experiments on the BraTS 2024 dataset show a 7% improvement in Dice score over baseline methods while providing clinically meaningful uncertainty maps.',
    instruction: 'Expand and make more technical based on latest results',
    status: 'accepted',
    feedback: null,
    created_at: '2025-03-20T13:20:00Z',
    resolved_at: '2025-03-28T08:00:00Z',
  },
  {
    id: 'ai2',
    section_id: 's3',
    original_text: 'We use an attention U-Net.',
    suggested_text: '## Methodology\n\n### 3.1 Attention U-Net Architecture\nWe extend the standard U-Net by incorporating additive attention gates at each skip connection. The attention coefficients are computed using a gating signal from the coarser scale to focus on relevant regions...',
    instruction: 'Write a detailed methodology section',
    status: 'accepted',
    feedback: null,
    created_at: '2025-03-30T09:10:00Z',
    resolved_at: '2025-03-31T14:40:00Z',
  },
  {
    id: 'ai3',
    section_id: 's2',
    original_text: '...existing work...',
    suggested_text: 'Recent work by Oktay et al. (2018) introduced attention gates to U-Net, allowing the model to focus on salient regions without requiring external localisation.',
    instruction: 'Add citation to Attention U-Net paper',
    status: 'rejected',
    feedback: 'I will cite this in a different paragraph',
    created_at: '2025-03-29T16:00:00Z',
    resolved_at: '2025-03-29T16:30:00Z',
  },
  {
    id: 'ai4',
    section_id: 's4',
    original_text: '',
    suggested_text: '### 4.1 Quantitative Results\nTable 1 summarises the Dice scores for all methods on the BraTS 2024 validation set. Our proposed attention‑U‑Net with MC dropout achieves a mean Dice of 0.89 ± 0.03, outperforming the baseline U‑Net (0.82 ± 0.04) and standard attention U‑Net (0.85 ± 0.03).',
    instruction: 'Generate results section based on uploaded CSV',
    status: 'pending',
    feedback: null,
    created_at: '2025-04-01T11:00:00Z',
    resolved_at: null,
  },
  {
    id: 'ai5',
    section_id: 's5',
    original_text: 'Our results show improvement over prior work.',
    suggested_text: 'Our results demonstrate a consistent improvement over prior work, likely attributable to the synergistic effect of attention gating and uncertainty‑aware training. The uncertainty maps generated by MC dropout highlight ambiguous regions (e.g., tumour boundaries), which may assist clinicians in focusing manual review efforts.',
    instruction: 'Expand discussion with interpretation of uncertainty maps',
    status: 'pending',
    feedback: null,
    created_at: '2025-04-02T09:30:00Z',
    resolved_at: null,
  },
  {
    id: 'ai6',
    section_id: 's2',
    original_text: 'Medical image segmentation is important.',
    suggested_text: 'Accurate medical image segmentation is critical for computer‑aided diagnosis, treatment planning, and longitudinal disease monitoring. In oncology, precise delineation of tumour boundaries directly impacts radiotherapy target definition and surgical resection margins.',
    instruction: 'Make the opening sentence more impactful with clinical context',
    status: 'accepted',
    feedback: null,
    created_at: '2025-03-15T10:00:00Z',
    resolved_at: '2025-03-15T14:20:00Z',
  },
];

export const chatMessages = [
  { id: 'c1', project_id: 'p1', section_id: null, role: 'human', content: 'I need to write the introduction for my medical imaging paper.', created_at: '2025-03-29T15:30:00Z' },
  { id: 'c2', project_id: 'p1', section_id: null, role: 'ai', content: "I can help with that. Would you like me to draft an introduction based on your project title and the sources we've collected?", created_at: '2025-03-29T15:30:30Z' },
  { id: 'c3', project_id: 'p1', section_id: 's2', role: 'human', content: 'Yes, please use the Attention U-Net paper and the BraTS benchmark.', created_at: '2025-03-29T15:31:00Z' },
  { id: 'c4', project_id: 'p1', section_id: 's2', role: 'ai', content: 'I have generated a suggestion for the introduction. Please review.', created_at: '2025-03-29T15:32:00Z' },
  { id: 'c5', project_id: 'p1', section_id: null, role: 'human', content: 'Can you also help with the results section? I have uploaded the CSV.', created_at: '2025-04-01T10:45:00Z' },
  { id: 'c6', project_id: 'p1', section_id: 's4', role: 'ai', content: 'Processing the CSV. I will generate a draft results section with tables and descriptions.', created_at: '2025-04-01T10:46:00Z' },
];

export const sources = [
  {
    id: 'src1',
    project_id: 'p1',
    title: 'U-Net: Convolutional Networks for Biomedical Image Segmentation',
    authors: 'Ronneberger, O., Fischer, P., Brox, T.',
    abstract: 'There is large consent that successful training of deep networks requires many thousand annotated training samples. In this paper, we present a network and training strategy that relies on the strong use of data augmentation to use the available annotated samples more efficiently.',
    url: 'https://arxiv.org/abs/1505.04597',
    doi: '10.1007/978-3-319-24574-4_28',
    citation_count: 45200,
    relevance_score: 0.98,
    pdf_url: 'https://arxiv.org/pdf/1505.04597.pdf',
    created_at: '2025-02-11T08:30:00Z',
  },
  {
    id: 'src2',
    project_id: 'p1',
    title: 'Attention U-Net: Learning Where to Look for the Pancreas',
    authors: 'Oktay, O., Schlemper, J., Folgoc, L.L., et al.',
    abstract: 'We propose a novel attention gate model for medical imaging that automatically learns to focus on target structures of varying shapes and sizes.',
    url: 'https://arxiv.org/abs/1804.03999',
    doi: '10.1007/978-3-030-00889-5_28',
    citation_count: 3800,
    relevance_score: 0.95,
    pdf_url: 'https://arxiv.org/pdf/1804.03999.pdf',
    created_at: '2025-02-12T13:15:00Z',
  },
  {
    id: 'src3',
    project_id: 'p1',
    title: 'The Multimodal Brain Tumor Image Segmentation Benchmark (BRATS)',
    authors: 'Menze, B.H., Jakab, A., Bauer, S., et al.',
    abstract: 'In this paper we report the set-up and results of the Multimodal Brain Tumor Image Segmentation Benchmark (BRATS) organized in conjunction with the MICCAI 2012 and 2013 conferences.',
    url: 'https://ieeexplore.ieee.org/document/6975210',
    doi: '10.1109/TMI.2014.2377694',
    citation_count: 3200,
    relevance_score: 0.92,
    pdf_url: 'https://example.com/brats_paper.pdf',
    created_at: '2025-02-15T11:00:00Z',
  },
  {
    id: 'src4',
    project_id: 'p1',
    title: 'Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning',
    authors: 'Gal, Y., Ghahramani, Z.',
    abstract: 'We show that dropout in neural networks can be mathematically interpreted as an approximation to the probabilistic deep Gaussian process.',
    url: 'https://arxiv.org/abs/1506.02142',
    doi: null,
    citation_count: 4500,
    relevance_score: 0.88,
    pdf_url: 'https://arxiv.org/pdf/1506.02142.pdf',
    created_at: '2025-02-18T14:20:00Z',
  },
];

export const literatureAnalysis = [
  {
    id: 'la1',
    project_id: 'p1',
    review_content: '# State-of-the-Art Review: Medical Image Segmentation with Deep Learning\n\n## 1. U-Net and Its Variants\nThe U-Net architecture (Ronneberger et al., 2015) has become the de facto standard for biomedical segmentation...\n\n## 2. Attention Mechanisms\nAttention gates (Oktay et al., 2018) improve focus on relevant regions without requiring additional supervision...\n\n## 3. Uncertainty Quantification\nMonte Carlo dropout (Gal & Ghahramani, 2016) provides a practical Bayesian approximation for uncertainty estimation...',
    gaps_content: '## Identified Research Gaps\n1. Few studies combine attention mechanisms with uncertainty quantification in a single framework.\n2. Limited evaluation of uncertainty estimates by clinical experts.\n3. Lack of standardized metrics for uncertainty quality.',
    warnings: '⚠️ The claim that "U-Net is the most cited segmentation paper" could not be verified. ⚠️ The performance improvement stated in Attention U-Net paper may not generalize to all modalities.',
    status: 'reviewed',
    created_at: '2025-02-20T14:30:00Z',
    updated_at: '2025-03-01T10:15:00Z',
  },
  {
    id: 'la2',
    project_id: 'p2',
    review_content: '# Explainable AI in Autonomous Driving: A Survey\n\n...',
    gaps_content: '...',
    warnings: null,
    status: 'completed',
    created_at: '2024-12-01T09:00:00Z',
    updated_at: '2024-12-05T11:30:00Z',
  },
];

export const literatureCitations = [
  { id: 'lc1', literature_analysis_id: 'la1', source_id: 'src1', formatted_citation: '[1] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional Networks for Biomedical Image Segmentation," in MICCAI, 2015.', citation_style: 'IEEE', position: 1, created_at: '2025-02-20T14:30:00Z' },
  { id: 'lc2', literature_analysis_id: 'la1', source_id: 'src2', formatted_citation: '[2] O. Oktay et al., "Attention U-Net: Learning Where to Look for the Pancreas," in MIDL, 2018.', citation_style: 'IEEE', position: 2, created_at: '2025-02-20T14:30:00Z' },
  { id: 'lc3', literature_analysis_id: 'la1', source_id: 'src4', formatted_citation: '[3] Y. Gal and Z. Ghahramani, "Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning," in ICML, 2016.', citation_style: 'IEEE', position: 3, created_at: '2025-02-20T14:30:00Z' },
  { id: 'lc4', literature_analysis_id: 'la2', source_id: 'src1', formatted_citation: '[1] O. Ronneberger et al., "U-Net," MICCAI 2015.', citation_style: 'IEEE', position: 1, created_at: '2024-12-01T09:00:00Z' },
];

export const visualizations = [
  {
    id: 'vis1',
    project_id: 'p1',
    section_id: 's4',
    type: 'chart',
    title: 'Dice Score Comparison Across Methods',
    raw_data: { labels: ['U-Net', 'Attention U-Net', 'Ours'], values: [0.82, 0.85, 0.89] },
    config: { xLabel: 'Method', yLabel: 'Dice Score', legend: true },
    file_path: '/visualizations/project_p1/dice_comparison.png',
    export_format: 'png',
    export_size: 'column_width',
    color_scheme: 'IEEE_blue',
    details: 'Add error bars from 5-fold cross-validation',
    created_at: '2025-04-01T11:30:00Z',
    updated_at: '2025-04-01T11:30:00Z',
  },
  {
    id: 'vis2',
    project_id: 'p1',
    section_id: 's3',
    type: 'figure',
    title: 'Architecture Diagram of Proposed Attention U-Net',
    raw_data: {},
    config: { caption: 'Figure 1: Proposed architecture with attention gates and Monte Carlo dropout layers.' },
    file_path: '/visualizations/project_p1/architecture_diagram.png',
    export_format: 'pdf',
    export_size: 'A4',
    color_scheme: 'grayscale',
    details: 'Ensure arrows are clearly visible in grayscale',
    created_at: '2025-03-15T09:45:00Z',
    updated_at: '2025-03-20T13:10:00Z',
  },
];

// Literature Review (Four Cards)
export const literatureReview = [
  {
    id: 'lr1',
    project_id: 'p1',
    known: 'U-Net and its variants are the standard for biomedical image segmentation. Attention mechanisms improve focus on relevant structures. Monte Carlo dropout provides uncertainty estimates.',
    debated: 'The clinical utility of uncertainty maps is still under discussion. Some argue that current uncertainty metrics do not correlate well with segmentation errors.',
    methodologies: 'Supervised deep learning with annotated medical images. U-Net with attention gates. Monte Carlo dropout for Bayesian approximation. Dice score and Hausdorff distance for evaluation.',
    gaps: 'Few studies combine attention and uncertainty in a single framework. Limited clinical validation of uncertainty estimates. Lack of standardized uncertainty quality metrics.',
    created_at: '2025-03-01T10:00:00Z',
    updated_at: '2025-04-01T12:00:00Z',
  },
  {
    id: 'lr2',
    project_id: 'p2',
    known: 'Saliency maps are commonly used for explaining CNN decisions in autonomous driving. Integrated Gradients and Grad-CAM are popular methods.',
    debated: 'Whether saliency maps truly reflect model reasoning or are merely edge detectors. The reliability of explanations in safety-critical systems is contested.',
    methodologies: 'Post-hoc explainability methods: Grad-CAM, Integrated Gradients, SmoothGrad. Evaluation via pointing game and deletion/insertion metrics.',
    gaps: 'Explanations often fail for complex scenes with multiple objects. Real-time explanation generation is challenging. Lack of user studies with actual drivers.',
    created_at: '2024-12-01T09:00:00Z',
    updated_at: '2024-12-05T11:30:00Z',
  },
];