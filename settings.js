function readValues() {
    time = $("#time").val();
    if (time < 60)
        time = 60;

    numOfGhosts = $("#numOfGhosts").val();
    if (numOfGhosts < 1)
        numOfGhosts = 1;
    else if (numOfGhosts > 3)
        numOfGhosts = 3;

    numOfBalls = $('#numOfBalls').val();
    if (numOfBalls < 50)
        numOfBalls = 50;
    else if (numOfBalls > 90)
        numOfBalls = 90;

    fiveCol = $('#fiveCol').val();
    fifteenCol = $('#fifteenCol').val();
    twentyfiveCol = $('#twentyfiveCol').val();
}

function updateForm(id, key) {
    switch (key) {
        case 37:
            $(id).val("ArrowLeft");
            break;

        case 38:
            $(id).val("ArrowUp");
            break;

        case 39:
            $(id).val("ArrowRight");
            break;

        case 40:
            $(id).val("ArrowDown");
            break;

        default:
            $(id).val(String.fromCharCode(key).charAt(1));
            break;
    }
}

var up = 38, down = 40, left = 37, right = 39,
    time = "60", numOfGhosts = "1", numOfBalls = "50", fiveCol = "#000000", fifteenCol = "#0000FF", twentyfiveCol = "#00FF00";

$("document").ready(function () {
    up = 38;
    down = 40;
    left = 37;
    right = 39;
    time = "60";
    numOfGhosts = "1";
    numOfBalls = "50";
    fiveCol = "#000000";
    fifteenCol = "#0000FF";
    twentyfiveCol = "#00FF00";

    $("#numOfBalls").val(numOfBalls);
    $("#fiveCol").val(fiveCol);
    $("#fifteenCol").val(fifteenCol);
    $("#twentyfiveCol").val(twentyfiveCol);
    $("#time").val(time);
    $("#numOfGhosts").val(numOfGhosts);

    $("#up").keydown(function (e) {
        up = e.keyCode;
        updateForm("#up", up);
    });

    $("#down").keydown(function (e) {
        down = e.which;
        updateForm("#down", down);
    });

    $("#left").keydown(function (e) {
        left = e.which;
        updateForm("#left", left);
    });

    $("#right").keydown(function (e) {
        right = e.which;
        updateForm("#right", right);
    });

    $("#random").click(function () {
        up = 38;
        down = 40;
        left = 37;
        right = 39;

        $("#up").val("ArrowUp");
        $("#down").val("ArrowDown");
        $("#left").val("ArrowLeft");
        $("#right").val("ArrowRight");

        fiveCol = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
        $("#fiveCol").val(fiveCol);

        fifteenCol = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
        $("#fifteenCol").val(fifteenCol);

        twentyfiveCol = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
        $("#twentyfiveCol").val(twentyfiveCol);

        numOfBalls = parseInt(Math.random() * 41 + 50);
        $("#numOfBalls").val(numOfBalls);

        time = parseInt(60 + Math.random() * (241));
        $("#time").val(time);

        numOfGhosts = parseInt(Math.random() * 3 + 1);
        $("#numOfGhosts").val(numOfGhosts);
    });

    $("#save").click(function () {
        readValues();
        updateValues(up, down, left, right, numOfBalls,
            fiveCol, fifteenCol, twentyfiveCol, time, numOfGhosts);
        showDiv("game");
    });

    $("#de").click(function () {
        up = 38;
        down = 40;
        left = 37;
        right = 39;
        time = "60";
        numOfGhosts = "1";
        numOfBalls = "50";
        fiveCol = "#000000";
        fifteenCol = "#0000FF";
        twentyfiveCol = "#00FF00";
        
        $("#up").val("ArrowUp");
        $("#down").val("ArrowDown");
        $("#left").val("ArrowLeft");
        $("#right").val("ArrowRight");
        $("#numOfBalls").val(numOfBalls);
        $("#fiveCol").val(fiveCol);
        $("#fifteenCol").val(fifteenCol);
        $("#twentyfiveCol").val(twentyfiveCol);
        $("#time").val(time);
        $("#numOfGhosts").val(numOfGhosts);
    });
})