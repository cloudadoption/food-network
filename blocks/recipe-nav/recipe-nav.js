/**
 * Recipe navigation block
 * Displays previous and next recipe links
 * @param {Element} block The recipe-nav block element
 */
export default function decorate(block) {
  // The block structure from authoring is:
  // <div class="recipe-nav">
  //   <div>
  //     <div><a href="...">Prev Recipe</a></div>
  //     <div><a href="...">Next Recipe</a></div>
  //   </div>
  // </div>

  // Transform into a more semantic structure
  // Get the first row (direct child div)
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  if (cells.length === 0) return;

  // Create navigation container
  const nav = document.createElement('nav');
  nav.className = 'recipe-nav-container';
  nav.setAttribute('aria-label', 'Recipe navigation');

  // Process prev link (first cell)
  if (cells[0]) {
    const prevLink = cells[0].querySelector('a');
    if (prevLink) {
      const prevDiv = document.createElement('div');
      prevDiv.className = 'recipe-nav-prev';

      // Add aria label for accessibility
      prevLink.setAttribute('aria-label', 'Previous recipe');
      prevLink.className = 'recipe-nav-link';

      // Add prev icon/chevron
      const prevIcon = document.createElement('span');
      prevIcon.className = 'recipe-nav-icon';
      prevIcon.setAttribute('aria-hidden', 'true');
      prevIcon.textContent = '‹';

      prevLink.prepend(prevIcon);
      prevDiv.append(prevLink);
      nav.append(prevDiv);
    }
  }

  // Process next link (second cell)
  if (cells[1]) {
    const nextLink = cells[1].querySelector('a');
    if (nextLink) {
      const nextDiv = document.createElement('div');
      nextDiv.className = 'recipe-nav-next';

      // Add aria label for accessibility
      nextLink.setAttribute('aria-label', 'Next recipe');
      nextLink.className = 'recipe-nav-link';

      // Add next icon/chevron
      const nextIcon = document.createElement('span');
      nextIcon.className = 'recipe-nav-icon';
      nextIcon.setAttribute('aria-hidden', 'true');
      nextIcon.textContent = '›';

      nextLink.append(nextIcon);
      nextDiv.append(nextLink);
      nav.append(nextDiv);
    }
  }

  // Replace block content with navigation
  block.replaceChildren(nav);
}
