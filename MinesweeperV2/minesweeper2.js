let board = [];
let rows = 8;
let columns = 8;
let minesCount = 10;
let minesLocation = [];
let tilesClicked = 0;
let flagEnabled = false;
let gameOver = false;

window.onload = function() {
    startGame();
    document.getElementById('board').oncontextmenu = function(e) {
        e.preventDefault(); // Prevent the context menu from showing
    };
    updateUIColor(); // Apply UI colors as soon as the game loads
}

function updateSettings() {
    rows = parseInt(document.getElementById("grid-size-input").value);
    columns = rows; // Assuming a square grid
    minesCount = parseInt(document.getElementById("mines-count-input").value);
    startGame();
}

function updateUIColor() {
    let bgColor = document.getElementById("background-color-input").value;
    let gridColor = document.getElementById("grid-color-input").value;
    let tileColor = document.getElementById("tile-color-input").value;
    let textColor = document.getElementById("text-color-input").value;

    document.body.style.backgroundColor = bgColor;
    document.getElementById("board").style.borderColor = gridColor;

    let tiles = document.querySelectorAll("#board div");
    tiles.forEach(tile => {
        tile.style.backgroundColor = tileColor;
        tile.style.color = textColor;
    });

    document.querySelectorAll("h1, h2, div#settings label, div#settings button, div#ui-customization label, div#ui-customization button, p, hr").forEach(element => {
        element.style.color = textColor;
    });
}

function setMines() {
    minesLocation = [];
    let minesLeft = minesCount;
    while (minesLeft > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = `${r}-${c}`;
        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft--;
        }
    }
}

function startGame() {
    board = [];
    tilesClicked = 0;
    flagEnabled = false;
    gameOver = false;
    document.getElementById("board").innerHTML = "";
    document.getElementById("mines-count").innerText = minesCount;
    setMines();

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = `${r}-${c}`;
            tile.addEventListener("mousedown", clickTile);
            tile.oncontextmenu = (e) => e.preventDefault(); // Prevent right-click menu on each tile
            document.getElementById("board").appendChild(tile);
            row.push(tile);
        }
        board.push(row);
    }

    adjustBoardStyle();
    updateUIColor(); // Apply UI colors whenever the game is restarted
}

function adjustBoardStyle() {
    let boardSize = columns * 50; // Assuming each tile is 50px for simplicity
    document.getElementById("board").style.width = `${boardSize}px`;
    document.getElementById("board").style.height = `${rows * 50}px`;
}

function clickTile(event) {
    event.preventDefault();
    if (gameOver) return;
    
    let tile = this;

    // Right-click to toggle flag
    if (event.button === 2 && !tile.classList.contains("tile-clicked")) {
        if (tile.classList.contains("flagged")) {
            tile.classList.remove("flagged");
            tile.innerText = ""; // Remove flag visual representation.
        } else {
            tile.classList.add("flagged");
            tile.innerText = "🚩"; // Add flag visual representation.
        }
        return; // Exit the function after handling right-click.
    }
    // Revealing the tile with a left-click
    else if (event.button === 0 && !tile.classList.contains("tile-clicked") && !tile.classList.contains("flagged")) { 
        // If the tile is a mine
        if (minesLocation.includes(tile.id)) {
            tile.innerText = "💣";
            tile.style.backgroundColor = "red"; // Highlight mines differently
            gameOver = true;
            revealMines();
            document.getElementById("mines-count").innerText = "Game Over";
        } else {
            // Reveal the tile and check surrounding mines
            revealTile(tile);
        }
    }

    // Check if the game is won after each click
    checkWinCondition();
}

function revealTile(tile) {
    if (tile.classList.contains("tile-clicked")) return;
    
    let [r, c] = tile.id.split("-").map(Number);
    let minesFound = checkSurroundingMines(r, c);

    tile.classList.add("tile-clicked");
    // Adjusting the opacity to visually indicate the tile has been clicked
    tile.style.opacity = "0.5";

    if (minesFound > 0) {
        // Display the count of adjacent mines
        tile.innerText = minesFound.toString();
    } else {
        // If no adjacent mines, recursively reveal surrounding tiles
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue; // Skip the current tile
                let nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < columns) {
                    let adjacentTile = board[nr][nc];
                    if (!adjacentTile.classList.contains("tile-clicked") && !minesLocation.includes(`${nr}-${nc}`)) {
                        revealTile(adjacentTile); // Recursive call
                    }
                }
            }
        }
    }
}

function revealMines() {
    minesLocation.forEach(function(mine) {
        const [r, c] = mine.split("-").map(x => parseInt(x));
        let tile = board[r][c];
        if (!tile.classList.contains("tile-clicked")) {
            tile.innerText = "💣";
            tile.style.backgroundColor = "red";
            tile.classList.add("tile-clicked");
        }
    });
}



function checkSurroundingMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && minesLocation.includes(`${nr}-${nc}`)) {
                count++;
            }
        }
    }
    return count;
}
function checkWinCondition() {
    let clearedTiles = document.querySelectorAll('.tile-clicked:not(:contains("💣"))').length;
    let totalTiles = rows * columns;
    let mineTiles = minesLocation.length;

    if (clearedTiles === totalTiles - mineTiles) {
        gameOver = true;
        alert("Congratulations, you've won!");
    }
}
function resetStylesToDefault() {
    // Define default colors
    const defaultBgColor = "#D3D3D3";
    const defaultGridColor = "#8B8989";
    const defaultTileColor = "#FFFFFF";
    const defaultTextColor = "#000000";

    // Reset color inputs to default values
    document.getElementById("background-color-input").value = defaultBgColor;
    document.getElementById("grid-color-input").value = defaultGridColor;
    document.getElementById("tile-color-input").value = defaultTileColor;
    document.getElementById("text-color-input").value = defaultTextColor;

    // Apply the default colors
    updateUIColor();
}



