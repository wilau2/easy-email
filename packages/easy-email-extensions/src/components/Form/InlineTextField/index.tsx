import React, { useEffect } from 'react';
import { ContentEditableType, DATA_CONTENT_EDITABLE_TYPE, getShadowRoot } from 'easy-email-editor';
import { useField, useForm } from 'react-final-form';
import DOMPurify from 'dompurify';

export interface InlineTextProps {
  idx: string;
  children?: React.ReactNode;
  onChange: (content: string) => void;
}

export function InlineText({ idx, onChange, children }: InlineTextProps) {
  const {
    mutators: { setFieldTouched },
  } = useForm();

  useField(idx); // setFieldTouched will be work while register field,

  useEffect(() => {
    const shadowRoot = getShadowRoot();

    const onPaste = (e: ClipboardEvent) => {
      if (!(e.target instanceof Element) || !e.target.getAttribute('contenteditable')) return;
      e.preventDefault();

      const contentEditableType = e.target.getAttribute(DATA_CONTENT_EDITABLE_TYPE);

      if (contentEditableType === ContentEditableType.RichText) {
        // Get HTML content from clipboard and sanitize it before insertion
        const html = e.clipboardData?.getData('text/html') || e.clipboardData?.getData('text/plain') || '';
        const sanitizedHtml = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 's', 'sub', 'sup'],
          ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
          ALLOW_DATA_ATTR: false,
        });
        document.execCommand('insertHTML', false, sanitizedHtml);
        // Read back and sanitize again as a safety measure
        onChange(DOMPurify.sanitize(e.target.innerHTML || '', {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 's', 'sub', 'sup'],
          ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
          ALLOW_DATA_ATTR: false,
        }));
      } else if (contentEditableType === ContentEditableType.Text) {
        // For plain text, only get text/plain
        const text = e.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertText', false, text);
        onChange(e.target.textContent?.trim() || '');
      }
    };

    const onInput = (e: Event) => {
      if (e.target instanceof Element && e.target.getAttribute('contenteditable')) {

        const contentEditableType = e.target.getAttribute(DATA_CONTENT_EDITABLE_TYPE);
        if (contentEditableType === ContentEditableType.RichText) {
          onChange(DOMPurify.sanitize(e.target.innerHTML || '', {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 's', 'sub', 'sup'],
            ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
            ALLOW_DATA_ATTR: false,
          }));
        } else if (contentEditableType === ContentEditableType.Text) {
          onChange(e.target.textContent?.trim() || '');
        }
      }
    };

    shadowRoot.addEventListener('paste', onPaste as any, true);
    shadowRoot.addEventListener('input', onInput);

    return () => {
      shadowRoot.removeEventListener('paste', onPaste as any, true);
      shadowRoot.removeEventListener('input', onInput);
    };
  }, [onChange, setFieldTouched]);

  return <>{children}</>;
}
