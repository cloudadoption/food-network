export default function decorate(block) {
  const h2 = document.createElement('h2');
  h2.textContent = 'Directions:';

  const directionsList = document.createElement('ol');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((cell) => {
      li.append(...cell.children);
    });
    directionsList.appendChild(li);
  });

  block.replaceChildren(h2, directionsList);

  const copyright = block.closest('.recipe-directions-wrapper').nextElementSibling;
  if (copyright && copyright.classList.contains('default-content-wrapper')) {
    block.closest('.recipe-directions-wrapper').appendChild(...copyright.children);
    copyright.remove();
  }
}
