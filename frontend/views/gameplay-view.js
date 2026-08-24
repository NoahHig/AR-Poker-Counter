export function mountGameplayView({
  root,
  onCreateGame,
  onJoinGame
}) {
  const controller = new AbortController();

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
        <input id="roomCode" placeholder="Game code" />
        <input id="playerName" placeholder="Player name" />
        <button id="joinBtn">Join game</button>
        <button id="addChipsBtn">+10 chips</button>
        <button id="raiseBtn">Raise</button>
        <button id="foldBtn">Fold</button>
        <button id="checkBtn">Check</button>
        <div id="status">Not connected</div>
        <div id="chipCount">Chips: --</div>
    </div>
  `;
  const joinBtn = document.getElementById('joinBtn');
  const addChipsBtn = document.getElementById('addChipsBtn');
  const raiseBtn = document.getElementById('raiseBtn');
  const foldBtn = document.getElementById('foldBtn');
  const checkBtn = document.getElementById('checkBtn');
  const statusEl = document.getElementById('status');

  raiseBtn.addEventListener('click', () => {
    // Implement raise logic here
    socket.emit('raise', {
      roomCode: appState.roomCode,
      amount: 10
    });
    console.log('Raise button clicked');
  });

  foldBtn.addEventListener('click', () => {
    // Implement fold logic here
    socket.emit('fold', {
      roomCode: appState.roomCode
    });
    console.log('Fold button clicked');
  });

  checkBtn.addEventListener('click', () => {
    // Implement check logic here
    socket.emit('check', {
      roomCode: appState.roomCode
    });
    console.log('Check button clicked');
  });

  socket.on('chip-update', (payload) => {
    appState.chips = payload.chips;
    document.querySelector('#chipCount').textContent = `Chips: ${payload.chips}`;
    document.querySelector('#markerText').setAttribute('value', `Chips: ${payload.chips}`);
  });

  return {
    unmount() {
      controller.abort();
      root.innerHTML = '';
    }
  };
}