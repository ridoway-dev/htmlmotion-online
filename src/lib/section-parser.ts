export interface DetectedSection {
  id: string;
  label: string;
  selector: string;
  tag: string;
}

export function detectHtmlSections(html: string): DetectedSection[] {
  if (!html) return [];

  const sections: DetectedSection[] = [];

  // Match tags with id, class, or section/article/header/footer tags
  const regex = /<(section|div|main|article|header|footer)[^>]*(?:id=["']([^"']+)["']|data-section=["']([^"']+)["']|class=["']([^"']+)["'])?[^>]*>/gi;

  let match;
  const seenSelectors = new Set<string>();

  while ((match = regex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const id = match[2];
    const dataSection = match[3];
    const className = match[4] || '';

    let selector = '';
    let label = '';

    if (id) {
      selector = `#${id}`;
      label = id
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else if (dataSection) {
      selector = `[data-section="${dataSection}"]`;
      label = dataSection;
    } else if (tag === 'section' || tag === 'header' || tag === 'footer' || tag === 'main') {
      // Find classes if any
      const firstClass = className.split(/\s+/).filter(Boolean)[0];
      if (firstClass) {
        selector = `${tag}.${firstClass}`;
        label = `${tag.toUpperCase()}: ${firstClass}`;
      } else {
        selector = tag;
        label = tag.toUpperCase();
      }
    } else if (className && /(scene|slide|screen|card|step|hero|feature|pricing|contact)/i.test(className)) {
      const matchedClass = className.split(/\s+/).find((c) => /(scene|slide|screen|card|step|hero|feature|pricing|contact)/i.test(c));
      if (matchedClass) {
        selector = `.${matchedClass}`;
        label = matchedClass
          .split(/[-_]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }

    if (selector && !seenSelectors.has(selector)) {
      seenSelectors.add(selector);
      sections.push({
        id: selector,
        label: label || selector,
        selector,
        tag,
      });
    }

    if (sections.length >= 25) break; // limit to 25 primary sections
  }

  return sections;
}
