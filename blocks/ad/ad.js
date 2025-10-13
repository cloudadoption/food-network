/**
 * Creates a placeholder FPO image as a data URL
 * @param {number} width - Width of the ad
 * @param {number} height - Height of the ad
 * @returns {string} Data URL of the SVG image
 */
function createFPOImage(width, height) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e0e0e0"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="24"
        fill="#666"
        text-anchor="middle"
        dominant-baseline="middle">
        FPO Ad ${width}x${height}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Gets the ad dimensions based on the variant
 * @param {string} variant - The ad variant (banner, large-banner, square, or default)
 * @returns {object} Object with width and height properties
 */
function getAdDimensions(variant) {
  const dimensions = {
    banner: { width: 728, height: 90 },
    'large-banner': { width: 970, height: 185 },
    square: { width: 300, height: 300 },
    default: { width: 300, height: 600 },
  };

  return dimensions[variant] || dimensions.default;
}

/**
 * Loads the ad content in the delayed phase
 * @param {Element} block - The ad block element
 */
async function loadAdContent(block) {
  // Simulate delayed loading (this would be replaced with actual ad framework in production)
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  // Determine the ad variant
  const variant = [...block.classList].find((cls) => cls !== 'ad' && cls !== 'block') || 'default';
  const { width, height } = getAdDimensions(variant);

  // Create FPO image
  const img = document.createElement('img');
  img.src = createFPOImage(width, height);
  img.alt = `Advertisement ${width}x${height}`;
  img.loading = 'lazy';

  // Clear the block and add the image
  const container = block.querySelector('div') || document.createElement('div');
  container.innerHTML = '';
  container.appendChild(img);

  if (!block.querySelector('div')) {
    block.appendChild(container);
  }

  // Mark as loaded
  block.classList.add('loaded');
}

/**
 * Loads and decorates the ad block
 * @param {Element} block The ad block element
 */
export default async function decorate(block) {
  // 1. Extract configuration from block content
  // The block may contain a variant name (banner, large-banner, square)
  const rows = [...block.children];
  let variant = 'default';

  if (rows.length > 0) {
    const firstCell = rows[0].querySelector('div');
    if (firstCell) {
      const text = firstCell.textContent.trim().toLowerCase();
      if (['banner', 'large-banner', 'square', 'default'].includes(text)) {
        variant = text;
        block.classList.add(variant);
      }
    }
  }

  // 2. Clear the block content
  block.innerHTML = '';

  // 3. Create a container for the ad
  const container = document.createElement('div');
  block.appendChild(container);

  // 4. Set ARIA label for accessibility
  block.setAttribute('role', 'complementary');
  block.setAttribute('aria-label', 'Advertisement');

  // 5. Schedule delayed loading
  // In production, this would hook into the actual delayed.js phase
  // For now, we'll use a simple timeout to simulate the delayed phase
  if (document.readyState === 'complete') {
    loadAdContent(block);
  } else {
    window.addEventListener('load', () => {
      loadAdContent(block);
    });
  }
}
