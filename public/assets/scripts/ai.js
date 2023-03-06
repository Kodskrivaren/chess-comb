const AIPieces = [],
  AIopponentPieces = [],
  AIattackBlocks = [],
  AImoveBlocks = [],
  AIOpponentMoveBlocks = [],
  AIOpponentAttackBlocks = [];

let filteredKingAttacks;
const letters = "ABCDEFGH";

function AIMove() {
  for (let i = 0; i < AIPieces.length; i++) {
    const id = AIPieces[i].id;

    if (AIPieces[i].parentElement === null) {
      AIPieces.splice(i, 1);
      i--;
    } else {
      checkPieceAlts(AIPieces[i], id, AImoveBlocks, AIattackBlocks);
    }
  }

  setOpponentsChoices();

  if (AIisKingInCheck()) {
    protectKing();
  } else if (AIattackBlocks.length > 0) {
    checkForAttack(AIattackBlocks);
  } else {
    checkForMove();
  }

  resetAIBlocks();

  AITurn = false;
}

function checkForMove() {
  sortByImportance(AImoveBlocks);

  const filteredMoves = AImoveBlocks.filter((element) => {
    // console.log(element);
    if (element.mover.includes("kung")) {
      return false;
    }
    const opponentMoveChoices = [];
    const opponentAttackChoices = [];

    for (let i = 0; i < AIopponentPieces.length; i++) {
      if (AIopponentPieces[i].id.includes("bonde")) {
        const id = AIopponentPieces[i].parentElement.id;
        const direction = AIopponentPieces[i].id.includes("svart") ? -1 : 1;
        opponentMoveChoices.push(
          `${letters[letters.indexOf(id[0]) - 1]}-${Number(id[2]) + direction}`
        );
        opponentMoveChoices.push(
          `${letters[letters.indexOf(id[0]) + 1]}-${Number(id[2]) + direction}`
        );
      } else {
        checkPieceAlts(
          AIopponentPieces[i],
          AIopponentPieces[i].id,
          opponentMoveChoices,
          opponentAttackChoices,
          [element.element.id],
          false
        );
      }
    }
    // console.log(opponentAttackChoices);
    // console.log(opponentMoveChoices);

    return ![...opponentMoveChoices, opponentAttackChoices].includes(
      element.element.id
    );
  });

  console.log(filteredMoves);

  if (filteredMoves.length > 0) {
    filteredMoves[0].func();
  } else {
    AImoveBlocks[0].func();
  }
}

function checkForAttack(AIattackBlocks) {
  sortByImportance(AIattackBlocks);

  const filteredAttacks = AIattackBlocks.filter((element) => {
    const opponentMoveChoices = [];
    const opponentAttackChoices = [];

    for (let i = 0; i < AIopponentPieces.length; i++) {
      if (AIopponentPieces[i].id.includes("bonde")) {
        const id = AIopponentPieces[i].parentElement.id;
        const direction = AIopponentPieces[i].id.includes("svart") ? -1 : 1;
        opponentMoveChoices.push(
          `${letters[letters.indexOf(id[0]) - 1]}-${Number(id[2]) + direction}`
        );
        opponentMoveChoices.push(
          `${letters[letters.indexOf(id[0]) + 1]}-${Number(id[2]) + direction}`
        );
      } else {
        checkPieceAlts(
          AIopponentPieces[i],
          AIopponentPieces[i].id,
          opponentMoveChoices,
          opponentAttackChoices,
          [element.element.id],
          false
        );
      }
    }
    // console.log(opponentAttackChoices);
    // console.log(opponentMoveChoices);

    return ![...opponentMoveChoices, opponentAttackChoices].includes(
      element.element.id
    );
  });

  // console.log(filteredAttacks);

  if (filteredAttacks.length > 0) {
    filteredAttacks[0].func();
  } else {
    checkForMove();
  }
}

function resetAIBlocks() {
  const arr = [
    ...AImoveBlocks,
    ...AIattackBlocks,
    ...AIOpponentMoveBlocks,
    ...AIOpponentAttackBlocks,
  ];

  for (let i = 0; i < arr.length; i++) {
    try {
      arr[i].element.removeEventListener("click", arr[i].func);
    } catch {}
  }
  AImoveBlocks.splice(0, AImoveBlocks.length);
  AIattackBlocks.splice(0, AIattackBlocks.length);
  AIOpponentMoveBlocks.splice(0, AIOpponentMoveBlocks.length);
  AIOpponentAttackBlocks.splice(0, AIOpponentAttackBlocks.length);
  filteredKingAttacks = [];

  document.querySelectorAll(".selector-img").forEach((element) => {
    element.remove();
  });
}

function AIisKingInCheck() {
  filteredKingAttacks = AIOpponentAttackBlocks.filter((element) => {
    return element.element.children[0].id.includes("kung");
  });

  return filteredKingAttacks.length > 0;
}

function setOpponentsChoices() {
  for (let i = 0; i < AIopponentPieces.length; i++) {
    const id = AIopponentPieces[i].id;

    if (AIopponentPieces[i].parentElement === null) {
      AIopponentPieces.splice(i, 1);
      i--;
    } else {
      if (AIopponentPieces[i].id.includes("bonde")) {
        const boardId = AIopponentPieces[i].parentElement.id.split("-");
        const path = AIopponentPieces[i].id.includes("svart") ? -1 : 1;
        boardId[0] = letters.indexOf(boardId[0]);
        boardId[1] = Number(boardId[1]) + path;
        if (boardId[0] - 1 >= 0) {
          AIOpponentMoveBlocks.push({
            element: {
              element: { id: `${letters[boardId[0] + 1]}-${boardId[1]}` },
            },
          });
        }
        if (boardId[0] + 1 <= 7) {
          AIOpponentMoveBlocks.push({
            element: {
              element: { id: `${letters[boardId[0] - 1]}-${boardId[1]}` },
            },
          });
        }
      } else {
        checkPieceAlts(
          AIopponentPieces[i],
          id,
          AIOpponentMoveBlocks,
          AIOpponentAttackBlocks
        );
      }
    }
  }
}

function protectKing() {
  const kingBlockId = AIPieces.find((piece) => piece.id.includes("kung"))
    .parentElement.id;

  const attackerBlockID = AIopponentPieces.find((piece) =>
    piece.id.includes(filteredKingAttacks[0].mover)
  ).parentElement.id;

  const pieceAttacks = AIattackBlocks.filter((attack) => {
    if (attack.mover.includes("kung")) {
      return false;
    }
    return attack.element.children[0].id.includes(filteredKingAttacks[0].mover);
  });

  if (pieceAttacks.length > 0) {
    sortByImportance(pieceAttacks);
    pieceAttacks[0].func();
  } else {
    const blockers = [];
    const blockersIds = [];
    const kingNum = Number(kingBlockId[2]);
    const attackerNum = Number(attackerBlockID[2]);
    const kingLetterIndex = letters.indexOf(kingBlockId[0]);
    const attackerLetterIndex = letters.indexOf(attackerBlockID[0]);

    let numIncrementor =
      kingNum > attackerNum ? 1 : kingNum < attackerNum ? -1 : 0;
    let letterIncrementor =
      kingLetterIndex > attackerLetterIndex
        ? 1
        : kingLetterIndex < attackerLetterIndex
        ? -1
        : 0;

    let numCheck = attackerNum + numIncrementor;
    let letterCheckIndex =
      letters.indexOf(attackerBlockID[0]) + letterIncrementor;

    let currentId = `${letters[letterCheckIndex]}-${numCheck}`;
    while (
      currentId != kingBlockId &&
      !filteredKingAttacks[0].mover.includes("häst")
    ) {
      const options = AImoveBlocks.filter((element) => {
        return (
          element.element.id == currentId && !element.mover.includes("kung")
        );
      });

      blockers.push(...options);
      blockersIds.push(currentId);
      numCheck += numIncrementor;
      letterCheckIndex += letterIncrementor;
      currentId = `${letters[letterCheckIndex]}-${numCheck}`;
    }

    if (blockers.length == 0) {
      let pieceMovers = [],
        attackMovers = [];

      filteredKingAttacks.forEach((piece) => {
        checkPieceAlts(
          document.querySelector(`#${piece.mover}`),
          piece.mover,
          pieceMovers,
          attackMovers,
          [
            AIPieces.find((piece) => {
              return piece.id.includes("kung");
            }).parentElement.id,
          ]
        );
      });

      const filteredKingAttackMoves = [...pieceMovers, ...attackMovers];
      for (let i = 0; i < filteredKingAttackMoves.length; i++) {
        filteredKingAttackMoves[i].element.removeEventListener(
          "click",
          filteredKingAttackMoves[i].func
        );
      }

      pieceMovers = pieceMovers.map((piece) => piece.element.id);
      attackMovers = attackMovers.map((piece) => piece.element.id);

      const kingMovers = AImoveBlocks.filter(
        (element) =>
          element.mover.includes("kung") &&
          blockersIds.indexOf(element.element.id) == -1 &&
          pieceMovers.indexOf(element.element.id) == -1 &&
          attackMovers.indexOf(element.element.id) == -1 &&
          AIOpponentMoveBlocks.find(
            (piece) => piece.element.id == element.element.id
          ) == undefined
      );

      if (kingMovers.length > 0) {
        kingMovers[0].func();
      } else {
        console.log("Check mate!");
      }
    } else {
      sortByImportance(blockers);
      blockers[0].func();
    }
  }
}

function sortByImportance(pieceMoves) {
  pieceMoves.sort((a, b) => {
    return pieceImportance(a) - pieceImportance(b);
  });
}

function pieceImportance(piece) {
  switch (true) {
    case piece.mover.includes("kung"):
      return 6;
    case piece.mover.includes("drottning"):
      return 5;
    case piece.mover.includes("löpare"):
      return 4;
    case piece.mover.includes("häst"):
      return 3;
    case piece.mover.includes("torn"):
      return 2;
    case piece.mover.includes("bonde"):
      return 1;
    default:
      return 0;
  }
}
