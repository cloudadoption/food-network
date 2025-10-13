const noop = async () => {};

/**
 * Runs during the eager phase.
 * @param {{ document: Document, main: Element | null }} context
 */
export const eager = noop;

/**
 * Runs during the lazy phase.
 * @param {{ document: Document, main: Element | null }} context
 */
export const lazy = noop;

/**
 * Runs during the delayed phase.
 * @param {{ document: Document, main: Element | null }} context
 */
export const delayed = () => {};
