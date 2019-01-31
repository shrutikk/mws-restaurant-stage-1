/*
Reference from: https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/
*/
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function(registration) {
      console.log('Registration successful, scope is:', registration.scope);
    })
    .catch(function(error) {
      console.log('Service worker registration failed, error:', error);
    });
  }