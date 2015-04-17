// Options
// Standard score = 1, stochastic score = 0;
// View Opponent = 1, Hide oppinent = 0;
var useStandardScore = 1;
var useViewOpponent  = 1;
var useThreeChoices  = 1;
var numRounds        = 500;
var curRound         = 1;

// Game data
var playerChoice = null;
var oppChoice    = null;
var score        = 0;
var turnScore    = 0;
var oppTurnScore = 0;
var totalMoney   = 0;
//var gameResult          = null;
// var wins                = 0;
// var ties                = 0;
// var losses              = 0;

// Socketio variables
var socketio        = null;
var joinSuccess     = false;
var makeGameSuccess = false;
var playerId        = null;
var gameId          = null;

// Text Strings
var standardScoreStr   = "Standard Score";
var stochasticScoreStr = "Stochastic Score";
var viewOpponentStr    = "View Opponent";
var hideOpponentStr    = "Hide Opponent";
var twoChoices         = "2 Choices";
var threeChoices       = "3 Choices";
var winStr             = "Win";
var loseStr            = "Lose";

// Enums
var choiceEnum = ["rock", "paper", "scissors"];
var resultEnum = ["tie", "win", "lose"];
var oppEnum    = ["hide", "view"];
var scoreEnum  = ["stochastic", "standard"];

// Timing variables, updated client side
var d         = new Date();
var startTime = 0;
var endTime   = 0;

// Log of last three games
// Each row is an entry consisting of:
// Player win/lose, move, CPU win/los, move
var log = [];
for (var i = 0; i < 3; ++i) {
    log[i] = [];
}

$(document).ready(function() {
  // Set up option menu
  $("#gameViewOpponent").click(function() {
      $("#gameOppDropdown").html(viewOpponentStr);
  });

  $("#gameHideOpponent").click(function() {
      $("#gameOppDropdown").html(hideOpponentStr);
  });

  $("#gameStandardScore").click(function() {
      $("#gameScoreDropdown").html(standardScoreStr);
  });

  $("#gameStochasticScore").click(function() {
      $("#gameScoreDropdown").html(stochasticScoreStr);
  });

  $("#game2Choices").click(function() {
      $("#gameNumChoicesDropdown").html(twoChoices);
  });

  $("#game3Choices").click(function() {
      $("#gameNumChoicesDropdown").html(threeChoices);
  });

  $("#saveOptions").click(function() {
      // Save the number of rounds
      var tmp = $("#numRoundsField").val();
      if($.isNumeric(tmp)) {
          numRounds = tmp;
      }

      // View or hide the opponent data
      var oppMode = $("#gameOppDropdown").html();
      useViewOpponent = (oppMode == viewOpponentStr);
      if(useViewOpponent) {
          $(".gameStats").css("display", "block");
          $("#gameLog").css("display", "block");
          $("#resultMessage").css("display", "block");
      } else {
          $(".gameStats").css("display", "none");
          $("#gameLog").css("display", "none");
          $("#resultMessage").css("display", "none");
      }

      // Changes the score mode
      var scoreMode = $("#gameScoreDropdown").html();
      useStandardScore = (scoreMode == standardScoreStr);

      // Change the number of options
      var numChoiceMode = $("#gameNumChoicesDropdown").html();
      useThreeChoices = (threeChoices == numChoiceMode);
      if(useThreeChoices) {
        $("#scissors").css("display", "inline-block");
      } else {
        $("#scissors").css("display", "none");
      }

      // Save the rewards input values
      var tempStr = $("#rewardInputValues").val();
      parseAndSaveRewardValue(tempStr);

      // Done, close the options box
      $("#gameOptionModal").modal("hide");
  });

});

/**
 * Set up the options menu and
 * displays it once it is ready
 */
function openOptions() {
    if(useStandardScore) {
        $("#gameScoreDropdown").html(standardScoreStr);
    } else {
        $("#gameScoreDropdown").html(stochasticScoreStr);
    }

    if(useViewOpponent) {
        $("#gameOppDropdown").html(viewOpponentStr);
    } else {
        $("#gameOppDropdown").html(hideOpponentStr);
    }

    if(useThreeChoices) {
      $("#gameNumChoicesDropdown").html(threeChoices);
    } else {
      $("#gameNumChoicesDropdown").html(twoChoices);
    }


    $("#numRoundsField").attr("placeholder", numRounds);
    $("#numRoundsField").val("");
    $("#gameOptionModal").modal("show");
}

/**
 * Parses and saves the inputted reward values
 * The argument string's format is specific is a seperat doc
 * Subject to change
 */
function parseAndSaveRewardValue(str) {
  // var lines = str.split("\n");
  // var numChoices = lines[0];
  //
  // // Number of values should be numChoice ^ 2
  // // With the one additional line at the beginning
  // // with the numChoices count.
  // if(lines.length != Math.pow(numChoices, 2) + 1) {
  //   console.log("Error with inputted reward file. \nValues from file were not saved.");
  //   return;
  // }
  //
  // for(var i = 1; i < lines.length; ++i){
  //   // SAVE THE DATA OK!!!
  // }
  //
  // return;
}
