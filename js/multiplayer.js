$(document).domain = "54.69.129.39";
$(document).ready(function() {
    // Communicating with the server
    socketio = io.connect("http://54.69.129.39:1337/");
    // var joinSuccess = false; // VARS MOVED TO OPTION.js
    // var makeGameSuccess = false;
    // var playerId = null;
    // var gameId = null;
    //console.log("checking connection: " + socketio.connected);

    /////////////////////////////////////////////////////////////////////
    // Joining a game
    /////////////////////////////////////////////////////////////////////

    $("#joinButton").click(function() {
        $("#joinModal").modal("show");
    });

    // Asking to join a specific game id
    $("#submitJoinGame").click(function() {
        // Disable the button from being clicked twice
        $("#submitJoinGame").attr("disabled", "disabled");

        // Hide the error box
        $("#gameIdError").hide();

        var requestedGameId = $("#inputGameId").val();
        console.log("game id requested: " + requestedGameId);

        if($.isNumeric(requestedGameId)) {
            // Send request to join game
            gameId = Number(requestedGameId);
            socketio.emit("second_player_join", {gameId:requestedGameId});
            joinSuccess = true;
        } else {
            console.log("Need a valid game id");
            $("#gameIdError").show();
        }

        // Let the button be clicked again
        $("#submitJoinGame").removeAttr('disabled');
    });

    // Start the game for the joining player
    // playerId:game.playerId2,
    // gameId:game.gameId,
    // useViewOpponent:game.useViewOpponent,
    // useThreeChoices:game.useThreeChoices
    socketio.on("join_game_success", function(data){
        console.log("join game success gameId " + data["gameid"] + " playerId " + data["playerId"]);

        // Save player id and game id
        if(gameId == null && data["gameId"] != null) {
            gameId = Number(data["gameId"]);
        }
        playerId = Number(data["playerId"]);

        if(joinSuccess) {
            // Set up the game with proper settings
            if(!data["useThreeChoices"]) {
                $("#scissors").css("display", "none");
            }
            if(!data["useViewOpponent"]) {
                $(".gameStats").css("display", "none");
                $("#gameLog").css("display", "none");
                $("#resultMessage").css("display", "none");
            }

            $("#joinModal").modal("hide");

            // Bring the user to the game screen
            $("#setUpContainer").hide();
            $(".gameContainer").show();

            startTime = d.getTime();
        }
    });

    // Couldn't join game. Game Id was invalid
    socketio.on("join_game_failure", function(data) {
        console.log("join gamefailure");
        $("#gameIdError").show();
    });

    /////////////////////////////////////////////////////////////////////
    // Starting a game
    /////////////////////////////////////////////////////////////////////

    // Opening the menu to set up a game
    $("#startButton").click(function() {
        openOptions();
    });

    // Get the game code back from the server
    // gameId:game.gameId,
    // playerId:game.playerId1
    socketio.on("approve_two_player", function(data){
        console.log("approve two player");
        console.log("game id: " + data["gameId"] + " playerid: " + data["playerId"]);

        // Save player id
        //if(data["playerId"] != null && playerId == null) {
            playerId = data["playerId"];
            //console.log("got player id from server!");
        //}

        //if(data["gameId"] != null) {
            gameId = data["gameId"];

            // Bring the user to the game screen
            $("#setUpContainer").hide();
            $(".gameContainer").show();

            // Set up the waiting pop up
            $("#gameIdText").html(gameId);

            // Prevent user from exiting pop up
            $("#waitingModal").modal({
                backdrop: "static",
                keyboard: false
            });

            $("#waitingModal").modal("show");
            makeGameSuccess = true;
        //}
    });

    // Wait for the second player to join the game
    socketio.on("found_second_player", function(data){
        // TODO Set up game, show the proper data (all good for game maker)
        console.log("found second player");

        if(makeGameSuccess) {
            $("#waitingModal").modal("hide");
            startTime = d.getTime();
        }
    });
});

// Tell teh server to start a new two player game
function saveOptions() {
    console.log("save options yay");

    // Send the game options
    socketio.emit("start_two_player", {
        useStandardScore:   useStandardScore,
        useViewOpponent:    useViewOpponent,
        useThreeChoices:    useThreeChoices,
        numRounds:          numRounds
    });

    console.log("sent game data to server");
}

// Update the log of previous games
function updateTwoPlayerLog() {
    // Update log number
    if(curRound <= numRounds) {
        $("#gameRoundNumber").html(curRound);
        $("#prev1Num").html(curRound - 1);
        $("#prev2Num").html(curRound - 2);
        $("#prev3Num").html(curRound - 3);
    }

    // Update displayed log
    var text1 = "You chose " + log[0][0] + " and earned " + log[0][1] +
                " points. Opponent chose " + log[0][2] + " and earned " + log[0][3] + " points.";
                $("#prev1Message").html(text1);

    var text2 = "You chose " + log[1][0] + " and earned " + log[1][1] +
                " points. Opponent chose " + log[1][2] + " and earned " + log[1][3] + " points.";
                $("#prev2Message").html(text2);

    var text3 = "You chose " + log[2][0] + " and earned " + log[2][1] +
                " points. Opponent chose " + log[2][2] + " and earned " + log[2][3] + " points.";
                $("#prev3Message").html(text3);
}


function sendAndGetResult() {
    console.log("sending result: playerChoice " + playerChoice );

    // Send the current move
    socketio.emit("submit_player_move", {
        playerId:playerId,
        gameId:gameId,
        playerChoice:playerChoice
    });

    // FIXME We're getting the game_result twice, but we only need it once
    var count = 0;

    // Params
    // totalScore:game.player1Score,
    // turnScore:game.player1TurnScore,
    // playerChoice:game.player1Choice,
    // opponentChoice:game.player2Choice
    // opponentTurnScore:game.player2TurnScore
    // donePlaying:donePlaying
    socketio.on("game_result", function(data){
        console.log("got game results!");
        console.log("totalScore: " + data["totalScore"]);
        console.log("turnScore: " + data["turnScore"]);
        console.log("playerChoice: " + data["playerChoice"]);
        console.log("opponentChoice: " + data["opponentChoice"]);
        console.log("opponentTurnScore: " + data["opponentTurnScore"]);
        console.log("doneplaying: " + data["donePlaying"]);

        // FIXME We're getting the game_result twice, but we only need it once
        count++;
        if(count > 1) {
            return;
        }

        // Set the game data in appropriate vars.
        playerChoice = data["playerChoice"];
        oppChoice    = data["opponentChoice"];
        score        = data["totalScore"];
        turnScore    = data["turnScore"];
        oppTurnScore = data["opponentTurnScore"];

        // Round the score to two decimal places
        score = roundToHundredth(score);
        turnScore = roundToHundredth(turnScore);

        // Session variable stuff
        sessionStorage["twoPlayerScore"] = data["totalScore"];
        // if(sessionStorage["singleScore"] != null) {
        //     score += Number(sessionStorage["singleScore"]);
        // }

        $(".scoreNumber").html(score);
        $("#turnScore").html("+" + turnScore);

console.log("log array: " + log);

        // Update log array
        log[2][0] = log[1][0]; log[2][1] = log[1][1];
        log[2][2] = log[1][2]; log[2][3] = log[1][3];
        log[1][0] = log[0][0]; log[1][1] = log[0][1];
        log[1][2] = log[0][2]; log[1][3] = log[0][3];

        log[0][0] = choiceEnum[playerChoice];
        log[0][1] = turnScore;
        log[0][2] = choiceEnum[oppChoice];
        log[0][3] = oppTurnScore;

console.log("log array: " + log);

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

        curRound = data["curRound"] + 1;
        continueGame();
        updateTwoPlayerLog();
        $("#oppTurnModal").modal("hide");
    });
}
