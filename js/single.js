// Standard score = 1, stochastic score = 0;
var useStandardScore = 1;
// View Opponent = 1, Hide oppinent = 0;
var useViewOpponent = 1;
var numRounds = 500;
var wins = 0;
var ties = 0;
var losses = 0;
var score = 0;

// Text Strings
var standardScore = "Standard Score";
var stochasticScore = "Stochastic Score";
var viewOpponent = "View Opponent";
var hideOpponent = "Hide Opponent";

$(document).ready(function() {
  //$(window).resize(function() {
    // Mobile view stuff
  //});

  /**
   * Prevent the user from leaving
   */
  $(window).bind('beforeunload', function() {
    return 'Game data will be lost!';
  });

  // Save the user's move
  $('#rock').click(function() {
    $('#rock').addClass('active');
    $('#paper').removeClass('active');
    $('#scissors').removeClass('active');
    // TODO: Set the var
  });

  $('#paper').click(function() {
    $('#paper').addClass('active');
    $('#rock').removeClass('active');
    $('#scissors').removeClass('active');
    // TODO: Set the var
  });

  $('#scissors').click(function() {
    $('#scissors').addClass('active');
    $('#paper').removeClass('active');
    $('#rock').removeClass('active');
    // TODO: Set the var
  });

  /**
   * Options menu setup
   */
  $('#gameViewOpponent').click(function() {
    $('#gameOppDropdown').html(viewOpponent);
  });

  $('#gameHideOpponent').click(function() {
    $('#gameOppDropdown').html(hideOpponent);
  });

  $('#gameStandardScore').click(function() {
    $('#gameScoreDropdown').html(standardScore);
  });

  $('#gameStochasticScore').click(function() {
    $('#gameScoreDropdown').html(stochasticScore);
  });

  $('#options').click(openOptions);

  $('#saveOptions').click(function() {
    var tmp = $('#numRoundsField').val();

    if($.isNumeric(tmp)) {
      numRounds = tmp;
    }

    var oppMode = $('#gameOppDropdown').val();
    useViewOpponent = (oppMode == viewOpponent);

    var scoreMode = $('#gameScoreDropdown').val();
    useStandardScore = (scoreMode == standardScore);

    $('#gameOptionModal').modal('hide');
  });

  openOptions();

  /**
   * Submit button pressed
   */
  $('#submit').click(function() {
    // if player won
    if(calculateWinner()) {

    }


    $('#gameResultModal').modal('show');
  });

  // http://www.rpscontest.com/
});


function openOptions() {
    if(useStandardScore) {
      $('#gameScoreDropdown').html(standardScore);
    } else {
      $('#gameScoreDropdown').html(stochasticScore);
    }

    if(useViewOpponent) {
      $('#gameOppDropdown').html(viewOpponent);
    } else {
      $('#gameOppDropdown').html(hideOpponent);
    }

    $('#numRoundsField').attr('placeholder', numRounds);
    $('#numRoundsField').val('');

    $('#gameOptionModal').modal('show');
}

/**
 * Returns winner
 * Tie - 0
 * Player - 1
 * Computer - 2
 */
function calculateWinner() {

}

/**
 * Returns the computer's move
 * Rock - 0
 * Paper - 1
 * Scissors - 2
 */
function getCPUMove() {
  var rand = Math.random();

  if(rand < 1/3) {
    return 0;
  } else if(rand >= 1/3 && rand < 2/3) {
    return 1;
  } else {
    return 2;
  }
}

/**
 * Returns the player's score
 * Score to be determined randomly or statically,
 * depending on setting
 */
function getScore(win, move) {
  if(useStandardScore) {

  } else {

  }
}
