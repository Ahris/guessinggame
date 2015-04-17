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

    /////////////////////////////////////////////////////////////////////
    // Starting a game
    /////////////////////////////////////////////////////////////////////

    // Opening the menu to set up a game
    $("#startButton").click(function() {
        openOptions();
    });

    // Starting the game, send data to server
    $("#saveOptions").click(function() {
        console.log("save options yay");

        // Send the game options
        socketio.emit("start_two_player", {
            useStandardScore:   useStandardScore,
            useViewOpponent:    useViewOpponent,
            useThreeChoices:    useThreeChoices,
            numRounds:          numRounds
        });

        console.log("sent game data to server");
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

function sendAndGetResult() {
    console.log("sending result: playerChoice " + playerChoice );

    // Send the current move
    socketio.emit("submit_player_move", {
        playerId:playerId,
        gameId:gameId,
        playerChoice:playerChoice
    });

    // Params
    // totalScore:game.player1Score,
    // turnScore:game.player1TurnScore,
    // opponentChoice:game.player2Choice
    // opponentTurnScore:game.player2TurnScore
    socketio.on("game_result", function(data){
        console.log("got game results!");
        console.log("totalScore: " + data["totalScore"]);
        console.log("turnScore: " + data["turnScore"]);
        console.log("opponentChoice: " + data["opponentChoice"]);
        console.log("opponentTurnScore: " + data["opponentTurnScore"]);

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

        // TODO Caluclate money earned
        //updateMoneyPayoff(gameResult);
        //$("#moneyNumber").html(totalMoney);

        // Done playing
        if(curRound == numRounds) {
            $("#resultMessage").html("Thanks for playing! Data is saved and you can exit.");

            $(window).bind("beforeunload", function() {
                return "Thanks for playing!";
            });

            $("#continue").hide();
        }

        //sendGameData();
        //$("#gameResultModal").modal("show");
        continueGame();

        $("#oppTurnModal").modal("hide");
    });
}
