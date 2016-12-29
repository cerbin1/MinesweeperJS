var gameBoard = {width: 0, height: 0, cells: null, numberOfFlaggedFields: 0, iterateCells: cellsIterator};
var game = {numberOfBombs: 0, isGameDone: false, isBoardGenerated: false, messageBox: null};
var colorsOfNumberOfBombsAdjacentToField = ["blue", "green", "red", "purple", "orange", "yellow", "brown", "pink"];

function cellsIterator(callback) {
    for (var i = 0; i < gameBoard.height; i++) {
        for (var j = 0; j < gameBoard.width; j++) {
            var cell = gameBoard.cells[i][j];
            callback(cell);
        }
    }
}

function startGame() {
    if (game.isBoardGenerated) {
        var gameDiv = document.getElementById("gameDiv");
        gameDiv.parentNode.removeChild(gameDiv);
    }
    game.numberOfBombs = document.getElementById("bombs").value;
    gameBoard.width = document.getElementById("width").value;
    gameBoard.height = document.getElementById("height").value;
    gameBoard.numberOfFlaggedFields = 0;
    game.isGameDone = false;
    gameBoard.cells = fillTwoDimensionalArray();
    createBorderTable();
    plantBombs();
    game.isBoardGenerated = true;

    createMessageBox();
}

function fillTwoDimensionalArray() {
    var array = [];
    for (var i = 0; i < gameBoard.height; i++) {
        array[i] = [];
        for (var j = 0; j < gameBoard.width; j++) {
            array[i][j] = getDefaultFieldObject();
        }
    }
    return array;
}

function getDefaultFieldObject() {
    return {
        isBomb: false,
        isFlag: false,
        isDiscovered: false,
        numberOfBombsAdjacent: 0,
        gameField: null,
        changeFieldToBomb: function () {
            var bombImage = document.createElement("img");
            bombImage.setAttribute("class", "sizeOfImage");
            bombImage.src = "bomb.png";
            this.gameField.appendChild(bombImage);
        }
    };
}

function createBorderTable() {
    var gameDiv = document.createElement("div");
    gameDiv.setAttribute("id", "gameDiv");
    gameDiv.setAttribute("oncontextmenu", "return false");
    document.body.appendChild(gameDiv);

    var table = document.createElement("table");
    table.setAttribute("id", "gameBoard");
    gameDiv.appendChild(table);

    for (var i = 0; i < gameBoard.height; i++) {
        var row = document.createElement("tr");
        row.setAttribute("id", "row" + i.toString());
        table.appendChild(row);

        for (var j = 0; j < gameBoard.width; j++) {
            var cell = document.createElement("td");
            cell.addEventListener("click", leftMouseClick);
            cell.addEventListener("contextmenu", rightMouseClick);
            cell.dataset.x = i.toString();
            cell.dataset.y = j.toString();
            row.appendChild(cell);
            gameBoard.cells[i][j].gameField = cell;
        }
    }
}

function plantBombs() {
    for (var i = 0; i < game.numberOfBombs; i++) {
        while (true) {
            var x = Math.floor(Math.random() * gameBoard.height);
            var y = Math.floor(Math.random() * gameBoard.width);
            if (!gameBoard.cells[x][y].isBomb) {
                gameBoard.cells[x][y].isBomb = true;
                break;
            }
        }
    }
    countBombsAdjacentToFields();
}

function countBombsAdjacentToFields() {
    for (var i = 0; i < gameBoard.height; i++) {
        for (var j = 0; j < gameBoard.width; j++) {
            isBombAdjacentToField(i, j);
        }
    }
    displayAllBombs();
}

function isBombAdjacentToField(x, y) {
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (isFieldInBoard(x + i, y + j)) {
                if (gameBoard.cells[x + i][y + j].isBomb) {
                    incrementNumberOfBombsAdjacentToField(x, y);
                }
            }
        }
    }
}

function isFieldInBoard(x, y) {
    return (0 <= x && x < gameBoard.height) && (0 <= y && y < gameBoard.width);
}

function incrementNumberOfBombsAdjacentToField(x, y) {
    gameBoard.cells[x][y].numberOfBombsAdjacent++;
}

function displayAllBombs() {
    for (var i = 0; i < gameBoard.height; i++) {
        for (var j = 0; j < gameBoard.width; j++) {
            if (gameBoard.cells[i][j].isBomb) {
                gameBoard.cells[i][j].changeFieldToBomb();
            }
        }
    }
}

function createMessageBox() {
    var divToDisplayMessages = document.createElement("div");
    divToDisplayMessages.setAttribute("id", "messageBox");
    document.getElementById("gameDiv").appendChild(divToDisplayMessages);
    game.messageBox = document.getElementById("messageBox");
}

function leftMouseClick() {
    if (game.isGameDone) {
        game.messageBox.innerHTML = "Rozpocznij nowa gre";
    } else {
        var x = parseInt(this.dataset.x);
        var y = parseInt(this.dataset.y);

        discoverField(x, y, gameBoard.cells[x][y]);
        checkIfPlayerWins();
    }
}

function rightMouseClick() {
    if (game.isGameDone) {
        game.messageBox.innerHTML = "Rozpocznij nowa gre";
    } else {
        var x = parseInt(this.dataset.x);
        var y = parseInt(this.dataset.y);

        setFlag(gameBoard.cells[x][y]);
        checkIfPlayerWins();
    }
}

function discoverField(x, y, cellToDiscover) {
    if (cellToDiscover.isFlag) {
        return;
    }
    if (cellToDiscover.isDiscovered) {
        return;
    }
    if (cellToDiscover.isBomb) {
        displayAllBombs();
        game.messageBox.innerHTML = "przegrales";
        game.isGameDone = true;
    } else {
        if (cellToDiscover.numberOfBombsAdjacent > 0) {
            displayAndColorField(cellToDiscover);
        } else {
            floodFill(x, y);
        }
    }
}

function displayAndColorField(cellToDiscover) {
    cellToDiscover.gameField.innerText = cellToDiscover.numberOfBombsAdjacent;
    cellToDiscover.gameField.style.color = colorNumberOfBombs(cellToDiscover.numberOfBombsAdjacent);
    cellToDiscover.gameField.style.backgroundColor = "darkGray";
    cellToDiscover.isDiscovered = true;
}

function colorNumberOfBombs(numberOfBombs) {
    return colorsOfNumberOfBombsAdjacentToField[numberOfBombs - 1];
}

function floodFill(x, y) {
    if (isEmptyOrDiscovered(x, y)) {//TODO wyciagnac sprawdzanie pola, dac komorke cell jako argument funkcji
        return;
    }
    var cell = gameBoard.cells[x][y];

    if (cell.numberOfBombsAdjacent > 0) {
        fillFieldWithBombsAdjacent(cell);
    }
    else {
        fillEmptyField(cell);
        recursiveFloodFill(x, y);
    }
}

function isEmptyOrDiscovered(x, y) {
    if (isFieldOutsideBoard(x, y) || isFieldEmpty(x, y)) {
        return true;
    }

    return gameBoard.cells[x][y].isDiscovered;
}

function isFieldOutsideBoard(x, y) {
    return (0 > y || y >= gameBoard.width) || (0 > x || x >= gameBoard.height);
}

function isFieldEmpty(x, y) {
    return gameBoard.cells[x][y].isFlag || gameBoard.cells[x][y].isBomb;
}

function fillFieldWithBombsAdjacent(cell) {
    cell.gameField.innerHTML = cell.numberOfBombsAdjacent.toString();
    cell.gameField.style.color = colorNumberOfBombs(cell.numberOfBombsAdjacent);
    cell.gameField.style.backgroundColor = "darkGray";
    cell.isDiscovered = true;
}

function fillEmptyField(cell) {
    cell.gameField.style.backgroundColor = "darkGray";
    cell.isDiscovered = true;
}

function recursiveFloodFill(x, y) {
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            floodFill(x + i, y + j);
        }
    }
}

function checkIfPlayerWins() {
    if (isThereEnoughPointsForWin()) {
        game.messageBox.innerHTML = "wygrales";
        game.isGameDone = true;
    }
}

function isThereEnoughPointsForWin() {
    return countPointsFromFlags() == game.numberOfBombs || countFieldsUndiscovered() == 0;
}

function countPointsFromFlags() {
    var numberOfPoints = 0;
    gameBoard.iterateCells(function (cell) {
        if (cell.isFlag) {
            if (cell.isBomb) {
                numberOfPoints++;
            }
            else {
                numberOfPoints--;
            }
        }
    });
    return numberOfPoints;
}

function countFieldsUndiscovered() {
    var numberOfUndiscoveredFields = 0;
    for (var i = 0; i < gameBoard.height; i++) {
        for (var j = 0; j < gameBoard.width; j++) {
            var cell = gameBoard.cells[i][j];
            if (!cell.isBomb && !cell.isDiscovered) {
                numberOfUndiscoveredFields++;
            }
        }
    }
    return numberOfUndiscoveredFields;
}

function setFlag(cellToSetFlag) {
    if (cellToSetFlag.isDiscovered) {
        return;
    }
    if (cellToSetFlag.isFlag) {
        cellToSetFlag.gameField.innerHTML = "";
        cellToSetFlag.isFlag = false;
        gameBoard.numberOfFlaggedFields--;
    } else {
        var flagImage = document.createElement("img");
        flagImage.setAttribute("class", "sizeOfImage");
        flagImage.src = "flag.png";
        cellToSetFlag.isFlag = true;
        gameBoard.numberOfFlaggedFields++;
        cellToSetFlag.gameField.appendChild(flagImage);
    }
    game.messageBox.innerHTML = "Pozostalo bomb: " + (game.numberOfBombs - gameBoard.numberOfFlaggedFields);
}