////////////////////////////////////////////////////////////////
// Server Setup
////////////////////////////////////////////////////////////////

// Set up mySQL
var mysql = require('mysql');
var sqlConnection  = mysql.createConnection({
    host      : 'localhost',
    database  : 'rps_data',
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

// Score matricies
// row = playerChoice, col = cpuChoice,
// 3 choice score matrix
var standardScoreArray3     = [];
var stochScoreArray3        = [];
for(var i = 0; i < 3; ++i) {
    standardScoreArray3[i]   = [];
    stochScoreArray3[i]      = [];
}

// 2 choice score matrix
var standardScoreArray2     = [];
var stochScoreArray2        = [];
for(var i = 0; i < 2; ++i) {
    standardScoreArray2[i]   = [];
    stochScoreArray2[i]      = [];
}

// Hard coded because we only need to change these settings very infrequently!
// Standard Score Matrix, 3 choices. Format: [p1 Score, p2 Score]
standardScoreArray3[0][0] = [1, 1];
standardScoreArray3[0][1] = [1, 1];
standardScoreArray3[0][2] = [1, 1];
standardScoreArray3[1][0] = [1, 1];
standardScoreArray3[1][1] = [1, 1];
standardScoreArray3[1][2] = [1, 1];
standardScoreArray3[2][0] = [1, 1];
standardScoreArray3[2][1] = [1, 1];
standardScoreArray3[2][2] = [1, 1];

// Stochastic Score Matrix, 3 choices
stochScoreArray3[0][0] = [1, 1];
stochScoreArray3[0][1] = [1, 1];
stochScoreArray3[0][2] = [1, 1];
stochScoreArray3[1][0] = [1, 1];
stochScoreArray3[1][1] = [1, 1];
stochScoreArray3[1][2] = [1, 1];
stochScoreArray3[2][0] = [1, 1];
stochScoreArray3[2][1] = [1, 1];
stochScoreArray3[2][2] = [1, 1];

// Standard Score Matrix, 2 choices
standardScoreArray2[0][0] = [1, 1];
standardScoreArray2[0][1] = [1, 1];
standardScoreArray2[0][2] = [1, 1];
standardScoreArray2[1][0] = [1, 1];

// Stochastic Score Matrix, 2 choices
stochScoreArray2[0][0] = [1, 1];
stochScoreArray2[0][1] = [1, 1];
stochScoreArray2[0][2] = [1, 1];
stochScoreArray2[1][0] = [1, 1];

// gameObject class to hold the data for one game
function GameObject(useStandardScore, useViewOpponent,
    useThreeChoices, numRounds, gameId, playerId1) {

        this.useStandardScore   = useStandardScore;
        this.useViewOpponent    = useViewOpponent;
        this.useThreeChoices    = useThreeChoices;
        this.numRounds          = numRounds;
        this.curRound           = 0;
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

    // Receiving single player data
    // TODO: Will calculate score and win/loss
    socket.on("single_player_data", function(data) {
        var input = JSON.stringify(data);
        var json = JSON.parse(data);

        var query = "\
        INSERT INTO single_player_data \
        (userId, turnNum, timeElapsed, playerChoice, \
            cpuChoice, turnScore, totalScore, result,\
            totalGames, scoreMode, oppMode) \
            VALUES (" + json.userId + ", " + json.turnNum +
            ", " + json.timeElapsed + ", " + json.playerChoice +
            ", " + json.cpuChoice + ", " + json.turnScore + ", " + json.totalScore + ", " + json.result + ", " + json.totalGames +
            ", " + json.scoreMode + ", " + json.oppMode + ");";

            sqlConnection.query(query, function() {
                console.log("inserted the game data");
            });
        });

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
            data["useStandardScore"], data["useViewOpponent"],
            data["useThreeChoices"], data["numRounds"], curGameId, curPlayerId
        );

        // Save the socket of player1
        game.player1Socket = socket;
        game.playerId1     = curPlayerId;
        game.gameId        = curGameId;

        // Save the new game in the game map
        gameIdToObject[Number(game.gameId)] = game;

        // Save the new game into a SQL database
        //TODO UGU HOW SQL

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
            console.log("game id not found");
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
                console.log("got a player ID that does not match any player");
            }

            numMovesReceived++;
            if(numMovesReceived == 2) {
                // We now have both moves
                updatePlayerScores(game);

                // Save the moves in the database
                // TODO MYSQL STUFF

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

                // Send back total score and turn score and other player move
                game.player1Socket.emit("game_result", {
                    totalScore:game.player1Score,
                    turnScore:game.player1TurnScore,
                    opponentChoice:game.player2Choice,
                    opponentTurnScore:game.player2TurnScore
                });
                game.player2Socket.emit("game_result", {
                    totalScore:game.player2Score,
                    turnScore:game.player2TurnScore,
                    opponentChoice:game.player1Choice,
                    opponentTurnScore:game.player1TurnScore
                });

                // reset the number of moves and move choice
                numMovesReceived = 0;
                game.player1Choice = null;
                game.player2Choice = null;
                game.curRound = game.curRound + 1;
            }
        } else {
            console.log("game id was not found in submit player move");
        }
    });
});

// Update the score for each player in the game object
// Decide the score using the score matrix
function updatePlayerScores(game) {
    var scoreMatrix = null;

    if(game.useThreeChoices) {
        if(game.useStandardScore) {
            scoreMatrix = standardScoreArray3;
        } else {
            scoreMatrix = stochScoreArray3;
        }
    } else {
        if(game.useStandardScore) {
            scoreMatrix = standardScoreArray2;
        } else {
            scoreMatrix = stochScoreArray2;
        }
    }

    // Update scores
    var player1Choice = game.player1Choice;
    var player2Choice = game.player2Choice;

    console.log("in updating player score, got both player's moves.");
    console.log("player1Choice: " + player1Choice + " player2choice: " + player2Choice);

    game.player1TurnScore = scoreMatrix[player1Choice][player2Choice][0];
    game.player2TurnScore = scoreMatrix[player1Choice][player2Choice][1];
    game.player1Score += game.player1TurnScore;
    game.player2Score += game.player2TurnScore;
}

// // Return 0 if tie
// // Returns 1 if player1 won
// // Returns 2 if player2 won
// // Choices: 0 = rock, 1 = paper, 2 = scissors
// function getWinner(game, player1Choice, player2Choice) {
//     // Tie
//     if(player1Choice == player2Choice) {
//         return 0;
//     }
//
//     // Using three choices (Rock, paper or scissors)
//     if(game.useThreeChoices) {
//         // player1Choice is scissors
//         if(player1Choice == 2) {
//             // player2Choice is paper
//             if(player2Choice == 1) {
//                 return 1;
//             } else {
//                 // player2Choice is rock
//                 return 2;
//             }
//         }
//
//         if(player1Choice > player2Choice) {
//             return 1;
//         } else {
//             return 2;
//         }
//     } else {
//         // Using Two choices (rock or paper)
//
//
//     }
// }

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
