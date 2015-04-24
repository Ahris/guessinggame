// TODO
// http://www.rpscontest.com/
//$(window).resize(function() {
// Mobile view stuff
//});

$(document).ready(function() {
    //$("#optionPopUp").load("options.html");

    /////////////////////////////////////////////////////////////////////
    // Setting up a game
    /////////////////////////////////////////////////////////////////////
    // Communicating with the server
    socketio = io.connect();


    // Not including time any more
    //startTime = d.getTime();

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

    // Starting the game, send data to server
    $("#saveOptions").click(function() {
        console.log("save options yay");

        // Send the game options
        socketio.emit("start_single_player", {
            useStandardScore:   useStandardScore,
            useViewOpponent:    useViewOpponent,
            useThreeChoices:    useThreeChoices,
            numRounds:          numRounds
        });

        console.log("sent game data to server");
    });

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

/**
 *  Returns money rounded to three digits
 */
 function roundThousandths(decimal) {
   return Math.round(decimal * 1000) / 1000;
 }

// Send move to server
function sendAndGetResult() {
 console.log("sending result: playerChoice " + playerChoice );

 // Send the current move
 socketio.emit("submit_single_player_move", {
     playerId:playerId,
     gameId:gameId,
     playerChoice:playerChoice
 });

 // Params
 // totalScore:game.player1Score,
 // turnScore:game.player1TurnScore,
 // opponentChoice:game.player2Choice
 // opponentTurnScore:game.player2TurnScore
 // donePlaying:donePlaying
 socketio.on("single_game_result", function(data){
     console.log("got game results!");
     console.log("totalScore: " + data["totalScore"]);
     console.log("turnScore: " + data["turnScore"]);
     console.log("opponentChoice: " + data["opponentChoice"]);
     console.log("opponentTurnScore: " + data["opponentTurnScore"]);
     console.log("doneplaying: " + data["donePlaying"]);

     // Set the game data in appropriate vars.
     oppChoice    = data["opponentChoice"];
     score        = data["totalScore"];
     turnScore    = data["turnScore"];
     oppTurnScore = data["opponentTurnScore"];

     $("#scoreNumber").html(score);
     $("#turnScore").html("+" + turnScore);

     // Update log array
     log[2][0] = log[1][0]; log[2][1] = log[1][1];
     log[2][2] = log[1][2]; log[2][3] = log[1][3];
     log[1][0] = log[0][0]; log[1][1] = log[0][1];
     log[1][2] = log[0][2]; log[1][3] = log[0][3];

     log[0][0] = choiceEnum[playerChoice];
     log[0][1] = turnScore;
     log[0][2] = choiceEnum[oppChoice];
     log[0][3] = oppTurnScore;

     //turnScore = getScore(gameResult)
     //score += turnScore;
     //score = roundThousandths(score);

     // Check if done playing
     if(data["donePlaying"]) {
         console.log("done playing, modal should show now");

         // Prevent user from exiting the pop up
         $("#donePlayingModal").modal({
             backdrop: "static",
             keyboard: false
         });
         $("#donePlayingModal").modal("show");
     }

     continueGame();
 });
}
