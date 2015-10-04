$( document ).ready(function() {

	var points = 0;
	
	/* Snake */
	console.log($(window).width() + ' & ' + $(window).height())
	var posX = $(window).width() / 2;
	var posY = $(window).height() / 2;

	// Size snake
	var snakeR = 12;
	var appleX = 0;
	var appleY = 0;

	var start = false;
	var lastAction = moveRight;

	var pseudoEnter = false;

	$('#snake').css({
		'left': posX,
		'top': posY,
		'width': snakeR * 2,
		'height': snakeR * 2
	});

	var lastLastPositionHead = [];
	var lastPosition = [];

	var pantheon = [];
	var panthonOpen = false;

	var bonusMalusX, bonusMalusY = 0;
	var bonusMalusR = 10;
	var bonusMalusTime = 100;
	var bonusMalusActive = false;
	var myBonusMalus = 0;
	var myBonusMalusChoice = false;

	var timeGame = 50;

	var inc = 1;


	/* Apple */
	// Rayon apple
	var appleR = 10;
	apple();
	bonusMalus();

	$('#start').click(function(){
		if(panthonOpen == false){
			start = true;
			$('.infos').remove();
		} else {
			alert('Veuiller fermer le classement pour recommencer une nouvelle partie');	
		}
	});



	/* Classement */
	$('.show-classement').click(function(){
		$.get( "files/classement.txt", function( data ) {
  			//$( ".pantheon" ).html( data );
  			var lines = data.split("\n");
			for (var i = 0, len = lines.length - 1; i < len; i++) {
            	var lastGame = lines[i].split("|");
            	if(lastGame[1] != undefined)
            		pantheon[i] = [lastGame[0], lastGame[1]];
            	//console.log(pantheon[i]);
        	}

			$('.aparticipant').remove();
			pantheon.sort(function(a, b){return b[1]-a[1]});
			var i = 1;
			$(pantheon).each(function(index){
				if(index < 7){
					console.log(pantheon[index][0]);
					var participant = $("<p class='aparticipant'>" + i + " - <b>" + pantheon[index][0] + "</b> avec <b>"+ pantheon[index][1] + "</b> pommes.</p>");
					$('.pantheon').append(participant);
					i++;
				}
			});
			$('.pantheon').css('display', 'block');
			panthonOpen = true;
		});
	});

	$('#close-pantheon').click(function(){
		$('.pantheon').css('display', 'none');
		panthonOpen = false;
	});

	/* Pseudo */
	$('.name').keypress(function(key){
		if((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) && (key.charCode < 48 || key.charCode > 57)) return false;
	});

	$('#valid-pseudo').click(function(){
		if($('.name').val() != "" && pseudoEnter == false){
			var postData = { "name":$('.name').val(), "points":points }
		    $.ajax({
	            type: "POST",
	            url: "foo.php",
	            data: postData,
	            success: function(data){
	            },
	            error: function(e){
	                console.log(e.message);
	            }
		    });
		    $('.name').val('');
		    pseudoEnter = true;
		}
	});

	$('#restart').click(function(){
		if(panthonOpen == false){
			$('.results').css('display', 'none');
			$('.more').remove();
			points = 0;
			posX = $(window).width() / 2;
			posY = $(window).height() / 2;

			$('#snake').css({
				'left': posX,
				'top': posY
			});
			lastAction = moveRight;
			start = true;
			apple();
			$('.name').val('');
			pseudoEnter = false;
			inc = 1;
		} else {
			alert('Veuiller fermer le classement pour recommencer une nouvelle partie');
		}
	});

	$('body').keydown(function(e) {
		//alert(e.which);
		// if we presse "up" key or "z" key
		if(e.which == 38 || e.which == 90){
			lastAction = moveUp;
		} // else if we presse "left" key or "q" key
		else if(e.which == 37 || e.which == 81) {
			lastAction = moveLeft;
		} // else if we presse "right" key or "d" key
		else if(e.which == 39|| e.which == 68) {
			lastAction = moveRight;
		} // else if we presse "down" key or "s" key 
		else if(e.which == 40 || e.which == 83) {
			lastAction = moveDown;
		}
	});




var myStart = function(){
    clearInterval(interval);

	if(start == true){
		move();
		if(bonusMalusActive == true){
			if(inc < bonusMalusTime){
				randBonusMalus();
			} else {
				bonusMalusActive = false;
			}
			inc++
		}
	}
    interval = setInterval(myStart, timeGame);
}
var interval = setInterval(myStart, timeGame);



	/*var myInterval = setInterval(function() {
		if(start == true){
			move();
			console.log(timeGame);
			if(bonusMalusActive == true){
				if(inc < bonusMalusTime){
					randBonusMalus();
				} else {
					bonusMalusActive = false;
				}
				inc++
			}
		}
	}, timeGame);*/

	function move(){
		// Get the last position from the snake's head before the move
		lastLastPositionHead[0] = [posX, posY]
		// Last action make
		lastAction();
		// Check if the snake is out the window
		outWindow();
		// Get the last position from the snake's head after the move
		lastPosition[0] = [posX, posY];
		// We eat apple
		eatApple();
		// We eat bonusmalus
		eatBonusMalus();
		// We update the snake's body
		updateNext();

		collision();

	}

	function outWindow(){
		if(posY + snakeR > $(window).height()){
			posY = snakeR;
		} else if (posY - snakeR < 0){
			posY = $(window).height() - snakeR;
		}

		if(posX + snakeR > $(window).width()){
			posX = snakeR;
		} else if (posX - snakeR < 0){
			posX = $(window).width() - snakeR;
		}
	}

	function collision(){
		$('.more').each(function(i){

			var distanceX = posX - parseInt($(this).css('left'), 10);
			var distanceY = posY - parseInt($(this).css('top'), 10);
	        var distance = Math.floor(Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)));

			if(distance < (snakeR + snakeR)){
				start = false;
				$('.results').css('display', 'block');
				$('.results strong').text(points);
				$('.apple').remove();
			}
		});
	}

	function randBonusMalus(){
		if(myBonusMalusChoice == false){

			myBonusMalus = Math.floor((Math.random() * 6) + 1);
			myBonusMalusChoice = true;
		}
		console.log(myBonusMalus);
		switch(myBonusMalus){
			case 1:
				$('body').css('background', 'rgb(' + Math.floor((Math.random() * 255) + 1) + ',' + Math.floor((Math.random() * 255) + 1)+ ',' + Math.floor((Math.random() * 255) + 1) + ')');
			break;
			case 2:
				timeGame = 100;
			break;
			break;
			case 3:
			case 4:
			case 5:
				$('.more').css('background', 'rgb(' + Math.floor((Math.random() * 255) + 1) + ',' + Math.floor((Math.random() * 255) + 1)+ ',' + Math.floor((Math.random() * 255) + 1) + ')');
			break;
			case 6:
				timeGame = 25;
			break;
		}
		
	}

	function bonusMalus(){
		var bonusMalus = document.createElement('div');
		bonusMalus.className = 'bonusmalus';
		bonusMalus.style.position = 'absolute';
		bonusMalus.style.width = bonusMalusR * 2;
		bonusMalus.style.height = bonusMalusR * 2;

		bonusMalusX = 1 + Math.floor(Math.random() * $(window).width());
		bonusMalusY = 1 + Math.floor(Math.random() * $(window).height());

		bonusMalus.style.left = bonusMalusX;
		bonusMalus.style.top = bonusMalusY;
		$('body').append(bonusMalus);
	}

	function eatBonusMalus(){		
		var distanceX = posX - bonusMalusX;
		var distanceY = posY - bonusMalusY;
        var distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

        if(distance < (snakeR + bonusMalusR)){
			$('.bonusmalus').remove();
			bonusMalusActive = true;
			bonusMalusX = 9999;
			inc = 0;
        }

        if(inc == bonusMalusTime && bonusMalusActive == true){
        	$('body').css('background', '#000');
        	$('.more').css('background', '#fff');
        	timeGame = 50;
        	myBonusMalusChoice = false;
        	bonusMalus();
        	//inc = 0;
        }
		
	}

	function apple(){
		var apple = document.createElement('div');
		apple.className = 'apple';
		apple.style.position = 'absolute';
		apple.style.width = appleR * 2;
		apple.style.height = appleR * 2;
		appleX = 1 + Math.floor(Math.random() * $(window).width());
		appleY = 1 + Math.floor(Math.random() * $(window).height());

		// We check if the apple is on the body
		if(appleX < 10){
			appleX = appleX + 20;
		} else if (appleX > $(window).width() - 10){			
			appleX = appleX - 20;
		}

		if(appleY < 10){
			appleY = appleY + 20;
		} else if (appleY > $(window).height() - 10){
			appleY = appleY - 20;
		}

		apple.style.left = appleX;
		apple.style.top = appleY;
		$('body').append(apple);
	}

	function eatApple(){		
		var distanceX = posX - appleX;
		var distanceY = posY - appleY;
        var distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

        if(distance < (snakeR + appleR)){
			$('.apple').remove();
			points++;
			apple();
			growUp();
        }
			
	}

	function growUp(){
		var moreSnake = document.createElement('span');
		moreSnake.style.width = snakeR * 2;
		moreSnake.style.height = snakeR * 2;
		moreSnake.style.left = lastPosition[lastPosition.length - 1][0];
		moreSnake.style.top = lastPosition[lastPosition.length - 1][1];
		
		// If there are only one circle to body, we give the position from the head before the mvoe
		if(lastPosition.length == 1){
			moreSnake.style.left = lastLastPositionHead[0][0];
			moreSnake.style.top = lastLastPositionHead[0][1];		
		}

		moreSnake.className = "more";
		$('.next').append(moreSnake);
	}

	function updateNext(){
		var i = 0;

		$('.more').each(function(){
			i++;
			var newLeft = lastPosition[i-1][0];			
			var newTop = lastPosition[i-1][1];

			if(i == 1){
				newLeft = lastLastPositionHead[0][0];
				newTop = lastLastPositionHead[0][1];	
			}
			lastPosition[i] = [$(this).css('left'), $(this).css('top')];

			$(this).css({
				'left': newLeft,
				'top' : newTop
			});
		});
	}

	/* Move */

	function moveUp(){
		posY = posY - 25; 
		$('#snake').css('top', posY );
	}

	function moveLeft(){

		posX = posX - 25;
		$('#snake').css('left', posX );
	}

	function moveRight(){
		posX = posX + 25;
		$('#snake').css('left', posX );
	}

	function moveDown(){
		posY = posY + 25; 
		$('#snake').css('top', posY );
	}
	
});