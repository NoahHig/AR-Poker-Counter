import { appState } from '../state.js';

export function mountGameplayView({
  root,
  onAction
}) {
  const controller = new AbortController();
  console.log('Mounting gameplay view');
    root.innerHTML = `
    <section class="info stack">
        <div class="horizontal">
            <span class="status">Hand in progress</span>
            <span class="status">Room ${appState.game.roomCode || '----'}</span>
        </div>

        <div class="card stack">
            <span class="label">Current turn</span>
            <strong class="value">
                ${
                appState.game.playersById[
                    appState.game.playerIds[appState.game.turn]
                ]?.playerName ?? 'Waiting for players'
                }
            </strong>
            <p>
                ${
                appState.game.playerIds[appState.game.turn] ===
                appState.session.playerId
                    ? 'It is your turn. Choose an action below.'
                    : 'Waiting for the current player to act.'
                }
            </p>
        </div>

        <section class="card stack" aria-label="Players at the table">
        <div>
            <span class="label">Table seats</span>
            <h2>Players</h2>
        </div>

        <ul class="player-list">
            ${appState.game.playerIds
            .map((playerId, index) => {
                const player = appState.game.playersById[playerId];

                if (!player) {
                    return '';
                }

                const isCurrentPlayer = index === appState.game.turn;
                const isLocal = player.playerId === appState.session.playerId;

                return `
                <li class="player-row ${isCurrentPlayer ? 'current-player' : ''}">
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
                        player.folded
                            ? 'Folded'
                            : player.allIn
                            ? 'All-in'
                            : isCurrentPlayer
                                ? 'Acting now'
                                : `Bet: ${player.bet ?? 0}`
                        }
                    </div>
                    </div>

                    <span class="player-chips">${player.chips ?? 0}</span>
                </li>
                `;
            })
            .join('')}
        </ul>
        </section>
    </section>

    <section class="hud">
        <div class="game-hud">
        <div class="game-stats">
            <div class="stat-pill">
                <span class="label">Round</span>
                <strong class="value">${appState.game.round ?? 1}</strong>
            </div>

            <div class="stat-pill">
                <span class="label">Pot</span>
                <strong class="value chip-value">${appState.game.pot ?? 0}</strong>
            </div>

            <div class="stat-pill">
                <span class="label">To call</span>
                <strong class="value chip-value">${appState.game.bet ?? 0}</strong>
            </div>
        </div>

        <div class="action-controls" data-action-controls>
            <button
            class="danger"
            type="button"
            data-action="fold"
            ${
                appState.game.playerIds[appState.game.turn] ===
                appState.session.playerId
                ? ''
                : 'disabled'
            }
            >
                Fold
            </button>

            <button
            class="secondary"
            type="button"
            data-action="call"
            ${
                appState.game.playerIds[appState.game.turn] ===
                appState.session.playerId
                ? ''
                : 'disabled'
            }
            >
                ${
                    appState.game.bet === 0
                    ? 'Check'
                    : appState.game.bet - appState.game.playersById[appState.session.playerId].bet <= appState.game.playersById[appState.session.playerId].chips
                    ? `Call ${appState.game.bet ?? 0}`
                    : `All In ${appState.game.bet ?? 0}`
                }
            </button>

            <input
            class="raise-input"
            type="number"
            min="1"
            value="1"
            data-raise-amount
            aria-label="Raise amount"
            ${
                appState.game.playerIds[appState.game.turn] ===
                appState.session.playerId
                ? ''
                : 'disabled'
            }
            />

            <button
            type="button"
            data-action="raise"
            ${
                appState.game.playerIds[appState.game.turn] ===
                appState.session.playerId
                ? ''
                : 'disabled'
            }
            >
                Raise
            </button>
        </div>
        </div>
    </section>
    `;
//     <a-scene embedded arjs="trackingMethod: best; sourceType: webcam;">
//         <a-marker preset="hiro">
//             <a-box position='0 0.5 0' material='color: red;'></a-box>
//         </a-marker>
//         <a-entity camera></a-entity>
//     </a-scene>

  const turnLabel = document.getElementById('turnLabel');
  const roundLabel = document.getElementById('roundLabel');
  const betLabel = document.getElementById('betLabel');
  const potLabel = document.getElementById('potLabel');
  const playerList = document.getElementById('playerList');
  
  const quantityInput = document.getElementById('quantityInput');
  const statusEl = document.getElementById('status');
  const actions = root.querySelector('[data-action-controls]');

    actions.addEventListener(
    'click',
    async (event) => {
        // The user might click an icon/span inside a button,
        // so closest() finds the enclosing action button.
        const button = event.target.closest('button[data-action]');

        if (!button || !actions.contains(button)) {
            return;
        }

        const action = button.dataset.action;

        let amount = 0;

        if (action === 'raise') {
            const raiseInput = actions.querySelector('[data-raise-amount]');
            amount = Number(raiseInput.value);

            if (!Number.isFinite(amount) || amount <= 0) {
                window.alert('Enter a raise amount greater than zero.');
                raiseInput.focus();
                return;
            }
        }

        try {
            await onAction({
                action,
                amount,
                roomCode: appState.session.roomCode,
                playerId: appState.session.playerId
            });
        } catch (error) {
            window.alert(error.message || 'The server did not accept that action.');
        }
    },
    { signal: controller.signal }
    );

    window.addEventListener(
        'message',
        (event) => {
            // statusEl.textContent = event.detail.message;
        });

  return {
    unmount() {
      controller.abort();
      root.innerHTML = '';
    }
  };
}