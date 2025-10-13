/**
 * Recipe Template JavaScript
 * This template demonstrates the three-phase loading system:
 * - eager: Called before the first section is loaded (critical for LCP)
 * - lazy: Called after lazy page load (for below-the-fold content)
 * - delayed: Called during delayed load (for analytics, etc.)
 */

/**
 * Eager phase - runs before first section loads
 * Use this for critical functionality needed for LCP
 * @param {Document} doc The document
 */
export async function eager(doc) {
  // Example: Add recipe metadata if present
  const main = doc.querySelector('main');
  if (!main) return;

  // Look for recipe metadata in the first section
  const firstSection = main.querySelector('.section');
  if (!firstSection) return;

  // Check if there's a table with recipe metadata
  const tables = firstSection.querySelectorAll('table');
  tables.forEach((table) => {
    const rows = table.querySelectorAll('tr');
    const isRecipeMetadata = Array.from(rows).some((row) => {
      const cells = row.querySelectorAll('td');
      return cells.length === 2 && (
        cells[0].textContent.toLowerCase().includes('prep time')
        || cells[0].textContent.toLowerCase().includes('cook time')
        || cells[0].textContent.toLowerCase().includes('servings')
      );
    });

    if (isRecipeMetadata) {
      // Transform table into recipe metadata display
      const metadataDiv = document.createElement('div');
      metadataDiv.className = 'recipe-metadata';

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 2) {
          const item = document.createElement('div');
          item.className = 'metadata-item';

          const label = document.createElement('div');
          label.className = 'label';
          label.textContent = cells[0].textContent;

          const value = document.createElement('div');
          value.className = 'value';
          value.textContent = cells[1].textContent;

          item.appendChild(label);
          item.appendChild(value);
          metadataDiv.appendChild(item);
        }
      });

      table.replaceWith(metadataDiv);
    }
  });

  // eslint-disable-next-line no-console
  console.log('Recipe template: eager phase completed');
}

/**
 * Lazy phase - runs after lazy page load
 * Use this for below-the-fold enhancements
 * @param {Document} doc The document
 */
export async function lazy(doc) {
  const main = doc.querySelector('main');
  if (!main) return;

  // Find and style ingredients lists
  const lists = main.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    // Check if this looks like an ingredients list
    const items = Array.from(list.querySelectorAll('li'));
    const hasIngredientPattern = items.some((item) => {
      const text = item.textContent.toLowerCase();
      return text.match(/\d+\s*(cup|tablespoon|teaspoon|oz|lb|gram|ml|liter)/);
    });

    if (hasIngredientPattern) {
      list.classList.add('ingredients-list');
    }
  });

  // Find and style recipe steps
  const sections = main.querySelectorAll('.section');
  sections.forEach((section) => {
    const heading = section.querySelector('h2, h3');
    if (heading && heading.textContent.toLowerCase().includes('step')) {
      const content = section.querySelector('ol, ul');
      if (content) {
        content.classList.add('recipe-steps');
        const items = content.querySelectorAll('li');
        items.forEach((item) => {
          item.classList.add('step');
        });
      }
    }
  });

  // eslint-disable-next-line no-console
  console.log('Recipe template: lazy phase completed');
}

/**
 * Delayed phase - runs after a delay
 * Use this for analytics, tracking, or other non-critical functionality
 */
export function delayed() {
  // Example: Track recipe page view
  // In a real implementation, this would send data to analytics
  const recipeName = document.querySelector('h1')?.textContent || 'Unknown Recipe';

  // eslint-disable-next-line no-console
  console.log(`Recipe template: delayed phase completed for "${recipeName}"`);

  // Example: Add print recipe button (non-critical enhancement)
  const main = document.querySelector('main');
  if (main) {
    const printButton = document.createElement('button');
    printButton.textContent = 'Print Recipe';
    printButton.className = 'print-recipe-btn';
    printButton.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 2rem;
      background: var(--recipe-accent-color, #27ae60);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 1000;
    `;

    printButton.addEventListener('mouseenter', () => {
      printButton.style.transform = 'translateY(-2px)';
      printButton.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
    });

    printButton.addEventListener('mouseleave', () => {
      printButton.style.transform = 'translateY(0)';
      printButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });

    printButton.addEventListener('click', () => {
      window.print();
    });

    document.body.appendChild(printButton);
  }
}

