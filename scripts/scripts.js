import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
  toClassName,
} from './aem.js';

/**
 * Module-level variable to store the loaded template
 * @type {Object|null}
 */
let templateMod = null;

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto block `*/fragments/*` references
    const fragments = main.querySelectorAll('a[href*="/fragments/"]');
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(frag.firstElementChild);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads template CSS and JS for a given template name.
 * Returns an object with eager, lazy, and delayed functions.
 * @param {string} template The template name
 * @returns {Promise<Object>} Object with eager, lazy, delayed functions
 */
async function loadTemplate(template) {
  const templateName = toClassName(template);
  try {
    // Load CSS (must complete before body is revealed)
    await loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`);
  } catch (error) {
    // CSS file may not exist, that's ok
  }

  try {
    // Load JS module
    const mod = await import(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.js`);
    return {
      eager: mod.eager || (() => {}),
      lazy: mod.lazy || (() => {}),
      delayed: mod.delayed || (() => {}),
    };
  } catch (error) {
    // JS file may not exist, that's ok - return no-op functions
    return {
      eager: () => {},
      lazy: () => {},
      delayed: () => {},
    };
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  // Load template CSS and JS, execute eager phase before first section loads
  const templateMeta = getMetadata('template');
  templateMod = templateMeta ? await loadTemplate(templateMeta) : null;

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    // Execute template eager phase before revealing body
    if (templateMod && templateMod.eager) {
      await templateMod.eager(doc);
    }
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  // Execute template lazy phase
  if (templateMod && templateMod.lazy) {
    await templateMod.lazy(doc);
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // Single timeout for all delayed operations
  window.setTimeout(() => {
    // eslint-disable-next-line import/no-cycle
    import('./delayed.js');
    // Execute template delayed phase
    if (templateMod && templateMod.delayed) {
      templateMod.delayed(document);
    }
  }, 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

const { searchParams, origin } = new URL(window.location.href);
const branch = searchParams.get('nx') || 'main';

export const NX_ORIGIN = branch === 'local' || origin.includes('localhost') ? 'http://localhost:6456/nx' : 'https://da.live/nx';

(async function loadDa() {
  /* eslint-disable import/no-unresolved */
  if (searchParams.get('dapreview')) {
    import('https://da.live/scripts/dapreview.js')
      .then(({ default: daPreview }) => daPreview(loadPage));
  }
  if (searchParams.get('daexperiment')) {
    import(`${NX_ORIGIN}/public/plugins/exp/exp.js`);
  }
}());
