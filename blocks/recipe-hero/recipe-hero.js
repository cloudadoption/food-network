import { getMetadata } from '../../scripts/aem.js';
import { fetchRatings } from '../recipe-reviews/recipe-reviews.js';

async function buildAuthor(authorContainer) {
  const author = getMetadata('author');
  if (author) {
    try {
      const authorUrl = new URL(author);
      const authorResp = await fetch(authorUrl);
      if (authorResp.ok) {
        const authorHtml = await authorResp.text();
        const authorDoc = new DOMParser().parseFromString(authorHtml, 'text/html');
        const img = authorDoc.querySelector('meta[property="og:image"]');
        const title = authorDoc.querySelector('meta[property="og:title"]');

        if (img) {
          const imgLink = document.createElement('a');
          imgLink.href = authorUrl;
          imgLink.target = '_blank';
          imgLink.rel = 'noopener noreferrer';
          imgLink.classList.add('recipe-hero-author-img');

          const imgEl = document.createElement('img');
          imgEl.src = img.content;
          imgEl.alt = title.content;
          imgLink.appendChild(imgEl);
          authorContainer.appendChild(imgLink);
        }

        if (title) {
          const titleEl = document.createElement('p');
          titleEl.innerHTML = `Recipe courtesy of <a href="${authorUrl}" target="_blank" rel="noopener noreferrer">${title.content}</a>`;
          authorContainer.appendChild(titleEl);
        }
      }
    } catch (error) {
      // do nothing
    }
  }
}

function buildReviews(reviewsContainer) {
  reviewsContainer.innerHTML = `
    <div class="star-rating"></div>
    <p class="recipe-hero-reviews-count"></p>
  `;

  reviewsContainer.classList.add('placeholder');

  window.addEventListener('message', (event) => {
    if (event.data === 'delayed' && event.origin === window.location.origin) {
      const id = getMetadata('recipe-id');
      fetchRatings(id).then((ratings) => {
        if (ratings.ratingsSummaries && ratings.ratingsSummaries.length > 0) {
          const ratingsSummary = ratings.ratingsSummaries[0];
          const reviewCount = ratingsSummary.count;
          const rating = Math.round(ratingsSummary.averageValue * 10) / 10;

          const ratingsSummaryContainer = reviewsContainer.querySelector('.star-rating');
          ratingsSummaryContainer.style.setProperty('--rating-width', `${(rating / 5) * 100}%`);
          ratingsSummaryContainer.setAttribute('aria-label', `Rated ${rating} out of 5`);

          const reviewCountContainer = reviewsContainer.querySelector('.recipe-hero-reviews-count');
          reviewCountContainer.textContent = `${reviewCount} Reviews`;
          reviewsContainer.classList.remove('placeholder');
        }
      }).catch(() => {
        // nothing
      });
    }
  });
}

export default async function decorate(block) {
  const els = [];

  const pic = block.querySelector('picture');
  if (pic) {
    const picHolder = pic.closest('div');
    picHolder.classList.add('recipe-hero-img');

    if (block.classList.contains('video')) {
      const playBtn = document.createElement('button');
      playBtn.classList.add('button', 'recipe-hero-play-btn');
      playBtn.type = 'button';
      playBtn.textContent = 'Watch';
      picHolder.appendChild(playBtn);
    }

    els.push(picHolder);
  }

  const author = document.createElement('div');
  author.classList.add('recipe-hero-author');
  buildAuthor(author);
  els.push(author);

  const h1 = block.querySelector('h1');
  if (h1) {
    h1.closest('div').classList.add('recipe-hero-title');
    els.push(h1.closest('div'));
  }

  const recipeReview = document.createElement('div');
  recipeReview.classList.add('recipe-hero-review');
  buildReviews(recipeReview);
  els.push(recipeReview);

  block.replaceChildren(...els);
}
