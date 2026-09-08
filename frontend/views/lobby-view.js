import { appState } from '../state.js';

console.log('Mounting lobby view');
export function mountLobbyView({
    root,
    onStartGame
}) {
    const controller = new AbortController();
    console.log(appState.game.playerIds);
    root.innerHTML = `
    <section class="info stack">
        <div class="horizontal">
        <span class="status">Lobby open</span>
        <span class="status">
            ${appState.game.playerIds.length} player${
                appState.game.playerIds.length === 1 ? '' : 's'
            }
        </span>
        </div>

        <div class="card stack">
        <div>
            <span class="label">Private table</span>
            <h1>Waiting for players</h1>
            <p>
            S   hare this room code. Players who join will appear below.
            </p>
        </div>

        <div class="card">
            <span class="label">Room code</span>
            <strong class="value chip-value">
                ${appState.session.roomCode || '----'}
            </strong>
        </div>
        </div>

        <section class="card stack" aria-label="Players in lobby">
        <div class="horizontal">
            <div>
            <span class="label">Table seats</span>
            <h2>Players</h2>
            </div>
        </div>

        <ul id="player-list" class="player-list">
            ${
            appState.game.playerIds.length === 0
                ? `
                <li class="player-row">
                    <span class="player-avatar">?</span>
                    <div>
                        <div class="player-name">No players yet</div>
                        <div class="player-detail">Waiting for a player to join</div>
                    </div>
                    <span class="player-chips">—</span>
                </li>
                `
                : appState.game.playerIds
                    .map((playerId) => {
                        const player = appState.game.playersById[playerId];

                        if (!player) {
                            return '';
                        }

                        const isLocal =
                            player.playerId === appState.session.playerId;

                        return `
                            <li class="player-row ${isLocal ? 'current-player' : ''}">
                            <span class="player-avatar">
                                ${(player.playerName || '?').charAt(0).toUpperCase()}
                            </span>

                            <div>
                                <div class="player-name">
                                ${player.playerName || 'Unknown player'}
                                ${isLocal ? ' (You)' : ''}
                                </div>

                                <div class="player-detail">
                                ${
                                    player.connected === false
                                    ? 'Disconnected'
                                    : player.isHost
                                        ? 'Host'
                                        : 'Ready'
                                }
                                </div>
                            </div>

                            <span class="player-chips">
                                ${player.chips ?? 0}
                            </span>
                            </li>
                        `;
                    })
                    .join('')
            }
        </ul>
        </section>
    </section>

    <section class="hud">
        <div class="game-hud">
            <div>
                <span class="label">Host controls</span>
                <p>
                    ${
                        appState.session.isHost
                        ? appState.game.playerIds.length >= 2
                            ? 'Players are seated. Start whenever the table is ready.'
                            : 'At least two players are needed to begin.'
                        : 'Waiting for the host to start the hand.'
                    }
                </p>
            </div>

            <div class="action-controls">
                ${
                appState.session.isHost
                    ? `
                    <button
                        id="start-game-button"
                        type="button"
                        ${appState.game.playerIds.length < 2 ? 'disabled' : ''}
                    >
                        Start hand
                    </button>
                    `
                    : `
                    <button class="secondary" type="button" disabled>
                        Waiting for host
                    </button>
                    `
                }
            </div>
        </div>
    </section>
    `;
    // root.innerHTML = `
    //     <h1>AR Poker Counter</h1>
    //     <div id="lobbyInfo">Room Code: ${appState.session.roomCode || '--'}</div>
    //     <ul id="playerList">
    //         <p>Players in lobby:</p>
    //         ${appState.game.playerIds.map(playerId => {
    //             const p = appState.game.playersById[playerId];
    //             return `<li${playerId === appState.session.playerId ? ` class="current-player"` : ``}>
    //                 ${p.playerName} - Chips: ${p.chips}
    //             </li>`
    //         }).join('')}
    //     </ul>
    //     <div class="hud">
    //         <div id="status">Joined lobby!</div>
    //         <div id="chipCount">Chips: ${appState.session.chips || '--'}</div>
    //         <button id="startGameBtn"${appState.session.isHost ? `` : ` style="display: none;"`}>Start Game</button>
    //     </div>
    // `;
  
    const playerList = document.getElementById('player-list');
    // const joinBtn = document.getElementById('joinBtn');
    // const roomInfo = document.getElementById('roomInfo');
    const statusEl = document.getElementById('status');
    const startGameBtn = document.getElementById('start-game-button');

    startGameBtn.addEventListener('click', () => {
        if (appState.session.isHost) {
            onStartGame({ roomCode: appState.session.roomCode });
        }
    })

    window.addEventListener(
        'message',
        (event) => {
            // statusEl.textContent = event.detail.message;
        }
    );

    window.addEventListener(
        'update-screen',
        (event) => {
            if (appState.game.phase === 'lobby') {
                // appState.chipsByPlayerId = appState.chipsByPlayerId || {};
                // appState.game.playersById = event.detail.playersById;
                // appState.session.chips = appState.game.playersById[appState.playerId].chips;
                // document.querySelector('#chipCount').textContent = `Chips: ${appState.game.playersById[appState.session.playerId].chips}`;
                // document.querySelector('#markerText').setAttribute('value', `Chips: ${appState.game.playersById[appState.session.playerId].chips}`);
    
                playerList.innerHTML = `${
                appState.game.playerIds.length === 0
                    ? `
                    <li class="player-row">
                        <span class="player-avatar">?</span>
                        <div>
                            <div class="player-name">No players yet</div>
                            <div class="player-detail">Waiting for a player to join</div>
                        </div>
                        <span class="player-chips">—</span>
                    </li>
                    `
                    : appState.game.playerIds
                        .map((playerId) => {
                            const player = appState.game.playersById[playerId];

                            if (!player) {
                                return '';
                            }

                            const isLocal =
                                player.playerId === appState.session.playerId;

                            return `
                                <li class="player-row ${isLocal ? 'current-player' : ''}">
                                <span class="player-avatar">
                                    ${(player.playerName || '?').charAt(0).toUpperCase()}
                                </span>

                                <div>
                                    <div class="player-name">
                                    ${player.playerName || 'Unknown player'}
                                    ${isLocal ? ' (You)' : ''}
                                    </div>

                                    <div class="player-detail">
                                    ${
                                        player.connected === false
                                        ? 'Disconnected'
                                        : player.isHost
                                            ? 'Host'
                                            : 'Ready'
                                    }
                                    </div>
                                </div>

                                <span class="player-chips">
                                    ${player.chips ?? 0}
                                </span>
                                </li>
                            `;
                        })
                        .join('')
                }`;
                // playerList.innerHTML = `<p>Players in lobby:</p>
                // ${appState.game.playerIds.map(playerId => {
                //     const p = appState.game.playersById[playerId];
                //     return `<li${playerId === appState.session.playerId ? ` class="current-player"` : ``}>
                //         ${p.playerName} - Chips: ${p.chips}
                //     </li>`
                // }).join('')}`;
            }
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