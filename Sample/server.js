// Require the packages we will use:
var http = require("http"),
socketio = require("socket.io"),
fs = require("fs");

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
  // This callback runs when a new connection is made to our HTTP server.

  fs.readFile("client.html", function(err, data){
    // This callback runs when the client.html file has been read from the filesystem.

    if(err) return resp.writeHead(500);
    resp.writeHead(200);
    resp.end(data);
  });
});
app.listen(3456);

var users = [];
var chatRooms = [];  // array of [ [chatRoomName, [user1, user2, user3], creator, password, savedMessages, [banneduser1, banneruser2]] ]

// here we'll keep the map of gameKeys:games
// you can define game obj however you like

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
  // This callback runs when a new Socket.IO connection is established.

  io.sockets.emit("chatRooms_to_client", {allChatrooms:chatRooms,activeUsers:users});
  console.log(users);

  // Message sent
  socket.on('message_to_server', function(data) {
    console.log("message: " + data["message"]);
    console.log("in: "+ data["chatroom"]);

    // Saves messages in a chatroom for display later
    for(var i = 0; i < chatRooms.length; i++) {
      if(chatRooms[i][0] == data["chatroom"]) {
        chatRooms[i][4] += data["savedMessages"];
        console.log(chatRooms[i][4]);
      }
    }
    io.sockets.emit("message_to_client",{message:data["message"], username:data["username"], chatroom:data["chatroom"]});
  });

  // Whisper sent
  socket.on('whisper_to_server', function(data){
    var error = true;
    console.log("Whisper...");
    for(var i = 0; i < chatRooms.length; i++) {
      for(var j = 0; j < chatRooms[i][1].length; j++) {
        console.log("Chatroom " + chatRooms[i][1][j]);
        console.log("Data username" + data["username"]);
        if(data["username"] !== undefined && chatRooms[i][1][j] !== undefined) {
          if(chatRooms[i][1][j] == data["username"]) {
            console.log("Got here because " + chatRooms[i][1][j] + "=" + data["username"]);
            error = false;
            io.sockets.emit("whisper_to_client",{whisper:data["whisper"],username:data["username"],sender:data["sender"]});
          }
        }
      }
    }
    if(error) {
      io.sockets.emit("whisper_failed", {sender:data["sender"]});
    }
  });

  // User logged in
  socket.on('username_to_server', function(data) {
    // Dont allow duplicate usernames
    var cnt = 0; // counter because idk how to break out of this socket.on thing
    for(var i = 0; i < users.length; i++) {
      if(users[i] == data["username"]) {
        break;
      }
      cnt++;
    }
    if(users.length == 0) {
      users.push(data["username"]);
      io.sockets.emit("chatRooms_to_client", {allChatrooms:chatRooms,activeUsers:users});
    } else if(cnt == users.length) {
      users.push(data["username"]);
      io.sockets.emit("chatRooms_to_client", {allChatrooms:chatRooms,activeUsers:users});
    }
    console.log("Users: " + users);
  });

  // Ban user
  socket.on('banning_user_to_server', function(data){
    for(var i = 0; i < chatRooms.length; i++) {
      if(chatRooms[i][0] == data["chatroom"]) {
        // Ensure user banning is the same as creator of chatroom
        if(data["userBanning"] != chatRooms[i][2]) {
          io.sockets.emit("invalid_permissions", {user:data["userBanning"]});
          break;
        }
        // Add user to ban list, and then kick them
        chatRooms[i][5].push(data["userToBan"]);
        console.log("Users banned in " + chatRooms[i][0] + ": " + chatRooms[i][5]);
        // Remove user from chatroom
        for(var i = 0; i < chatRooms.length; i++) {
          if(chatRooms[i][0] == data["chatroom"]) {
            // Ensure user kicking is the same as creator of chatroom
            if(data["userBanning"] != chatRooms[i][2]) {
              io.sockets.emit("invalid_permissions", {user:data["userBanning"]});
              break;
            }
            console.log("Before: " + chatRooms[i][1]);
            var idx = chatRooms[i][1].indexOf(data["userToBan"]);
            chatRooms[i][1].splice(idx, 1);
            console.log("After: " + chatRooms[i][1]);
            io.sockets.emit("kicking_user_to_client", {user:data["userToBan"],allChatrooms:chatRooms});
          }
        }
      }
    }
    io.sockets.emit("chatRooms_to_client", {allChatrooms:chatRooms,activeUsers:users});
  });

  // Kick user
  socket.on('kicking_user_to_server', function(data) {

    console.log("userKicking: " + data["userKicking"]);
    console.log("userToKick: " + data["userToKick"]);
    console.log("chatroom: " + data["chatroom"]);

    // Remove user to be kicked from chatroom
    for(var i = 0; i < chatRooms.length; i++) {
      if(chatRooms[i][0] == data["chatroom"]) {
        // Ensure user kicking is the same as creator of chatroom
        if(data["userKicking"] != chatRooms[i][2]) {
          io.sockets.emit("invalid_permissions", {user:data["userKicking"]});
          break;
        }
        console.log("Before: " + chatRooms[i][1]);
        var idx = chatRooms[i][1].indexOf(data["userToKick"]);
        chatRooms[i][1].splice(idx, 1);
        console.log("After: " + chatRooms[i][1]);
        io.sockets.emit("kicking_user_to_client", {user:data["userToKick"],allChatrooms:chatRooms});
      }
    }
    io.sockets.emit("chatRooms_to_client", {allChatrooms:chatRooms,activeUsers:users});
  });

  // Create chatroom
  socket.on('chatRoom_to_server', function(data) {
    console.log("chatroomName: "+data["chatroomName"]+" creator: "+data["creator"]+" password: "+data["password"]);
    chatRooms.push([data["chatroomName"], [], data["creator"], data["password"], "", []]); // creating an empty chatroom
    io.sockets.emit("chatRooms_to_client", {allChatrooms:chatRooms,activeUsers:users});
    console.log(users);
  });

  socket.on('userJoinsRoom_to_server', function(data) {
    console.log("chatroomName: "+data["chatroomName"]+" username: "+data["username"]);

    // Find chatroom and ensure passwords match
    var userCanJoin = true;
    for(var i = 0; i < chatRooms.length; i++) {
      if(chatRooms[i][0] == data["chatroomName"]) {
        if(data["password"] != chatRooms[i][3]) {
          userCanJoin = false;
          io.sockets.emit("incorrect_password", {user:data["username"]});
        } else {
          // Make sure the user isn't on the ban list
          for(var j = 0; j < chatRooms[i][5].length; j++) {
            if(chatRooms[i][5][j] == data["username"]) {
              userCanJoin = false;
              io.sockets.emit("user_is_banned",{user:data["username"]});
            }
          }
        }
        if(userCanJoin) { chatRooms[i][1].push(data["username"]); }
      }
    }

    // Send list of all chatrooms, and chatrooms associated with the user, and all active users
    io.sockets.emit("chatRooms_to_client", {allChatrooms:chatRooms,activeUsers:users});
  });

});
