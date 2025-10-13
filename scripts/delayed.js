function loadAdBlocks() {
  const adBlocks = document.querySelectorAll('.ad:not([data-ad-processed="true"])');
  adBlocks.forEach((block) => {
    const slot = block.querySelector('.ad-slot');
    if (!slot) {
      return;
    }

    const placeholder = slot.querySelector('.ad-placeholder');
    const fpoSrc = block.dataset.adFpo;
    const altText = block.dataset.adAlt || block.dataset.adLabel || 'Advertisement';
    const width = Number(block.dataset.adWidth);
    const height = Number(block.dataset.adHeight);

    if (fpoSrc) {
      const img = document.createElement('img');
      img.alt = altText;
      if (width) img.width = width;
      if (height) img.height = height;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => {
        if (placeholder) {
          placeholder.remove();
        }
        slot.classList.add('ad-slot--loaded');
        slot.removeAttribute('role');
        slot.removeAttribute('aria-label');
      });
      img.addEventListener('error', () => {
        slot.classList.add('ad-slot--error');
      });
      img.src = fpoSrc;
      slot.append(img);
    } else if (placeholder) {
      placeholder.classList.add('ad-placeholder--static');
    }

    block.dataset.adProcessed = 'true';
  });
}

loadAdBlocks();
