/**
 * Recipe Ingredients Block
 * Displays recipe ingredients in a list format with interactive checkboxes
 */

/**
 * Decorates the recipe ingredients block
 * @param {Element} block The recipe ingredients block element
 */
export default function decorate(block) {
  // Create the ingredients list container
  const ingredientsList = document.createElement('ul');
  ingredientsList.className = 'ingredients-list';

  // Extract all ingredient paragraphs from the block
  const ingredientParagraphs = block.querySelectorAll('p');

  ingredientParagraphs.forEach((p) => {
    const ingredientText = p.textContent.trim();

    // Skip empty ingredients
    if (!ingredientText) return;

    // Create list item
    const li = document.createElement('li');
    li.className = 'ingredient-item';

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `ingredient-${Math.random().toString(36).substr(2, 9)}`;
    checkbox.className = 'ingredient-checkbox';
    checkbox.setAttribute('aria-label', `Check off ${ingredientText}`);

    // Create label
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.className = 'ingredient-label';
    label.textContent = ingredientText;

    // Add checkbox change handler to apply strikethrough
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        label.classList.add('checked');
      } else {
        label.classList.remove('checked');
      }
    });

    // Append checkbox and label to list item
    li.appendChild(checkbox);
    li.appendChild(label);
    ingredientsList.appendChild(li);
  });

  // Replace block content with the new list
  block.replaceChildren(ingredientsList);
}
