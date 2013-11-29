// Card Constructor
function Card(newSuit, newNumber) {
    var suit = newSuit;
	var number = newNumber;
	this.getNumber = function() {
		return number;
	};
	this.getSuit = function() {
		return suit;
	};
	this.getValue = function() {
		if (number > 10) {
			return 10;
		} else if (number == 1) {
			return 11;
		} else {
			return number;
		}
	};
}

function deal() {
	var aSuit = Math.floor(Math.random() * 4 + 1);
	var aNumber = Math.floor(Math.random() * 13 + 1);
	return new Card(aSuit, aNumber);
}

function Hand() {
	var cardArray = [deal(), deal()];
	this.getHand = function() {
		return cardArray;
	};
	this.score = function() {
		var sum = 0;
		var aces = 0;
		for (var i = 0; i < cardArray.length; i++) {
			sum += cardArray[i].getValue();
			if (cardArray[i].getValue() == 11) {
				aces += 1;
			}
		}
		while (sum > 21 && aces > 0) {
			sum -= 10;
			aces -= 1;
		}
		return sum;
	};
	this.printHand = function() {
		var string = "";
		for (var i = 0; i < cardArray.length; i++) {
			string += cardArray[i].getNumber() + " of suit " + cardArray[i].getSuit() + ", ";
		}
		return string;
	};
	this.hitMe = function() {
		var newCard = deal();
		cardArray[cardArray.length] = newCard;
	};
}

function playAsDealer() {
	var hand = new Hand();
	while (hand.score() < 17) {
		hand.hitMe();
	}
	return hand;
}

function playAsUser() {
	var hand = new Hand();
	var decision = confirm("Your hand is " + hand.printHand() + ": Hit OK to hit (take another card) or Cancel to stand");
	while (decision) {
		hand.hitMe();
		decision = confirm("Your hand is " + hand.printHand() + ": Hit OK to hit (take another card) or Cancel to stand");
	}
	return hand;
}

function declareWinner(userHand, dealerHand) {
	if (userHand.score() > 21) {
		if (dealerHand.score() > 21) {
			return "You tied!";
		} else {
			return "You lose!";
		}
	} else if (dealerHand.score() > 21) {
		return "You win!";
	} else {
		if (userHand.score() > dealerHand.score()) {
			return "You win!";
		} else if (userHand.score() < dealerHand.score()) {
			return "You lose!";
		} else {
			return "You tied!";
		}
	}
}

function playGame() {
	var user = playAsUser();
	var dealer = playAsDealer();
	var result = declareWinner(user, dealer);
	console.log(result);
	console.log("\n");
}

playGame();
