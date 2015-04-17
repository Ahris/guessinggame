////////////////////////////////////////////////////////////////
// Server Setup
////////////////////////////////////////////////////////////////

// Set up socket io
//var http = require("http"),
//var socketio = require("socket.io"),
//fs = require("fs");

// Set up mySQL
var mysql = require('mysql');
var sqlConnection  = mysql.createConnection({
    host      : 'localhost',
    database  : 'rps_data',
});


// THE PROBLEM IS HERE!!
// This is clear because the print statement within the callback doesn't
// ever print
// Two ways to figure out how to get this to work:
//  1. Try var app = ... using different means, such as Express
//  2. Set up a test, in a new directory, with socket.io installed where
//     we try to establish a connection to just one file (like client.html)
//     If we can figure that out, then we can diagnose the issue here
//     If we can't, we should do 1.
//

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
// var app = http.createServer(function(req, resp){
//   console.log(" in the http create server");
//
//     // This callback runs when a new connection is made to our HTTP server
//     fs.readFile("/var/www/html/twoPlayer.html", function(err, data){
//         // This callback runs when the client.html file has been read from the filesystem.
//         if(err) return resp.writeHead(500);
//         resp.writeHead(200);
//         resp.end(data);
//         console.log("fs print");
//     });
// });
//
// app.listen(1340, function(){
//    console.log("in app.listen, server listening");
// });
//app.listen(1337);

// Trying out Express
var express = require('express');
var http = require('http');

var app = express();
var server = http.Server(app); //app.listen(3000);
var socketio = require('socket.io')(server);

server.listen(1337);  //listen on port 80

app.get('http:://54.69.129.39:1337/twoPlayer', function (req, res) {
  res.sendfile(__dirname + '/twoPlayer.html');
});

// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });

////////////////////////////////////////////////////////////////
// Game Logic
////////////////////////////////////////////////////////////////

// Global variables
var lastGameId        = 100;
var lastPlayerId      = 100;
var gameIdToObject    = {}; // Associative array, not a standard array

var playerSocket1     = null;
var playerSocket2     = null;

console.log("Node server is starting up. Setup done.");

// gameObject class to hold the data for one game
function GameObject(useStandardScore, useViewOpponent,
  useThreeChoices, numRounds, gameId, playerId1) {

  this.useStandardScore   = useStandardScore;
  this.useViewOpponent    = useViewOpponent;
  this.useThreeChoices    = useThreeChoices;
  this.numRounds          = numRounds;
  this.gameId             = gameId;
  this.playerId1          = this.playerId1;
  this.playerId2          = -1;
}

// Client and server communication
socketio.sockets.on('connection', function (socket) {
    console.log('on CONNECTION');

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

        // Save the new game in the game map
        gameIdToObject[game.gameId] = game;

        // Save the socket of player1
        playerSocket1 = socket;

        // Pass back the game id and player id to client
        socket.emit("approve_two_player",{
          gameId:game.gameId,
          playerId:game.playerId1
        });
    });

    // Second player is trying to join a specific game
    socket.on("second_player_join", function(data) {
        console.log("on the server, got a request join game");
        console.log("gameId: " + data["gameId"]);

        // If the requested game exists, join it
        var requestedGameId = Number(data["gameId"]);
        if(requestedGameId != null) {

          console.log("got the game ID");

            if(gameIdToObject[requestedGameId]) {

              console.log("found game in dictionary");

                var game = gameIdToObject[requestedGameId];
                game.playerId2 = lastPlayerId;
                ++lastPlayerId;

                // Save player two's socket connection
                playerSocket2 = socket;

                // Let first player know they can play now
                playerSocket1.emit("found_second_player",{})

                // Let second player know they can play now
                socket.emit("join_game_success", {
                  playerId:game.playerId2,
                  gameId:game.gameId,
                  useViewOpponent:game.useViewOpponent,
                  useThreeChoices:game.useThreeChoices
                });
            } else {
              console.log("Could not find the game in the dictionary");
              //TODO emit something to the joining player that the game they want doesn't exist
            }
        }
    });
});
