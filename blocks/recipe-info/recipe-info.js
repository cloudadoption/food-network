/**
 * loads and decorates the recipe-info block
 * @param {Element} block The recipe-info element
 */
export default async function decorate(block) {
  // Extract all info items from the block
  const items = Array.from(block.children).map((row) => {
    const cells = Array.from(row.children);
    if (cells.length === 2) {
      return {
        label: cells[0].textContent.trim(),
        value: cells[1].textContent.trim(),
      };
    }
    return null;
  }).filter((item) => item !== null);

  // Clear the block
  block.replaceChildren();

  // Create info items based on what's available
  items.forEach((item) => {
    const infoItem = document.createElement('div');
    infoItem.className = 'recipe-info-item';

    const label = document.createElement('div');
    label.className = 'recipe-info-label';
    label.textContent = `${item.label}:`;

    const value = document.createElement('div');
    value.className = 'recipe-info-value';
    value.textContent = item.value;

    infoItem.appendChild(label);
    infoItem.appendChild(value);
    block.appendChild(infoItem);
  });

  // Add nutrition info link
  const nutritionItem = document.createElement('div');
  nutritionItem.className = 'recipe-info-item nutrition-info';

  const nutritionLink = document.createElement('a');
  nutritionLink.href = '#';
  nutritionLink.className = 'nutrition-link';
  nutritionLink.textContent = 'Nutrition Info';
  nutritionLink.addEventListener('click', (e) => {
    e.preventDefault();
    // For now, the link doesn't do anything as per requirements
  });

  nutritionItem.appendChild(nutritionLink);
  block.appendChild(nutritionItem);
}
