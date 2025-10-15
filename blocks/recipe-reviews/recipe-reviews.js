const RATING_URL = 'https://api.sni.foodnetwork.com/moderation-chitter-proxy/v1/ratings/brand/FOOD/type/recipe/id/__ID__';
const REVIEWS_URL = 'https://api.sni.foodnetwork.com/moderation-chitter-proxy/v1/dalton-comments/brand/FOOD/type/recipe/id/__ID__?sort=NEWEST';

const promises = {};

export async function fetchRatings(id) {
  if (promises[id]?.ratings) {
    return promises[id].ratings;
  }

  promises[id] = promises[id] || {};
  promises[id].ratings = (async () => {
    const resp = await fetch(RATING_URL.replace('__ID__', id));
    if (resp.ok) {
      const data = await resp.json();
      return data;
    }

    return null;
  })();

  return promises[id].ratings;
}

export async function fetchReviews(id, cursor = '') {
  if (promises[id]?.reviews && promises[id].reviews[cursor]) {
    return promises[id].reviews[cursor];
  }

  promises[id] = promises[id] || {};
  promises[id].reviews = promises[id].reviews || {};
  promises[id].reviews[cursor] = (async () => {
    const resp = await fetch(REVIEWS_URL.replace('__ID__', id) + (cursor ? `&cursor=${cursor}` : ''));
    if (resp.ok) {
      const data = await resp.json();
      return data;
    }

    return null;
  })();

  return promises[id].reviews[cursor];
}

async function loadReviews(id, block) {
  const [ratings, reviews] = await Promise.all([fetchRatings(id), fetchReviews(id)]);

  if (ratings.ratingsSummaries && ratings.ratingsSummaries.length > 0) {
    const ratingsSummary = ratings.ratingsSummaries[0];
    const reviewCount = ratingsSummary.count;
    const rating = Math.round(ratingsSummary.averageValue * 10) / 10;

    block.innerHTML = `
    <div class="recipe-reviews-header">
      <h3 class="recipe-reviews-count">${reviewCount} Reviews</h3>
      <div class="star-rating"></div>
    </div>
    <div class="recipe-reviews-form">
      <form>
        <label for="review-text">Review</label>
        <textarea id="review-text" placeholder="Add a review"></textarea>
        <button type="submit">Post Review</button>
      </form>
    </div>
    <div class="recipe-reviews-list">
      <ul>
      </ul>
    </div>
  `;

    const ratingsSummaryContainer = block.querySelector('.star-rating');
    ratingsSummaryContainer.style.setProperty('--rating-width', `${(rating / 5) * 100}%`);
    ratingsSummaryContainer.setAttribute('aria-label', `Rated ${rating} out of 5`);

    if (reviews.comments) {
      reviews.comments.forEach((review) => {
        const li = document.createElement('li');
        const {
          text, timestamp, userReference, authorAssetRatings,
        } = review;
        li.innerHTML = `
          <img src="${userReference?.imageUrl}" alt="">
          <div class="comment-info">
            <p>${userReference?.name}</p>
            <p>${new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div class="star-rating"></div>
          <p class="comment-text">${text}</p>
        `;

        const commentStarRatingEl = li.querySelector('.star-rating');
        const commentRating = authorAssetRatings[0]?.value;
        commentStarRatingEl.style.setProperty('--rating-width', `${(commentRating / 5) * 100}%`);
        commentStarRatingEl.setAttribute('aria-label', `Rated ${commentRating} out of 5`);

        block.querySelector('.recipe-reviews-list ul').appendChild(li);
      });
    }
  }
}

export default function decorate(block) {
  const id = block.textContent.trim();
  block.textContent = '';
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        loadReviews(id, block);
      }
    });
  });
  observer.observe(block);

  window.addEventListener('message', (event) => {
    if (event.data === 'delayed' && event.origin === window.location.origin) {
      loadReviews(id, block);
    }
  });
}
