export type ContentKind = 'url' | 'ip' | 'text';

const IP_RE =
  /^(\d{1,3}(\.\d{1,3}){3})(:\d{1,5})?(\/\S*)?$/;

const DOMAIN_RE =
  /^(([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d{1,5})?(\/\S*)?$/;

const LOCALHOST_RE = /^localhost(:\d{1,5})?(\/\S*)?$/i;

const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i;

export function isIPAddress(content: string): boolean {
  return IP_RE.test(content.trim());
}

export function classifyContentKind(content: string): ContentKind {
  const c = content.trim();
  if (SCHEME_RE.test(c) || /^www\./i.test(c) || DOMAIN_RE.test(c)) {
    return 'url';
  }
  if (IP_RE.test(c) || LOCALHOST_RE.test(c)) {
    return 'ip';
  }
  return 'text';
}

export function isValidTarget(content: string): boolean {
  return classifyContentKind(content) !== 'text';
}

export function normalizeTarget(content: string): string {
  const c = content.trim();
  if (!c) return '';

  if (/^exp:\/\//i.test(c)) {
    return `http://${c.slice('exp://'.length)}`;
  }

  if (SCHEME_RE.test(c)) {
    return c;
  }

  if (isIPAddress(c) || LOCALHOST_RE.test(c) || DOMAIN_RE.test(c)) {
    return `http://${c}`;
  }

  return '';
}

export function searchQuery(content: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(content.trim())}`;
}