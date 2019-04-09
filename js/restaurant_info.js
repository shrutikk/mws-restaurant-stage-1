import DataHelper from './data_helper.js';

let restaurant;
var newMap;
let tabIndex = 1;
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();

  var addReview = document.getElementsByClassName("collapsible");
  addReview[0].addEventListener('click', function() {
    var content = document.getElementsByClassName('review-form')[0];
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });

  var reviewform = document.getElementsByClassName('review-form');
  reviewform[0].addEventListener('submit', submitReview);

  window.addEventListener('online', updateTempReviews());
});

/**
 * Initialize leaflet map
 */
function initMap() {
  fetchRestaurantFromURL((error, rest) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      newMap = L.map('map', {
        center: [rest.latlng.lat, rest.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'sk.eyJ1Ijoic2t1YmVyIiwiYSI6ImNqcXNoNTg3ZTBjYXA0OXJ4dmI3YWhuYWEifQ.SXEcDiJtesd7Usn-AfemWg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DataHelper.mapMarkerForRestaurant(restaurant, newMap);
    }
  });
}


/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(callback) {
  if (restaurant) { // restaurant already fetched!
    callback(null, restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DataHelper.fetchRestaurantById(id, (error, rest) => {
      restaurant = rest;
      if (!rest) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, rest)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(rest = restaurant) {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = rest.name;
  name.tabIndex = 0;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = rest.address;
  address.tabIndex = 0;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DataHelper.imageUrlForRestaurant(rest);
  image.alt = "Image for " + rest.cuisine_type + " food in " +rest.name;
  image.tabIndex = 0;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = rest.cuisine_type;
  cuisine.tabIndex = 0;

  // fill operating hours
  if (rest.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours = restaurant.operating_hours) {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = restaurant.reviews) {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    container.tabIndex = 0;
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {
  const li = document.createElement('li');
  li.tabIndex = 0;
  const reviewNameAndDateDiv = document.createElement('div');
  reviewNameAndDateDiv.className = 'review-name-date';

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'review-name';
  name.tabIndex = 0;
  reviewNameAndDateDiv.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = (new Date(review.createdAt)).toDateString();
  date.className = 'review-date';
  date.tabIndex = 0;
  reviewNameAndDateDiv.appendChild(date);
  li.appendChild(reviewNameAndDateDiv);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.tabIndex = 0;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.tabIndex = 0;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(rest = restaurant) {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = rest.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function submitReview(e) {
  e.preventDefault();
  const newReview = {
    'restaurant_id': restaurant.id,
    'name': document.getElementById('name').value,
    'rating': document.getElementById('rating').value,
    'comments' : document.getElementById('comments').value
  };
  restaurant.reviews.push(newReview);
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(newReview));
  DataHelper.submitReview(newReview);
  var content = document.getElementsByClassName('review-form')[0];
  content.style.maxHeight = null;
  return false;
}

function updateTempReviews() {
  DataHelper.syncOfflineReviews();
}
