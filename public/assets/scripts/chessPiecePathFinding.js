const kingAlts = [
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

const bishopAlts = [
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: -1 },
];

const tornAlts = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const horseAlts = [
  { x: 1, y: 2 },
  { x: -1, y: 2 },
  { x: 1, y: -2 },
  { x: -1, y: -2 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
  { x: -2, y: 1 },
  { x: -2, y: -1 },
];

function horsePiece(target, id, moveBlocks, attackBlocks, addClickEvents) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < horseAlts.length; i++) {
    const x = nums[0] + horseAlts[i].x - 1;
    const y = 8 - nums[1] + horseAlts[i].y;

    if (x < 0 || y < 0 || x > 7 || y > 7) continue;

    let element = playfield.children[[y]].children[x];

    if (
      element.childElementCount > 0 &&
      element.children[0].className != "selector-img"
    ) {
      if (checkElementForAttack(element, id)) {
        if (addClickEvents != undefined && !addClickEvents) {
          attackBlocks.push(element.id);
        } else {
          addElementToAttackBlocks(element, id, attackBlocks);
        }
      }
      continue;
    }
    if (addClickEvents != undefined && !addClickEvents) {
      moveBlocks.push(element.id);
    } else {
      addElementToMoveBlocks(element, id, moveBlocks);
    }
  }
}

function checkPieceAlts(
  target,
  id,
  moveBlocks,
  attackBlocks,
  ignoreBlocks = [],
  addClickEvents = true,
  ignoreCheckCastling = false
) {
  switch (true) {
    case id.startsWith("bonde"):
      bondePiece(target, id, moveBlocks, attackBlocks, addClickEvents);
      break;
    case id.startsWith("häst"):
      horsePiece(target, id, moveBlocks, attackBlocks, addClickEvents);
      break;
    case id.startsWith("torn"):
      tornPiece(
        target,
        id,
        moveBlocks,
        attackBlocks,
        ignoreBlocks,
        addClickEvents
      );
      break;
    case id.startsWith("löpare"):
      bishopPiece(
        target,
        id,
        moveBlocks,
        attackBlocks,
        ignoreBlocks,
        addClickEvents
      );
      break;
    case id.startsWith("drottning"):
      bishopPiece(
        target,
        id,
        moveBlocks,
        attackBlocks,
        ignoreBlocks,
        addClickEvents
      );
      tornPiece(
        target,
        id,
        moveBlocks,
        attackBlocks,
        ignoreBlocks,
        addClickEvents
      );
      break;
    case id.startsWith("kung"):
      kingPiece(
        target,
        id,
        moveBlocks,
        attackBlocks,
        ignoreBlocks,
        addClickEvents,
        ignoreCheckCastling
      );
      break;
    default:
      console.log("Unkown piece!");
  }
}

function kingPiece(
  target,
  id,
  moveBlocks,
  attackBlocks,
  ignoreBlocks,
  addClickEvents,
  ignoreCheckCastling
) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < kingAlts.length; i++) {
    const y = 8 - nums[1] + kingAlts[i].y;
    const x = nums[0] - 1 + kingAlts[i].x;

    if (x < 0 || y < 0 || x >= 8 || y > 7) continue;

    let element = playfield.children[y].children[x];

    if (
      element.childElementCount > 0 &&
      element.children[0].className != "selector-img"
    ) {
      if (checkElementForAttack(element, id)) {
        if (!addClickEvents) {
          attackBlocks.push(element.id);
        } else {
          addElementToAttackBlocks(element, id, attackBlocks);
        }
      } else if (addClickEvents == false && ignoreBlocks.includes(element.id)) {
        moveBlocks.push(element.id);
      }
      continue;
    }
    if (!addClickEvents) {
      moveBlocks.push(element.id);
    } else {
      addElementToMoveBlocks(element, id, moveBlocks);
    }
  }
  !ignoreCheckCastling && checkKingCastleing(id, nums);
}

function canEnemyPiecesMoveHere(blockIds, colorSwe) {
  const color = colorSwe == "gul" ? "svart" : "gul";
  const moves = [];
  for (let y = 0; y < playfield.childElementCount; y++) {
    for (let x = 0; x < playfield.children[y].childElementCount; x++) {
      const currentBlock = playfield.children[y].children[x];
      if (
        currentBlock.childElementCount > 0 &&
        currentBlock.children[0].id.includes(color)
      ) {
        const target = currentBlock.children[0];
        checkPieceAlts(target, target.id, moves, [], [], false, true);
      }
    }
  }

  return moves.filter((element) => blockIds.includes(element)).length > 0;
}

function checkKingCastleing(id, nums) {
  const colorEng = id.includes("gul") ? "yellow" : "black";
  const kingElement = playfield.querySelector("#" + id);
  if (
    !specialMoves[`${colorEng}KingMoved`] &&
    !kingElement.className.includes("red-flash")
  ) {
    const y = 8 - nums[1];
    const x = nums[0] - 1;
    const colorSwe = id.includes("gul") ? "gul" : "svart";

    if (!specialMoves[`${colorEng}Tower2Moved`]) {
      const rightTowerBlock = playfield.children[y].children[x + 1];
      const rightKingBlock = playfield.children[y].children[x + 2];
      if (
        (rightTowerBlock.childElementCount == 0 ||
          rightTowerBlock.children[0].className == "selector-img") &&
        rightKingBlock.childElementCount == 0 &&
        !canEnemyPiecesMoveHere(
          [rightKingBlock.id, rightTowerBlock.id],
          colorSwe
        )
      ) {
        const tower2 = playfield.querySelector(`#torn-${colorSwe}-2`);
        addElementToSpecialMoveBlocks(
          rightKingBlock,
          id,
          specialMoveBlocks,
          tower2.id,
          rightTowerBlock.id
        );
      }
    }

    if (!specialMoves[`${colorEng}Tower1Moved`]) {
      const leftTowerBlock = playfield.children[y].children[x - 1];
      const leftKingBlock = playfield.children[y].children[x - 2];
      const leftEmptyBlock = playfield.children[y].children[x - 3];
      if (
        (leftTowerBlock.childElementCount == 0 ||
          leftTowerBlock.children[0].className == "selector-img") &&
        leftKingBlock.childElementCount == 0 &&
        leftEmptyBlock.childElementCount == 0 &&
        canEnemyPiecesMoveHere([leftKingBlock.id, leftTowerBlock.id], colorSwe)
      ) {
        const tower1 = playfield.querySelector(`#torn-${colorSwe}-1`);
        addElementToSpecialMoveBlocks(
          leftKingBlock,
          id,
          specialMoveBlocks,
          tower1.id,
          leftTowerBlock.id
        );
      }
    }
  }
}

function bishopPiece(
  target,
  id,
  moveBlocks,
  attackBlocks,
  ignoreBlocks,
  addClickEvents
) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < bishopAlts.length; i++) {
    let pathFound = false;
    let stepX = bishopAlts[i].x;
    let stepY = bishopAlts[i].y;

    while (!pathFound) {
      const y = 8 - nums[1] + stepY;
      const x = nums[0] - 1 + stepX;

      if (x < 0 || y < 0 || x > 7 || y > 7) break;

      let nextElement = playfield.children[y].children[x];

      if (
        nextElement.childElementCount > 0 &&
        nextElement.children[0].className != "selector-img"
      ) {
        if (checkElementForAttack(nextElement, id)) {
          if (addClickEvents != undefined && addClickEvents == false) {
            attackBlocks.push(nextElement.id);
          } else {
            addElementToAttackBlocks(nextElement, id, attackBlocks);
          }
        }
        if (ignoreBlocks.includes(nextElement.id)) {
          if (!addClickEvents) {
            moveBlocks.push(nextElement.id);
          }
          stepX += bishopAlts[i].x;
          stepY += bishopAlts[i].y;
        } else {
          pathFound = true;
        }
      } else {
        if (addClickEvents != undefined && addClickEvents == false) {
          moveBlocks.push(nextElement.id);
        } else {
          addElementToMoveBlocks(nextElement, id, moveBlocks);
        }
        stepX += bishopAlts[i].x;
        stepY += bishopAlts[i].y;
      }
    }
  }
}

function tornPiece(
  target,
  id,
  moveBlocks,
  attackBlocks,
  ignoreBlocks,
  addClickEvents
) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let i = 0; i < tornAlts.length; i++) {
    let stepX = tornAlts[i].x;
    let stepY = tornAlts[i].y;

    let pathsFound = false;
    while (!pathsFound) {
      const y = 8 - nums[1] + stepX;
      const x = nums[0] - 1 + stepY;

      if (x < 0 || y < 0 || x > 7 || y > 7) break;

      let nextElement = playfield.children[y].children[x];

      if (
        nextElement.childElementCount > 0 &&
        nextElement.children[0].className != "selector-img"
      ) {
        if (checkElementForAttack(nextElement, id)) {
          if (!addClickEvents) {
            attackBlocks.push(nextElement.id);
          } else {
            addElementToAttackBlocks(nextElement, id, attackBlocks);
          }
        }
        if (ignoreBlocks.includes(nextElement.id)) {
          if (!addClickEvents) {
            attackBlocks.push(nextElement.id);
          }
          stepX += tornAlts[i].x;
          stepY += tornAlts[i].y;
        } else {
          pathsFound = true;
        }
      } else {
        if (!addClickEvents) {
          moveBlocks.push(nextElement.id);
        } else {
          addElementToMoveBlocks(nextElement, id, moveBlocks);
        }
        stepX += tornAlts[i].x;
        stepY += tornAlts[i].y;
      }
    }
  }
}

function bondePiece(target, id, moveBlocks, attackBlocks, addClickEvents) {
  const nums = getNumsFromParentId(target.parentElement);

  for (let pess of enPessants) {
    if (pess.pieceId == id) {
      addEnPessant(moveBlocks, pess);
    }
  }

  const step = id.includes("gul") ? 0 : 2;

  const y = 7 - nums[1] + step;
  const x = nums[0] - 1;

  if (x < 0 || y < 0 || x >= 8 || y > 7) return;

  const element = playfield.children[y].children[x];

  const elLeftRight = [
    playfield.children[y].children[x - 1],
    playfield.children[y].children[x + 1],
  ];

  for (let i = 0; i < elLeftRight.length; i++) {
    if (checkElementForAttack(elLeftRight[i], id))
      if (addClickEvents != undefined && !addClickEvents) {
        attackBlocks.push(elLeftRight[i].id);
      } else {
        addElementToAttackBlocks(elLeftRight[i], id, attackBlocks);
      }
  }

  if (element.childElementCount > 0) return;

  if (addClickEvents != undefined && !addClickEvents) {
    moveBlocks.push(element.id);
  } else {
    addElementToMoveBlocks(element, id, moveBlocks);
  }

  if (y === 5 && id.includes("gul")) {
    const element2 = playfield.children[y - 1].children[x];
    if (
      element2.childElementCount > 0 &&
      element2.children[0].className != "selector-img"
    )
      return;
    if (addClickEvents != undefined && !addClickEvents) {
      moveBlocks.push(element2.id);
    } else {
      addElementToMoveBlocks(element2, id, moveBlocks, true);
    }
  } else if (y === 2 && id.includes("svart")) {
    const element2 = playfield.children[y + 1].children[x];
    if (
      element2.childElementCount > 0 &&
      element2.children[0].className != "selector-img"
    )
      return;
    if (addClickEvents != undefined && !addClickEvents) {
      moveBlocks.push(element2.id);
    } else {
      addElementToMoveBlocks(element2, id, moveBlocks, true);
    }
  }
}

function addElementToAttackBlocks(element, id, attackBlocks) {
  let pieceCheck;
  if (gameMode == "AI") {
    pieceCheck = playerIsWhite ? "svart" : "gul";
  } else if (gameMode == "local") {
    pieceCheck = whiteTurn ? "svart" : "gul";
  }
  !id.includes(pieceCheck) && element.append(createSelectorImg("Red"));

  attackBlocks.push({
    element: element,
    func: () => {
      attackHere(id, element.id);
      switchTurn();
    },
    mover: id,
  });

  element.addEventListener("click", attackBlocks[attackBlocks.length - 1].func);
}

function checkElementForAttack(element, id) {
  const pieceColor = id.split("-")[1];
  if (
    element !== undefined &&
    element.childElementCount > 0 &&
    !element.children[0].className.startsWith("selector") &&
    !element.children[0].id.includes(pieceColor)
  ) {
    return true;
  }
  return false;
}

function addEnPessant(moveBlocks, pessantInfo) {
  let pieceCheck;
  if (gameMode == "AI") {
    pieceCheck = playerIsWhite ? "svart" : "gul";
  } else if (gameMode == "local") {
    pieceCheck = whiteTurn ? "svart" : "gul";
  }
  !pessantInfo.pieceId.includes(pieceCheck) &&
    pessantInfo.moveBlock.append(createSelectorImg("Yellow"));

  moveBlocks.push({
    element: pessantInfo.moveBlock,
    func: () => {
      moveHere(pessantInfo.pieceId, pessantInfo.moveBlock.id, false, false);
      pessantInfo.attackBlock.children[0].remove();
      if (gameMode == "online") {
        socket.send(
          `en-pessant ${currentRoomId} ${pessantInfo.attackBlock.id}`
        );
      }
      switchTurn();
    },
    mover: pessantInfo.pieceId,
  });

  pessantInfo.moveBlock.addEventListener(
    "click",
    moveBlocks[moveBlocks.length - 1].func
  );
}

function addElementToMoveBlocks(element, id, moveBlocks, checkPessant = false) {
  let pieceCheck;
  if (gameMode == "AI") {
    pieceCheck = playerIsWhite ? "svart" : "gul";
  } else if (gameMode == "local") {
    pieceCheck = whiteTurn ? "svart" : "gul";
  }
  !id.includes(pieceCheck) && element.append(createSelectorImg("Green"));
  moveBlocks.push({
    element: element,
    func: () => {
      moveHere(id, element.id, false, checkPessant);
      switchTurn();
    },
    mover: id,
  });

  element.addEventListener("click", moveBlocks[moveBlocks.length - 1].func);
}

function addElementToSpecialMoveBlocks(
  element,
  id,
  specialMoveBlocks,
  secondPieceId,
  secondBlockId
) {
  let pieceCheck;
  if (gameMode == "AI") {
    pieceCheck = playerIsWhite ? "svart" : "gul";
  } else if (gameMode == "local") {
    pieceCheck = whiteTurn ? "svart" : "gul";
  }
  !id.includes(pieceCheck) && element.append(createSelectorImg("Yellow"));

  specialMoveBlocks.push({
    element: element,
    func: () => {
      moveHere(id, element.id, true);
      moveHere(secondPieceId, secondBlockId, true);

      if (gameMode == "online") {
        socket.send(
          `castle ${currentRoomId} ${id} ${element.id} ${secondPieceId} ${secondBlockId}`
        );
      }

      switchTurn();
    },
    mover: id,
  });

  element.addEventListener(
    "click",
    specialMoveBlocks[specialMoveBlocks.length - 1].func
  );
}

function moveHere(
  pieceId,
  blockId,
  skipOnlineSynch = false,
  checkPessant = false
) {
  const chessPiece = document.querySelector("#" + pieceId);

  document.querySelector("#" + blockId).append(chessPiece);

  if (gameMode == "online" && !skipOnlineSynch) {
    socket.send(`moved-piece ${currentRoomId} ${pieceId} ${blockId}`);
  }

  checkMover(pieceId);

  resetPlayfield();
  enPessants.splice(0, enPessants.length);

  checkPessant && checkEnpessant(pieceId, blockId);

  const sound = new Audio("assets/sounds/move.wav");
  sound.play();
}

function checkEnpessant(pieceId, blockId, ignoreServerSend = false) {
  if (gameMode == "online" && !ignoreServerSend) {
    socket.send(`check-pessant ${currentRoomId} ${pieceId} ${blockId}`);
  }
  const checkColor = pieceId.includes("gul") ? "svart" : "gul";
  const nums = getNumsFromParentId(playfield.querySelector(`#${blockId}`));
  const x = nums[0] - 1;
  const y = 8 - nums[1];
  const pessantPieces = [];
  if (x - 1 >= 0) {
    pessantPieces.push(playfield.children[y].children[x - 1]);
  }
  if (x + 1 <= 7) {
    pessantPieces.push(playfield.children[y].children[x + 1]);
  }
  for (let block of pessantPieces) {
    if (block.childElementCount > 0) {
      const piece = block.children[0];
      if (piece.id.includes(checkColor)) {
        const yChange = checkColor == "svart" ? 1 : -1;
        const attackBlock = playfield.children[y].children[x];
        const moveBlock = playfield.children[y + yChange].children[x];
        enPessants.push({ pieceId: piece.id, attackBlock, moveBlock });
      }
    }
  }
}

function checkMover(id) {
  if (id.includes("kung")) {
    if (id.includes("svart")) {
      specialMoves.blackKingMoved = true;
    } else {
      specialMoves.yellowKingMoved = true;
    }
  } else if (id.includes("torn")) {
    if (id.includes("svart")) {
      if (id.includes("1")) {
        specialMoves.blackTower1Moved = true;
      } else {
        specialMoves.blackTower2Moved = true;
      }
    } else {
      if (id.includes("1")) {
        specialMoves.yellowTower1Moved = true;
      } else {
        specialMoves.yellowTower2Moved = true;
      }
    }
  } else if (id.includes("bonde")) {
    checkPawnPromotion(id);
  }
}

function checkPawnPromotion(id, ignoreServerSync = false) {
  const y = id.includes("gul") ? 0 : 7;

  const pawn = playfield.children[y].querySelector(`#${id}`);

  if (pawn != null) {
    const imgColor = id.includes("gul") ? "" : "Svart_";
    pawn.id = pawn.id.replace("bonde", "drottning");
    pawn.src = pawn.src.replace(
      `Bonde_${imgColor}TP`,
      `Drottning_${imgColor}TP`
    );
  }
}

function attackHere(pieceId, blockId) {
  const block = document.querySelector("#" + blockId);

  block.children[0].remove();

  moveHere(pieceId, blockId);
}
