app.controller("CardController", function($scope, $rootScope, $timeout, $location, $http, $window) {

	/**
	 * Container for the deck size
	 * @type {Number}
	 */
	$scope.deckSize = 6;

	/**
	 * Container for the scores
	 * @type {Number}
	 */
	$scope.score	= 0;

	/**
	 * Boolean flag to determine if the current session
	 * is finished or not.
	 * @type {Boolean}
	 */
	$scope.hasFinished	= false;

	/**
	 * Container for the current deck
	 * @type {Object}
	 */
	$scope.deck 	= {};

	/**
	 * Container Number of pairs
	 * @type {Number}
	 */
	$scope.numPairs = 0;

	/**
	 * Flag for the state of the current session
	 * @type {Boolean}
	 */
	$scope.currentSessionIsOpen = false;

	/**
	 * Container for the previousCard
	 * @type {Object}
	 */
	$scope.previousCard = null;

	/**
	 * Container for the number of matches
	 * @type {Number}
	 */
	$scope.numberOfMatches = $rootScope.deckSize / 2;

	/**
	 * Container for isGuarding
	 * @type {Boolean}
	 */
	$scope.isGuarding = false;

	/**
	 * Name of the player
	 * @type {String}
	 */
	$scope.playerName = 'Unknown';

	/**
	 * Hands out the cards for the current game session based on
	 * the deck size and the number of pairs
	 * @return {Object} Current game session deck size
	 */
	$scope.handoutCards = function() {	
		var deck = {};
		deck.cards = []; 
		var pairs = $scope.setPairs();

		angular.forEach(pairs, function(item, index) {
			var card = {};
			card.letter = item;
			card.isFaceUp = false;
			card.isHide = false;
			deck.cards.push(card);	
		});
		return deck;
	}

	/**
	 * Generationg pairs for the handout card deck
	 */
	$scope.setPairs = function() {
		var matches = $scope.numberOfMatches;
		var pool = [];
		var results = [];
		var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'
						, 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'
						, 'S', 'T', 'U', 'W', 'X', 'Y', 'Z'];

		for (var i = 0; i < matches * 2; i++) {
			pool.push(i);
		}
	
		for (var n = 0; n < matches; n++) {
			var randLetter = Math.floor((Math.random() * letters.length));
			var letter = letters[randLetter];
			$scope.removeByIndex(letters, randLetter);
			var randPool = Math.floor((Math.random() * pool.length));
			$scope.insertByIndex(results, pool[randPool], letter);
		
			$scope.removeByIndex(pool, randPool);
			randPool = Math.floor((Math.random() * pool.length));
			$scope.insertByIndex(results, pool[randPool], letter);

			$scope.removeByIndex(pool, randPool);
		}
		return results;
	}

	/**
	 * Check for the matching cards
	 * @param  {Object} card Current card that is flipped up
	 * @return {Boolean}
	 */
	$scope.check = function(card) {
		if ($scope.currentSessionIsOpen && $scope.previousCard != card && $scope.previousCard.letter == card.letter && !card.isFaceUp) {
			$scope.isGuarding = true;
			card.isFaceUp = true;
			$scope.previousCard = null;
			$scope.currentSessionIsOpen = false;
			$scope.numPairs++;
			$scope.tries++;
			$scope.score = (($scope.deckSize / 2) / $scope.tries) * 100
			$scope.isGuarding = false;
		} else if($scope.currentSessionIsOpen && $scope.previousCard != card && $scope.previousCard.letter != card.letter && !card.isFaceUp) {
			$scope.isGuarding = true;
			card.isFaceUp = true;
			$scope.tries++;
			$scope.currentSessionIsOpen = false;
			$timeout(function() {
				$scope.previousCard.isFaceUp = card.isFaceUp = false;
				$scope.previousCard = null;
				$scope.isGuarding = false;
			}, 1000);
		} else {
			$scope.isGuarding = true;
			card.isFaceUp = true;
			$scope.currentSessionIsOpen = true;
			$scope.previousCard = card;
			$scope.isGuarding = false;
		}	

		if ($scope.numPairs == $scope.numberOfMatches) {
			$scope.hasWon = true;
			$rootScope.win.tries 	= $scope.tries;
			$rootScope.win.score 	= (($scope.deckSize / 2) / $scope.tries) * 100;
			$rootScope.win.deckSize = $rootScope.deckSize;
			$location.path('/win');
		}
	}

	/**
	 * Setting the player name
	 * @param {String} name
	 */
	$scope.setPlayerName = function(name) {
		$scope.playerName = name;
	}

	/**
	 * Navigating to the game board
	 * @return {Redirect}
	 */
	$scope.reMatch = function() {
		$scope.deck = $scope.handoutCards();
		$scope.tries = 0;
		$scope.score = 0;
		$location.path('/');
	}

	/**
	 * Show settings page
	 * @return {Redirect}
	 */
	$scope.showSettings = function() {
		$location.path('/settings');
	}

	/**
	 * Save the current settings and hand out a new deck
	 */
	$scope.saveSettings = function(settings) {
		if (!angular.isUndefined(settings.deckSizeSettings)) {
			if (settings.deckSizeSettings <= 20 && settings.deckSizeSettings >= 6) {
				if (settings.deckSizeSettings % 2 === 0) {
					$rootScope.deckSize = settings.deckSizeSettings;
					$scope.playerName 	= settings.playerNameSettings;
					$scope.deck 		= $scope.handoutCards();
					$location.path('/');
				} else {
					alert("This type of deck can't be generated!");			
				}

			} else {
				alert("You have to set the deck size between 6 and 20!");			
			}
		} else {
			alert("You have to set a valid deck size between 6 and 20!");			
		}

	}

	/**
	 * Save scores into the local storage
	 * @param  {String} player
	 * @return LocalStorage
	 */
	$scope.saveScores = function(player) {		
		$rootScope.win.name = player;
		var scores = [];
		scores = $window.localStorage.getItem('scores');
		if (scores == null) {
			scores = [];
			$window.localStorage.setItem('scores', JSON.stringify([$rootScope.win]));
		} else {
			scores = JSON.parse(scores);
			scores.push($rootScope.win);
			$window.localStorage.setItem('scores', JSON.stringify(scores));
		}
		scores = $window.localStorage.getItem('scores');
		$rootScope.scores = JSON.parse(scores);
		// Redirect to the scores
		$location.path('/scores');
	}

	/**
	 * Util procedures
	 * ================================================================== */

	$scope.removeByIndex = function(arr, index) {
	    arr.splice(index, 1);
	}

	$scope.insertByIndex = function(arr, index, item) {
		arr.splice(index, 0, item);
	}

	/**
	 * Main program
	 * ================================================================== */

	 // Hand out the first set of cards
	 if ($location.path() == '/') {
	 	$scope.deck = $scope.handoutCards();
	 	$scope.tries = 0;
	 }

}); 

