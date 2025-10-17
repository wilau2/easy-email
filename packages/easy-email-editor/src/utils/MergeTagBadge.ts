import DOMPurify from 'dompurify';

const sanitizeConfig = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 's', 'sub', 'sup', 'input'],
  ALLOWED_ATTR: ['href', 'target', 'style', 'class', 'type', 'value', 'id'],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
};

const transform = (text: string, id?: string) => {
  return text.replace(/{{([\s\S]+?)}}/g, (_, $1) => {
    const input = document.createElement('input');
    input.className = 'easy-email-merge-tag';
    input.value = DOMPurify.sanitize($1, { SAFE_FOR_TEMPLATES: true });
    input.type = 'button';
    if (id) {
      input.id = id;
    }

    return input.outerHTML;
  });
};
export class MergeTagBadge {
  static transform(content: string, id?: string) {
    const loop = (node: ChildNode) => {
      if (node instanceof HTMLElement) {
        if (node.textContent === node.innerHTML) {
          node.innerHTML = DOMPurify.sanitize(transform(node.innerHTML, id), sanitizeConfig);
        } else {
          [...node.childNodes].forEach(loop);
        }
      } else {
        if (node.nodeType === 3 && node.textContent) {
          const div = document.createElement('div');
          div.innerHTML = DOMPurify.sanitize(transform(node.textContent, id), sanitizeConfig);
          node.replaceWith(...div.childNodes);
        }
      }

    };
    const container = document.createElement('div');
    container.innerHTML = DOMPurify.sanitize(content, sanitizeConfig);

    [...container.childNodes].forEach(loop);
    return container.innerHTML;
  }

  static revert(content: string, generateMergeTag: (s: string) => string) {
    const container = document.createElement('div');
    container.innerHTML = DOMPurify.sanitize(content, sanitizeConfig);
    container.querySelectorAll('.easy-email-merge-tag').forEach((item: any) => {
      item.parentNode?.replaceChild(
        document.createTextNode(generateMergeTag(item.value)),
        item
      );
    });

    return container.innerHTML;
  }
}
