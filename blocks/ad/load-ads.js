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

  // Create FPO image using a colorful gradient
  // Using a vibrant gradient to distinguish from gray placeholder
  const fpoUrl = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="adGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#adGradient)"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="16" 
        font-weight="bold"
        fill="#ffffff"
        stroke="#333333"
        stroke-width="0.5"
      >
        Ad Loaded ${width}x${height}
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
