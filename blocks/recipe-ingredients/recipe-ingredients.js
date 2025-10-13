/**
 * Recipe Ingredients Block
 * Displays recipe ingredients in a list format with interactive checkboxes
 */

/**
 * Updates the select/deselect all toggle label
 * @param {Element} toggle The toggle button element
 * @param {NodeList} checkboxes All ingredient checkboxes
 */
function updateToggleLabel(toggle, checkboxes) {
  const checkedCount = Array.from(checkboxes).filter((cb) => cb.checked).length;
  const allChecked = checkedCount === checkboxes.length;

  // Get the icon element (it's the first child)
  const icon = toggle.querySelector('.toggle-icon');

  if (allChecked) {
    toggle.textContent = 'Deselect All';
  } else {
    toggle.textContent = 'Select All';
  }

  // Re-add the icon at the beginning
  if (icon) {
    toggle.prepend(icon);
  }
}

/**
 * Updates the shopping list button state
 * @param {Element} button The shopping list button element
 * @param {NodeList} checkboxes All ingredient checkboxes
 */
function updateShoppingListButton(button, checkboxes) {
  const checkedCount = Array.from(checkboxes).filter((cb) => cb.checked).length;
  if (checkedCount === 0) {
    button.disabled = true;
  } else {
    button.disabled = false;
  }
}

/**
 * Decorates the recipe ingredients block
 * @param {Element} block The recipe ingredients block element
 */
export default function decorate(block) {
  // Create container
  const container = document.createElement('div');
  container.className = 'ingredients-container';

  // Create select/deselect all toggle
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'ingredients-toggle-container';

  const toggleButton = document.createElement('button');
  toggleButton.className = 'ingredients-toggle';
  toggleButton.textContent = 'Select All';
  toggleButton.type = 'button';

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'toggle-icon';
  toggleIcon.setAttribute('aria-hidden', 'true');

  toggleButton.prepend(toggleIcon);
  toggleContainer.appendChild(toggleButton);

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

    // Append checkbox and label to list item
    li.appendChild(checkbox);
    li.appendChild(label);
    ingredientsList.appendChild(li);
  });

  // Create action buttons container
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'ingredients-actions';

  // Add to Shopping List button
  const addToListButton = document.createElement('button');
  addToListButton.className = 'action-button primary';
  addToListButton.type = 'button';
  addToListButton.disabled = true;
  addToListButton.innerHTML = '<span class="button-icon plus-icon" aria-hidden="true"></span>Add to Shopping List';

  // View Shopping List button
  const viewListButton = document.createElement('button');
  viewListButton.className = 'action-button secondary';
  viewListButton.type = 'button';
  viewListButton.innerHTML = '<span class="button-icon cart-icon" aria-hidden="true"></span>View Shopping List';

  // Ingredient Substitutions button
  const substitutionsButton = document.createElement('button');
  substitutionsButton.className = 'action-button secondary';
  substitutionsButton.type = 'button';
  substitutionsButton.innerHTML = '<span class="button-icon droplet-icon" aria-hidden="true"></span>Ingredient Substitutions';

  actionsContainer.appendChild(addToListButton);
  actionsContainer.appendChild(viewListButton);
  actionsContainer.appendChild(substitutionsButton);

  // Assemble the block
  container.appendChild(toggleContainer);
  container.appendChild(ingredientsList);
  container.appendChild(actionsContainer);

  // Get all checkboxes for event handling
  const checkboxes = ingredientsList.querySelectorAll('.ingredient-checkbox');

  // Add checkbox change handlers
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      updateToggleLabel(toggleButton, checkboxes);
      updateShoppingListButton(addToListButton, checkboxes);
    });
  });

  // Add toggle button handler
  toggleButton.addEventListener('click', () => {
    const checkedCount = Array.from(checkboxes).filter((cb) => cb.checked).length;
    const allChecked = checkedCount === checkboxes.length;

    checkboxes.forEach((cb) => {
      // eslint-disable-next-line no-param-reassign
      cb.checked = !allChecked;
    });

    updateToggleLabel(toggleButton, checkboxes);
    updateShoppingListButton(addToListButton, checkboxes);
  });

  // Replace block content
  block.replaceChildren(container);
}
