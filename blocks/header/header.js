import { getMetadata, toClassName } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

const flyoutCache = new Map();

/**
 * Hides the shared desktop flyout panel.
 * @param {HTMLElement|null} nav The nav element
 */
function closeDesktopFlyout(nav) {
  if (!nav) return;
  const flyoutPanel = nav.querySelector('.nav-flyout-panel');
  if (flyoutPanel) {
    flyoutPanel.innerHTML = '';
    flyoutPanel.hidden = true;
  }
  nav.removeAttribute('data-active-flyout');
}

/**
 * Collapses all open nav sections and clears flyout content.
 * @param {HTMLElement|null} navSections The nav sections element
 */
function collapseAllSections(navSections) {
  if (!navSections) return;
  navSections.querySelectorAll('[aria-expanded="true"]').forEach((item) => {
    item.setAttribute('aria-expanded', 'false');
    const trigger = item.querySelector('[aria-haspopup="true"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    const mobileFlyout = item.querySelector('.nav-flyout');
    if (mobileFlyout) mobileFlyout.remove();
  });
  closeDesktopFlyout(navSections.closest('nav'));
}

/**
 * Fetches and caches flyout content.
 * @param {string} flyoutId The fragment identifier to load
 * @returns {Promise<HTMLElement|null>} The cached template element
 */
async function getFlyoutContent(flyoutId) {
  if (!flyoutId) return null;
  if (flyoutCache.has(flyoutId)) return flyoutCache.get(flyoutId);

  try {
    const fragment = await loadFragment(`/fragments/nav/${flyoutId}`);
    const section = fragment?.querySelector('.section');
    const content = section?.querySelector('.default-content-wrapper');
    if (!content) {
      flyoutCache.set(flyoutId, null);
      return null;
    }
    flyoutCache.set(flyoutId, content);
    return content;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[header] failed to load flyout', flyoutId, error);
    flyoutCache.set(flyoutId, null);
    return null;
  }
}

/**
 * Opens a nav flyout for the provided section.
 * @param {HTMLElement} nav The nav element
 * @param {HTMLElement} navSections The nav sections container
 * @param {HTMLElement} item The nav item requesting the flyout
 */
async function openFlyout(nav, navSections, item) {
  if (!nav || !navSections || !item) return;
  const flyoutId = item.dataset.flyout;
  if (!flyoutId) return;

  const template = await getFlyoutContent(flyoutId);
  if (!template) return;

  const trigger = item.querySelector('[aria-haspopup="true"]');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  item.setAttribute('aria-expanded', 'true');

  if (isDesktop.matches) {
    const flyoutPanel = nav.querySelector('.nav-flyout-panel');
    if (flyoutPanel) {
      flyoutPanel.innerHTML = '';
      flyoutPanel.append(template.cloneNode(true));
      flyoutPanel.hidden = false;
      nav.dataset.activeFlyout = flyoutId;
    }
  } else {
    let mobileContainer = item.querySelector('.nav-flyout');
    if (!mobileContainer) {
      mobileContainer = document.createElement('div');
      mobileContainer.className = 'nav-flyout';
      item.append(mobileContainer);
    } else {
      mobileContainer.innerHTML = '';
    }
    mobileContainer.append(template.cloneNode(true));
  }
}

/**
 * Toggles the entire nav open/closed state.
 * @param {HTMLElement} nav Nav element
 * @param {HTMLElement} navSections Nav sections container
 * @param {HTMLButtonElement} hamburgerButton The hamburger toggle button
 * @param {boolean|null} forceExpanded Explicit state override
 */
function toggleMenu(nav, navSections, hamburgerButton, forceExpanded = null) {
  if (!nav) return;
  const isExpanded = nav.getAttribute('aria-expanded') === 'true';
  const nextState = forceExpanded !== null ? forceExpanded : !isExpanded;

  nav.setAttribute('aria-expanded', nextState ? 'true' : 'false');
  if (hamburgerButton) {
    hamburgerButton.setAttribute('aria-label', nextState ? 'Close navigation' : 'Open navigation');
  }

  document.body.style.overflowY = nextState && !isDesktop.matches ? 'hidden' : '';

  if (!nextState || isDesktop.matches) {
    collapseAllSections(navSections);
  }
}

/**
 * Loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/fragments/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const navSectionsById = {};
  fragment.querySelectorAll(':scope > .section').forEach((section) => {
    const { id } = section.dataset;
    if (id) navSectionsById[id] = section;
  });

  block.textContent = '';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  block.append(navWrapper);

  const adSection = navSectionsById.ad;
  if (adSection) {
    const banner = document.createElement('div');
    banner.className = 'nav-banner';
    while (adSection.firstElementChild) {
      banner.append(adSection.firstElementChild);
    }
    if (banner.children.length > 0) {
      navWrapper.append(banner);
    }
  }

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  navWrapper.append(nav);

  const topBar = document.createElement('div');
  topBar.className = 'nav-topbar';
  nav.append(topBar);

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  topBar.append(hamburger);
  const hamburgerButton = hamburger.querySelector('button');

  const brandLink = document.createElement('a');
  brandLink.className = 'nav-logo';
  brandLink.href = '/';
  brandLink.setAttribute('aria-label', 'Food Network home');
  const logoSpan = navSectionsById.brand?.querySelector('.icon-logo');
  if (logoSpan) {
    brandLink.append(logoSpan);
  } else {
    brandLink.textContent = 'Food Network';
  }
  topBar.append(brandLink);

  const toolsContainer = document.createElement('div');
  toolsContainer.className = 'nav-tools';
  const toolsSource = navSectionsById.tools?.querySelector('ul');
  if (toolsSource) {
    const toolsList = toolsSource.cloneNode(true);
    toolsList.querySelectorAll('p').forEach((p) => {
      if (p.childElementCount === 1 && p.firstElementChild?.tagName === 'A') {
        p.replaceWith(p.firstElementChild);
      }
    });
    toolsContainer.append(toolsList);
  }
  topBar.append(toolsContainer);

  const utilitySource = navSectionsById.brand?.querySelector('ul');
  if (utilitySource && utilitySource.children.length > 0) {
    const utilityList = document.createElement('ul');
    utilityList.className = 'nav-utility';
    while (utilitySource.firstElementChild) {
      utilityList.append(utilitySource.firstElementChild);
    }
    nav.append(utilityList);
  }

  const sectionsContainer = document.createElement('div');
  sectionsContainer.className = 'nav-sections';
  nav.append(sectionsContainer);

  const sectionsList = document.createElement('ul');
  sectionsList.className = 'nav-main-links';
  sectionsContainer.append(sectionsList);

  const sectionsSource = navSectionsById.sections?.querySelector('.default-content-wrapper > ul');
  if (sectionsSource) {
    sectionsSource.querySelectorAll(':scope > li').forEach((srcItem) => {
      const li = document.createElement('li');
      li.classList.add('nav-item');

      const anchor = srcItem.querySelector('a');
      const label = anchor ? anchor.textContent.trim() : srcItem.textContent.trim();
      const flyoutId = srcItem.dataset.flyout || toClassName(label);

      if (srcItem.dataset.flyout || !anchor) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-link';
        button.textContent = label;
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        li.append(button);
        if (flyoutId) {
          li.dataset.flyout = flyoutId;
          li.classList.add('nav-drop');
          li.setAttribute('aria-expanded', 'false');
        }
      } else if (anchor) {
        const link = anchor.cloneNode(true);
        link.classList.add('nav-link');
        li.append(link);
      }

      sectionsList.append(li);
    });
  }

  const flyoutPanel = document.createElement('div');
  flyoutPanel.className = 'nav-flyout-panel';
  flyoutPanel.hidden = true;
  nav.append(flyoutPanel);

  const navDrops = sectionsList.querySelectorAll('.nav-drop');
  navDrops.forEach((item) => {
    const trigger = item.querySelector('button');
    if (!trigger) return;

    trigger.addEventListener('click', async (event) => {
      event.preventDefault();
      if (item.getAttribute('aria-expanded') === 'true') {
        collapseAllSections(sectionsContainer);
        trigger.focus();
      } else {
        collapseAllSections(sectionsContainer);
        await openFlyout(nav, sectionsContainer, item);
      }
    });

    trigger.addEventListener('keydown', async (event) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        if (item.getAttribute('aria-expanded') === 'true') {
          collapseAllSections(sectionsContainer);
        } else {
          collapseAllSections(sectionsContainer);
          await openFlyout(nav, sectionsContainer, item);
        }
      }
    });

    item.addEventListener('mouseenter', async () => {
      if (!isDesktop.matches) return;
      if (item.getAttribute('aria-expanded') === 'true') return;
      collapseAllSections(sectionsContainer);
      await openFlyout(nav, sectionsContainer, item);
    });

    item.addEventListener('focusin', async () => {
      if (!isDesktop.matches) return;
      if (item.getAttribute('aria-expanded') === 'true') return;
      collapseAllSections(sectionsContainer);
      await openFlyout(nav, sectionsContainer, item);
    });
  });

  hamburgerButton?.addEventListener('click', () => {
    toggleMenu(nav, sectionsContainer, hamburgerButton);
  });

  nav.addEventListener('mouseleave', () => {
    if (!isDesktop.matches) return;
    collapseAllSections(sectionsContainer);
  });

  nav.addEventListener('focusout', (event) => {
    if (nav.contains(event.relatedTarget)) return;
    collapseAllSections(sectionsContainer);
    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, sectionsContainer, hamburgerButton, false);
    }
  });

  const handleEscape = (event) => {
    if (event.code !== 'Escape') return;
    const expandedItem = sectionsContainer.querySelector('[aria-expanded="true"]');
    if (expandedItem && isDesktop.matches) {
      collapseAllSections(sectionsContainer);
      const trigger = expandedItem.querySelector('button,[aria-haspopup="true"]');
      trigger?.focus();
      return;
    }

    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, sectionsContainer, hamburgerButton, false);
      hamburgerButton?.focus();
    }
  };

  window.addEventListener('keydown', handleEscape);

  isDesktop.addEventListener('change', (event) => {
    collapseAllSections(sectionsContainer);
    document.body.style.overflowY = '';
    if (event.matches) {
      toggleMenu(nav, sectionsContainer, hamburgerButton, false);
    } else {
      nav.setAttribute('aria-expanded', 'false');
      hamburgerButton?.setAttribute('aria-label', 'Open navigation');
    }
  });
}
