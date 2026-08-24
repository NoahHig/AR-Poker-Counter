import { socket } from '../socket-client.js';
import { appState } from '../state.js';

console.log('Mounting lobby view');
export function mountLobbyView({
  root,
  onStartGame
}) {
  const controller = new AbortController();

  root.innerHTML = `
    <h1>AR Poker Counter</h1>
    <div id="lobbyInfo">Room Code: ${appState.roomCode || '--'}</div>
    <ul id="playerList">
        <p>Players in lobby:</p>
        ${appState.players.map(p => `<li>${p.playerName} - Chips: ${p.chips}</li>`).join('')}
    </ul>
    <div class="hud">
        <div id="status">Joined lobby!</div>
        <div id="chipCount">Chips: ${appState.chips || '--'}</div>
        <button id="startGameBtn"${appState.isHost ? `` : ` style="display: none;"`}>Start Game</button>
        <div>Test</div>
    </div>
    `;
  
  const playerList = document.getElementById('playerList');
  const joinBtn = document.getElementById('joinBtn');
  const roomInfo = document.getElementById('roomInfo');
  const statusEl = document.getElementById('status');
  const startGameBtn = document.getElementById('startGameBtn');

  startGameBtn.addEventListener('click', () => {
    if (appState.isHost) {
        onStartGame({ roomCode: appState.roomCode });
    }
  })

  window.addEventListener(
    'joined-lobby',
    (event) => {
        statusEl.textContent = `${event.detail.playerName} has joined the lobby!`;
        statusEl.style.color = 'green';
        playerList.innerHTML += `<li>${event.detail.playerName} - Chips: ${event.detail.chips}</li>`;  
    }
  )

  return {
    unmount() {
      controller.abort();
      root.innerHTML = '';
    }
  };
}