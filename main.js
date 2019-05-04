function stop() {
    window.clearInterval(interval);
    music = document.getElementById("myAudio");
    lives = 3;
    fiftyCent.alive = true;
    toRemoveTime = false;
    numOfRejects=0;
    music.pause();
}

function updateValues(up, down, left, right, numOfBalls,
    fiveCol, fifteenCol, twentyfiveCol, time, numOfGhosts) {
    upKey = up;
    downKey = down;
    leftKey = left;
    rightKey = right;
    numOfFood = numOfBalls;
    originalNumOfFood = numOfBalls;
    fiveColor = fiveCol;
    fifteenColor = fifteenCol;
    twentyfiveColor = twentyfiveCol;
    timeForGame = time;
    numOfMonsters = numOfGhosts;
    five = numOfFood * 0.6;
    fifthteen = numOfFood * 0.3;
    twentyFive = numOfFood * 0.1;
    Start();
}

function showDiv(div) {
    if (gameOn && div!="game")
        stop();
    for (var i = 0; i < 5; i++) {
        var ele = document.getElementById(divs[i]);
        ele.style.visibility = 'hidden';
        ele.disabled = true;
    }
    var ele = document.getElementById(div);
    ele.style.visibility = 'visible';
    ele.disabled = false;
}

function Start() {
    gameOn=true;
    numOfFood = originalNumOfFood;
    five = numOfFood * 0.6;
    fifthteen = numOfFood * 0.3;
    twentyFive = numOfFood * 0.1;
    fiftyCent.alive = true;
    numOfRejects=0;
    //music = document.getElementById("myAudio");
    music=new Audio("./one.mp3");
    music.pause();
    music.currentTime = 0;
    music.loop=true;
    music.play();
    board = new Array();
    score = 0;
    pac_color = "yellow";
    var food_remain = numOfFood;
    var pacman_remain = 1;
    start_time = new Date();

    //initiate board
    for (var i = 0; i < 10; i++) {
        board[i] = new Array();
        for (var j = 0; j < 10; j++)
            board[i][j] = 0;
    }
    //available num of walls is 100 - num of monsters - 3 characters - pacman - numOfFood
    numOfObstacle = Math.min(10, 100 - 3 - 4 - numOfFood);
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            //put obstacles
            if ((i == 0 && j == 0) || (i == 9 && j == 0) || (i == 0 && j == 9) || (i == 9 && j == 9))
                continue;
            var randomNum = Math.random();
            if (numOfObstacle > 0 && i < 9 && j < 9 && i > 0 && j > 0 && randomNum > 0.8) {
                board[i][j] = 4;
                numOfObstacle--;
            }
            //put food 
            else {
                if (food_remain > 0 && randomNum > 0.5) {
                    var randomFood = Math.random();
                    if (randomFood < 0.6 && five > 0) {
                        board[i][j] = 5;
                        five--;
                        food_remain--;
                    }
                    else if (fifthteen > 0 && randomFood < 0.9) {
                        board[i][j] = 6;
                        fifthteen--;
                        food_remain--;
                    }
                    else if (twentyFive > 0) {
                        board[i][j] = 7;
                        twentyFive--;
                        food_remain--;
                    }
                }
            }
        }
    }
    //put pacman
    if (pacman_remain > 0) {
        var emptyCell = findRandomEmptyCell(board);
        pac.col = emptyCell[0];
        pac.row = emptyCell[1];
        board[emptyCell[0]][emptyCell[1]] = 2;
        pacman_remain--;
    }

    //put timerBonus - on board it is 11
    var emptyCell = findRandomEmptyCell(board);
    timeBonus.col = emptyCell[0];
    timeBonus.row = emptyCell[1];
    board[emptyCell[0]][emptyCell[1]] = 11;


    //put extra life
    emptyCell = findRandomEmptyCell(board);
    extraLife.col = emptyCell[0];
    extraLife.row = emptyCell[1];
    board[emptyCell[0]][emptyCell[1]] = 12;

    //put food
    while (food_remain > 0) {
        var emptyCell = findRandomEmptyCell(board);
        if (five > 0) {
            board[emptyCell[0]][emptyCell[1]] = 5;
            five--;
        }
        else if (fifthteen > 0) {
            board[emptyCell[0]][emptyCell[1]] = 6;
            fifthteen--;
        }
        else if (twentyFive > 0) {
            board[emptyCell[0]][emptyCell[1]] = 7;
            twentyFive--;
        }
        food_remain--;
    }
    //put monsters
    board[0][0] = 3;
    monsters[0].col = 0;
    monsters[0].row = 0;
    monsters[0].prev=0;
    if (numOfMonsters > 1) {
        board[0][9] = 3;
        monsters[1].col = 0;
        monsters[1].row = 9;
        monsters[1].prev=0;
    }
    if (numOfMonsters > 2) {
        board[9][0] = 3;
        monsters[2].col = 9;
        monsters[2].row = 0;
        monsters[2].prev=0;
    }

    // choose a random color for the monsters
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    monster_color = getRandomColor();
    //put special character
    fiftyCent.col = 9;
    fiftyCent.row = 9;
    board[9][9] = 1;

    keysDown = {};
    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);
    addEventListener("keyup", function (e) {
        keysDown[e.keyCode] = false;
    }, false);
    interval = setInterval(UpdatePosition, 100);
}

//move all the monsters toward the pacman
function moveMonsters() {
    var moveToCell;
    for (var i = 0; i < numOfMonsters; i++) {
        moveToCell = findMonsterMove(monsters[i].col, monsters[i].row);
        monsters[i].col = moveToCell[0];
        monsters[i].row = moveToCell[1];
    }
    moveToCell = findFiftyMove();
    fiftyCent.col = moveToCell[0];
    fiftyCent.row = moveToCell[1];
}

// find the best cell available to move to
/*function findMonsterMove(col, row) {
    var left = 100, right = 100, up = 100, down = 100;
    var arr = new Array();
    if (row - 1 >= 0)
        up = parseFloat(Math.sqrt(Math.pow(pac.col - col, 2) + Math.pow(pac.row - (row - 1), 2)) + Math.random());
    if (row + 1 <= 9)
        down = parseFloat(Math.sqrt(Math.pow(pac.col - col, 2) + Math.pow(pac.row - (row + 1), 2)) + Math.random());
    if (col - 1 >= 0)
        left = parseFloat(Math.sqrt(Math.pow(pac.col - (col - 1), 2) + Math.pow(pac.row - row, 2)) + Math.random());
    if (col + 1 <= 9)
        right = parseFloat(Math.sqrt(Math.pow(pac.col - (col + 1), 2) + Math.pow(pac.row - row, 2)) + Math.random());
    arr.push(left);
    arr.push(right);
    arr.push(up);
    arr.push(down);
    arr = arr.sort(function (a, b) { return a - b; });
    for (var i = 0; i < 4; i++)
        if (arr[i] == up && arr[i] != 100 && (board[col][row - 1] == 0 || board[col][row - 1] == 2)) {
            return [col, row - 1];
        }
        else if (arr[i] == down && arr[i] != 100 && (board[col][row + 1] == 0 || board[col][row + 1] == 2)) {
            return [col, row + 1];
        }
        else if (arr[i] == left && arr[i] != 100 && (board[col - 1][row] == 0 || board[col - 1][row] == 2)) {
            return [col - 1, row];
        }
        else if (arr[i] == right && arr[i] != 100 && (board[col + 1][row] == 0 || board[col + 1][row] == 2)) {
            return [col + 1, row];
        }
    return [col, row];
}

//find a cell to move to for fiftyCent
function findFiftyMove() {
    var rand1 = Math.random() * 2, rand2 = Math.random() * 2;
    //right
    if (rand1 < 1 && rand2 < 1 && fiftyCent.col + 1 <= 9 && board[fiftyCent.col + 1][fiftyCent.row] == 0)
        return [fiftyCent.col + 1, fiftyCent.row];
    //left
    else if (rand1 < 2 && rand2 < 1 && fiftyCent.col - 1 >= 0 && board[fiftyCent.col - 1][fiftyCent.row] == 0)
        return [fiftyCent.col - 1, fiftyCent.row];
    //up
    else if (rand1 < 1 && rand2 < 2 && fiftyCent.row - 1 >= 0 && board[fiftyCent.col][fiftyCent.row - 1] == 0)
        return [fiftyCent.col, fiftyCent.row - 1];
    //down
    else if (fiftyCent.row + 1 <= 9 && board[fiftyCent.col][fiftyCent.row + 1] == 0)
        return [fiftyCent.col, fiftyCent.row + 1];
    else return [fiftyCent.col, fiftyCent.row];
}*/

function findMonsterMove(col, row) {
    var left = 100, right = 100, up = 100, down = 100;
    var arr = new Array();
    if (row - 1 >= 0)
        up = parseFloat(Math.sqrt(Math.pow(pac.col - col, 2) + Math.pow(pac.row - (row - 1), 2)) + Math.random());
    if (row + 1 <= 9)
        down = parseFloat(Math.sqrt(Math.pow(pac.col - col, 2) + Math.pow(pac.row - (row + 1), 2)) + Math.random());
    if (col - 1 >= 0)
        left = parseFloat(Math.sqrt(Math.pow(pac.col - (col - 1), 2) + Math.pow(pac.row - row, 2)) + Math.random());
    if (col + 1 <= 9)
        right = parseFloat(Math.sqrt(Math.pow(pac.col - (col + 1), 2) + Math.pow(pac.row - row, 2)) + Math.random());
    arr.push(left);
    arr.push(right);
    arr.push(up);
    arr.push(down);
    arr = arr.sort(function (a, b) { return a - b; });
    for (var i = 0; i < 4; i++)
        if (arr[i] == up && arr[i] != 100 && (board[col][row - 1] == 0 || board[col][row - 1] == 2
            || (board[col][row - 1] >= 5 && board[col][row - 1] <= 7))) {
            return [col, row - 1];
        }
        else if (arr[i] == down && arr[i] != 100 && (board[col][row + 1] == 0 || board[col][row + 1] == 2
            || (board[col][row + 1] >= 5 && board[col][row + 1] <= 7))) {
            return [col, row + 1];
        }
        else if (arr[i] == left && arr[i] != 100 && (board[col - 1][row] == 0 || board[col - 1][row] == 2
            || (board[col - 1][row] >= 5 && board[col - 1][row] <= 7))) {
            return [col - 1, row];
        }
        else if (arr[i] == right && arr[i] != 100 && (board[col + 1][row] == 0 || board[col + 1][row] == 2
            || (board[col + 1][row] >= 5 && board[col + 1][row] <= 7))) {
            return [col + 1, row];
        }
    return [col, row];
}

//find a cell to move to for fiftyCent
function findFiftyMove() {
    var rand1 = Math.random() * 2, rand2 = Math.random() * 2;
    //right
    if (rand1 < 1 && rand2 < 1 && fiftyCent.col + 1 <= 9 &&
        (board[fiftyCent.col + 1][fiftyCent.row] == 0 ||
            (board[fiftyCent.col + 1][fiftyCent.row] >= 5 && board[fiftyCent.col + 1][fiftyCent.row] <= 7)))
        return [fiftyCent.col + 1, fiftyCent.row];
    //left
    else if (rand1 < 2 && rand2 < 1 && fiftyCent.col - 1 >= 0 &&
        (board[fiftyCent.col - 1][fiftyCent.row] == 0 ||
            (board[fiftyCent.col - 1][fiftyCent.row] >= 5 && board[fiftyCent.col - 1][fiftyCent.row] <= 7)))
        return [fiftyCent.col - 1, fiftyCent.row];
    //up
    else if (rand1 < 1 && rand2 < 2 && fiftyCent.row - 1 >= 0 &&
        (board[fiftyCent.col][fiftyCent.row - 1] == 0 ||
            (board[fiftyCent.col][fiftyCent.row - 1] >= 5 && board[fiftyCent.col][fiftyCent.row - 1] <= 7)))
        return [fiftyCent.col, fiftyCent.row - 1];
    //down
    else if (fiftyCent.row + 1 <= 9 &&
        (board[fiftyCent.col][fiftyCent.row + 1] == 0 ||
            (board[fiftyCent.col][fiftyCent.row + 1] >= 5 && board[fiftyCent.col][fiftyCent.row + 1] < 7)))
        return [fiftyCent.col, fiftyCent.row + 1];
    else return [fiftyCent.col, fiftyCent.row];
}

function findRandomEmptyCell(board) {
    var counter = 10;
    var i = Math.floor((Math.random() * 9) + 1);
    var j = Math.floor((Math.random() * 9) + 1);
    for (; counter > 0 && board[i][j] !== 0 || (((i == 0 && j == 0) || (i == 9 && j == 0) || (i == 0 && j == 9) || (i == 9 && j == 9))); counter--) {
        i = Math.floor((Math.random() * 9) + 1);
        j = Math.floor((Math.random() * 9) + 1);
    }
    if (counter === 0) {
        for (var i = 0; i < 10; i++)
            for (var j = 0; j < 10; j++)
                if (board[i][j] === 0 && !(((i == 0 && j == 0) || (i == 9 && j == 0) || (i == 0 && j == 9) || (i == 9 && j == 9))))
                    return [i, j];
    }
    return [i, j];
}

/**
 * @return {number}
 */
function GetKeyPressed() {
    if (keysDown[upKey]) {
        return 1;
    }
    if (keysDown[downKey]) {
        return 2;
    }
    if (keysDown[leftKey]) {
        return 3;
    }
    if (keysDown[rightKey]) {
        return 4;
    }
}

/*function Draw(x) {
    if (x == undefined)
        x = pac.dir;

    context.clearRect(0, 0, canvas.width, canvas.height); //clean board
    context.opacity = 1;
    lblScore.value = score;
    lblTime.value = time_elapsed;
    lblReject.value = numOfRejects;

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var center = new Object();
            center.row = i * 60 + 30;
            center.col = j * 60 + 30;
            center.radius = 30;
            //pac
            if (board[i][j] === 2) {
                context.beginPath();
                switch (x) {
                    case 1://UP:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI * 11 / 18, 2 * Math.PI - Math.PI * 7 / 18, true);
                        break;

                    case 2://DOWN:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI * 29 / 18, 2 * Math.PI - Math.PI * 25 / 18, true);
                        break;

                    case 3://LEFT:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI * 10 / 9, 2 * Math.PI - Math.PI * 8 / 9, true);
                        break;

                    case 4://RIGHT:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI / 9, 2 * Math.PI - Math.PI * 17 / 9, true);
                        break;

                    default:
                        break;
                }
                context.lineTo(center.row, center.col);
                context.fillStyle = pac_color; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.shadowBlur = 0;
                //eye
                context.beginPath();
                switch (x) {
                    case 1://UP:
                        context.arc(center.row + 15, center.col + 0, 5, 0, 2 * Math.PI);
                        break;

                    case 2://DOWN:
                        context.arc(center.row + 15, center.col - 0, 5, 0, 2 * Math.PI);
                        break;

                    case 3://LEFT:
                        context.arc(center.row + 0, center.col - 15, 5, 0, 2 * Math.PI);
                        break;

                    case 4://RIGHT:
                        context.arc(center.row - 0, center.col - 15, 5, 0, 2 * Math.PI);
                        break;

                    default:
                        break;
                }
                context.fillStyle = "black"; //color
                context.fill();
            }//five 
            else if (board[i][j] === 5) {
                context.beginPath();
                context.arc(center.row, center.col, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = fiveColor; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.font = 12 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "white";
                context.fillText("5", center.row, center.col);
            }//fifteen
            else if (board[i][j] === 6) {
                context.beginPath();
                context.arc(center.row, center.col, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = fifteenColor; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.font = 12 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "white";
                context.fillText("15", center.row, center.col);
            }//twentyfive
            else if (board[i][j] === 7) {
                context.beginPath();
                context.arc(center.row, center.col, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = twentyfiveColor; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.font = 12 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "white";
                context.fillText("25", center.row, center.col);
            }//block
            else if (board[i][j] === 4) {
                context.shadowBlur = 0;
                context.beginPath();
                context.rect(center.row - 30, center.col - 30, 60, 60);
                context.fillStyle = "#36d1d1"; //color
                context.fill();
                context.font = 60 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                var h = '2612';
                context.fillStyle = "#2c0582";
                context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 6.2);
            }//monster
            else if (board[i][j] === 3) {
                context.beginPath();
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fillStyle = monster_color;
                context.arc(center.row, center.col, 30, Math.PI, 0, false);
                context.moveTo(center.row - center.radius, center.col);
                context.fill();
                context.shadowBlur = 0;
                //legs
                context.lineTo(center.row - center.radius, center.col + center.radius);
                context.lineTo(center.row - center.radius + center.radius / 3, center.col + center.radius - center.radius / 4);
                context.lineTo(center.row - center.radius + center.radius / 3 * 2, center.col + center.radius);
                context.lineTo(center.row, center.col + center.radius - center.radius / 4);
                context.lineTo(center.row + center.radius / 3, center.col + center.radius);
                context.lineTo(center.row + center.radius / 3 * 2, center.col + center.radius - center.radius / 4);
                context.lineTo(center.row + center.radius, center.col + center.radius);
                context.lineTo(center.row + center.radius, center.col);
                context.fill();
                //eyes
                context.beginPath();
                context.arc(center.row + 10, center.col - 15, 5, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color
                context.fill();
                context.beginPath();
                context.arc(center.row - 10, center.col - 15, 5, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color
                context.fill();
            }//spec char
            else if (board[i][j] === 1 && fiftyCent.alive) {
                //special char
                context.beginPath();
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fillStyle = "#ffc0a0"; //color
                context.fill();
                context.shadowBlur = 0;
                context.font = 60 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                var h = '263B';
                context.fillStyle = "white";
                context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 5);
            }
            //clock
            else if (board[i][j] == 11) {
                function drawClock(context, radius) {
                    var grad;
                    context.beginPath();
                    context.arc(center.row, center.col, radius, 0, 2 * Math.PI);
                    context.fillStyle = 'white';
                    context.fill();
                    grad = context.createRadialGradient(center.row, center.col, radius * 0.95, 0, 0, radius * 1.05);
                    grad.addColorStop(0, '#333');
                    grad.addColorStop(0.5, 'white');
                    grad.addColorStop(1, '#333');
                    context.strokeStyle = grad;
                    context.lineWidth = radius * 0.1;
                    context.stroke();
                    context.beginPath();
                    context.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
                    context.fillStyle = '#333';
                    context.fill();
                    context.font = radius * 1.4 + "px arial";
                    context.textBaseline = "middle";
                    context.textAlign = "center";
                    var h = '231a';
                    // we can 2661 2665 for heart also
                    // context.fillText("TIME", center.row, center.col + 5);
                    context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 5);
                }
                drawClock(context, 25);
            }
            //extra life
            else if (board[i][j] == 12) {
                function drawHeart(context, radius) {
                    var grad;
                    context.beginPath();
                    context.arc(center.row, center.col, radius, 0, 2 * Math.PI);
                    context.fillStyle = 'white';
                    context.fill();
                    grad = context.createRadialGradient(center.row, center.col, radius * 0.95, 0, 0, radius * 1.05);
                    grad.addColorStop(0, '#333');
                    grad.addColorStop(0.5, 'white');
                    grad.addColorStop(1, '#333');
                    context.strokeStyle = grad;
                    context.lineWidth = radius * 0.1;
                    context.stroke();
                    context.beginPath();
                    context.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
                    context.fillStyle = '#333';
                    context.fill();
                    context.font = radius * 1.4 + "px arial";
                    context.textBaseline = "middle";
                    context.textAlign = "center";
                    var h = '2665';
                    context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 5);
                }
                drawHeart(context, 25);
            }
        }
    }
}*/

function Draw(x) {
    if (x == undefined)
        x = pac.dir;

    context.clearRect(0, 0, canvas.width, canvas.height); //clean board
    context.opacity = 1;
    lblScore.value = score;
    lblTime.value = time_elapsed;
    lblReject.value = numOfRejects;

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var center = new Object();
            center.row = i * 60 + 30;
            center.col = j * 60 + 30;
            center.radius = 30;
            //pac
            if (board[i][j] === 2) {
                context.beginPath();
                switch (x) {
                    case 1://UP:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI * 11 / 18, 2 * Math.PI - Math.PI * 7 / 18, true);
                        break;

                    case 2://DOWN:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI * 29 / 18, 2 * Math.PI - Math.PI * 25 / 18, true);
                        break;

                    case 3://LEFT:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI * 10 / 9, 2 * Math.PI - Math.PI * 8 / 9, true);
                        break;

                    case 4://RIGHT:
                        context.arc(center.row, center.col, center.radius, 2 * Math.PI - Math.PI / 9, 2 * Math.PI - Math.PI * 17 / 9, true);
                        break;

                    default:
                        break;
                }
                context.lineTo(center.row, center.col);
                context.fillStyle = pac_color; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.shadowBlur = 0;
                //eye
                context.beginPath();
                switch (x) {
                    case 1://UP:
                        context.arc(center.row + 15, center.col + 0, 5, 0, 2 * Math.PI);
                        break;

                    case 2://DOWN:
                        context.arc(center.row + 15, center.col - 0, 5, 0, 2 * Math.PI);
                        break;

                    case 3://LEFT:
                        context.arc(center.row + 0, center.col - 15, 5, 0, 2 * Math.PI);
                        break;

                    case 4://RIGHT:
                        context.arc(center.row - 0, center.col - 15, 5, 0, 2 * Math.PI);
                        break;

                    default:
                        break;
                }
                context.fillStyle = "black"; //color
                context.fill();
            }//five
            else if (board[i][j] === 5) {
                context.beginPath();
                context.arc(center.row, center.col, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = fiveColor; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.font = 12 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "white";
                context.fillText("5", center.row, center.col);
            }//fifteen
            else if (board[i][j] === 6) {
                context.beginPath();
                context.arc(center.row, center.col, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = fifteenColor; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.font = 12 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "white";
                context.fillText("15", center.row, center.col);
            }//twentyfive
            else if (board[i][j] === 7) {
                context.beginPath();
                context.arc(center.row, center.col, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = twentyfiveColor; //color
                context.shadowBlur = 10;
                context.shadowColor = "white";
                context.fill();
                context.font = 12 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "white";
                context.fillText("25", center.row, center.col);
            }//block
            else if (board[i][j] === 4) {
                context.shadowBlur = 0;
                context.beginPath();
                context.rect(center.row - 30, center.col - 30, 60, 60);
                context.fillStyle = "#36d1d1"; //color
                context.fill();
                context.font = 60 * 1.4 + "px arial";
                context.textBaseline = "middle";
                context.textAlign = "center";
                var h = '2612';
                context.fillStyle = "#2c0582";
                context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 6.2);
            }
            //clock
            else if (board[i][j] == 11) {
                function drawClock(context, radius) {
                    var grad;
                    context.beginPath();
                    context.arc(center.row, center.col, radius, 0, 2 * Math.PI);
                    context.fillStyle = 'white';
                    context.fill();
                    grad = context.createRadialGradient(center.row, center.col, radius * 0.95, 0, 0, radius * 1.05);
                    grad.addColorStop(0, '#333');
                    grad.addColorStop(0.5, 'white');
                    grad.addColorStop(1, '#333');
                    context.strokeStyle = grad;
                    context.lineWidth = radius * 0.1;
                    context.stroke();
                    context.beginPath();
                    context.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
                    context.fillStyle = '#333';
                    context.fill();
                    context.font = radius * 1.4 + "px arial";
                    context.textBaseline = "middle";
                    context.textAlign = "center";
                    var h = '231a';
                    // we can 2661 2665 for heart also
                    // context.fillText("TIME", center.row, center.col + 5);
                    context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 5);
                }
                drawClock(context, 25);
            }
            //extra life
            else if (board[i][j] == 12) {
                function drawHeart(context, radius) {
                    var grad;
                    context.beginPath();
                    context.arc(center.row, center.col, radius, 0, 2 * Math.PI);
                    context.fillStyle = 'white';
                    context.fill();
                    grad = context.createRadialGradient(center.row, center.col, radius * 0.95, 0, 0, radius * 1.05);
                    grad.addColorStop(0, '#333');
                    grad.addColorStop(0.5, 'white');
                    grad.addColorStop(1, '#333');
                    context.strokeStyle = grad;
                    context.lineWidth = radius * 0.1;
                    context.stroke();
                    context.beginPath();
                    context.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
                    context.fillStyle = '#333';
                    context.fill();
                    context.font = radius * 1.4 + "px arial";
                    context.textBaseline = "middle";
                    context.textAlign = "center";
                    var h = '2665';
                    context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 5);
                }
                drawHeart(context, 25);
            }
        }
    }
    //monsters
    for(var i=0; i<numOfMonsters; i++) {
        var center = new Object();
        center.row = monsters[i].col * 60 + 30;
        center.col = monsters[i].row * 60 + 30;
        center.radius = 30;

        context.beginPath();
        context.shadowBlur = 10;
        context.shadowColor = "white";
        context.fillStyle = monster_color;
        context.arc(center.row, center.col, 30, Math.PI, 0, false);
        context.moveTo(center.row - center.radius, center.col);
        context.fill();
        context.shadowBlur = 0;
        //legs
        context.lineTo(center.row - center.radius, center.col + center.radius);
        context.lineTo(center.row - center.radius + center.radius / 3, center.col + center.radius - center.radius / 4);
        context.lineTo(center.row - center.radius + center.radius / 3 * 2, center.col + center.radius);
        context.lineTo(center.row, center.col + center.radius - center.radius / 4);
        context.lineTo(center.row + center.radius / 3, center.col + center.radius);
        context.lineTo(center.row + center.radius / 3 * 2, center.col + center.radius - center.radius / 4);
        context.lineTo(center.row + center.radius, center.col + center.radius);
        context.lineTo(center.row + center.radius, center.col);
        context.fill();
        //eyes
        context.beginPath();
        context.arc(center.row + 10, center.col - 15, 5, 0, 2 * Math.PI); // circle
        context.fillStyle = "black"; //color
        context.fill();
        context.beginPath();
        context.arc(center.row - 10, center.col - 15, 5, 0, 2 * Math.PI); // circle
        context.fillStyle = "black"; //color
        context.fill();
    }
    //spec char
    if(fiftyCent.alive){
        var center = new Object();
        center.row = fiftyCent.col * 60 + 30;
        center.col = fiftyCent.row * 60 + 30;
        center.radius = 30;

        context.beginPath();
        context.shadowBlur = 10;
        context.shadowColor = "white";
        context.fillStyle = "#ffc0a0"; //color
        context.fill();
        context.shadowBlur = 0;
        context.font = 60 * 1.4 + "px arial";
        context.textBaseline = "middle";
        context.textAlign = "center";
        var h = '263B';
        context.fillStyle = "white";
        context.fillText(String.fromCharCode(parseInt(h, 16)), center.row, center.col + 5);
    }
}

function generateLocation() {
    for (var i = 0; i < numOfMonsters; i++) {
        board[monsters[i].col][monsters[i].row] = 0;
    }
    board[0][0] = 3;
    monsters[0].col = 0;
    monsters[0].row = 0;
    if (numOfMonsters > 1) {
        board[0][9] = 3;
        monsters[1].col = 0;
        monsters[1].row = 9;
    }
    if (numOfMonsters > 2) {
        board[9][0] = 3;
        monsters[2].col = 9;
        monsters[2].row = 0;
    }
    board[pac.col][pac.row] = 0;
    var newPos = findRandomEmptyCell(board);
    pac.col = newPos[0];
    pac.row = newPos[1];
    board[pac.col][pac.row] = 2;
}

function eatingCheck() {
    for (var i = 0; i < numOfMonsters; i++) {
        if (monsters[i].col == pac.col && monsters[i].row == pac.row)
            return true;
    }
    return false;
}

function eatFiftyCheck() {
    if(fiftyCent.col === pac.col && fiftyCent.row === pac.row) {
        return true;
    }
    return false;
}

/*function UpdatePosition() {
    board[pac.col][pac.row] = 0;
    var x = GetKeyPressed();
    //up
    if (x === 1) {
        pac.dir = x;
        if (pac.row > 0 && board[pac.col][pac.row - 1] !== 4) {
            pac.row--;
        }
    }
    //down
    else if (x === 2) {
        pac.dir = x;
        if (pac.row < 9 && board[pac.col][pac.row + 1] !== 4) {
            pac.row++;
        }
    }
    //left
    else if (x === 3) {
        pac.dir = x;
        if (pac.col > 0 && board[pac.col - 1][pac.row] !== 4) {
            pac.col--;
        }
    }
    //right
    else if (x === 4) {
        pac.dir = x;
        if (pac.col < 9 && board[pac.col + 1][pac.row] !== 4) {
            pac.col++;
        }
    }
    else x = pac.dir;
    //cell content
    if (board[pac.col][pac.row] === 5) {
        score += 5;
        numOfFood--;
    }
    else if (board[pac.col][pac.row] === 6) {
        score += 15;
        numOfFood--;
    }
    else if (board[pac.col][pac.row] === 7) {
        score += 25;
        numOfFood--;
    }

    //special character
    else if (board[pac.col][pac.row] === 1) {
        score += 50;
        fiftyCent.alive = false;
    }

    //extra time
    else if (board[pac.col][pac.row] == 11) {
        timeBonus.row = -1;
        timeBonus.col = -1;
        toRemoveTime = true;
    }

    //extra life
    else if (board[pac.col][pac.row] == 12) {
        extraLife.row = -1;
        extraLife.col = -1;
        lives++;
    }
    board[pac.col][pac.row] = 2;

    //bonus time
    if (toRemoveTime == true) {
        // give extra 10 seconds
        start_time.setSeconds(start_time.getSeconds() + 10);
        toRemoveTime = false;
    }

    var currentTime = new Date();
    time_elapsed = (currentTime - start_time) / 1000;

    Draw(x);
    monsterTrigger++;
    if (monsterTrigger % 4 == 0)
        moveMonsters();
    //eaten by monster
    if (eatingCheck()) {
        lives--;
        numOfRejects++;
        score -= 10;
        //hold the game for two seconds
        var startPause = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if (new Date().getTime() - startPause > 2000)
                break;
        }
        Draw(x);
        if (lives == 0) {
            stop();
            window.alert("You lost!");
        }
        else {
            generateLocation();
            Draw(x);
        }
    }
    if (numOfFood == 0) {
        stop();
        window.alert("Game completed");
    }
    //time has ended
    if (time_elapsed > timeForGame) {
        stop();
        if (score >= 150)
            window.alert("We have a Winner!!!");
        else
            window.alert("you can do better");
    }
}*/

function UpdatePosition() {
    board[pac.col][pac.row] = 0;
    var x = GetKeyPressed();
    //up
    if (x === 1) {
        pac.dir = x;
        if (pac.row > 0 && board[pac.col][pac.row - 1] !== 4) {
            pac.row--;
        }
    }
    //down
    else if (x === 2) {
        pac.dir = x;
        if (pac.row < 9 && board[pac.col][pac.row + 1] !== 4) {
            pac.row++;
        }
    }
    //left
    else if (x === 3) {
        pac.dir = x;
        if (pac.col > 0 && board[pac.col - 1][pac.row] !== 4) {
            pac.col--;
        }
    }
    //right
    else if (x === 4) {
        pac.dir = x;
        if (pac.col < 9 && board[pac.col + 1][pac.row] !== 4) {
            pac.col++;
        }
    }
    else x = pac.dir;
    //cell content
    if (board[pac.col][pac.row] === 5) {
        score += 5;
        numOfFood--;
    }
    else if (board[pac.col][pac.row] === 6) {
        score += 15;
        numOfFood--;
    }
    else if (board[pac.col][pac.row] === 7) {
        score += 25;
        numOfFood--;
    }

    //extra time
    else if (board[pac.col][pac.row] == 11) {
        timeBonus.row = -1;
        timeBonus.col = -1;
        toRemoveTime = true;
    }

    //extra life
    else if (board[pac.col][pac.row] == 12) {
        extraLife.row = -1;
        extraLife.col = -1;
        lives++;
    }
    board[pac.col][pac.row] = 2;

    //bonus time
    if (toRemoveTime == true) {
        // give extra 10 seconds
        start_time.setSeconds(start_time.getSeconds() + 10);
        toRemoveTime = false;
    }

    var currentTime = new Date();
    time_elapsed = (currentTime - start_time) / 1000;

    monsterTrigger++;
    if (monsterTrigger % 4 == 0)
        moveMonsters();
    //eaten by monster
    if (eatingCheck()) {
        lives--;
        numOfRejects++;
        score -= 10;
        //hold the game for two seconds
        var startPause = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if (new Date().getTime() - startPause > 2000)
                break;
        }
        Draw(x);
        if (lives == 0) {
            stop();
            window.alert("You lost!");
        }
        else {
            generateLocation();
            Draw(x);
        }
    }
    //special character
    else if (eatFiftyCheck()) {
        score += 50;
        fiftyCent.alive = false;
    }
    Draw(x);
    if (numOfFood == 0) {
        stop();
        window.alert("Game completed");
    }
    //time has ended
    if (time_elapsed > timeForGame) {
        stop();
        if (score >= 150)
            window.alert("We have a Winner!!!");
        else
            window.alert("you can do better");
    }
}

var gameOn = false;

var i = 0;
var divs = ["main", "login", "register", "settings", "game"];
var context;

var pac = new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;

pac.dir = 4;
var lives = 3;
var monsterTrigger = 0;
var numOfFood;
var originalNumOfFood;
var numOfMonsters;
var monsters = new Array();

var upKey = 38, downKey = 40, leftKey = 37, rightKey = 39;

var fiveColor = "#000000";
var fifteenColor = "#000099";
var twentyfiveColor = "#00ff00";
var fiftyCent = new Object();
fiftyCent.alive = true;
var timeForGame = 1000;
var numOfObstacle;
var numOfRejects = 0;

var monster_color;
var toRemoveTime = false;
var timeBonus = new Object();
var extraLife = new Object();
var music;
for (var i = 0; i < 3; i++) {
    monsters[i] = new Object();
}

$("document").ready(function () {
    context = canvas.getContext("2d");
    back = backCanvas.getContext("2d");
    back.clearRect(0, 0, canvas.width, canvas.height); //clean board
    back.globalAlpha = 0.3;
    back.fillStyle = "#4286f4";
    back.fillRect(0, 0, canvas.width, canvas.height);
    back.globalAlpha = 0.8;
    back.beginPath();
    back.lineWidth = "8";
    back.strokeStyle = "black";
    back.rect(0, 0, canvas.width, canvas.height);
    back.stroke();

    showDiv("main");

    $("#log").click(function () {
        showDiv("login");
    });

    $("#logBtn").click(function () {
        showDiv("login");
    });

    $("#reg").click(function () {
        showDiv("register");
    });

    $("#regBtn").click(function () {
        showDiv("register");
    });

    $("#welcome").click(function () {
        showDiv("main");
    });

    $(document).keydown(function (e) {
        if (e.keyCode == 27)
            $("#myModal").fadeOut(250);
    });

    $("#newGame").click(function () {
        stop();
        Start();
    });
});