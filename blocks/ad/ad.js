/**
 * Loads and decorates the ad block
 * @param {Element} block The ad block element
 */
export default async function decorate(block) {
  // Extract ad size from block classes
  // Expected structure: authors can add a variant like "banner", "large-banner", "square"
  // If no variant specified, defaults to 300x600

  const adSize = [...block.classList].find((cls) => ['banner', 'large-banner', 'square'].includes(cls));

  // Clear the block content - we'll replace with ad placeholder
  block.innerHTML = '';

  // Store ad size for later use in delayed loading
  block.dataset.adSize = adSize || 'default';

  // Mark as ready for delayed loading
  block.classList.add('ad-placeholder');
}
