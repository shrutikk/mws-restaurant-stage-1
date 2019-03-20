/*
Reference from: https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
*/

if (typeof idb === "undefined") {
    self.importScripts('js/idb.js');
}

let staticCacheName = 'restaurant-rev-cache';
let filesToCache = [
  './',
  './index.html',
  './restaurant.html',
  './css/styles.css',
  './js/main.js',
  './js/restaurant_info.js',
  './js/dbhelper.js',
  './js/data_helper.js',
  './js/sw_registration.js',
  './data/restaurants.json',
  './img/1.jpg',
  './img/2.jpg',
  './img/3.jpg',
  './img/4.jpg',
  './img/5.jpg',
  './img/6.jpg',
  './img/7.jpg',
  './img/8.jpg',
  './img/9.jpg',
  './img/10.jpg',
];

self.addEventListener('install', function(event) {
    createDB();
	event.waitUntil(
		caches.open(staticCacheName).then(function(cache) {
			return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(event) {
    addToDB();
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('restaurant-rev-') &&
                        cacheName != staticCacheName;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
/*
Sends cached data if present.
*/
self.addEventListener('fetch', function(event) {
    console.log(event.request);
    if (event.request.url === 'http://localhost:1337/restaurants') {
        event.respondWith(idb.open('restaurant-data', 1).then(function(db) {
            var tx = db.transaction(['restaurants'], 'readonly');
            var store = tx.objectStore('restaurants');
            return store.getAll();
          }).then(function(items){
              return new Response(JSON.stringify(items));
          }));
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});

function createDB() {
    self.dbpromise = idb.open('restaurant-data', 1, function(upgradeDB) {
      upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id'
      });
    });
}

function addToDB() {
    fetch('http://localhost:1337/restaurants')
    .then(function(response) {
        return response.json();
    })
    .then(function(restaurants) {
        let cuisines = new Set();
        let neighborhoods = new Set();
        self.dbpromise.then(function(db){
            var tx = db.transaction(['restaurants'], 'readwrite');
            var store = tx.objectStore('restaurants');
            restaurants.forEach((restaurant, index) => {
                store.add(restaurant);
            });
            return tx.complete;
        });
    });
}