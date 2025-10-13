/**
 * Simple Template JavaScript
 * This template demonstrates that eager/lazy/delayed functions are optional.
 * Only implement the phases you actually need.
 */

/**
 * Eager phase - runs before first section loads
 * @param {Document} doc The document
 */
export async function eager(doc) {
  // Add a data attribute to track template loading
  doc.body.setAttribute('data-template-loaded', 'simple');
  // eslint-disable-next-line no-console
  console.log('Simple template: eager phase completed');
}

/**
 * Lazy phase - runs after lazy page load
 * @param {Document} doc The document
 */
export async function lazy(doc) {
  // Example: Add a simple banner
  const main = doc.querySelector('main');
  if (main && main.querySelector('.section')) {
    const banner = document.createElement('div');
    banner.style.cssText = `
      padding: 1rem;
      background: var(--simple-accent, #2ecc71);
      color: white;
      text-align: center;
      border-radius: 4px;
      margin-bottom: 2rem;
      font-weight: 500;
    `;
    banner.textContent = 'Simple Template Active';
    main.querySelector('.section').prepend(banner);
  }
  // eslint-disable-next-line no-console
  console.log('Simple template: lazy phase completed');
}

/**
 * Delayed phase - runs after a delay
 * This template doesn't need delayed functionality, so this is minimal
 */
export function delayed() {
  // eslint-disable-next-line no-console
  console.log('Simple template: delayed phase completed');
}

