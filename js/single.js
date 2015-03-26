// Standard score = 1, stochastic score = 0;
// View Opponent = 1, Hide oppinent = 0;
var useStandardScore    = 1;
var useViewOpponent     = 1;
var numRounds           = 500;
var playerChoice        = null;
var cpuChoice           = null;
var curRound            = 1;
var wins                = 0;
var ties                = 0;
var losses              = 0;
var score               = 0;

// Text Strings
var standardScoreStr    = "Standard Score";
var stochasticScoreStr  = "Stochastic Score";
var viewOpponentStr     = "View Opponent";
var hideOpponentStr     = "Hide Opponent";
var winStr              = "Win";
var loseStr             = "Lose";

// Log of last three games
// Each row is an entry consisting of:
// Player win/lose, move, CPU win/los, move
var log = new Array(3);
for (var i = 0; i < 3; ++i) {
    log[i] = new Array(4);
    for(var j = 0; j < 4; ++j) {
        log[i][j] = "null";
    }
}

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

        var result = getWinner();
        switch(result) {
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

        var scoreIncr = getScore(result)
        score += scoreIncr;
        $("#scoreNumber").html(score);
        $("#gameScoreNumber").html("+" + scoreIncr);

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
