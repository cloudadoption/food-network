import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('ul > li.nav-drop').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Loads a flyout fragment for a navigation section
 * @param {string} sectionId The section identifier (e.g., 'recipes', 'shows')
 * @returns {Promise<HTMLElement|null>} The flyout content element
 */
async function loadFlyout(sectionId) {
  try {
    const fragment = await loadFragment(`/fragments/nav/${sectionId}`);
    if (fragment && fragment.firstElementChild) {
      return fragment.firstElementChild;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load flyout for ${sectionId}:`, error);
  }
  return null;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/fragments/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // Process fragment sections - they have section-metadata with id
  const sections = Array.from(fragment.querySelectorAll(':scope > div'));

  // Helper to find section by metadata id
  const findSection = (id) => sections.find((s) => {
    const metadata = s.querySelector('.section-metadata');
    if (metadata) {
      const idCell = Array.from(metadata.querySelectorAll('div > div')).find(
        (cell) => cell.textContent.trim().toLowerCase() === 'id',
      );
      if (idCell && idCell.nextElementSibling) {
        return idCell.nextElementSibling.textContent.trim().toLowerCase() === id;
      }
    }
    return false;
  });

  const adSection = findSection('ad');
  const brandSection = findSection('brand');
  const mainSections = findSection('sections');
  const toolsSection = findSection('tools');

  // Create trending line (ad section)
  if (adSection) {
    const trendingLine = document.createElement('div');
    trendingLine.className = 'nav-trending';
    const adContent = adSection.querySelector('ul');
    if (adContent) {
      trendingLine.appendChild(adContent.cloneNode(true));
    }
    nav.appendChild(trendingLine);
  }

  // Create brand section
  if (brandSection) {
    const navBrand = document.createElement('div');
    navBrand.className = 'nav-brand';
    const logoIcon = brandSection.querySelector('.icon-logo');
    if (logoIcon) {
      const logoLink = document.createElement('a');
      logoLink.href = '/';
      logoLink.setAttribute('aria-label', 'Food Network Home');
      logoLink.appendChild(logoIcon.cloneNode(true));
      navBrand.appendChild(logoLink);
    }
    nav.appendChild(navBrand);
  }

  // Create main navigation sections
  if (mainSections) {
    const navSections = document.createElement('div');
    navSections.className = 'nav-sections';
    const sectionsList = mainSections.querySelector('ul');

    if (sectionsList) {
      const sectionsUl = document.createElement('ul');

      Array.from(sectionsList.children).forEach((item) => {
        const li = document.createElement('li');
        const text = item.textContent.trim();
        const link = item.querySelector('a');

        if (link) {
          // Item with link
          li.appendChild(link.cloneNode(true));
        } else {
          // Item without link - potential flyout trigger
          const span = document.createElement('span');
          span.textContent = text;
          span.className = 'nav-drop';
          li.appendChild(span);
          li.classList.add('nav-drop');
          li.setAttribute('aria-expanded', 'false');

          // Normalize section id for flyout loading
          const sectionId = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

          // Add click handler for flyout loading
          li.addEventListener('click', async (e) => {
            e.stopPropagation();

            if (isDesktop.matches) {
              const expanded = li.getAttribute('aria-expanded') === 'true';
              toggleAllNavSections(navSections);

              if (!expanded) {
                li.setAttribute('aria-expanded', 'true');

                // Load flyout content if not already loaded
                if (!li.querySelector('.nav-flyout')) {
                  const flyoutContent = await loadFlyout(sectionId);
                  if (flyoutContent) {
                    const flyout = document.createElement('div');
                    flyout.className = 'nav-flyout';
                    flyout.appendChild(flyoutContent);
                    li.appendChild(flyout);
                  }
                }
              } else {
                li.setAttribute('aria-expanded', 'false');
              }
            }
          });
        }

        sectionsUl.appendChild(li);
      });

      navSections.appendChild(sectionsUl);
    }
    nav.appendChild(navSections);
  }

  // Create tools section
  if (toolsSection) {
    const navTools = document.createElement('div');
    navTools.className = 'nav-tools';
    const toolsList = toolsSection.querySelector('ul');
    if (toolsList) {
      navTools.appendChild(toolsList.cloneNode(true));
    }
    nav.appendChild(navTools);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  const navSections = nav.querySelector('.nav-sections');
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
