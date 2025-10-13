import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/fragments/footer';
  const fragment = await loadFragment(footerPath);

  if (!fragment) {
    block.textContent = '';
    return;
  }

  // decorate footer DOM
  block.textContent = '';
  const footerContent = document.createElement('div');
  footerContent.classList.add('footer-content');

  const sections = [...fragment.querySelectorAll(':scope .section')];
  const [linksSection, metaSection] = sections;

  if (linksSection) {
    const list = linksSection.querySelector('ul');
    if (list) {
      linksSection.classList.add('footer-nav');
      list.classList.add('footer-links');
      list.querySelectorAll('li').forEach((item) => {
        const anchor = item.querySelector('a');
        if (anchor) {
          anchor.classList.add('footer-link');
          return;
        }

        const text = item.textContent.trim();
        if (!text) {
          item.remove();
          return;
        }

        const span = document.createElement('span');
        span.textContent = text;
        span.classList.add('footer-link', 'footer-link-static');
        item.textContent = '';
        item.append(span);
      });

      let nav = list.closest('nav');
      if (!nav) {
        nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Footer navigation');
        const parent = list.parentElement;
        nav.append(list);
        if (parent) {
          parent.append(nav);
        } else {
          linksSection.append(nav);
        }
      } else {
        nav.setAttribute('aria-label', 'Footer navigation');
      }

      footerContent.append(linksSection);
    }
  }

  if (metaSection) {
    const list = metaSection.querySelector('ul');
    if (list) {
      metaSection.classList.add('footer-meta');
      list.classList.add('footer-meta-list');
      footerContent.append(metaSection);
    }
  }

  if (footerContent.childElementCount > 0) {
    block.append(footerContent);
  }
}
