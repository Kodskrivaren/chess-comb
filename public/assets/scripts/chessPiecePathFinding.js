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
  addClickEvents = true
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
        addClickEvents
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
  addClickEvents
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
      addElementToMoveBlocks(element2, id, moveBlocks);
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
      addElementToMoveBlocks(element2, id, moveBlocks);
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

function addElementToMoveBlocks(element, id, moveBlocks) {
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
      moveHere(id, element.id);
    },
    mover: id,
  });

  element.addEventListener("click", moveBlocks[moveBlocks.length - 1].func);
}

function moveHere(pieceId, blockId) {
  const chessPiece = document.querySelector("#" + pieceId);

  document.querySelector("#" + blockId).append(chessPiece);

  if (gameMode == "online") {
    socket.send(`moved-piece ${currentRoomId} ${pieceId} ${blockId}`);
  }

  resetPlayfield();

  const sound = new Audio("assets/sounds/move.wav");
  sound.play();

  switchTurn();
}

function attackHere(pieceId, blockId) {
  const block = document.querySelector("#" + blockId);

  block.children[0].remove();

  moveHere(pieceId, blockId);
}
