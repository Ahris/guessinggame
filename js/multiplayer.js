$(document).domain = "54.69.129.39";
$(document).ready(function() {

    // Communicating with the server
    var socketio = io.connect("http://54.69.129.39:1337/");
    var joinSuccess = false;
    var makeGameSuccess = false;
    var playerId = null;
    var gameId = null;
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
        socketio.emit("second_player_join", {gameId:requestedGameId});
        joinSuccess = true;
      } else {
        console.log("Need a valid game id");
        $("#gameIdError").show();
      }
    });

    // Start the game for the joining player
    socketio.on("join_game_success", function(data){
      console.log("join game success");

      // Save player id and game id
      gameId = data["gameId"];
      playerId = data["playerId"];

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
    socketio.on("approve_two_player", function(data){
      console.log("approve two player");
      console.log("game id: " + data["gameId"]);

      // Save player id
      if(data["playerId"] != null && playerId == null) {
        playerId = data["playerId"];
        console.log("got player id from server!");
      }

      if(data["gameId"] != null) {
        var gameId = data["gameId"];

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
      }
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

    /////////////////////////////////////////////////////////////////////
    // Submiting a move
    /////////////////////////////////////////////////////////////////////
    $("#submit").click(function() {

    });
});
