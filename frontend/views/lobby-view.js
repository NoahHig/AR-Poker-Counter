import { appState } from '../state.js';

console.log('Mounting lobby view');
export function mountLobbyView({
    root,
    onStartGame
}) {
    const controller = new AbortController();
    console.log(appState.game.playerIds);
    root.innerHTML = `
        <h1>AR Poker Counter</h1>
        <div id="lobbyInfo">Room Code: ${appState.session.roomCode || '--'}</div>
        <ul id="playerList">
            <p>Players in lobby:</p>
            ${appState.game.playerIds.map(playerId => {
                const p = appState.game.playersById[playerId];
                return `<li${playerId === appState.session.playerId ? ` class="current-player"` : ``}>
                    ${p.playerName} - Chips: ${p.chips}
                </li>`
            }).join('')}
        </ul>
        <div class="hud">
            <div id="status">Joined lobby!</div>
            <div id="chipCount">Chips: ${appState.session.chips || '--'}</div>
            <button id="startGameBtn"${appState.session.isHost ? `` : ` style="display: none;"`}>Start Game</button>
            <div>Test</div>
        </div>
    `;
  
    const playerList = document.getElementById('playerList');
    const joinBtn = document.getElementById('joinBtn');
    const roomInfo = document.getElementById('roomInfo');
    const statusEl = document.getElementById('status');
    const startGameBtn = document.getElementById('startGameBtn');

    startGameBtn.addEventListener('click', () => {
        if (appState.session.isHost) {
            onStartGame({ roomCode: appState.session.roomCode });
        }
    })

    window.addEventListener(
        'message',
        (event) => {
            statusEl.textContent = event.detail.message;
        }
    );

    window.addEventListener(
        'update-screen',
        (event) => {
            // appState.chipsByPlayerId = appState.chipsByPlayerId || {};
            // appState.game.playersById = event.detail.playersById;
            // appState.session.chips = appState.game.playersById[appState.playerId].chips;
            document.querySelector('#chipCount').textContent = `Chips: ${appState.game.playersById[appState.session.playerId].chips}`;
            // document.querySelector('#markerText').setAttribute('value', `Chips: ${appState.game.playersById[appState.session.playerId].chips}`);
  
          playerList.innerHTML = `<p>Players in lobby:</p>
            ${appState.game.playerIds.map(playerId => {
                const p = appState.game.playersById[playerId];
                return `<li${playerId === appState.session.playerId ? ` class="current-player"` : ``}>
                    ${p.playerName} - Chips: ${p.chips}
                </li>`
            }).join('')}`;
        });

//   window.addEventListener(
//     'joined-lobby',
//     (event) => {
//         statusEl.textContent = `${event.detail.playerName} has joined the lobby!`;
//         statusEl.style.color = 'green';
//         playerList.innerHTML += `<li>${event.detail.playerName} - Chips: ${event.detail.chips}</li>`;  
//     }
//   )

    return {
        unmount() {
            controller.abort();
            root.innerHTML = '';
        }
    };
}