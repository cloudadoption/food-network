/**
 * Eagerly run template-specific logic before the first section loads.
 * @param {Document} doc
 */
export async function eager(doc) {
  const main = doc.querySelector('main');
  if (main) {
    main.dataset.template = 'default';
  }
}

/**
 * Lazily enhance the template once critical content has loaded.
 * @param {Document} doc
 */
export async function lazy(doc) {
  const footer = doc.querySelector('footer');
  if (footer) {
    footer.dataset.templateReady = 'true';
  }
}

/**
 * Defer non-critical enhancements for the template.
 * @param {Document} doc
 */
export async function delayed(doc) {
  doc.body.dataset.templateDelayed = 'true';
}
