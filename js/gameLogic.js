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

      endTime = d.getTime();

      // Update log array
      log[2][0] = log[1][0]; log[2][1] = log[1][1];
      log[2][2] = log[1][2]; log[2][3] = log[1][3];
      log[1][0] = log[0][0]; log[1][1] = log[0][1];
      log[1][2] = log[0][2]; log[1][3] = log[0][3];

      switch(playerChoice) {
          case 0:
              log[0][1] = "rock";
              break;
          case 1:
              log[0][1] = "paper";
              break;
          case 2:
              log[0][1] = "scissors";
              break;
      }

      gameResult = getWinner();
      switch(gameResult) {
          case 0:
              ++ties;
              log[0][0] = "tie";
              log[0][2] = "ties";
              $("#ties").html(ties);
              $("#resultText").html("TIE").css("color", "#f0ad4e");
              break;
          case 1:
              ++wins;
              log[0][0] = "win";
              log[0][2] = "loses";
              $("#wins").html(wins);
              $("#resultText").html("WIN").css("color", "#5cb85c");
              break;
          case 2:
              ++losses;
              log[0][0] = "lose";
              log[0][2] = "wins";
              $("#losses").html(losses);
              $("#resultText").html("LOSE").css("color", "#d9534f");
              break;
      }

      dScore = getScore(gameResult)
      score += dScore;
      score = roundThousandths(score);
      $("#scoreNumber").html(score);
      $("#gameScoreNumber").html("+" + dScore);

      if(useViewOpponent) {
          var resultStr = "The cpu played ";
          switch(cpuChoice) {
              case 0:
                  log[0][3] = "rock";
                  resultStr = resultStr.concat("rock.");
                  break;
              case 1:
                  log[0][3] = "paper";
                  resultStr = resultStr.concat("paper.");
                  break;
              case 2:
                  log[0][3] = "scissors";
                  resultStr = resultStr.concat("scissors.");
                  break;
          }

          $("#resultMessage").html(resultStr);
      }

      // Caluclate money earned
      updateMoneyPayoff(gameResult);
      $("#moneyNumber").html(totalMoney);

      // Done playing
      if(curRound == numRounds) {
          $("#resultMessage").html("Thanks for playing! Data is saved and you can exit.");

          $(window).bind("beforeunload", function() {
              return "Thanks for playing!";
          });

          $("#continue").hide();
      }

      sendGameData();
      //$("#gameResultModal").modal("show");
      continueGame();
  });
});

function continueGame() {
  startTime = d.getTime();
  ++curRound;

  // Continue to next game
  if(curRound <= numRounds) {
      $("#gameRoundNumber").html(curRound);
      $("#prev1Num").html(curRound - 1);
      $("#prev2Num").html(curRound - 2);
      $("#prev3Num").html(curRound - 3);
  }

  // Update displayed log
  var text1 = "You " + log[0][0] + " with " + log[0][1] +
              ". Opponent " + log[0][2] + " with " + log[0][3] + ".";
              $("#prev1Message").html(text1);

  var text2 = "You " + log[1][0] + " with " + log[1][1] +
              ". Opponent " + log[1][2] + " with " + log[1][3] + ".";
              $("#prev2Message").html(text2);

  var text3 = "You " + log[2][0] + " with " + log[2][1] +
              ". Opponent " + log[2][2] + " with " + log[2][3] + ".";
              $("#prev3Message").html(text3);

  unselectOption();
  playerChoice = null;
  cpuChoice = null;
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
