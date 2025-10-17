import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML content safe for rendering
 */
export function sanitizeBlockContent(content: string | undefined | null): string {
  if (!content) return '';
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 's', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
    ALLOW_DATA_ATTR: false,
    SAFE_FOR_TEMPLATES: true,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}