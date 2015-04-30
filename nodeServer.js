////////////////////////////////////////////////////////////////
// Server Setup
////////////////////////////////////////////////////////////////

// Set up mySQL
var mysql = require('mysql');
var sqlConnection  = mysql.createConnection({
    host      : 'localhost',
    database  : 'rps_data',
    user      : 'wustl',
    password  : 'rps123',
});

sqlConnection.connect(function(err) {
  // connected! (unless `err` is set)
  if(err) {
      console.log("error with mysql");
  } else {
      console.log("mysql is connected");
  }
});

var express = require('express');
var http = require('http');

var app = express();
var server = http.Server(app); //app.listen(3000);
var socketio = require('socket.io')(server);

server.listen(1337);  //listen on port 80

app.get('http:://54.69.129.39:1337/twoPlayer', function (req, res) {
    res.sendfile(__dirname + '/twoPlayer.html');
});

////////////////////////////////////////////////////////////////
// Game Variables
////////////////////////////////////////////////////////////////

// Global variables
var lastGameId        = 100;
var lastPlayerId      = 100;
var gameIdToObject    = {}; // Associative array, not a standard array
var numMovesReceived  = 0;

// Hard coded because we only need to change these settings very infrequently!
// Standard Score Matrix, 3 choices. Format: [p1 Score, p2 Score]
var standardScoreArray3 = [1, 1, 1, 1, 1, 1,
                           1, 1, 1, 1, 1, 1,
                           1, 1, 1, 1, 1, 1];

// Stochastic Score Matrix, 3 choices
var stochScoreArray3 = [.5, .5, .5, .5, .5, .5,
                        .5, .5, .5, .5, .5, .5,
                        .5, .5, .5, .5, .5, .5];

// Standard Score Matrix, 2 choices
var standardScoreArray2 = [2, 2, 1, 3,
                           3, 1, 0, 0];

// Stochastic Score Matrix, 2 choices
var stochScoreArray2 = [.5, .5, .2, .8,
                        .8, .2, .1, .1];

// gameObject class to hold the data for one game
function GameObject(useStandardScore, useViewOpponent,
    useThreeChoices, totalRounds, gameId, playerId1) {

        this.useStandardScore   = useStandardScore;
        this.useViewOpponent    = useViewOpponent;
        this.useThreeChoices    = useThreeChoices;
        this.totalRounds        = totalRounds;
        this.curRound           = 1;
        this.gameId             = gameId;
        this.playerId1          = null;
        this.playerId2          = null;
        this.player1Socket      = null;
        this.player2Socket      = null;
        this.player1Choice      = 0;
        this.player2Choice      = 0;
        this.player1Score       = 0;
        this.player2Score       = 0;
        this.player1TurnScore   = 0;
        this.player2TurnScore   = 0;
    }

////////////////////////////////////////////////////////////////
// Game Logic
////////////////////////////////////////////////////////////////
console.log("server started up");

// Client and server communication
socketio.sockets.on('connection', function (socket) {
    console.log('on connection');

    ////////////////////////////////////////////////////////////////
    // Single Player
    ////////////////////////////////////////////////////////////////
    // useStandardScore:   useStandardScore,
    // useViewOpponent:    useViewOpponent,
    // useThreeChoices:    useThreeChoices,
    // numRounds:          numRounds
    socket.on("start_single_player", function(data) {
        console.log("on the server, got a request to start single player game");
        console.log("useStandardScore: " + data["useStandardScore"]);
        console.log("useViewOpponent: "+ data["useViewOpponent"]);
        console.log("useThreeChoices: " + data["useThreeChoices"]);
        console.log("numRounds: "+ data["numRounds"]);

        // Create a game object
        var curGameId = lastGameId;
        var curPlayerId = lastPlayerId;
        ++lastPlayerId;
        ++lastGameId;

        var game = new GameObject(
            data["useStandardScore"], data["useViewOpponent"], data["useThreeChoices"], data["numRounds"], curGameId, curPlayerId
        );

        // Save the socket of player1
        game.player1Socket = socket;
        game.playerId1     = curPlayerId;
        game.gameId        = curGameId;

        // Save the new game in the game map
        gameIdToObject[Number(game.gameId)] = game;

        // tell the player their game is approved
        // Pass back the game id and player id to client
        socket.emit("approve_single_player",{
            gameId:game.gameId,
            playerId:game.playerId1
        });

        console.log("should have sent approval of single player");
    });

    // Receiving single player data
    //      playerId:playerId,
    //      gameId:gameId,
    //      playerChoice:playerChoice
    socket.on("submit_single_player_move", function(data) {
        console.log("------------------------");
        console.log("got a player's move: playerid: " + data["playerId"] + " gameId: " + data["gameId"] + " player choice: " + data["playerChoice"]);

        // Check for valid game id
        var game = getGameFromDictionary(data["gameId"]);
        if(game) {
            // Save the move

            // Check for valid player id
            var pId = Number(data["playerId"]);
            if(pId == Number(game.playerId1)) {
                game.player1Choice = data["playerChoice"];
            } else {
                // TODO send error message to user
                console.log("got a player ID that does not match any player");
            }

            // Calculate and save score
            updateSinglePlayerScores(game);

            // Save the moves in the database
            // Table name = twoPlayer
            var query = "INSERT INTO singlePlayer (gameId, playerId, curRound, playerChoice, playerTurnScore, playerScore, totalRounds, scoreMode, oppMode, choiceMode) VALUES (" + game.gameId + ", " + game.playerId1 + ", " + game.curRound + ", " + game.player1Choice + ", " + game.player1TurnScore + ", "  + game.player1Score + ", " + game.totalRounds + ", " + game.useStandardScore + ", " + game.useViewOpponent + ", " + game.useThreeChoices + ");";

            console.log("query!!!" + query);

            sqlConnection.query(query, function() {
                console.log("inserted the two player game data");
            });

            console.log("p1---")
            console.log("player1Score: " + game.player1Score);
            console.log("turnScore: " + game.player1TurnScore);
            console.log("opponentChoice: " + game.player2Choice);
            console.log("opponentTurnScore: " + game.player2TurnScore);
            console.log("p2---")
            console.log("player1Score: " + game.player2Score);
            console.log("turnScore: " + game.player2TurnScore);
            console.log("opponentChoice: " + game.player1Choice);
            console.log("opponentTurnScore: " + game.player1TurnScore);

            // Check if we're done playing
            var donePlaying = false;
            if((game.curRound) == game.totalRounds) {
                donePlaying = true;
            }

            // Send back total score and turn score and other player move
            game.player1Socket.emit("single_game_result", {
                totalScore:game.player1Score,
                turnScore:game.player1TurnScore,
                opponentChoice:game.player2Choice,
                opponentTurnScore:game.player2TurnScore,
                donePlaying:donePlaying,
                curRound:game.curRound
            });

            // reset the number of moves and move choice
            game.player1Choice = null;
            game.player2Choice = null;
            game.curRound = game.curRound + 1;
        } else {
            // TODO send user some error message
            console.log("game id was not found in submit player move");
        }
    });

    ////////////////////////////////////////////////////////////////
    // Multi player
    ////////////////////////////////////////////////////////////////

    // Requesting to start a 2 player game
    // useStandardScore:   useStandardScore,
    // useViewOpponent:    useViewOpponent,
    // useThreeChoices:    useThreeChoices,
    // numRounds:          numRounds
    socket.on('start_two_player', function(data) {
        console.log("on the server, got a request to start two player game");
        console.log("useStandardScore: " + data["useStandardScore"]);
        console.log("useViewOpponent: "+ data["useViewOpponent"]);
        console.log("useThreeChoices: " + data["useThreeChoices"]);
        console.log("numRounds: "+ data["numRounds"]);

        // Create a game object
        var curGameId = lastGameId;
        var curPlayerId = lastPlayerId;
        ++lastPlayerId;
        ++lastGameId;

        var game = new GameObject(
            data["useStandardScore"], data["useViewOpponent"], data["useThreeChoices"], data["numRounds"], curGameId, curPlayerId
        );

        // Save the socket of player1
        game.player1Socket = socket;
        game.playerId1     = curPlayerId;
        game.gameId        = curGameId;

        // Save the new game in the game map
        gameIdToObject[Number(game.gameId)] = game;

        // Pass back the game id and player id to client
        socket.emit("approve_two_player",{
            gameId:game.gameId,
            playerId:game.playerId1
        });
    });

    // Second player is trying to join a specific game
    // gameId:requestedGameId
    socket.on("second_player_join", function(data) {
        console.log("on the server, got a request join game");
        console.log("gameId: " + data["gameId"]);

        var game = getGameFromDictionary(data["gameId"]);
        if(game) {
            game.playerId2 = lastPlayerId;
            ++lastPlayerId;

            // Save player two's socket connection
            game.player2Socket = socket;

            // Let first player know they can play now
            game.player1Socket.emit("found_second_player",{})

            // Let second player know they can play now
            socket.emit("join_game_success", {
                playerId:game.playerId2,
                gameId:game.gameId,
                useViewOpponent:game.useViewOpponent,
                useThreeChoices:game.useThreeChoices
            });
        } else {
            // Let second player know they need a valid game id
            console.log("game id not found");
            socket.emit("join_game_failure");
        }
    });

    // Any player submitted a move
    // playerId:playerId,
    // gameId:gameId,
    // playerChoice:playerChoice
    socket.on("submit_player_move", function(data) {
        console.log("------------------------");
        console.log("got a player's move: playerid: " + data["playerId"] + " gameId: " + data["gameId"] + " player choice: " + data["playerChoice"]);

        var game = getGameFromDictionary(data["gameId"]);
        if(game) {
            // Save the move
            var pId = Number(data["playerId"]);
            if(pId == Number(game.playerId1)) {
                game.player1Choice = data["playerChoice"];

            } else if(pId == Number(game.playerId2)) {
                game.player2Choice = data["playerChoice"];

            } else {
                // TODO send error message to user
                console.log("got a player ID that does not match any player");
            }

            numMovesReceived++;
            if(numMovesReceived == 2) {
                // We now have both moves
                updateTwoPlayerScores(game);

                // Save the moves in the database
                // Table name = twoPlayer
                var query = "INSERT INTO twoPlayer (gameId, player1Id, player2Id, curRound, player1Choice, player2Choice, player1TurnScore, player2TurnScore, player1Score, player2Score, totalRounds, scoreMode, oppMode, choiceMode) VALUES (" + game.gameId + ", " + game.playerId1 +
                    ", " + game.playerId2 + ", " + game.curRound +
                    ", " + game.player1Choice + ", " + game.player2Choice + ", " + game.player1TurnScore + ", " + game.player2TurnScore + ", " + game.player1Score + ", " + game.player2Score + ", " + game.totalRounds + ", " + game.useStandardScore +
                    ", " + game.useViewOpponent + ", " + game.useThreeChoices + ");";

                console.log("query!!!" + query);

                sqlConnection.query(query, function() {
                    console.log("inserted the single player game data");
                });

                console.log("p1---")
                console.log("player1Score: " + game.player1Score);
                console.log("turnScore: " + game.player1TurnScore);
                console.log("opponentChoice: " + game.player2Choice);
                console.log("opponentTurnScore: " + game.player2TurnScore);
                console.log("p2---")
                console.log("player1Score: " + game.player2Score);
                console.log("turnScore: " + game.player2TurnScore);
                console.log("opponentChoice: " + game.player1Choice);
                console.log("opponentTurnScore: " + game.player1TurnScore);

                // Check if we're done playing
                var donePlaying = false;
                if((game.curRound) >= game.totalRounds) {
                    donePlaying = true;
                }

                // Send back total score and turn score and other player move
                game.player1Socket.emit("game_result", {
                    totalScore:game.player1Score,
                    turnScore:game.player1TurnScore,
                    playerChoice:game.player1Choice,
                    opponentChoice:game.player2Choice,
                    opponentTurnScore:game.player2TurnScore,
                    donePlaying:donePlaying,
                    curRound:game.curRound
                });
                game.player2Socket.emit("game_result", {
                    totalScore:game.player2Score,
                    turnScore:game.player2TurnScore,
                    playerChoice:game.player2Choice,
                    opponentChoice:game.player1Choice,
                    opponentTurnScore:game.player1TurnScore,
                    donePlaying:donePlaying,
                    curRound:game.curRound
                });

                // reset the number of moves and move choice
                numMovesReceived = 0;
                game.player1Choice = null;
                game.player2Choice = null;
                game.curRound = game.curRound + 1;
            }
        } else {
            // TODO send user some error message
            console.log("game id was not found in submit player move");
        }
    });
});

// /**
// * Returns the computer's move
// * Currently returning a random move
// * Rock - 0
// * Paper - 1
// * Scissors - 2
// */
// function getCpuMove() {
//     var rand = Math.random();
//
//     if(rand < 1/3) {
//         return 0;
//     } else if(rand >= 1/3 && rand < 2/3) {
//         return 1;
//     } else {
//         return 2;
//     }
// }

// Update score for single player mode
// There is only a stocastic mode for single player, only 2 choices
// 1 player game
// ================================================
// action A: 2 with probability 90%, -2 with probability 10%
// action B: 1.4 with certainty
// ====================
function updateSinglePlayerScores(game) {
    console.log("in updating player score, got both player's moves.");
    console.log("player1Choice: " + player1Choice);

    // Update scores
    var player1Choice = game.player1Choice;
    var scoreMatrix = null;
    var numChoices = 0;

    if(game.useThreeChoices) {
        // Don't have a payoff matrix for this yet
        // FIXME
    } else {
        if(player1Choice == 0) {
            game.player1TurnScore = Math.random() < .9 ? 2 : -2;
        } else if(player1Choice == 1) {
            game.player1TurnScore = 1.4;

        }
    }

    game.player1Score += game.player1TurnScore;
    game.player2TurnScore = 0;
}

// Update the score for each player in the game object
// Decide the score using the score matrix
function updateTwoPlayerScores(game) {
    // Update scores
    var player1Choice = game.player1Choice;
    var player2Choice = game.player2Choice;

    var scoreMatrix = null;
    var numChoices = 0;

    if(game.useThreeChoices) {
        numChoices = 3;

        if(game.useStandardScore) {
            scoreMatrix = standardScoreArray3;
        } else {
            scoreMatrix = stochScoreArray3;
        }
    } else {
        numChoices = 2;

        if(game.useStandardScore) {
            scoreMatrix = standardScoreArray2;
        } else {
            scoreMatrix = stochScoreArray2;
        }
    }

    console.log("in updating player score, got both player's moves.");
    console.log("player1Choice: " + player1Choice + " player2choice: " + player2Choice);
    console.log("scoreMatric: " + scoreMatrix);
    console.log("index: " + ((player1Choice * 2 + player2Choice + 0) * 2));

    // Calculate the index of the scores
    var p1Index = (player1Choice * numChoices + player2Choice) * 2;
    var p2Index = (player1Choice * numChoices + player2Choice) * 2 + 1;

console.log("choice: " + scoreMatrix[p1Index]);

    if(!game.useStandardScore) {
        // Stochastic scoring
        var chance1 = scoreMatrix[p1Index];
        var chance2 = scoreMatrix[p2Index];
        game.player1TurnScore = Math.random() < chance1 ? 1 : 0;
        game.player2TurnScore = Math.random() < chance2 ? 1 : 0;
    } else {
        // Deterministic scoring
        game.player1TurnScore = scoreMatrix[p1Index];
        game.player2TurnScore = scoreMatrix[p2Index];
    }

    game.player1Score += game.player1TurnScore;
    game.player2Score += game.player2TurnScore;
}

// Return the game object from the game mapping
// Check to make sure the game ID is valid
function getGameFromDictionary(gameId) {
    var requestedGameId = Number(gameId);
    if(requestedGameId != null) {

        console.log("got the game ID");

        var gameObj = gameIdToObject[requestedGameId];
        if(gameObj) {
            console.log("found game in dictionary");
            return gameObj;
        } else {
            console.log("Could not find the game in the dictionary");
            //TODO emit something to the joining player that the game they want doesn't exist
            return null;
        }
    }
}
