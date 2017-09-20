var app = angular.module('card-game', [
	'ngAnimate',
	'ngRoute'
]).config(function($routeProvider) {

	$routeProvider
	.when('/', {
		templateUrl: 'templates/board.html',
		controller: 'CardController',
	})

	.when('/win', {
		templateUrl: 'templates/win.html',
		controller: 'CardController',
	})

	.when('/scores', {
		templateUrl: 'templates/scores.html',
		controller: 'CardController',
	})

	.when('/settings', {
		templateUrl: 'templates/settings.html',
		controller: 'CardController',
	});

}).run(['$rootScope', '$window', function($rootScope, $window) {

	$rootScope.win = {};
	$rootScope.win.tries 	= 0;
	$rootScope.win.score 	= 0;
	$rootScope.win.deckSize = 6;
	$rootScope.win.name 	= '';
	$rootScope.deckSize 	= 6;
	$rootScope.scores 		= JSON.parse($window.localStorage.getItem('scores'));
}]);

app.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});