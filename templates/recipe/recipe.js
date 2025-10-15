import {
  getMetadata,
  buildBlock,
  decorateSections,
  decorateBlocks,
  loadSections,
} from '../../scripts/aem.js';

function buildAside(doc, wrapper) {
  // Create aside with recipe sidebar block
  const aside = doc.createElement('aside');
  const section = doc.createElement('div');
  section.append(buildBlock('recipe-sidebar', { elems: [] }));
  aside.append(section);

  // Insert aside after main
  wrapper.append(aside);

  // Decorate the aside (prepare sections and blocks)
  decorateSections(aside);
  decorateBlocks(aside);
}

/**
 * Builds all synthetic blocks for recipe pages.
 * @param {Document} doc The document
 */
function buildAutoBlocks(doc) {
  try {
    const main = doc.querySelector('main');
    if (!main) return;

    const wrapper = doc.createElement('div');
    wrapper.className = 'recipe-content';

    main.before(wrapper);
    wrapper.append(main);

    buildAside(doc, wrapper);

    const reviewsSection = doc.createElement('div');
    const recipeId = getMetadata('recipe-id', doc);
    const reviewsBlock = buildBlock('recipe-reviews', recipeId);
    reviewsSection.append(reviewsBlock);
    main.append(reviewsSection);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Recipe auto-blocking failed', error);
  }
}

/**
 * Eager phase - runs before body is revealed and before first section loads
 * Use this for critical functionality that affects initial render
 * @param {Document} doc The document
 */
// eslint-disable-next-line no-unused-vars
export async function eager(doc) {
  // Set breadcrumb metadata if not already defined
  if (!getMetadata('breadcrumb', doc)) {
    const meta = doc.createElement('meta');
    meta.name = 'breadcrumb';
    meta.content = 'recipe';
    doc.head.append(meta);
  }

  // Build recipe-specific auto blocks
  buildAutoBlocks(doc);
}

/**
 * Lazy phase - runs after initial content is loaded
 * Use this for enhancements that improve the experience but aren't critical
 * @param {Document} doc The document
 */
// eslint-disable-next-line no-unused-vars
export async function lazy(doc) {
  // Load blocks in the aside
  const aside = doc.querySelector('aside');
  if (aside) {
    await loadSections(aside);
  }
}

/**
 * Delayed phase - runs after everything else, for non-critical features
 * Use this for analytics, social sharing, or other features that can wait
 * @param {Document} doc The document
 */
// eslint-disable-next-line no-unused-vars
export async function delayed(doc) {
  // no operations
}
