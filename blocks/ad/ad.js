import { readBlockConfig } from '../../scripts/aem.js';

const AD_SIZES = {
  banner: { width: 728, height: 90 },
  'large-banner': { width: 970, height: 185 },
  square: { width: 300, height: 300 },
  default: { width: 300, height: 600 },
};

function getConfigValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function normaliseType(value) {
  if (!value) {
    return 'default';
  }
  const type = getConfigValue(value);
  return type.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  const type = normaliseType(config.type);
  const size = AD_SIZES[type] || AD_SIZES.default;
  const label = getConfigValue(config.label) || 'Advertisement';
  const fpoSrc = getConfigValue(config['fpo-image'] || config.image);
  const altText = getConfigValue(config['image-alt']) || label;

  block.textContent = '';
  block.classList.add(`ad-${type}`);

  const slot = document.createElement('div');
  slot.className = 'ad-slot';
  slot.setAttribute('role', 'img');
  slot.setAttribute('aria-label', label);

  const badge = document.createElement('span');
  badge.className = 'ad-badge';
  badge.textContent = label;
  slot.append(badge);

  const placeholder = document.createElement('div');
  placeholder.className = 'ad-placeholder';

  const labelEl = document.createElement('span');
  labelEl.className = 'ad-placeholder-label';
  labelEl.textContent = label;
  placeholder.append(labelEl);

  const sizeEl = document.createElement('span');
  sizeEl.className = 'ad-placeholder-size';
  sizeEl.textContent = `${size.width} × ${size.height}`;
  placeholder.append(sizeEl);

  slot.append(placeholder);
  block.append(slot);

  block.dataset.adType = type;
  block.dataset.adLabel = label;
  block.dataset.adWidth = size.width;
  block.dataset.adHeight = size.height;
  block.dataset.adAlt = altText;
  if (fpoSrc) {
    block.dataset.adFpo = fpoSrc;
  }
}
