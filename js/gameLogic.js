$(document).ready(function() {
  /**
  * Prevent the user from leaving
  */
  $(window).bind("beforeunload", function() {
      return "Game data will be lost!";
  });

  // Save the user's move
  $("#rock").click(function() {
      $("#rock").addClass("active");
      $("#paper").removeClass("active");
      $("#scissors").removeClass("active");
      playerChoice = 0;
  });

  $("#paper").click(function() {
      $("#paper").addClass("active");
      $("#rock").removeClass("active");
      $("#scissors").removeClass("active");
      playerChoice = 1;
  });

  $("#scissors").click(function() {
      $("#scissors").addClass("active");
      $("#paper").removeClass("active");
      $("#rock").removeClass("active");
      playerChoice = 2;
  });

  /**
  * Submit button pressed
  */
  $("#submit").click(function() {
      // No choice was made
      if(playerChoice == null) {
          $("#popupAlert").fadeIn().delay(400).fadeOut();
          return;
      }

      $("#oppTurnModal").modal("show");
      // Prevent user from exiting pop up
      $("#oppTurnModal").modal({
          backdrop: "static",
          keyboard: false
      });

      endTime = d.getTime();
      sendAndGetResult();

    //   // Update log array
    //   log[2][0] = log[1][0]; log[2][1] = log[1][1];
    //   log[2][2] = log[1][2]; log[2][3] = log[1][3];
    //   log[1][0] = log[0][0]; log[1][1] = log[0][1];
    //   log[1][2] = log[0][2]; log[1][3] = log[0][3];
      //
    //   log[0][0] = choiceEnum[playerChoice];
    //   log[0][1] = turnScore;
    //   log[0][2] = choiceEnum[oppChoice];
    //   log[0][3] = oppTurnScore;
      //
    //   //turnScore = getScore(gameResult)
    //   //score += turnScore;
    //   //score = roundThousandths(score);
      //
    //   $("#scoreNumber").html(score);
    //   $("#turnScore").html("+" + turnScore);
      //
    //   // TODO Caluclate money earned
    //   //updateMoneyPayoff(gameResult);
    //   //$("#moneyNumber").html(totalMoney);
      //
    //   // Done playing
    //   if(curRound == numRounds) {
    //       $("#resultMessage").html("Thanks for playing! Data is saved and you can exit.");
      //
    //       $(window).bind("beforeunload", function() {
    //           return "Thanks for playing!";
    //       });
      //
    //       $("#continue").hide();
    //   }
      //
    //   //sendGameData();
    //   //$("#gameResultModal").modal("show");
    //   continueGame();
  });
});

function continueGame() {
  startTime = d.getTime();
  ++curRound;
  updateLog();
  unselectOption();
  playerChoice = null;
  oppChoice = null;
  //$("#gameResultModal").modal("hide");
}

// Update the log of previous games
function updateLog() {
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

/**
 * Deselects the currently chosen move button
 */
function unselectOption() {
    $("#scissors").removeClass("active");
    $("#paper").removeClass("active");
    $("#rock").removeClass("active");
}
