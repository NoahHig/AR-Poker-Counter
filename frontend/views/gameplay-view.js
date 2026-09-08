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
                    : `Call ${appState.game.bet ?? 0}`
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

//   root.innerHTML = `
//   <section class="info stack">
//     <div class="horizontal">
//       <span class="status">Room ${appState.game.roomCode}</span>
//       <span class="status">Round ${appState.game.round}/4</span>
//     </div>

//     <div class="card">
//       <span class="label">Current turn</span>
//       <strong class="value">
//         ${appState.game.playersById[appState.game.playerIds[appState.game.turn]]?.playerName ?? 'Waiting for players'}
//       </strong>
//     </div>

//     <ul id="playerList" class="player-list">
//       ${appState.game.playerIds
//         .map((playerId) => {
//           const player = appState.game.playersById[playerId];
//           const isCurrentPlayer =
//             playerId === appState.game.playerIds[appState.game.turn];

//           return `
//             <li class="player-row ${isCurrentPlayer ? 'current-player' : ''}">
//               <span class="player-avatar">
//                 ${player.playerName.charAt(0).toUpperCase()}
//               </span>

//               <div>
//                 <div class="player-name">${player.playerName}</div>
//                 <div class="player-detail">
//                   ${player.folded ? 'Folded' : player.allIn ? 'All-in' : `Bet: ${player.bet}`}
//                 </div>
//               </div>

//               <span class="player-chips">${player.chips}</span>
//             </li>
//           `;
//         })
//         .join('')}
//     </ul>
//   </section>

//   <section class="hud">
//     <div class="game-hud">
//       <div class="game-stats">
//         <div class="stat-pill">
//           <span class="label">Pot</span>
//           <strong id="potLabel" class="value chip-value">${appState.game.pot}</strong>
//         </div>

//         <div class="stat-pill">
//           <span class="label">To call</span>
//           <strong id="betLabel" class="value chip-value">${appState.game.bet}</strong>
//         </div>
//       </div>
        
//       <div class="action-controls" data-action-controls>
//         <button class="danger" data-action="fold">Fold</button>
//         <button class="secondary" data-action="call">Call</button>
//         <input
//           class="raise-input"
//           type="number"
//           min="1"
//           value="1"
//           data-raise-amount
//         />
//         <button data-action="raise">Raise</button>
//       </div>
//     </div>
//   </section>
//   <div id="status">Connected</div>
// `;

//   root.innerHTML = `
//     <script src="https://cdn.jsdelivr.net/gh/aframevr/aframe@1c2407b26c61958baa93967b5412487cd94b290b/dist/aframe-master.min.js"></script>
//     <script src="https://raw.githack.com/AR-js-org/AR.js/3.0.0/aframe/build/aframe-ar.js"></script>
//     <!-- <script src="https://jeromeetienne.github.io/AR.js/aframe/build/aframe-ar.js"></script> -->

//     <a-scene embedded arjs="trackingMethod: best; sourceType: webcam;">
//         <a-marker preset="hiro">
//             <a-box position='0 0.5 0' material='color: red;'></a-box>
//         </a-marker>
//         <a-entity camera></a-entity>
//     </a-scene>

//     <div class="game">
//         <p id="turnLabel">Turn: </p>
//         <p id="roundLabel">Round: </p>
//         <p id="betLabel">Bet: </p>
//         <p id="potLabel">Pot: </p>
//         <ul id="playerList">
//             <p>Players:</p>
//             ${appState.game.playerIds.map(playerId => {
//                 const p = appState.game.playersById[playerId];
//                 return `<li${playerId === appState.session.playerId ? ` class="current-player"` : ``}>
//                     ${p.playerName} - Chips: ${p.chips}
//                 </li>`
//             }).join('')}
//         </ul>
//     </div

//     <div class="hud">
//         <input id="quantityInput" placeholder="Quantity" type="number">
//         <button id="addChipsBtn">+10 chips</button>
//         <button id="raiseBtn">Raise</button>
//         <button id="foldBtn">Fold</button>
//         <button id="callBtn">Call</button>
//         <div id="status">Connected</div>
//         <div id="chipCount">Chips: ${ appState.game.playersById[appState.session.playerId].chips }</div>
//     </div>
//   `;

  const turnLabel = document.getElementById('turnLabel');
  const roundLabel = document.getElementById('roundLabel');
  const betLabel = document.getElementById('betLabel');
  const potLabel = document.getElementById('potLabel');
  const playerList = document.getElementById('playerList');
  
  const quantityInput = document.getElementById('quantityInput');
//   const addChipsBtn = document.getElementById('addChipsBtn');
//   const raiseBtn = document.getElementById('raiseBtn');
//   const foldBtn = document.getElementById('foldBtn');
//   const callBtn = document.getElementById('callBtn');
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

//   addChipsBtn.addEventListener('click', () => {
//     const quantity = parseInt(quantityInput.value, 10) || 0;
//     quantityInput.value = quantity + 10;
//   })

//   raiseBtn.addEventListener('click', () => {
//     // Implement raise logic here
//     const quantity = parseInt(quantityInput.value, 10) || 0;
//     onAction({ action: 'raise', roomCode: appState.session.roomCode, amount: quantity, playerId: appState.session.playerId });
//     // socket.emit('raise', {
//     //   roomCode: appState.roomCode,
//     //   amount: 10
//     // });
//     console.log('Raise button clicked');
//   });

//   foldBtn.addEventListener('click', () => {
//     // Implement fold logic here
//     onAction({ action: 'fold', roomCode: appState.session.roomCode, amount: 0, playerId: appState.session.playerId });
//     // socket.emit('fold', {
//     //   roomCode: appState.roomCode
//     // });
//     console.log('Fold button clicked');
//   });

//   callBtn.addEventListener('click', () => {
//     // Implement call logic here
//     const quantity = parseInt(quantityInput.value, 10) || 0
//     onAction({ action: 'call', roomCode: appState.session.roomCode, amount: 0, playerId: appState.session.playerId });
//     // socket.emit('call', {
//     //   roomCode: appState.roomCode
//     // });
//     console.log('Call button clicked');
//   });

  window.addEventListener(
    'update-screen',
    (event) => {
        if (appState.game.phase === 'gameplay') {
            // appState.chipsByPlayerId = appState.chipsByPlayerId || {};
            // appState.game.playersById = event.detail.playersById;
            // appState.session.chips = appState.game.playersById[appState.playerId].chips;
            document.querySelector('#chipCount').textContent = `Chips: ${appState.game.playersById[appState.session.playerId].chips}`;
            // document.querySelector('#markerText').setAttribute('value', `Chips: ${appState.game.playersById[appState.session.playerId].chips}`);

            turnLabel.textContent = `Turn: ${appState.game.playersById[appState.game.playerIds[appState.game.turn]].playerName}`;
            // turnLabel.textContent = `Turn: ${appState.game.turn}`;
            roundLabel.textContent = `Round: ${appState.game.round}`;
            betLabel.textContent = `Bet: ${appState.game.bet}`;
            potLabel.textContent = `Pot: ${appState.game.pot}`;
            playerList.innerHTML = `${appState.game.playerIds
            .map((playerId) => {
                const player = appState.game.playersById[playerId];
                const isCurrentPlayer =
                    playerId === appState.game.playerIds[appState.game.turn];

                return `
                    <li class="player-row ${isCurrentPlayer ? 'current-player' : ''}">
                    <span class="player-avatar">
                        ${player.playerName.charAt(0).toUpperCase()}
                    </span>

                    <div>
                        <div class="player-name">${player.playerName}</div>
                        <div class="player-detail">
                            ${player.folded ? 'Folded' : player.allIn ? 'All-in' : `Bet: ${player.bet}`}
                        </div>
                    </div>

                    <span class="player-chips">${player.chips}</span>
                    </li>
                `;
                })
            .join('')}`;
            // playerList.innerHTML = `<p>Players:</p>
            // ${appState.game.playerIds.map(playerId => {
            //     const p = appState.game.playersById[playerId];
            //     return `<li${playerId === appState.session.playerId ? ` class="current-player"` : ``}>
            //         ${appState.game.playerIds.indexOf[playerId] === appState.game.turn ? '>' : ''}${p.playerName} - Chips: ${p.chips}
            //     </li>`
            // }).join('')}`;
        }
    });

    window.addEventListener(
        'message',
        (event) => {
            // statusEl.textContent = event.detail.message;
        });

//   socket.on('chip-update', (payload) => {
//     appState.chips = payload.chips;
//     document.querySelector('#chipCount').textContent = `Chips: ${payload.chips}`;
//     document.querySelector('#markerText').setAttribute('value', `Chips: ${payload.chips}`);
//   });

  return {
    unmount() {
      controller.abort();
      root.innerHTML = '';
    }
  };
}