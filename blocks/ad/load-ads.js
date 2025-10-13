/**
 * Loads the actual ad content in the delayed phase
 * This simulates loading ad frameworks and replacing with FPO
 * @param {Element} block The ad block element
 */
async function loadAd(block) {
  const { adSize } = block.dataset;

  // Get dimensions based on ad size
  const dimensions = {
    banner: { width: 728, height: 90 },
    'large-banner': { width: 970, height: 185 },
    default: { width: 300, height: 600 },
    square: { width: 300, height: 300 },
  };

  const { width, height } = dimensions[adSize] || dimensions.default;

  // Create FPO image using a placeholder service
  // Using a solid color with text for demonstration
  const fpoUrl = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#cccccc"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="16" 
        fill="#666666"
      >
        Ad Placeholder ${width}x${height}
      </text>
    </svg>
  `)}`;

  // Create and insert the FPO image
  const img = document.createElement('img');
  img.src = fpoUrl;
  img.alt = `Advertisement ${width}x${height}`;
  img.width = width;
  img.height = height;

  block.appendChild(img);
  block.classList.add('loaded');
}

/**
 * Loads all ad blocks on the page during delayed phase
 */
export default async function loadAds() {
  const adBlocks = document.querySelectorAll('.ad.ad-placeholder');
  await Promise.all([...adBlocks].map((block) => loadAd(block)));
}
