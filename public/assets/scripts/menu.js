function setMainMenu() {
  pageMenu.innerHTML = `
    <h1 class="page-title">Welcome to Chess!</h1>
    <button class="btn" onclick="startButtonClick()">Start</button>`;
}

function startButtonClick() {
  setChoicesMenu();
}

function setChoicesMenu() {
  pageMenu.innerHTML = `
    <div class="choice-menu">
        <button class="btn" onclick="playAsWhite(true)">Play as White against AI</button>
        <button class="btn" onclick="playAsWhite(false)">Play as Black against AI</button>
        <button class="btn" onclick="localMultiplayerClick()">Play local multiplayer</button>
        <button class="btn" onclick="onlinePlayClick()">Play online</button>
    </div>`;
}

function onlinePlayClick() {
  pageMenu.innerHTML = `
  <input type="password" class="server-adress-input" placeholder="Password"/>
  <p class="page-title" id="serverMessage" hidden></p>
  <button class="btn" onclick="attemptConnection()">Connect</button>`;
}

function attemptConnection() {
  const password = document.querySelector(".server-adress-input").value;
  const url = window.location.href;
  const adress = `${url.includes("localhost") ? "ws" : "wss"}${url.substring(
    url.indexOf(":"),
    url.length
  )}?password=${password}`;
  setUpSocketConnection(adress, password);
}

function setGameOverScreen(winMessage) {
  pageMenu.style = "";
  pageMenu.innerHTML = `
  <h1 class="page-title">${winMessage}</h1>
  <button class="btn" onclick="restartGameClick()">Restart</button>`;
}

function setOnlineRoomsScreen(command) {
  const rooms = command.split(" ");
  pageMenu.innerHTML = `
    <h1 class="page-title">Lobby</h1>
  `;
  for (let i = 0; i < rooms.length; i++) {
    const roomSize = rooms[i];
    pageMenu.innerHTML += `
    <div class="room-container">
      <p>Room: ${i + 1}</p>
      <p>Current players: ${roomSize}</p>
      <button class="btn" onclick="connectToRoom(${i})" 
      ${roomSize == 2 ? "disabled" : ""}>Connect to room</button>
    </div>`;
  }
}

function setConnectedRoomPage(room) {
  pageMenu.innerHTML = `
  <h2 class="page-title">Connected to Room: ${room}</h2>
  <p class="page-title">Waiting for other player...</p>
  <button class="btn" onclick="disconnectFromRoom()">Leave room</button>
  `;
}

function setLostServerConnectionPage() {
  pageMenu.style = "";
  pageMenu.innerHTML = `
  <h2 class="page-title">Server connection lost!</h2>
  <button class="btn" onclick="onlinePlayClick()">Return Multiplayer Screen</button>
  <button class="btn" onclick="setMainMenu()">Return to main menu</button>
  `;
}

function setOpponentLeftScreen() {
  pageMenu.style = "";
  pageMenu.innerHTML = `
  <h2 class="page-title">Your opponent left the room!</h2>
  <button class="btn" onclick="setMainMenu()">Return to main menu</button>
  `;
}

function restartGameClick() {
  setChoicesMenu();
  pageCover.style = "";
  removeAllPieces();
  it = 0;
}
