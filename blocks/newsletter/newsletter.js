/**
 * loads and decorates the newsletter block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Extract content from block rows
  const rows = [...block.children];

  // First row contains description and disclaimer
  const descriptionRow = rows[0];
  const descriptionContent = descriptionRow?.querySelector('div');

  // Second row contains the email input placeholder and sign up button text
  const formRow = rows[1];
  const formContent = formRow?.querySelector('div');

  // Third row contains the privacy policy footer
  const footerRow = rows[2];
  const footerContent = footerRow?.querySelector('div');

  // Create new structure
  const container = document.createElement('div');
  container.className = 'newsletter-container';

  // Add description section
  if (descriptionContent) {
    const descSection = document.createElement('div');
    descSection.className = 'newsletter-description';
    descSection.innerHTML = descriptionContent.innerHTML;
    container.append(descSection);
  }

  // Create form section
  if (formContent) {
    const formSection = document.createElement('div');
    formSection.className = 'newsletter-form';

    const form = document.createElement('form');
    form.className = 'newsletter-form-wrapper';

    // Get placeholder text and button text
    const paragraphs = formContent.querySelectorAll('p');
    const placeholderText = paragraphs[0]?.textContent || 'Enter email address';
    const buttonText = paragraphs[1]?.textContent || 'Sign UP';

    // Create email input
    const input = document.createElement('input');
    input.type = 'email';
    input.placeholder = placeholderText;
    input.className = 'newsletter-input';
    input.setAttribute('aria-label', 'Email address');

    // Create submit button
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'newsletter-button';
    button.textContent = buttonText;

    form.append(input);
    form.append(button);
    formSection.append(form);
    container.append(formSection);

    // Prevent form submission (no-op for now)
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  // Add footer section
  if (footerContent) {
    const footerSection = document.createElement('div');
    footerSection.className = 'newsletter-footer';
    footerSection.innerHTML = footerContent.innerHTML;
    container.append(footerSection);
  }

  // Replace block content
  block.replaceChildren(container);
}
