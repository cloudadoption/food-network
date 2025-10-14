import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the editorial promo block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Convert block to unordered list
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    // Extract image and link from row
    const imageDiv = row.children[0];
    const linkDiv = row.children[1];

    if (imageDiv && linkDiv) {
      // Create link wrapper
      const link = linkDiv.querySelector('a');
      if (link) {
        const anchor = document.createElement('a');
        anchor.href = link.href;
        anchor.className = 'editorial-promo-link';

        // Add image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'editorial-promo-image';
        const picture = imageDiv.querySelector('picture');
        if (picture) {
          const img = picture.querySelector('img');
          if (img) {
            imageContainer.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '161' }]));
          }
        }

        // Add text container
        const textContainer = document.createElement('div');
        textContainer.className = 'editorial-promo-text';
        textContainer.textContent = link.textContent;

        anchor.append(imageContainer);
        anchor.append(textContainer);
        li.append(anchor);
      }
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
