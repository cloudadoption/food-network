# Templates

This directory contains page templates for the AEM Edge Delivery Services project. Each template provides custom styling and functionality that can be applied to pages by setting the `template` metadata property.

## Overview

Templates extend the functionality of the standard page layout by providing:
- Custom CSS styles loaded before the body is revealed
- JavaScript functionality organized into three loading phases (eager, lazy, delayed)
- Specialized page transformations and enhancements

## Directory Structure

Each template should have its own directory with the following structure:

```
templates/
  └── {template-name}/
      ├── {template-name}.css    # Template styles
      └── {template-name}.js     # Template JavaScript
```

## Using Templates

To apply a template to a page, add the template metadata to your page:

### In Document Authoring

Add a Metadata block at the end of your document:

| Metadata |              |
|----------|--------------|
| Template | recipe       |

### In HTML (for testing)

Add a meta tag in the head:

```html
<meta name="template" content="recipe">
```

## Creating a New Template

### 1. Create the Template Directory

```bash
mkdir -p templates/my-template
```

### 2. Create the CSS File

Create `templates/my-template/my-template.css`:

```css
/* My Template Styles */

body.my-template {
  /* Custom CSS variables */
  --my-template-color: #3498db;
}

/* Template-specific styles */
body.my-template main {
  /* Your styles here */
}
```

The body element will automatically have the template name as a class (e.g., `body.my-template`).

### 3. Create the JavaScript File

Create `templates/my-template/my-template.js`:

```javascript
/**
 * Eager phase - runs before first section loads
 * Critical for LCP - use for essential functionality
 * @param {Document} doc The document
 */
export async function eager(doc) {
  // Add critical functionality here
  console.log('Template eager phase');
}

/**
 * Lazy phase - runs after lazy page load
 * Use for below-the-fold enhancements
 * @param {Document} doc The document
 */
export async function lazy(doc) {
  // Add lazy-loaded functionality here
  console.log('Template lazy phase');
}

/**
 * Delayed phase - runs after a delay
 * Use for analytics, tracking, or other non-critical functionality
 */
export function delayed() {
  // Add delayed functionality here
  console.log('Template delayed phase');
}
```

**Note:** All three functions (eager, lazy, delayed) are optional. Only implement the phases you need.

## Loading Phases

Templates use a three-phase loading system that aligns with the overall page loading strategy:

### Eager Phase
- **When:** Before the body is revealed and before the first section loads
- **Use for:** 
  - Critical DOM transformations
  - Essential functionality needed for LCP
  - Data extraction and preparation
- **Example:** Transforming metadata tables into styled components

### Lazy Phase
- **When:** After all page sections have loaded
- **Use for:**
  - Below-the-fold enhancements
  - Progressive enhancement features
  - Non-critical visual improvements
- **Example:** Styling ingredient lists, adding interactive elements

### Delayed Phase
- **When:** After a 3-second delay
- **Use for:**
  - Analytics and tracking
  - Marketing tags
  - Non-essential enhancements
  - Features that can wait
- **Example:** Adding social sharing buttons, analytics events

## Best Practices

1. **Keep CSS Minimal**: Only include styles necessary for the template. Leverage existing global styles.

2. **Progressive Enhancement**: Templates should enhance, not require. Pages should work without templates.

3. **Performance First**: 
   - Load only what's needed in each phase
   - Avoid blocking operations in eager phase
   - Use async/await appropriately

4. **Error Handling**: Templates fail silently. The page should work even if template loading fails.

5. **Semantic HTML**: Work with the HTML structure provided by authors, don't fight it.

6. **Mobile First**: Always test templates on mobile devices and small screens.

7. **Console Logging**: Use console.log sparingly, primarily for debugging during development.

## Example Templates

### Recipe Template
Location: `templates/recipe/`

A comprehensive template for recipe pages with:
- Styled recipe metadata (prep time, cook time, servings)
- Formatted ingredient lists
- Numbered step instructions
- Print recipe functionality

Usage: Add `template: recipe` to recipe pages

### Simple Template
Location: `templates/simple/`

A minimal template demonstrating basic functionality:
- Clean, centered layout
- Custom color scheme
- Basic visual enhancements
- Template loading indicator

Usage: Add `template: simple` to any page

## Testing Templates

### Local Testing

1. Create a test page in the `drafts/` directory with the template metadata
2. Start the development server:
   ```bash
   aem up --html-folder drafts
   ```
3. Open your test page: `http://localhost:3000/drafts/your-test-page`
4. Open browser DevTools console to see template loading messages
5. Inspect the page structure and verify styling

### Test Pages

- Recipe template: `/drafts/recipe-test`
- Simple template: `/drafts/simple-test`

### Debugging

1. Check browser console for template loading messages
2. Verify the body element has the template class: `<body class="recipe">`
3. Check Network tab to ensure CSS and JS files loaded
4. Verify template phases execute in order: eager → lazy → delayed

## Integration with AEM

The template system integrates seamlessly with AEM's existing functionality:

- Templates are detected via the standard `template` metadata property
- The `decorateTemplateAndTheme()` function adds the template class to the body
- Template CSS loads before body reveal (no FOUC)
- Template eager phase runs before first section loads
- Template lazy phase runs after all sections load
- Template delayed phase runs with other delayed functionality

## Troubleshooting

**Template not loading:**
- Verify the template name in metadata matches the directory name
- Check browser console for 404 errors
- Ensure template files are named correctly (lowercase, hyphenated)

**Styles not applying:**
- Verify CSS selectors start with `body.{template-name}`
- Check CSS syntax for errors
- Use browser DevTools to inspect element styles

**JavaScript not running:**
- Check browser console for JavaScript errors
- Verify function names (eager, lazy, delayed) are correct
- Ensure functions are exported: `export async function eager()`

## Performance Considerations

- Template CSS is loaded synchronously before body reveal (intentional for FOUC prevention)
- Template JS is loaded as a module (cached by browser)
- Only eager phase can delay LCP - keep it fast
- Lazy and delayed phases don't impact initial page load metrics
- Test with Lighthouse to ensure templates don't harm Core Web Vitals

## Future Enhancements

Potential improvements to the template system:

- Template inheritance (base templates)
- Template configuration via JSON
- Shared template utilities
- Template marketplace/library
- A/B testing support
- Template validation tools

