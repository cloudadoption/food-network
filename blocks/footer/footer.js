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

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.classList.add('footer-wrapper');

  while (fragment.firstElementChild) {
    footer.append(fragment.firstElementChild);
  }

  // Add classes to the footer sections
  const sections = footer.querySelectorAll(':scope > div');
  if (sections.length > 0) {
    sections[0].classList.add('footer-links');
  }
  if (sections.length > 1) {
    sections[1].classList.add('footer-bottom');
  }

  block.append(footer);
}
