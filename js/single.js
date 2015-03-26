// Standard score = 1, stochastic score = 0;
// View Opponent = 1, Hide oppinent = 0;
var useStandardScore = 1;
var useViewOpponent = 1;
var numRounds = 500;
var playerChoice = null;
var cpuChoice = null;
var curRound = 1;
var wins = 0;
var ties = 0;
var losses = 0;
var score = 0;

// Text Strings
var standardScoreStr = "Standard Score";
var stochasticScoreStr = "Stochastic Score";
var viewOpponentStr = "View Opponent";
var hideOpponentStr = "Hide Opponent";
var winStr = "Win";
var loseStr = "Lose";

// TODO
// http://www.rpscontest.com/
//$(window).resize(function() {
// Mobile view stuff
//});

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
    * Options menu setup
    */
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

    $("#options").click(openOptions);

    $("#saveOptions").click(function() {
        var tmp = $("#numRoundsField").val();

        if($.isNumeric(tmp)) {
            numRounds = tmp;
        }

        var oppMode = $("#gameOppDropdown").html();
        useViewOpponent = (oppMode == viewOpponentStr);

        var scoreMode = $("#gameScoreDropdown").html();
        useStandardScore = (scoreMode == standardScoreStr);

        $("#gameOptionModal").modal("hide");
    });

    openOptions();

    /**
    * Submit button pressed
    */
    $("#submit").click(function() {
        // No choice was made
        if(playerChoice == null) {
            $("#popupAlert").fadeIn().delay(400).fadeOut();
            return;
        }

        var result = getWinner();
        switch(result) {
            case 0:
                ++ties;
                $("#ties").html(ties);
                $("#resultText").html("TIE").css("color", "#f0ad4e");
                break;
            case 1:
                ++wins;
                $("#wins").html(wins);
                $("#resultText").html("WIN").css("color", "#5cb85c");
                break;
            case 2:
                ++losses;
                $("#losses").html(losses);
                $("#resultText").html("LOSE").css("color", "#d9534f");
                break;
        }

        var scoreIncr = getScore(result)
        score += scoreIncr;
        $("#scoreNumber").html(score);
        $("#gameScoreNumber").html("+" + scoreIncr);

        console.log(cpuChoice);


        if(useViewOpponent) {
            var resultStr = "The cpu played ";
            console.log(resultStr);
            switch(cpuChoice) {
                case 0:
                    resultStr = resultStr.concat("rock.");
                    break;
                case 1:
                    resultStr = resultStr.concat("paper.");
                    break;
                case 2:
                    resultStr = resultStr.concat("scissors.");
                    break;
            }

            $("#resultMessage").html(resultStr);
        }

        // Done playing
        if(curRound == numRounds) {
            $("#resultMessage").html("Thanks for playing! Data is saved and you can exit.");

            $(window).bind("beforeunload", function() {
                return "Thanks for playing!";
            });

            $("#continue").hide();
        }

        $("#gameResultModal").modal("show");
    });



    /**
    * Close the results modal and set up the next round
    */
    $("#continue").click(function() {
        ++curRound;

        // Continue to next game
        if(curRound <= numRounds) {
            $("#gameRoundNumber").html(curRound);
            $("#prev1Num").html(curRound - 1);
            $("#prev2Num").html(curRound - 2);
            $("#prev3Num").html(curRound - 3);
        }

        unselectOption();
        playerChoice = null;
        cpuChoice = null;
        $("#gameResultModal").modal("hide");
    });
});

function unselectOption() {
    $("#scissors").removeClass("active");
    $("#paper").removeClass("active");
    $("#rock").removeClass("active");
}

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

    $("#numRoundsField").attr("placeholder", numRounds);
    $("#numRoundsField").val("");
    $("#gameOptionModal").modal("show");
}

/**
* Returns winner
* Tie - 0
* Player - 1
* Computer - 2
*/
function getWinner() {
    cpuChoice = getCPUMove();
    if(playerChoice == cpuChoice) {
        return 0;
    }

    // Player is scissors
    if(playerChoice == 2) {
        // cpu is paper
        if(cpuChoice == 1) {
            return 1;
        } else {
            // cpu is rock
            return 2;
        }
    }

    if(playerChoice > cpuChoice) {
        return 1;
    } else {
        return 2;
    }
}

/**
 * Return the number of points earned by the player
 * Can be determined statically or stochastically.
 */
function getScore(result) {
    if(useStandardScore) {
        return 1;
    } else {
        return 1 * Math.random();
    }
}

/**
* Returns the computer's move
* Currently returning a random move
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
