class DataHelper {

    static getRestaurants() {
        return this.restaurants;
    };
    static getCuisines() {
        return this.cuisines;
    };
    static getNeighbhourhoods() {
        return this.neighborhoods;
    };

    static requestData(callback) {
        fetch('http://localhost:1337/restaurants')
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            DataHelper.initializeData(myJson);
            callback(myJson);
        });
    }

    static initializeData(data) {
        this.cuisines = new Set();
        this.neighborhoods = new Set();
        this.restaurants = [];
        data.forEach((restrnt) => {
          this.cuisines.add(restrnt.cuisine_type);
          this.neighborhoods.add(restrnt.neighborhood);
          this.restaurants.push(restrnt);
        })
    }

    static fetchNeighborhoods(callback) {
        callback(null, this.neighborhoods);
    }

    static fetchCuisines(callback) {
        callback(null, this.cuisines);
    }

    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        let results = this.restaurants;
        if (cuisine !== 'all') {
          results = this.restaurants.filter((rest) => rest.cuisine_type === cuisine);
        }
        if (neighborhood !== 'all') {
          results = this.restaurants.filter((rest) => rest.neighborhood === neighborhood);
        }
        return callback(null,results);
    }

    static imageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph}.jpg`);
    }

    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    static mapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
          {title: restaurant.name,
          alt: restaurant.name,
          url: DataHelper.urlForRestaurant(restaurant)
          })
          marker.addTo(newMap);
        return marker;
    }

    static fetchRestaurantById(id, callback) {
        DataHelper.requestData((restaurants) => {
            const restaurant = restaurants.filter((rest) => rest.id === parseInt(id))[0];
            callback(null, restaurant);
        });
    }

    static fetchRestaurantByCuisine(cuisine, callback) {
        const restaurants = this.restaurants.filter((rest) => rest.cuisine_type === cuisine);
        callback(null, restaurants);
    }

    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        const restaurants = this.restaurants.filter((rest) => rest.neighborhood === neighborhood);
        callback(null, restaurants);
    }

}
