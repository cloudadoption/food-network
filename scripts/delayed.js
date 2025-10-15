import loadAds from '../blocks/ad/load-ads.js';

async function loadDelayed() {
  window.postMessage('delayed', window.location.origin);

  await loadAds();
}

loadDelayed();
