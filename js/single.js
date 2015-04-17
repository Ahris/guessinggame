// TODO
// http://www.rpscontest.com/
//$(window).resize(function() {
// Mobile view stuff
//});

$(document).ready(function() {
    //$("#optionPopUp").load("options.html");

    // Communicating with the server
    socketio = io.connect();

    // TODO Query the server for the next player
    playerId = 0;

    startTime = d.getTime();

    // /**
    // * Prevent the user from leaving
    // */
    // $(window).bind("beforeunload", function() {
    //     return "Game data will be lost!";
    // });

    // // Save the user's move
    // $("#rock").click(function() {
    //     $("#rock").addClass("active");
    //     $("#paper").removeClass("active");
    //     $("#scissors").removeClass("active");
    //     playerChoice = 0;
    // });
    //
    // $("#paper").click(function() {
    //     $("#paper").addClass("active");
    //     $("#rock").removeClass("active");
    //     $("#scissors").removeClass("active");
    //     playerChoice = 1;
    // });
    //
    // $("#scissors").click(function() {
    //     $("#scissors").addClass("active");
    //     $("#paper").removeClass("active");
    //     $("#rock").removeClass("active");
    //     playerChoice = 2;
    // });

    // Don't allow users to open options in the middle of a game any more
    //$("#options").click(openOptions);

    openOptions();

    // /**
    // * Submit button pressed
    // */
    // $("#submit").click(function() {
    //     // No choice was made
    //     if(playerChoice == null) {
    //         $("#popupAlert").fadeIn().delay(400).fadeOut();
    //         return;
    //     }
    //
    //     endTime = d.getTime();
    //
    //     // Update log array
    //     log[2][0] = log[1][0]; log[2][1] = log[1][1];
    //     log[2][2] = log[1][2]; log[2][3] = log[1][3];
    //     log[1][0] = log[0][0]; log[1][1] = log[0][1];
    //     log[1][2] = log[0][2]; log[1][3] = log[0][3];
    //
    //     switch(playerChoice) {
    //         case 0:
    //             log[0][1] = "rock";
    //             break;
    //         case 1:
    //             log[0][1] = "paper";
    //             break;
    //         case 2:
    //             log[0][1] = "scissors";
    //             break;
    //     }
    //
    //     gameResult = getWinner();
    //     switch(gameResult) {
    //         case 0:
    //             ++ties;
    //             log[0][0] = "tie";
    //             log[0][2] = "ties";
    //             $("#ties").html(ties);
    //             $("#resultText").html("TIE").css("color", "#f0ad4e");
    //             break;
    //         case 1:
    //             ++wins;
    //             log[0][0] = "win";
    //             log[0][2] = "loses";
    //             $("#wins").html(wins);
    //             $("#resultText").html("WIN").css("color", "#5cb85c");
    //             break;
    //         case 2:
    //             ++losses;
    //             log[0][0] = "lose";
    //             log[0][2] = "wins";
    //             $("#losses").html(losses);
    //             $("#resultText").html("LOSE").css("color", "#d9534f");
    //             break;
    //     }
    //
    //     dScore = getScore(gameResult)
    //     score += dScore;
    //     score = roundThousandths(score);
    //     $("#scoreNumber").html(score);
    //     $("#gameScoreNumber").html("+" + dScore);
    //
    //     if(useViewOpponent) {
    //         var resultStr = "The cpu played ";
    //         switch(oppChoice) {
    //             case 0:
    //                 log[0][3] = "rock";
    //                 resultStr = resultStr.concat("rock.");
    //                 break;
    //             case 1:
    //                 log[0][3] = "paper";
    //                 resultStr = resultStr.concat("paper.");
    //                 break;
    //             case 2:
    //                 log[0][3] = "scissors";
    //                 resultStr = resultStr.concat("scissors.");
    //                 break;
    //         }
    //
    //         $("#resultMessage").html(resultStr);
    //     }
    //
    //     // Caluclate money earned
    //     updateMoneyPayoff(gameResult);
    //     $("#moneyNumber").html(totalMoney);
    //
    //     // Done playing
    //     if(curRound == numRounds) {
    //         $("#resultMessage").html("Thanks for playing! Data is saved and you can exit.");
    //
    //         $(window).bind("beforeunload", function() {
    //             return "Thanks for playing!";
    //         });
    //
    //         $("#continue").hide();
    //     }
    //
    //     sendGameData();
    //     //$("#gameResultModal").modal("show");
    //     continueGame();
    // });

    /**
    * Close the results modal and set up the next round
    */
    $("#continue").click(function() {
      continueGame();
    });
});

// function continueGame() {
//   startTime = d.getTime();
//   ++curRound;
//
//   // Continue to next game
//   if(curRound <= numRounds) {
//       $("#gameRoundNumber").html(curRound);
//       $("#prev1Num").html(curRound - 1);
//       $("#prev2Num").html(curRound - 2);
//       $("#prev3Num").html(curRound - 3);
//   }
//
//   // Update displayed log
//   var text1 = "You " + log[0][0] + " with " + log[0][1] +
//               ". Opponent " + log[0][2] + " with " + log[0][3] + ".";
//               $("#prev1Message").html(text1);
//
//   var text2 = "You " + log[1][0] + " with " + log[1][1] +
//               ". Opponent " + log[1][2] + " with " + log[1][3] + ".";
//               $("#prev2Message").html(text2);
//
//   var text3 = "You " + log[2][0] + " with " + log[2][1] +
//               ". Opponent " + log[2][2] + " with " + log[2][3] + ".";
//               $("#prev3Message").html(text3);
//
//   unselectOption();
//   playerChoice = null;
//   oppChoice = null;
//   //$("#gameResultModal").modal("hide");
// }

/**
 * Send the game data to the server
 * Server will save the data into the database
 */
function sendGameData() {
    // socketio.on("single_player_data",function(data) {
    //     //Append an HR thematic break and the escaped HTML of the new message
    //     document.getElementById("chatlog").appendChild(document.createElement("hr"));
    //     document.getElementById("chatlog").appendChild(document.createTextNode(data['message']));
    // });
    var milliSecEllapsed = endTime - startTime;

    socketio.emit("single_player_data", {
        userId:         playerId,
        turnNum:        curRound,
        timeElapsed:    milliSecEllapsed,
        playerChoice:   choiceEnum[playerChoice],
        oppChoice:      choiceEnum[oppChoice],
        turnScore:      turnScore,
        totalScore:     score,
        result:         resultEnum[gameResult],
        totalGames:     numRounds,
        scoreMode:      scoreEnum[useStandardScore],
        oppMode:        oppEnum[useViewOpponent]
    });
}

// /**
//  * Deselects the currently chosen move button
//  */
// function unselectOption() {
//     $("#scissors").removeClass("active");
//     $("#paper").removeClass("active");
//     $("#rock").removeClass("active");
// }

/**
* Returns winner
* Tie - 0
* Player - 1
* Computer - 2
*/
function getWinner() {
    oppChoice = getCPUMove();
    if(playerChoice == oppChoice) {
        return 0;
    }

    // Player is scissors
    if(playerChoice == 2) {
        // cpu is paper
        if(oppChoice == 1) {
            return 1;
        } else {
            // cpu is rock
            return 2;
        }
    }

    if(playerChoice > oppChoice) {
        return 1;
    } else {
        return 2;
    }
}

/**
 * Return the number of points earned by the player
 * Can be determined statically or stochastically.
 */
function getScore(result) {
    if(useStandardScore) {
        return standardScoreArray[playerChoice][oppChoice];
    } else {
        return Math.random() < stochScoreArray[playerChoice][oppChoice];
    }
}

/**
 * Returns the total amount of money earned so far
 */
function updateMoneyPayoff(result) {
  var result = 0;

  if(useStandardScore) {
      result = standardScoreArray[playerChoice][oppChoice];
  } else {
      result = Math.random() < stochScoreArray[playerChoice][oppChoice];
  }

  totalMoney += result;
  roundThousandths(totalMoney);
  return totalMoney;
}

/**
* Returns the computer's move
* Currently returning a random move
* Rock - 0
* Paper - 1
* Scissors - 2
*/
function getCPUMove() {
    var rand = Math.random();

    if(rand < 1/3) {
        return 0;
    } else if(rand >= 1/3 && rand < 2/3) {
        return 1;
    } else {
        return 2;
    }
}

/**
 *  Returns money rounded to three digits
 */
 function roundThousandths(decimal) {
   return Math.round(decimal * 1000) / 1000;
 }
