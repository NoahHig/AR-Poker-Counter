if (typeof io === 'undefined') {
  throw new Error(
    'Socket.IO client library is missing. ' +
    'Load <script src="/socket.io/socket.io.js"></script> before main.js.'
  );
}

// Because index.html is served by the same Express/Socket.IO server,
// io() connects back to the same protocol, hostname, and port.
export const socket = io({
  autoConnect: true,
  timeout: 5000
});

socket.on('connect', () => {
  console.log('[socket] connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('[socket] disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('[socket] connection error:', error.message);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('[socket] reconnecting; attempt:', attemptNumber);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('[socket] reconnected after attempt:', attemptNumber);
});

// export const socket = io('http://localhost:3000');

// const appState = {
//   roomCode: null,
//   playerName: '',
//   chips: 0,
//   chipsByPlayerId: {},
//   visibleMarkerId: null,
//   connected: false
// };

// const roomCodeInput = document.getElementById('roomCode');
// const playerNameInput = document.getElementById('playerName');
// const joinBtn = document.getElementById('joinBtn');
// const addChipsBtn = document.getElementById('addChipsBtn');
// const statusEl = document.getElementById('status');
// const raiseBtn = document.getElementById('raiseBtn');
// const foldBtn = document.getElementById('foldBtn');
// const checkBtn = document.getElementById('checkBtn');

// joinBtn.addEventListener('click', () => {
//   const roomCode = roomCodeInput.value.trim().toUpperCase();
//   const playerName = playerNameInput.value.trim() || 'Player';
//   console.log(`Joining game with code: ${roomCode} and name: ${playerName}`);
//   socket.emit('join-game', {
//     roomCode,
//     playerName
//   }, message => {
//     console.log('Join game response:', message);
//     if (!message.success) {
//       statusEl.textContent = `Failed to join game: ${message.message}`;
//       return;
//     }
//     appState.roomCode = roomCode;
//     appState.playerName = message.playerName;
//     appState.chips = message.chips;
//     appState.connected = true;
//     statusEl.textContent = `Joined ${roomCode} as ${message.playerName}`;
//     document.querySelector('#chipCount').textContent = `Chips: ${message.chips}`;
//   });
// });

// addChipsBtn.addEventListener('click', () => {
//   const roomCode = roomCodeInput.value.trim().toUpperCase();
//   socket.emit('add-chips', {
//     roomCode,
//     amount: 10
//   });
// });

// raiseBtn.addEventListener('click', () => {
//   // Implement raise logic here
//   socket.emit('raise', {
//     roomCode: appState.roomCode,
//     amount: 10
//   });
//   console.log('Raise button clicked');
// });

// foldBtn.addEventListener('click', () => {
//   // Implement fold logic here
//   socket.emit('fold', {
//     roomCode: appState.roomCode
//   });
//   console.log('Fold button clicked');
// });

// checkBtn.addEventListener('click', () => {
//   // Implement check logic here
//   socket.emit('check', {
//     roomCode: appState.roomCode
//   });
//   console.log('Check button clicked');
// });

socket.on('connection', () => {
  console.log('Client connected');
  // statusEl.textContent = 'Socket connected';
});

socket.on('message', (payload) => {
  window.dispatchEvent(
    new CustomEvent('message', {
      detail: payload
    })
  )
})

socket.on('joined-lobby', (payload) => {
  window.dispatchEvent(
    new CustomEvent('update-values', {
      detail: payload
    })
  )
  window.dispatchEvent(
    new CustomEvent('message', {
      detail: {
        message: `${payload.playerName} has joined the lobby!`
      }
    })
  )
  // statusEl.textContent = `${payload.playerName} has joined the lobby!`;
});

socket.on('update', (payload) => {
  window.dispatchEvent(
    new CustomEvent('update-values', {
      detail: payload
    })
  )
})

socket.on('start-hand', (payload) => {
  window.dispatchEvent(
    new CustomEvent('start-hand', {
      detail: payload
    })
  )
})

// socket.on('chip-update', (payload) => {
//   appState.chips = payload.chips;
//   document.querySelector('#chipCount').textContent = `Chips: ${payload.chips}`;
//   document.querySelector('#markerText').setAttribute('value', `Chips: ${payload.chips}`);
// });