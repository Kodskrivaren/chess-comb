const playfield = document.querySelector(".playfield");
const pageMenu = document.querySelector(".page-menu");
const jsonData = fetch("./assets/json/chessPieceData.json");
const pageCover = document.querySelector(".page-cover");

const moveBlocks = [],
  attackBlocks = [],
  specialMoveBlocks = [];

// AI variables
let AITurn, chessPieces, playerIsWhite;

// local variables
let whiteTurn = true;

// online variables
let amIWhite = true,
  myTurn = false;

const specialMoves = {
  blackKingMoved: false,
  blackTower1Moved: false,
  blackTower2Moved: false,
  yellowKingMoved: false,
  yellowTower1Moved: false,
  yellowTower2Moved: false,
};

let gameMode = ""; // modes: AI, local, online

let blackPieceTimer = 85,
  it = 0;

(async () => {
  await Promise.all([jsonData]).then(async (response) => {
    chessPieces = await response[0].json();
    setMainMenu();
    createPlayfield();
    // localMultiplayerClick();
  });
})();

function localMultiplayerClick() {
  playfield.parentElement.style = "";
  gameMode = "local";
  whiteTurn = true;
  startGame();
}

function resetSpecialMoves() {
  for (let index in specialMoves) {
    specialMoves[index] = false;
  }
}

function playAsWhite(choice) {
  if (choice) {
    playfield.parentElement.style = "";
  } else {
    playfield.parentElement.style = "transform: rotateZ(180deg)";
  }
  playerIsWhite = choice;
  AITurn = playerIsWhite ? false : true;
  gameMode = "AI";
  startGame();
}

function startGame() {
  pageMenu.style = "visibility: hidden;";
  resetSpecialMoves();
  it = 0;
  setTimeout(setUpblackPiece, 0);
}

function removeAllPieces() {
  for (let i = 0; i < playfield.childElementCount; i++) {
    for (let j = 0; j < playfield.children[i].childElementCount; j++) {
      const element = playfield.children[i].children[j];
      if (element.childElementCount === 0) continue;
      element.firstChild.remove();
    }
  }
}

function setUpblackPiece() {
  if (it === 16) {
    setTimeout(setUpYellowPieces, 0);
    return;
  }

  const block = document.querySelector("#" + chessPieces[it].startBlock);
  const piece = createBasicPiece(chessPieces[it].id, chessPieces[it].img);

  piece.style =
    playerIsWhite || gameMode == "local"
      ? "scale: -1;"
      : "scale: -1; transform: translateX(1px);";

  checkGameMode(piece, "black");

  block.append(piece);
  it++;
  setTimeout(setUpblackPiece, blackPieceTimer);
}

function setUpYellowPieces() {
  if (it === 32) {
    if (AITurn) {
      pageCover.style = "";
      setTimeout(AIMove, 1000);
    } else {
      pageCover.style = "visibility: hidden";
    }
    return;
  }

  const block = document.querySelector("#" + chessPieces[it].startBlock);
  const piece = createBasicPiece(chessPieces[it].id, chessPieces[it].img);

  checkGameMode(piece, "white");

  block.append(piece);
  it++;
  setTimeout(setUpYellowPieces, blackPieceTimer);
}

function checkGameMode(piece, pieceColor) {
  switch (true) {
    case gameMode == "AI":
      if (
        (playerIsWhite && pieceColor == "white") ||
        (!playerIsWhite && pieceColor == "black")
      ) {
        piece.addEventListener("click", onChessPieceClick);
        piece.classList.add("chess-piece-hover");
        AIopponentPieces.push(piece);
      } else {
        AIPieces.push(piece);
      }
      break;
    case gameMode == "local":
      piece.addEventListener("click", onChessPieceClick);
      piece.classList.add("chess-piece-hover");
      break;
    case gameMode == "online":
      if (
        (amIWhite && pieceColor == "black") ||
        (!amIWhite && pieceColor == "white")
      )
        return;
      piece.addEventListener("click", onChessPieceClick);
      piece.classList.add("chess-piece-hover");
      break;
  }
}

function createBasicPiece(id, img) {
  const piece = document.createElement("img");
  piece.className = "chess-piece-pic";
  piece.id = id;
  piece.src = "assets/pictures/" + img + ".webp";

  const sound = new Audio("assets/sounds/move.wav");
  sound.play();

  return piece;
}

function onChessPieceClick(event) {
  const target = event.target;
  const id = target.id;
  switch (true) {
    case gameMode == "AI":
      if (AITurn) return;
      if (
        (!playerIsWhite && id.includes("gul")) ||
        (playerIsWhite && id.includes("svart"))
      )
        return;
      resetPlayfield();
      checkPieceAlts(target, id, moveBlocks, attackBlocks);
      break;
    case gameMode == "local":
      if (
        (whiteTurn && id.includes("svart")) ||
        (!whiteTurn && id.includes("gul"))
      )
        return;
      resetPlayfield();
      checkPieceAlts(target, id, moveBlocks, attackBlocks);
      break;
    case gameMode == "online":
      if (!myTurn) return;
      resetPlayfield();
      checkPieceAlts(target, id, moveBlocks, attackBlocks);
      break;
  }
}

function getNumsFromParentId(parentElement) {
  const nums = parentElement.id.split("-");
  nums[0] = nums[0].charCodeAt(0) - 64;
  nums[1] = Number(nums[1]);
  return nums;
}

function createSelectorImg(color) {
  const image = document.createElement("img");
  image.className = "selector-img";
  image.src = "assets/pictures/Selected_" + color + "_TP.webp";
  return image;
}

function switchTurn() {
  if (!winConditionMet()) {
    switch (true) {
      case gameMode == "AI":
        AITurn = !AITurn;
        if (AITurn) {
          pageCover.style = "";
          setTimeout(AIMove, 1000);
        } else {
          pageCover.style = "visibility: hidden";
        }
        break;
      case gameMode == "local":
        removeRedFlashingFromKings();
        whiteTurn = !whiteTurn;
        isKingInCheck();
        break;
      case gameMode == "online":
        removeRedFlashingFromKings();
        myTurn = false;
        break;
    }
  }
}

function removeRedFlashingFromKings() {
  const whiteKing = document.querySelector("#kung-gul");
  const blackKing = document.querySelector("#kung-svart");
  whiteKing.classList.remove("red-flash");
  blackKing.classList.remove("red-flash");
}

function winConditionMet() {
  const blackKing = document.querySelector("#kung-svart");
  const yellowKing = document.querySelector("#kung-gul");

  if (blackKing === null || yellowKing === null) {
    let message;

    switch (true) {
      case gameMode == "AI":
        if (playerIsWhite) {
          message = blackKing === null ? "Player Wins!" : "AI Wins!";
        } else {
          message = yellowKing === null ? "Player Wins!" : "AI Wins!";
        }
        break;
      case gameMode == "local":
        message =
          blackKing === null ? "White pieces win!" : "Black pieces win!";
        break;
      case gameMode == "online":
        socket.close();
        socket = null;
        currentRoomId = -1;
        message =
          (blackKing === null && amIWhite) || (yellowKing === null && !amIWhite)
            ? "You win!"
            : "You loose!";
        break;
    }

    setGameOverScreen(message);

    return true;
  } else {
    return false;
  }
}

function resetPlayfield() {
  const arr = [...moveBlocks, ...attackBlocks, ...specialMoveBlocks];

  for (let i = 0; i < arr.length; i++) {
    arr[i].element.removeEventListener("click", arr[i].func);
  }
  moveBlocks.splice(0, moveBlocks.length);
  attackBlocks.splice(0, attackBlocks.length);
  specialMoveBlocks.splice(0, specialMoveBlocks.length);

  document.querySelectorAll(".selector-img").forEach((element) => {
    element.remove();
  });
}

function createPlayfield() {
  const chars = "ABCDEFGH";
  for (let i = 8; i >= 1; i--) {
    const boardRow = document.createElement("div");
    boardRow.className = "board-row";
    for (let j = 0; j < chars.length; j++) {
      const block = document.createElement("div");
      block.className = "block";
      block.id = `${chars[j]}-${i}`;
      boardRow.append(block);
    }
    playfield.append(boardRow);
  }
  const letters = document.querySelectorAll(".letters");
  const numbers = document.querySelectorAll(".numbers");
  for (let i = 0; i < chars.length; i++) {
    createSideCharacters(letters[0], chars[i]);
    createSideCharacters(letters[1], chars[i]);
    createSideCharacters(numbers[0], i + 1);
    createSideCharacters(numbers[1], i + 1);
  }
}

function createSideCharacters(parent, letter) {
  const charDiv1 = document.createElement("div");
  const charP1 = document.createElement("p");
  charP1.textContent = letter;
  charDiv1.append(charP1);

  parent.append(charDiv1);
}

function isKingInCheck() {
  switch (true) {
    case gameMode == "local":
      let attacks;
      if (whiteTurn) {
        attacks = getOpponentAttacks("svart");
      } else {
        attacks = getOpponentAttacks("gul");
      }
      if (doesAttacksContainKing(attacks)) {
        const kingId = whiteTurn ? "kung-gul" : "kung-svart";
        const king = document.querySelector("#" + kingId);
        king.classList.add("red-flash");
      }
      break;
    case gameMode == "online":
      let onlineAttacks;
      if (myTurn) {
        if (amIWhite) {
          onlineAttacks = getOpponentAttacks("svart");
        } else {
          onlineAttacks = getOpponentAttacks("gul");
        }
        if (doesAttacksContainKing(onlineAttacks)) {
          const kingId = amIWhite ? "kung-gul" : "kung-svart";
          const king = document.querySelector("#" + kingId);
          king.classList.add("red-flash");
        }
      }
      break;
  }
}

function doesAttacksContainKing(attacks) {
  for (let block of attacks) {
    let docBlock = document.querySelector("#" + block);
    if (docBlock.children[0].id.includes("kung")) {
      return true;
    }
  }
  return false;
}

function getOpponentAttacks(pieceColor) {
  const attacks = [];
  for (let blockRow of playfield.children) {
    for (let block of blockRow.children) {
      if (block.children.length > 0) {
        let piece = block.children[0];
        if (piece.id.includes(pieceColor)) {
          checkPieceAlts(piece, piece.id, [], attacks, [], false);
        }
      }
    }
  }

  return attacks;
}
