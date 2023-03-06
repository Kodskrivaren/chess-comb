let socket,
  currentRoomId = -1;

function setUpSocketConnection(adress) {
  socket = new WebSocket(adress, ["Test"]);

  socket.onopen = function (e) {
    console.log("Connection established");
  };

  socket.onmessage = (event) => {
    const data = event.data;
    commandHandler(data);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
      );
    } else {
      socket = null;
      removeAllPieces();
      setLostServerConnectionPage();
      console.log("Connection failed! Please check your connection!");
    }
  };

  socket.onerror = function (error) {
    console.log(error);
  };
}

function commandHandler(command) {
  switch (true) {
    case command.includes("start-"):
      gameMode = "online";
      if (command.includes("white")) {
        amIWhite = true;
        myTurn = true;
      } else {
        amIWhite = false;
        myTurn = false;
      }
      playfield.parentElement.style = amIWhite
        ? ""
        : "transform: rotateZ(180deg)";
      startGame();
      break;
    case command.includes("moved"):
      synchronizeMove(command);
      break;
    case command == "full server":
      const serverMessage = document.querySelector("#serverMessage");
      serverMessage.textContent =
        "Server is full! Sorry for the inconvenience!";
      serverMessage.hidden = false;
      break;
    case command.startsWith("rooms"):
      if (currentRoomId != -1) return;
      setOnlineRoomsScreen(command.replace("rooms ", ""));
      break;
    case command.startsWith("connected-room"):
      const roomId = Number(command.replace("connected-room ", ""));
      onConnectedToRoom(roomId);
      break;
    case command.startsWith("opponent-disconnected"):
      currentRoomId = -1;
      socket.close();
      removeAllPieces();
      socket = null;
      setOpponentLeftScreen();
      break;
    default:
      console.log(command);
  }
}

function disconnectFromRoom() {
  socket.send("disconnect-room " + currentRoomId);
  currentRoomId = -1;
}

function onConnectedToRoom(roomId) {
  currentRoomId = roomId;
  setConnectedRoomPage(currentRoomId + 1);
}

function connectToRoom(roomId) {
  socket.send("join-room " + roomId);
}

function synchronizeMove(command) {
  const commandArr = command.split(" ");
  const piece = document.querySelector(`#${commandArr[1]}`);
  const block = document.querySelector(`#${commandArr[2]}`);
  if (block.children.length > 0) {
    block.childNodes[0].remove();
  }
  block.append(piece);
  myTurn = true;
  winConditionMet();
  isKingInCheck();
}
