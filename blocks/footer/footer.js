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

  const createTop = () => {
    const list = linksSection?.querySelector('ul');
    if (!list) return null;

    list.classList.add('footer-links');
    list.querySelectorAll('li').forEach((item) => {
      item.classList.add('footer-link-item');
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

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Footer navigation');
    nav.append(list);

    const topWrapper = document.createElement('div');
    topWrapper.classList.add('footer-top');
    topWrapper.append(nav);
    return topWrapper;
  };

  const createBottom = () => {
    const list = metaSection?.querySelector('ul');
    if (!list) return null;

    list.classList.add('footer-meta');
    list.querySelectorAll('li').forEach((item) => {
      item.classList.add('footer-meta-item');
    });

    const bottomWrapper = document.createElement('div');
    bottomWrapper.classList.add('footer-bottom');
    bottomWrapper.append(list);
    return bottomWrapper;
  };

  const top = createTop();
  const bottom = createBottom();

  if (top) footerContent.append(top);
  if (bottom) footerContent.append(bottom);

  if (footerContent.childElementCount > 0) {
    block.append(footerContent);
  }
}
