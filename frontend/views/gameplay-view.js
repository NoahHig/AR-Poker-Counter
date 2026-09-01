import { appState } from '../state.js';

export function mountGameplayView({
  root,
  onAction
}) {
  const controller = new AbortController();
  console.log('Mounting gameplay view');
  root.innerHTML = `
    <script src="https://cdn.jsdelivr.net/gh/aframevr/aframe@1c2407b26c61958baa93967b5412487cd94b290b/dist/aframe-master.min.js"></script>
    <script src="https://raw.githack.com/AR-js-org/AR.js/3.0.0/aframe/build/aframe-ar.js"></script>
    <!-- <script src="https://jeromeetienne.github.io/AR.js/aframe/build/aframe-ar.js"></script> -->

    <a-scene embedded arjs="trackingMethod: best; sourceType: webcam;">
        <a-marker preset="hiro">
            <a-box position='0 0.5 0' material='color: red;'></a-box>
        </a-marker>
        <a-entity camera></a-entity>
    </a-scene>

    <div class="hud">
        <input id="quantityInput" placeholder="Quantity" type="number">
        <button id="addChipsBtn">+10 chips</button>
        <button id="raiseBtn">Raise</button>
        <button id="foldBtn">Fold</button>
        <button id="checkBtn">Check</button>
        <div id="status">Connected</div>
        <div id="chipCount">Chips: ${ appState.game.playersById[appState.session.playerId].chips }</div>
    </div>
  `;
  const quantityInput = document.getElementById('quantityInput');
  const addChipsBtn = document.getElementById('addChipsBtn');
  const raiseBtn = document.getElementById('raiseBtn');
  const foldBtn = document.getElementById('foldBtn');
  const checkBtn = document.getElementById('checkBtn');
  const statusEl = document.getElementById('status');

  addChipsBtn.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value, 10) || 0;
    quantityInput.value = quantity + 10;
  })

  raiseBtn.addEventListener('click', () => {
    // Implement raise logic here
    const quantity = parseInt(quantityInput.value, 10) || 0;
    onAction({ action: 'raise', roomCode: appState.session.roomCode, amount: quantity, playerId: appState.session.playerId });
    // socket.emit('raise', {
    //   roomCode: appState.roomCode,
    //   amount: 10
    // });
    console.log('Raise button clicked');
  });

  foldBtn.addEventListener('click', () => {
    // Implement fold logic here
    onAction({ action: 'fold', roomCode: appState.session.roomCode, amount: 0, playerId: appState.session.playerId });
    // socket.emit('fold', {
    //   roomCode: appState.roomCode
    // });
    console.log('Fold button clicked');
  });

  checkBtn.addEventListener('click', () => {
    // Implement check logic here
    const quantity = parseInt(quantityInput.value, 10) || 0
    onAction({ action: 'check', roomCode: appState.session.roomCode, amount: 0, playerid: appState.session.playerId });
    // socket.emit('check', {
    //   roomCode: appState.roomCode
    // });
    console.log('Check button clicked');
  });

  window.addEventListener(
    'chip-update',
    (event) => {
        // appState.chipsByPlayerId = appState.chipsByPlayerId || {};
        const players = event.detail.lobby.players;
        players.forEach(p => {
            appState.game.playersById[p.playerId] = p;
        })
        // appState.game.playersById = event.detail.playersById;
        appState.session.chips = appState.game.playersById[appState.playerId].chips;
        document.querySelector('#chipCount').textContent = `Chips: ${appState.session.chips}`;
        document.querySelector('#markerText').setAttribute('value', `Chips: ${appState.session.chips}`);
    });

    window.addEventListener(
        'message',
        (event) => {
            statusEl.textContent = event.detail.message;
        }
    )

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