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
                Share this room code. Players who join will appear below.
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
  
    const playerList = document.getElementById('player-list');
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

    return {
        unmount() {
            controller.abort();
            root.innerHTML = '';
        }
    };
}