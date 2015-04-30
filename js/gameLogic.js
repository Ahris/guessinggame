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

      // Prevent user from exiting pop up
      $("#oppTurnModal").modal({
          backdrop: "static",
          keyboard: false
      });
      $("#oppTurnModal").modal("show");

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
  //startTime = d.getTime();
  unselectOption();
  playerChoice = null;
  oppChoice = null;
  //$("#gameResultModal").modal("hide");
}

/**
 * Deselects the currently chosen move button
 */
function unselectOption() {
    $("#scissors").removeClass("active");
    $("#paper").removeClass("active");
    $("#rock").removeClass("active");
}

// Round to two decimal places
function roundToHundredth(number) {
    return Math.round(100*number)/100;
}
