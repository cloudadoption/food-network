/**
 * Recipe template - demonstrates eager/lazy/delayed phases
 */

/**
 * Eager phase - runs before body is revealed and before first section loads
 * Use this for critical functionality that affects initial render
 * @param {Document} doc The document
 */
export async function eager(doc) {
  // Example: Add recipe-specific metadata display
  const main = doc.querySelector('main');
  if (!main) return;

  // Create a recipe metadata element if we have recipe metadata
  const prepTime = doc.querySelector('meta[name="prep-time"]')?.content;
  const cookTime = doc.querySelector('meta[name="cook-time"]')?.content;
  const servings = doc.querySelector('meta[name="servings"]')?.content;

  if (prepTime || cookTime || servings) {
    const metadataDiv = document.createElement('div');
    metadataDiv.className = 'recipe-metadata';

    if (prepTime) {
      const prepDiv = document.createElement('div');
      prepDiv.innerHTML = `<dt>Prep Time</dt><dd>${prepTime}</dd>`;
      metadataDiv.appendChild(prepDiv);
    }

    if (cookTime) {
      const cookDiv = document.createElement('div');
      cookDiv.innerHTML = `<dt>Cook Time</dt><dd>${cookTime}</dd>`;
      metadataDiv.appendChild(cookDiv);
    }

    if (servings) {
      const servingsDiv = document.createElement('div');
      servingsDiv.innerHTML = `<dt>Servings</dt><dd>${servings}</dd>`;
      metadataDiv.appendChild(servingsDiv);
    }

    // Insert after the first heading in the first section
    const firstSection = main.querySelector('.section');
    if (firstSection) {
      const heading = firstSection.querySelector('h1, h2');
      if (heading) {
        heading.after(metadataDiv);
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log('Recipe template: eager phase complete');
}

/**
 * Lazy phase - runs after initial content is loaded
 * Use this for enhancements that improve the experience but aren't critical
 * @param {Document} doc The document
 */
export async function lazy(doc) {
  // Example: Add print recipe button
  const main = doc.querySelector('main');
  if (!main) return;

  const firstSection = main.querySelector('.section');
  if (firstSection) {
    const printButton = document.createElement('button');
    printButton.textContent = 'Print Recipe';
    printButton.className = 'button primary';
    printButton.onclick = () => window.print();

    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    buttonContainer.appendChild(printButton);

    firstSection.appendChild(buttonContainer);
  }

  // eslint-disable-next-line no-console
  console.log('Recipe template: lazy phase complete');
}

/**
 * Delayed phase - runs after everything else, for non-critical features
 * Use this for analytics, social sharing, or other features that can wait
 * @param {Document} doc The document
 */
export async function delayed(doc) {
  // Example: Log recipe view (simulating analytics)
  const title = doc.querySelector('h1')?.textContent || 'Unknown Recipe';

  // eslint-disable-next-line no-console
  console.log(`Recipe template: delayed phase complete - viewed "${title}"`);

  // In a real implementation, this might send analytics data
  // Example: trackEvent('recipe_view', { recipe_name: title });
}
