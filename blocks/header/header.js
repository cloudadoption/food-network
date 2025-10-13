import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function buildSearchTool(toolLi) {
  const searchLink = toolLi.querySelector('a');
  const searchIcon = searchLink.querySelector('.icon-search');
  const searchText = searchLink.textContent;

  toolLi.innerHTML = `
    <button type="button" class="buttonsearch-toggle" aria-label="Search"></button>
    <form class="search-form">
      <input type="search" id="search-input" aria-label="Search" placeholder="${searchText}">
      <button type="submit" class="button" aria-label="Search"></button>
    </form>
  `;

  toolLi.querySelectorAll('button').forEach((btn) => {
    btn.append(searchIcon.cloneNode(true));
  });
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

  block.replaceChildren();

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';

  while (fragment.firstElementChild) {
    const section = fragment.firstElementChild;

    if (section.dataset.id) {
      section.classList.add(`nav-${section.dataset.id}`);
    }

    if (section.dataset.id !== 'ad') {
      nav.append(section);
    } else {
      block.prepend(section);
    }
  }

  const brand = nav.querySelector('.nav-brand');
  if (brand) {
    const brandList = brand.querySelector('ul');
    brandList.classList.add('nav-brand-list');
  }

  const tools = nav.querySelector('.nav-tools');
  if (tools) {
    const toolsList = tools.querySelector('ul');
    toolsList.classList.add('nav-tools-list');

    const searchTool = toolsList.querySelector('.icon-search');
    if (searchTool) {
      buildSearchTool(searchTool.closest('li'));
    }
  }

  // add hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  nav.prepend(hamburger);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
