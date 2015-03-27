// Require the packages we will use:
var http = require("http"),
socketio = require("socket.io"),
fs = require("fs");

var mysql = require('mysql');
var sqlConnection  = mysql.createConnection({
    host      : 'localhost',
    database  : 'rps_data',
});

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
    // This callback runs when a new connection is made to our HTTP server.

    fs.readFile("single.html", function(err, data){
        // This callback runs when the client.html file has been read from the filesystem.

        if(err) return resp.writeHead(500);
        resp.writeHead(200);
        resp.end(data);
    });
});
app.listen(1337);

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
    // This callback runs when a new Socket.IO connection is established.
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
            ", " + json.scoreMode + ", " + json.oppMode + ");
            ";

        sqlConnection.query(query, function() {
            console.log("inserted the game data");
        });

        // This callback runs when the server receives a new message from the client.
        //console.log("message: "+data["message"]); // log it to the Node.JS output
        //io.sockets.emit("message_to_client",{message:data["message"] })
        // broadcast the message to other users
    });
});
