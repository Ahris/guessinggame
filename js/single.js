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
    socketio = io.connect("http://54.69.129.39:1337/");
    openOptions();

    // gameId:game.gameId,
    // playerId:game.playerId1
    socketio.on("approve_single_player", function(data) {
        console.log("approve_single_player");
        console.log("gameId: "+ data["gameId"]);
        console.log("playerId " + data["playerId"]);

        gameId = data["gameId"];
        playerId = data["playerId"];
    });

    // /**
    // * Close the results modal and set up the next round
    // */
    // $("#continue").click(function() {
    //   continueGame();
    // });
});

// Tell the server to create a new single player game
function saveOptions() {
    // Starting the game, send data to server
    console.log("save options yay");

    // Send the game options
    socketio.emit("start_single_player", {
        useStandardScore:   useStandardScore,
        useViewOpponent:    useViewOpponent,
        useThreeChoices:    useThreeChoices,
        numRounds:          numRounds
    });

    console.log("sent game data to server");
}

// Update the log of previous games
function updateSinglePlayerLog() {
    // Update log number
    if(curRound <= numRounds) {

        console.log("about to update cur round number");
        $("#gameRoundNumber").html(curRound);
        $("#prev1Num").html(curRound - 1);
        $("#prev2Num").html(curRound - 2);
        $("#prev3Num").html(curRound - 3);
    }

    // Update displayed log
    var text1 = "You chose " + log[0][0] + " and earned " + log[0][1] +
                " points.";
                $("#prev1Message").html(text1);

    var text2 = "You chose " + log[1][0] + " and earned " + log[1][1] +
                " points.";
                $("#prev2Message").html(text2);

    var text3 = "You chose " + log[2][0] + " and earned " + log[2][1] +
                " points.";
                $("#prev3Message").html(text3);
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

     // Round the score to 2 decimal places
     score = roundToHundredth(score);
     turnScore = roundToHundredth(turnScore);

     // Session variable stuff
     sessionStorage["singleScore"] = data["totalScore"];
    //  if(sessionStorage["twoPlayerScore"] != null) {
    //      score += Number(sessionStorage["twoPlayerScore"]);
    //  }

     $(".scoreNumber").html(score);
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

     curRound = data["curRound"] + 1;
     continueGame();
     updateSinglePlayerLog();
    });
}
