import {
  decorateIcons,
  getMetadata,
  toClassName,
} from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');
const flyoutCache = new Map();
const flyoutPromises = new Map();

function moveSectionContent(source, target) {
  if (!source || !target) return;
  const wrapper = source.querySelector(':scope > .default-content-wrapper') || source;
  while (wrapper.firstChild) {
    target.append(wrapper.firstChild);
  }
}

async function fetchFlyout(sectionId) {
  if (!sectionId) return '';
  if (flyoutCache.has(sectionId)) return flyoutCache.get(sectionId);
  if (!flyoutPromises.has(sectionId)) {
    flyoutPromises.set(sectionId, (async () => {
      const fragment = await loadFragment(`/fragments/nav/${sectionId}`);
      if (!fragment) return '';
      const section = fragment.querySelector('.section');
      if (!section) return '';
      const container = document.createElement('div');
      while (section.firstChild) {
        container.append(section.firstChild);
      }
      return container.innerHTML;
    })());
  }
  const html = await flyoutPromises.get(sectionId);
  flyoutCache.set(sectionId, html);
  return html;
}

function organizeFlyout(panel) {
  const nodes = [...panel.childNodes];
  if (!nodes.length) return;
  const fragment = document.createDocumentFragment();
  let group = null;
  nodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H6') {
      group = document.createElement('div');
      group.className = 'nav-flyout-group';
      group.append(node);
      fragment.append(group);
    } else if (group && node.nodeType === Node.ELEMENT_NODE) {
      group.append(node);
    } else if (group && node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
      // skip whitespace between groups
    } else if (group) {
      group.append(node);
    } else {
      fragment.append(node);
    }
  });
  panel.textContent = '';
  panel.append(fragment);
}

async function ensureFlyout(panel, sectionId) {
  if (!panel) return false;
  if (panel.dataset.loaded === 'true') {
    return panel.dataset.empty !== 'true';
  }
  if (panel.dataset.loading === 'true') {
    const html = await fetchFlyout(sectionId);
    if (!panel.dataset.loaded) {
      if (html) {
        panel.innerHTML = html;
        decorateIcons(panel);
        panel.dataset.loaded = 'true';
        panel.dataset.empty = 'false';
        return true;
      }
      panel.dataset.loaded = 'true';
      panel.dataset.empty = 'true';
    }
    return panel.dataset.empty !== 'true';
  }
  panel.dataset.loading = 'true';
  const html = await fetchFlyout(sectionId);
  panel.dataset.loading = 'false';
  if (html) {
    panel.innerHTML = html;
    decorateIcons(panel);
    organizeFlyout(panel);
    panel.dataset.loaded = 'true';
    panel.dataset.empty = 'false';
    return true;
  }
  panel.dataset.loaded = 'true';
  panel.dataset.empty = 'true';
  panel.innerHTML = '';
  return false;
}
function closeFlyout(item) {
  if (!item) return;
  const trigger = item.querySelector('.nav-section-trigger');
  const panel = item.querySelector('.nav-flyout');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  if (panel) panel.hidden = true;
  item.classList.remove('is-open');
}

function closeSiblingFlyouts(item) {
  if (!item || !item.parentElement) return;
  item.parentElement
    .querySelectorAll(':scope > li.is-open')
    .forEach((sibling) => {
      if (sibling !== item) closeFlyout(sibling);
    });
}

async function setSectionState(item, expand) {
  if (!item) return;
  const trigger = item.querySelector('.nav-section-trigger');
  const panel = item.querySelector('.nav-flyout');
  if (!trigger || !panel) return;
  try {
    if (expand) {
      const { flyoutId } = trigger.dataset;
      const hasContent = await ensureFlyout(panel, flyoutId);
      if (!hasContent) return;
      closeSiblingFlyouts(item);
    }
    trigger.setAttribute('aria-expanded', expand ? 'true' : 'false');
    panel.hidden = !expand;
    item.classList.toggle('is-open', expand);
  } catch (error) {
    closeFlyout(item);
  }
}

function closeTool(item) {
  if (!item) return;
  const trigger = item.querySelector('.nav-tool-trigger');
  const panel = item.querySelector('.nav-tool-flyout');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  if (panel) panel.hidden = true;
  item.classList.remove('is-open');
}

function closeSiblingTools(item) {
  if (!item || !item.parentElement) return;
  item.parentElement
    .querySelectorAll(':scope > li.is-open')
    .forEach((sibling) => {
      if (sibling !== item) closeTool(sibling);
    });
}

function setToolState(item, expand) {
  if (!item) return;
  const trigger = item.querySelector('.nav-tool-trigger');
  const panel = item.querySelector('.nav-tool-flyout');
  if (!trigger || !panel) return;
  if (expand) closeSiblingTools(item);
  trigger.setAttribute('aria-expanded', expand ? 'true' : 'false');
  panel.hidden = !expand;
  item.classList.toggle('is-open', expand);
}

function closeAllFlyouts(nav) {
  if (!nav) return;
  nav.querySelectorAll('.nav-sections li.is-open').forEach((item) => closeFlyout(item));
  nav.querySelectorAll('.nav-tools li.is-open').forEach((item) => closeTool(item));
}

function toggleMenu(nav, expanded = null) {
  if (!nav) return;
  const current = nav.getAttribute('aria-expanded') === 'true';
  const next = expanded === null ? !current : expanded;
  if (current === next) return;
  nav.setAttribute('aria-expanded', next ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) {
    button.setAttribute('aria-expanded', next ? 'true' : 'false');
    button.setAttribute('aria-label', next ? 'Close navigation' : 'Open navigation');
  }
  document.body.style.overflowY = next && !isDesktop.matches ? 'hidden' : '';
  if (!next) {
    closeAllFlyouts(nav);
  }
}

function handleEscape(event) {
  if (event.key !== 'Escape') return;
  const nav = document.getElementById('nav');
  if (!nav) return;
  if (isDesktop.matches) {
    const openSection = nav.querySelector('.nav-sections li.is-open');
    if (openSection) {
      closeFlyout(openSection);
      const trigger = openSection.querySelector('button');
      if (trigger) trigger.focus();
      return;
    }
  }
  const openTool = nav.querySelector('.nav-tools li.is-open');
  if (openTool) {
    closeTool(openTool);
    const trigger = openTool.querySelector('button, a');
    if (trigger) trigger.focus();
    return;
  }
  if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
    toggleMenu(nav, false);
    const hamburger = nav.querySelector('.nav-hamburger button');
    if (hamburger) hamburger.focus();
  }
}

function handleOutsideInteraction(event) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  if (!nav.contains(event.target)) {
    closeAllFlyouts(nav);
    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
    }
  }
}

function closeOnFocusOut(event) {
  const nav = event.currentTarget;
  const { relatedTarget } = event;
  if (!nav || (relatedTarget && nav.contains(relatedTarget))) return;
  if (isDesktop.matches) {
    closeAllFlyouts(nav);
  }
}

function buildUtility(navWrapper, brandSection) {
  if (!brandSection) return;
  const utilityList = brandSection.querySelector('ul');
  if (!utilityList) return;
  const navUtility = document.createElement('div');
  navUtility.className = 'nav-utility';
  navUtility.append(utilityList);
  navWrapper.append(navUtility);
}

function buildBrand(navBrand, brandSection) {
  if (!navBrand) return;
  const logoSpan = brandSection ? brandSection.querySelector('span.icon') : null;
  if (!logoSpan) return;
  const existingLink = brandSection.querySelector('a');
  const link = document.createElement('a');
  link.href = existingLink ? existingLink.getAttribute('href') : '/';
  link.className = 'nav-brand-link';
  link.setAttribute('aria-label', 'Food Network Home');
  link.append(logoSpan);
  navBrand.append(link);
}

function setupNavSections(navSections) {
  if (!navSections) return;
  const list = navSections.querySelector('ul');
  if (!list) {
    navSections.textContent = '';
    return;
  }
  list.classList.add('nav-sections-list');
  list.querySelectorAll(':scope > li').forEach((item) => {
    const anchor = item.querySelector('a');
    const label = (anchor ? anchor.textContent : item.textContent).trim();
    const flyoutId = toClassName(label);
    while (item.firstChild) item.removeChild(item.firstChild);
    if (anchor && anchor.getAttribute('href')) {
      anchor.classList.add('nav-section-link');
      item.classList.add('nav-section-item');
      item.append(anchor);
      return;
    }
    if (!label) return;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-section-trigger';
    trigger.textContent = label;
    trigger.dataset.flyoutId = flyoutId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-controls', `nav-flyout-${flyoutId}`);
    const panel = document.createElement('div');
    panel.id = `nav-flyout-${flyoutId}`;
    panel.className = 'nav-flyout';
    panel.hidden = true;
    item.classList.add('nav-section-item');
    item.dataset.flyoutId = flyoutId;
    item.append(trigger);
    item.append(panel);
    trigger.addEventListener('click', async (event) => {
      event.preventDefault();
      const expand = !item.classList.contains('is-open');
      await setSectionState(item, expand);
    });
    trigger.addEventListener('keydown', async (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const expand = !item.classList.contains('is-open');
      await setSectionState(item, expand);
    });
    trigger.addEventListener('focus', () => {
      if (isDesktop.matches) setSectionState(item, true);
    });
    item.addEventListener('mouseenter', () => {
      if (isDesktop.matches) setSectionState(item, true);
    });
    item.addEventListener('mouseleave', () => {
      if (isDesktop.matches) closeFlyout(item);
    });
  });
}

function setupNavTools(navTools) {
  if (!navTools) return;
  const list = navTools.querySelector('ul');
  if (!list) {
    navTools.remove();
    return;
  }
  list.classList.add('nav-tools-list');
  list.querySelectorAll(':scope > li').forEach((item) => {
    const submenu = item.querySelector(':scope > ul');
    const iconSpan = item.querySelector(':scope > p span.icon');
    const paragraph = item.querySelector(':scope > p');
    const link = item.querySelector(':scope > p > a');
    if (submenu && iconSpan) {
      const iconName = Array.from(iconSpan.classList).find((cls) => cls.startsWith('icon-')) || 'icon-profile';
      const identifier = toClassName(iconName.replace('icon-', ''));
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-tool-trigger';
      trigger.dataset.toolId = identifier;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-controls', `nav-tool-${identifier}`);
      const label = paragraph?.textContent?.trim() || 'Account';
      trigger.setAttribute('aria-label', label);
      trigger.append(iconSpan);
      const panel = document.createElement('div');
      panel.className = 'nav-tool-flyout';
      panel.id = `nav-tool-${identifier}`;
      panel.hidden = true;
      panel.append(submenu);
      item.textContent = '';
      item.classList.add('nav-tool-dropdown');
      item.append(trigger, panel);
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const expand = !item.classList.contains('is-open');
        setToolState(item, expand);
      });
    } else if (link) {
      const iconEl = link.querySelector('span.icon');
      const linkText = link.childNodes.length ? link.textContent.trim() : '';
      const iconName = iconEl
        ? Array.from(iconEl.classList).find((cls) => cls.startsWith('icon-'))
        : null;
      link.textContent = '';
      if (iconName === 'icon-search') {
        const textSpan = document.createElement('span');
        textSpan.className = 'nav-search-text';
        textSpan.textContent = linkText || 'What are you looking for?';
        link.classList.add('nav-search-link');
        link.append(textSpan);
        if (iconEl) link.append(iconEl);
        link.setAttribute('aria-label', 'Search Food Network');
        item.classList.add('nav-tool-search');
      } else {
        if (iconEl) link.append(iconEl);
        const label = link.getAttribute('title') || linkText || (iconName ? iconName.replace('icon-', '') : 'Menu');
        link.setAttribute('aria-label', label);
        link.classList.add('nav-icon-link');
        item.classList.add('nav-tool-icon');
      }
      item.textContent = '';
      item.append(link);
    } else if (paragraph && iconSpan) {
      paragraph.textContent = '';
      paragraph.append(iconSpan);
      item.textContent = '';
      item.append(paragraph);
    }
  });
}

function bindGlobalListeners(nav) {
  if (!window.foodNetworkHeaderBound) {
    window.foodNetworkHeaderBound = true;
    window.addEventListener('keydown', handleEscape);
    document.addEventListener('pointerdown', handleOutsideInteraction);
  }
  nav.addEventListener('focusout', closeOnFocusOut);
  isDesktop.addEventListener('change', () => {
    document.body.style.overflowY = '';
    toggleMenu(nav, false);
  });
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const brandSection = fragment.querySelector('.section[data-id="brand"]');
  buildUtility(navWrapper, brandSection);

  const adSection = fragment.querySelector('.section[data-id="ad"]');
  if (adSection) {
    const adContainer = document.createElement('div');
    adContainer.className = 'nav-ad';
    moveSectionContent(adSection, adContainer);
    if (adContainer.textContent.trim()) {
      navWrapper.append(adContainer);
    }
  }

  const navInner = document.createElement('div');
  navInner.className = 'nav-inner';
  navWrapper.append(navInner);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  navInner.append(nav);

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  nav.append(hamburger);

  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  buildBrand(navBrand, brandSection);
  nav.append(navBrand);

  const sectionsSection = fragment.querySelector('.section[data-id="sections"]');
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  moveSectionContent(sectionsSection, navSections);
  nav.append(navSections);

  const toolsSection = fragment.querySelector('.section[data-id="tools"]');
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  moveSectionContent(toolsSection, navTools);
  nav.append(navTools);

  setupNavSections(navSections);
  setupNavTools(navTools);
  decorateIcons(navWrapper);

  hamburger.addEventListener('click', () => {
    toggleMenu(nav);
  });

  bindGlobalListeners(nav);
  toggleMenu(nav, false);
  block.append(navWrapper);
}
