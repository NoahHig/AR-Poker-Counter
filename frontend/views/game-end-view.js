import { appState } from '../state.js';

export function mountGameEndView({
  root,
  onSelectWinner
}) {
  const controller = new AbortController();
  console.log('Mounting gameplay view');
    root.innerHTML = `
    <section class="info stack">
        ${appState.session.isHost ? 
            `
            <div class="horizontal">
                <span class="status">Game Ended - Select Winner</span>
                <span class="status">Room ${appState.game.roomCode || '----'}</span>
            </div>
            <section class="card stack" aria-label="Players at the table">
            <div>
                <span class="label">Table seats</span>
                <h2>Players</h2>
            </div>

            <form id="select-winner-form" class="card stack">
                <ul id="player-select" class="player-list winner-select">
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
                            <input type="radio" name="winner-id" value=${playerId}>

                            <span class="player-avatar">
                                ${(player.playerName || '?').charAt(0).toUpperCase()}
                            </span>

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

                            <span class="player-chips">${player.chips ?? 0}</span>
                        </li>
                        `;
                    })
                    .join('')}
                </ul>
                <div class="horizontal">
                    <button type="submit">Award Chips</button>
                </div>
            </form>
            </section>
            `
            :
            `
            <div class="horizontal">
                <span class="status">Game Ended - Waiting for Host</span>
                <span class="status">Room ${appState.game.roomCode || '----'}</span>
            </div>
            `
        }
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
  
  const statusEl = document.getElementById('status');
  const selectWinnerForm = document.getElementById('select-winner-form');
  const winnerIdInput = document.getElementById('winner-id-input');

  selectWinnerForm.addEventListener('submit', async (event) =>{
    event.preventDefault();

    const formData = new FormData(selectWinnerForm);
    const playerId = formData.get('winner-id');

    onSelectWinner({ roomCode: appState.session.roomCode, playerId: playerId });
  }, { signal: controller.signal });

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