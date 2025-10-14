import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the recipe sidebar block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const fragment = await loadFragment('/fragments/recipe-sidebar');
  if (fragment) {
    block.closest('.section').replaceWith(...fragment.childNodes);
  }
}
