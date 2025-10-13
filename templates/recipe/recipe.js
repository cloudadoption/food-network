/**
 * Recipe template - demonstrates eager/lazy/delayed phases
 */

/**
 * Eager phase - runs before body is revealed and before first section loads
 * Use this for critical functionality that affects initial render
 * @param {Document} doc The document
 */
export async function eager(doc) {
  // no operations
}

/**
 * Lazy phase - runs after initial content is loaded
 * Use this for enhancements that improve the experience but aren't critical
 * @param {Document} doc The document
 */
export async function lazy(doc) {
// no operations
}

/**
 * Delayed phase - runs after everything else, for non-critical features
 * Use this for analytics, social sharing, or other features that can wait
 * @param {Document} doc The document
 */
export async function delayed(doc) {
// no operations
}
