// scripts.js
// Name: [Your Name Here]
// Email: [Your Email Here]

let TILE_DISTRIBUTION = ScrabbleTiles;
let rackTiles = [];
let score = 0;
let placedTiles = [];

$(function () {
  createFullBoard();
  dealTiles();

  $("#submit-word").click(submitWord);
  $("#new-tiles").click(dealTiles);
  $("#restart").click(() => location.reload());
});

function createFullBoard() {
  const board = $("#board");
  board.empty();

  const bonusMap = {
    "0,0": "triple-word", "0,3": "double-letter", "0,7": "triple-word",
    "0,11": "double-letter", "0,14": "triple-word",
    "1,1": "double-word", "1,5": "triple-letter", "1,9": "triple-letter", "1,13": "double-word",
    "2,2": "double-word", "2,6": "double-letter", "2,8": "double-letter", "2,12": "double-word",
    "3,0": "double-letter", "3,3": "double-word", "3,7": "double-letter", "3,11": "double-word", "3,14": "double-letter",
    "4,4": "double-word", "4,10": "double-word",
    "5,1": "triple-letter", "5,5": "triple-letter", "5,9": "triple-letter", "5,13": "triple-letter",
    "6,2": "double-letter", "6,6": "double-letter", "6,8": "double-letter", "6,12": "double-letter",
    "7,0": "triple-word", "7,3": "double-letter", "7,7": "center double-word", "7,11": "double-letter", "7,14": "triple-word",
    "8,2": "double-letter", "8,6": "double-letter", "8,8": "double-letter", "8,12": "double-letter",
    "9,1": "triple-letter", "9,5": "triple-letter", "9,9": "triple-letter", "9,13": "triple-letter",
    "10,4": "double-word", "10,10": "double-word",
    "11,0": "double-letter", "11,3": "double-word", "11,7": "double-letter", "11,11": "double-word", "11,14": "double-letter",
    "12,2": "double-word", "12,6": "double-letter", "12,8": "double-letter", "12,12": "double-word",
    "13,1": "double-word", "13,5": "triple-letter", "13,9": "triple-letter", "13,13": "double-word",
    "14,0": "triple-word", "14,3": "double-letter", "14,7": "triple-word", "14,11": "double-letter", "14,14": "triple-word"
  };

  for (let row = 0; row < 15; row++) {
    const rowDiv = $('<div class="board-row"></div>');
    for (let col = 0; col < 15; col++) {
      const square = $('<div class="board-square"></div>');
      const bonus = bonusMap[`${row},${col}`];
      if (bonus) square.addClass(bonus);

      square.attr("id", `square-${row}-${col}`);
      square.droppable({
        accept: ".tile",
        drop: function (event, ui) {
          const tile = ui.draggable;
          const target = $(this);
          if (target.hasClass("occupied")) return;

          const tileLetter = tile.data("letter");
          tile.detach().css({ top: 0, left: 0 }).appendTo(target);
          tile.draggable("disable");
          target.addClass("occupied");

          placedTiles.push({ letter: tileLetter, target: target });
        },
        out: function (event, ui) {
          ui.draggable.animate({ top: 0, left: 0 }, "slow");
        }
      });
      rowDiv.append(square);
    }
    board.append(rowDiv);
  }
}

function dealTiles() {
  const numToDraw = 7 - rackTiles.length;
  for (let i = 0; i < numToDraw; i++) {
    const letter = getRandomTile();
    const tile = $('<div class="tile"></div>');
    tile.attr("id", "tile-" + i);
    tile.data("letter", letter);
    tile.text(letter);
    tile.draggable({ revert: "invalid", containment: "document" });
    $("#tile-rack").append(tile);
    rackTiles.push(letter);
  }
}

function getRandomTile() {
  const letters = Object.keys(TILE_DISTRIBUTION);
  const randIndex = Math.floor(Math.random() * letters.length);
  return letters[randIndex];
}

function areTilesContiguous() {
  if (placedTiles.length <= 1) return true;
  const positions = placedTiles.map(item => {
    const id = item.target.attr("id").split("-");
    return [parseInt(id[1]), parseInt(id[2])];
  });
  const sameRow = positions.every(p => p[0] === positions[0][0]);
  const sameCol = positions.every(p => p[1] === positions[0][1]);
  if (!sameRow && !sameCol) return false;
  positions.sort((a, b) => (sameRow ? a[1] - b[1] : a[0] - b[0]));
  for (let i = 1; i < positions.length; i++) {
    const expected = sameRow ? positions[i - 1][1] + 1 : positions[i - 1][0] + 1;
    if ((sameRow && positions[i][1] !== expected) || (!sameRow && positions[i][0] !== expected)) {
      return false;
    }
  }
  return true;
}

function submitWord() {
  if (!areTilesContiguous()) {
    alert("Tiles must be placed in a single line with no gaps.");
    return;
  }

  let word = "";
  let wordScore = 0;
  let wordMultiplier = 1;

  placedTiles.forEach((item) => {
    const letter = item.letter;
    const square = item.target;
    let letterScore = TILE_DISTRIBUTION[letter].value;

    if (square.hasClass("double-letter")) letterScore *= 2;
    if (square.hasClass("triple-letter")) letterScore *= 3;
    if (square.hasClass("double-word") || square.hasClass("center")) wordMultiplier *= 2;
    if (square.hasClass("triple-word")) wordMultiplier *= 3;

    word += letter;
    wordScore += letterScore;
  });

  word = word.toUpperCase();

  wordScore *= wordMultiplier;
  score += wordScore;
  $("#score").text("Score: " + score);
  alert(`Submitted word: ${word} for ${wordScore} points!`);

  $(".board-square").removeClass("occupied");
  $("#tile-rack").empty();
  placedTiles = [];
  rackTiles = [];
  dealTiles();
}
