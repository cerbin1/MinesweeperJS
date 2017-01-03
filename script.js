var gameBoard = {
    width: 0,
    height: 0,
    cells: null,
    numberOfFlaggedFields: 0,
    iterateCells: cellsIterator,
    isWidthRight: checkWidth,
    isHeightRight: checkHeight,
    isNumberOfBombsRight: checkNumberOfBombs
};
var game = {
    numberOfBombs: 0,
    isGameDone: false,
    isFirstClick: true,
    messageBox: null,
    createBoard: generateBoard,
    gameField: null,
    createGameDiv: generateGameDiv,
    clearBoard: clearGameField
}; //TODO add gameBoard to game
var colorsOfNumberOfBombsAdjacentToField = ["blue", "green", "red", "purple", "orange", "yellow", "brown", "pink"];

function cellsIterator(callback) {
    for (var i = 0; i < gameBoard.height; i++) {
        for (var j = 0; j < gameBoard.width; j++) {
            var cell = gameBoard.cells[i][j];
            callback(cell);
        }
    }
}

function clearGameField() {
    this.messageBox.innerHTML = "";
    this.gameField.innerHTML = "";
}

function checkWidth() {
    return (this.width >= 1 && this.width <= 50) && (Math.round(this.width) == this.width);
}

function checkHeight() {
    return (this.height >= 1 && this.height <= 50) && (Math.round(this.height) == this.height);
}

function checkNumberOfBombs() {
    return game.numberOfBombs == Math.round(game.numberOfBombs) && game.numberOfBombs >= 0 && game.numberOfBombs < this.height * this.width;
}

function generateBoard() {
    console.log(this);
    gameBoard.numberOfFlaggedFields = 0;
    this.isGameDone = false;
    this.isFirstClick = true;
    gameBoard.cells = fillTwoDimensionalArray();
    createBorderTable();
    plantBombs();
}

function generateGameDiv() {
    this.gameField = document.createElement("div");
    this.gameField.setAttribute("id", "gameDiv");
    this.gameField.setAttribute("oncontextmenu", "return false");
    document.body.appendChild(this.gameField);
}

function startGame() {
    if(game.gameField != null) {
        game.clearBoard();
    }

    gameBoard.width = document.getElementById("width").value;
    gameBoard.height = document.getElementById("height").value;
    game.numberOfBombs = document.getElementById("bombs").value;
    if (gameBoard.isWidthRight()) {
        if (gameBoard.isHeightRight()) {
            if (gameBoard.isNumberOfBombsRight()) {
                game.createGameDiv();
                game.createBoard();
                createMessageBox();//TODO extract creating div with game and fix this code
            }
            else {
                alert("Podałeś niepoprawną liczbę bomb!");
            }
        }
        else {
            alert("Wysokość niepoprawna (Powinna być wartość od 1 do 50)!");
        }
    }
    else {
        alert("Szerokość niepoprawna (Powinna być wartość od 1 do 50)!");
    }
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
    var table = document.createElement("table");
    table.setAttribute("id", "gameBoard");
    game.gameField.appendChild(table);

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
        plantSingleBomb();
    }
    countBombsAdjacentToFields();
}

function plantSingleBomb() {
    while (true) {
        var x = Math.floor(Math.random() * gameBoard.height);
        var y = Math.floor(Math.random() * gameBoard.width);
        if (!gameBoard.cells[x][y].isBomb) {
            gameBoard.cells[x][y].isBomb = true;
            break;
        }
    }
}

function countBombsAdjacentToFields() {
    for (var i = 0; i < gameBoard.height; i++) {
        for (var j = 0; j < gameBoard.width; j++) {
            isBombAdjacentToField(i, j);
        }
    }
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
            var cellToChange = gameBoard.cells[i][j];
            if (cellToChange.isBomb) {
                if (cellToChange.isFlag) {
                    cellToChange.gameField.innerHTML = "";
                    cellToChange.gameField.style.backgroundColor = "lightGreen";
                }
                else {
                    cellToChange.gameField.style.backgroundColor = "#FF4500";//TODO add red color only when player lose, otherwise, set all bombs background color on green
                }
                cellToChange.changeFieldToBomb();
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
        game.messageBox.innerHTML = "Rozpocznij nową grę";
    } else {
        var x = parseInt(this.dataset.x);
        var y = parseInt(this.dataset.y);

        var cell = gameBoard.cells[x][y];
        if (game.isFirstClick) {
            if (cell.isBomb) {
                plantSingleBomb();
                cell.isBomb = false;
            }
            game.isFirstClick = false;
        }

        discoverField(x, y, cell);
        checkIfPlayerWins();
    }
}

function rightMouseClick() {
    game.isFirstClick = false;
    if (game.isGameDone) {
        game.messageBox.innerHTML = "Rozpocznij nową grę";
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
        game.messageBox.innerHTML = "Przegrałeś";
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
    if (isFieldOutsideBoard(x, y)) {
        return;
    }

    var cell = gameBoard.cells[x][y];

    if (isEmptyOrDiscovered(cell)) {
        return;
    }

    if (cell.numberOfBombsAdjacent > 0) {
        fillFieldWithBombsAdjacent(cell);
    }
    else {
        fillEmptyField(cell);
        recursiveFloodFill(x, y);
    }
}

function isFieldOutsideBoard(x, y) {
    return (0 > y || y >= gameBoard.width) || (0 > x || x >= gameBoard.height);
}

function isEmptyOrDiscovered(cell) {
    return cell.isDiscovered || cell.isFlag || cell.isBomb;
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
        displayAllBombs();
        game.messageBox.innerHTML = "Wygrałeś!!!";
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
    if (allFieldsDiscovered()) {
        return numberOfPoints;
    }
    return 0;
}

function allFieldsDiscovered() {
    var allDiscovered = true;
    gameBoard.iterateCells(function (cell) {
        if (!cell.isDiscovered) {
            allDiscovered = false;
        }
    });
    return allDiscovered;
}

function countFieldsUndiscovered() { // TODO tu też możesz użyć iteratora
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