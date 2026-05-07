/**
 * exportPDF.ts - Convert document sections to PDF
 * Exports all sections of a project as a properly formatted PDF document
 */

export async function exportProjectToPDF(
  projectTitle: string,
  sections: Array<{
    id: string;
    title: string;
    type: string;
    content: string;
    depth: number;
  }>
) {
  try {
    // Dynamically import html2pdf to keep bundle size small
    const html2pdf = (await import('html2pdf.js')).default;

    // Create a temporary container for PDF content
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    element.style.lineHeight = '1.6';
    element.style.color = '#1e293b';
    element.style.backgroundColor = '#ffffff';
    element.style.width = '210mm'; // A4 width
    element.style.margin = '0 auto';

    // Add title
    const titleEl = document.createElement('h1');
    titleEl.innerHTML = projectTitle;
    titleEl.style.fontSize = '32px';
    titleEl.style.fontWeight = '700';
    titleEl.style.marginBottom = '30px';
    titleEl.style.borderBottom = '3px solid #6550e8';
    titleEl.style.paddingBottom = '20px';
    titleEl.style.color = '#6550e8';
    element.appendChild(titleEl);

    // Add date and metadata
    const metaEl = document.createElement('div');
    metaEl.style.fontSize = '12px';
    metaEl.style.color = '#64748b';
    metaEl.style.marginBottom = '40px';
    metaEl.innerHTML = `
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <p><strong>Document Type:</strong> Research Paper</p>
    `;
    element.appendChild(metaEl);

    // Add table of contents
    const tocEl = document.createElement('div');
    tocEl.style.marginBottom = '60px';
    tocEl.style.pageBreakAfter = 'always';
    
    const tocTitle = document.createElement('h2');
    tocTitle.innerHTML = 'Table of Contents';
    tocTitle.style.fontSize = '24px';
    tocTitle.style.fontWeight = '700';
    tocTitle.style.marginBottom = '20px';
    tocTitle.style.color = '#6550e8';
    tocEl.appendChild(tocTitle);

    const tocList = document.createElement('ul');
    tocList.style.listStyle = 'none';
    tocList.style.padding = '0';
    tocList.style.margin = '0';

    sections.forEach((section, index) => {
      const li = document.createElement('li');
      const indent = section.depth * 20;
      li.style.marginLeft = `${indent}px`;
      li.style.marginBottom = '8px';
      li.style.fontSize = section.depth === 0 ? '14px' : '12px';
      li.style.fontWeight = section.depth === 0 ? '600' : '400';
      li.style.color = section.depth === 0 ? '#1e293b' : '#475569';
      li.innerHTML = `${index + 1}. ${section.title}`;
      tocList.appendChild(li);
    });

    tocEl.appendChild(tocList);
    element.appendChild(tocEl);

    // Add sections
    sections.forEach((section) => {
      // Create section container
      const sectionEl = document.createElement('div');
      sectionEl.style.marginBottom = '40px';
      sectionEl.style.pageBreakInside = 'avoid';

      // Create heading based on depth
      const headingLevel = Math.min(section.depth + 1, 6);
      const heading = document.createElement(`h${headingLevel}`);
      heading.innerHTML = section.title;
      
      const fontSizes = ['28px', '24px', '20px', '18px', '16px', '14px'];
      heading.style.fontSize = fontSizes[section.depth] || '14px';
      heading.style.fontWeight = section.depth === 0 ? '700' : '600';
      heading.style.marginBottom = '15px';
      heading.style.marginTop = section.depth === 0 ? '30px' : '20px';
      heading.style.color = '#1e293b';
      heading.style.borderBottom = section.depth === 0 ? '2px solid #6550e8' : 'none';
      heading.style.paddingBottom = section.depth === 0 ? '10px' : '0';
      
      sectionEl.appendChild(heading);

      // Add content
      if (section.content) {
        const contentEl = document.createElement('div');
        contentEl.innerHTML = sanitizeHTMLForPDF(section.content);
        contentEl.style.fontSize = '12px';
        contentEl.style.lineHeight = '1.8';
        contentEl.style.color = '#334155';
        contentEl.style.marginBottom = '20px';
        
        // Style content elements
        styleContentElements(contentEl);
        
        sectionEl.appendChild(contentEl);
      }

      element.appendChild(sectionEl);
    });

    // Create PDF
    const filename = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    
    const opt = {
      margin: [15, 15, 15, 15], // mm margins
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Sanitize HTML content for PDF export
 * Removes problematic elements and attributes
 */
function sanitizeHTMLForPDF(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove script tags and other problematic elements
  const scripts = temp.querySelectorAll('script, style, meta');
  scripts.forEach((el) => el.remove());

  // Remove class and style attributes that might cause issues
  temp.querySelectorAll('[style*="display:none"]').forEach((el) => el.remove());

  return temp.innerHTML;
}

/**
 * Apply consistent styling to content elements
 */
function styleContentElements(container: HTMLElement) {
  // Style paragraphs
  container.querySelectorAll('p').forEach((el) => {
    el.style.margin = '0 0 12px 0';
  });

  // Style headings within content
  container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
    el.style.marginTop = '16px';
    el.style.marginBottom = '8px';
    el.style.fontWeight = '600';
  });

  // Style lists
  container.querySelectorAll('ul, ol').forEach((el) => {
    el.style.margin = '12px 0';
    el.style.paddingLeft = '24px';
  });

  container.querySelectorAll('li').forEach((el) => {
    el.style.marginBottom = '6px';
  });

  // Style code blocks
  container.querySelectorAll('pre, code').forEach((el) => {
    el.style.backgroundColor = '#f1f5f9';
    el.style.padding = '12px';
    el.style.borderRadius = '4px';
    el.style.fontFamily = "'Monaco', 'Courier New', monospace";
    el.style.fontSize = '11px';
    el.style.overflow = 'auto';
    el.style.margin = '12px 0';
  });

  // Style blockquotes
  container.querySelectorAll('blockquote').forEach((el) => {
    el.style.borderLeft = '4px solid #6550e8';
    el.style.paddingLeft = '16px';
    el.style.margin = '12px 0';
    el.style.color = '#475569';
    el.style.fontStyle = 'italic';
  });

  // Style tables
  container.querySelectorAll('table').forEach((el) => {
    el.style.width = '100%';
    el.style.borderCollapse = 'collapse';
    el.style.margin = '12px 0';
  });

  container.querySelectorAll('th, td').forEach((el) => {
    el.style.border = '1px solid #cbd5e1';
    el.style.padding = '8px';
    el.style.textAlign = 'left';
  });

  container.querySelectorAll('th').forEach((el) => {
    el.style.backgroundColor = '#f1f5f9';
    el.style.fontWeight = '600';
  });

  // Style images
  container.querySelectorAll('img').forEach((el) => {
    (el as HTMLImageElement).style.maxWidth = '100%';
    (el as HTMLImageElement).style.height = 'auto';
    (el as HTMLImageElement).style.margin = '12px 0';
  });

  // Style links
  container.querySelectorAll('a').forEach((el) => {
    el.style.color = '#6550e8';
    el.style.textDecoration = 'underline';
  });
}
