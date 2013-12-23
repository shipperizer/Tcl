$(document).ready(function () {

    var debugStr;
    var PERSONAL_USER_ID = ##TP_USER_ID##;
    var GAME_ID = ##TP_GAME_ID##;
    var turn_no=-1;
    var deck = ["Aces", "Twos", "Threes", "Fours", "Fives", "Sixes", "Sevens", "Eights", "Nines", "Tens", "Jacks", "Queens", "Kings"]; 
    var cards;
    var kind=-1;
    var new_round=1;
    var turn=0;
    var numberOfCards = 52;
    //---------------------------------
    var cardWidth = 79;
    var cardHeight = 123;
    var backOverlap = 5;
    var defaultOverlap = 20;
    //---------------------------------
    var numPlayers = 4;

    // Arrays to hold players and cards
    var players = [];
    var playerOneCards = [];
    var playerTwoCardCount = 0;
    var playerThreeCardCount = 0;
    var playerFourCardCount = 0;
    var tableCardCount = 0;
    var discardedCardKinds = [];
    var selectedCardIndexes = [];
    var selectedCardNumbers = [];

    // Get the canvas and context
    var canvas = document.getElementById("GameBoard");
    var context = canvas.getContext("2d");

    // Default values for variables
    var overlap = defaultOverlap;
    var cardDisplayWidth = 0;
    
    

    setTimeout(function Clock() {
                              var time = new Date();
                              var clock=
                              $("#timer").text(time.getHours()+":"+((time.getMinutes()<10)?'0':'')+time.getMinutes()+":"+((time.getSeconds()<10)?'0':'')+time.getSeconds());
                              setTimeout( Clock , 1000);
                                  }, 1 );

    
    // ----------------------------------------------------- AJAX REQUESTS -------------------------------------------------------------------
    $("#play_btn").click(function() {
            if(turn==0) return;
            cards=getSelectedCards();
            console.debug(cards);
            if (new_round==1 && kind==-1) {alert("Choose a kind");return;}
            $.ajax({
                    url: "##TP_CGI_URL##?action=CHEAT_play_action&user_id="+PERSONAL_USER_ID+"&game_id="+GAME_ID+"&kind="+kind+"&cards="+cards,                    
                    cache: false
                    })
                    .done( function(results) {
                                        alert("You played");
                                        var jsonResp = JSON.parse(results);
                                        turn=0;
                                        turn_no=jsonResp["turn_no"];
                                        new_round=jsonResp["new_round"];
                                        drawGameBoard(results);
                                        });        
                    });

    $("#cheat_btn").click(function() {
            if(turn==0) return;
            $.ajax({
                    url: "##TP_CGI_URL##?action=CHEAT_cheat_action&user_id="+PERSONAL_USER_ID+"&game_id="+GAME_ID,
                    cache: false 
                    })
                    .done( function(results) {
                                        alert("You called cheat");
                                        var jsonResp = JSON.parse(results);
                                        turn=0;                                        
                                        turn_no=jsonResp["turn_no"];
                                        drawGameBoard(results);
                                       });
        });

    setTimeout(function CheckTurn() {
                              $.ajax({
                                      url: "##TP_CGI_URL##?action=CHEAT_check_status&user_id="+PERSONAL_USER_ID+"&game_id="+GAME_ID+"&turn_no="+turn_no,
                                      cache: false 
                                    }).done( function(results) {
                                                                var jsonResp = JSON.parse(results);
                                                                turn_no=jsonResp["turn_no"];
                                                                new_round=jsonResp["new_round"];
                                                                debugStr="jsonResp:"+jsonResp+" turn:"+turn_no;
                                                                console.debug(debugStr);
                                                                if ( jsonResp["cur_player_id"]==PERSONAL_USER_ID) 
                                                                    {
                                                                      turn=1;
                                                                      drawGameBoard(results);
                                                                      // check if it's first round so u can choose the kind
                                                                    }
                                                                else { 
                                                                      drawGameBoard(results);
                                                                      turn=0;  
                                                                     }
                                                              });                   
                                      setTimeout( CheckTurn , 5000); // reset to 4000
                                  }, 1 );


    // ----------------------------------------------------- AJAX REQUESTS -------------------------------------------------------------------


    console.log(deck);
    var divSel;
    $.each( deck, function(index, value) {
                                          divSel='<div class="selection" id="choice_'+index+'">'+value+'</div>';  
                                          $("#dropdown").append(divSel);
                                         });


    $(".selection").click(function() {
                                      kind = $(this).attr("id").match(/[0-9]+/)[0];
                                      debugStr="kind:"+deck[kind]+" "+kind; 
                                      console.debug(debugStr);
                                      alert("You've chosen "+deck[kind]);
                                      });
    

     
    // Draws the game board on each turn
    function drawGameBoard(jsonData) {

      // Set up some default/starting values for variables
      overlap = defaultOverlap;
      var cards = [];

      // Parse the JSON data
      jsonData = JSON.parse(jsonData);
      
      // If it's the start of the game, then we can retrieve the player info
      var playerOneIndex = 0;
      if (jsonData.hasOwnProperty('players')) {
        var jsonPlayers = jsonData.players;
        for (var i = 0; i < jsonPlayers.length; i++) {
          if (jsonPlayers[i].user_id == PERSONAL_USER_ID) {
            playerOneIndex = i;
            break;
          }
        }
        for (var i = playerOneIndex; i < numPlayers; i++) {
          players.push(jsonPlayers[i]);
        }
        for (i = 0; i < playerOneIndex; i++) {
          players.push(jsonPlayers[i]);
        }
      } 

      var cards = jsonData.cards;

      // Empty the card info variables and repopulate them
      playerOneCards = [];
      playerTwoCardCount = 0;
      playerThreeCardCount = 0;
      playerFourCardCount = 0;
      tableCardCount = 0;
      discardedCardKinds = [];
  
      for (i = 0; i < cards.length; i++) {
        switch(cards[i]) {
          case players[0].user_id:
            playerOneCards.push(i);
            break;
          case players[1].user_id:
            playerTwoCardCount++;
            break;
          case players[2].user_id:
            playerThreeCardCount++;
            break;
          case players[3].user_id:
            playerFourCardCount++;
            break;
          case 0:
            tableCardCount++;
            break;
          case -1:
            var kind = i % 13;
            var isDiscarded = false;
            for (var j = 0; j < discardedCardKinds.length; j++) {
              if (discardedCardKinds[j] == kind) {
                isDiscarded = true;
                break;
              }
            }
            if (!isDiscarded) {
              discardedCardKinds.push(kind);
            }
        }
      }

      // console.log(players[0]);
      // console.log(playerOneCards);
      // console.log(playerTwoCardCount);
      // console.log(playerThreeCardCount);
      // console.log(playerFourCardCount);
      // console.log(tableCardCount);
      // console.log(discardedCardKinds);

      // How much overlap can playerOne's cards have and still fit on the screen?
      cardDisplayWidth = ((playerOneCards.length - 1) * defaultOverlap) + 79;
      if (cardDisplayWidth > canvas.width) {
        overlap = (canvas.width - cardWidth)/(playerOneCards.length - 1);
        cardDisplayWidth = ((playerOneCards.length - 1) * overlap) + 79;
      }

      //Draw the cards
      drawCards();
    }

    function drawCardsOnCanvas() {
      // draw the cards
      for (var i = cards.length - 1; i >= 0; i--) {
        context.drawImage(this, cards[i][0], cards[i][1], cardWidth, cardHeight, cards[i][2], cards[i][3], cardWidth, cardHeight);
      }

    }

    function drawCards() {
      // clear the canvas
      context.fillStyle="#003300";
      context.fillRect(canvas.offsetLeft,canvas.offsetTop,canvas.width,canvas.height);
      
      // Empty the array of card information
      cards = [];

      // Loop through the player's cards and find the corresponding area of the
      // 'cards.png' sprite sheet, and work out where each card should appear.
      // Add this to the array of card information
      for (var i = 0; i < playerOneCards.length; i++) {
        var sourceX = (playerOneCards[i] % 13) * cardWidth;
        var sourceY = (Math.floor(playerOneCards[i] / 13)) * cardHeight;
        var destX = i * overlap;
        var destY = 450;
        for (var j = 0; j < selectedCardIndexes.length; j++) {
          if (selectedCardIndexes[j] == i) {
            destY = 430;
            break;
          }
        }
        cards.push(new Array(sourceX, sourceY, destX, destY));
      }

      // locate the card back image in the cards sprite sheet.
      sourceX = 2 * cardWidth;
      sourceY = 4 * cardHeight;

      // Now loop through the other entities on the table creating records
      // for each card that needs to appear face down.

      // Player 2
      destX = 0;
      for (i = 0; i < playerTwoCardCount; i++) {
        destY = (i * backOverlap) + 27;
        cards.push(new Array(sourceX, sourceY, destX, destY));
      }

      // Player 3
      destY = 27;
      for (i = 0; i < playerThreeCardCount; i++) {
        destX = (i * backOverlap) + 150;
        cards.push(new Array(sourceX, sourceY, destX, destY));
      }

      // Player 4
      destX = 650;
      for (i = 0; i < playerFourCardCount; i++) {
        destY = (i * backOverlap) + 27;
        cards.push(new Array(sourceX, sourceY, destX, destY));
      }

      // Table
      destY = 240;
      for (i = tableCardCount; i > 0; i--) {
        destX = (i * backOverlap) + 250;
        cards.push(new Array(sourceX, sourceY, destX, destY));
      }

      // Discarded
      // TODO: Where/how are we displaying this information?

      // Create an image object for the cards
      var card = new Image();
      card.addEventListener('load', drawCardsOnCanvas, false);  
      card.src = '##TP_STUFF_URL##cards.png';

      // Write the players' names on the board
      context.font = "bold 12px Arial";
      context.fillText(players[0].name, 150, 580);
      context.fillText(players[1].name, 0, 0);
      context.fillText(players[2].name, 150, 0);
      context.fillText(players[3].name, 650, 0);
    }

    function selectCard(event) {
      // A player can play at most 4 cards in a turn
      var maxCards = 4

      // TODO: You currently can't click the top 20 px of a card when it is above the line of cards.
      // This is a bit tricky to implement as the rules for overlap for the part poking out are different
      // to the rules for the bottom part, so an extra bit of logic would need to be added.

      // TODO: You should only be able to select cards when it is your turn
      var x = Math.floor((event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft));
      var y = Math.floor((event.clientY + document.body.scrollTop + document.documentElement.scrollTop));
      x -= canvas.offsetLeft;
      y -= canvas.offsetTop;
      if (y >= 450 && y <= 450 + cardHeight && x <= cardDisplayWidth) {
        // Assume player clicked the first card
        var cardClicked = 0;
        // If their mouse x position is further across than the first card, then work out which card they clicked
        if (x > cardWidth) {
          cardClicked = Math.ceil((x - cardWidth)/overlap);
        }
        // Now work out if the user was selecting or deselecting a card
        var processedCard = false;
        for (var i = 0; i < selectedCardIndexes.length; i++) {
          if (cardClicked == selectedCardIndexes[i]) {
            selectedCardIndexes.splice(i, 1);
            selectedCardNumbers.splice(i, 1);
            processedCard = true;
          }
        }
        if (!processedCard && selectedCardIndexes.length < maxCards) {
          selectedCardIndexes.push(cardClicked);
          selectedCardNumbers.push(playerOneCards[cardClicked]);
        }

        console.log(selectedCardIndexes);
        console.log(selectedCardNumbers);

        // Now redraw the board to show which cards are now selected.
        drawCards();
      }
    }

    function getSelectedCards() {
      return selectedCardNumbers;
    }

    canvas.addEventListener('click', selectCard, false);       




});