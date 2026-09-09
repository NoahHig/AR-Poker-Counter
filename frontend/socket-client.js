if (typeof io === 'undefined') {
  throw new Error(
    'Socket.IO client library is missing. ' +
    'Load <script src="/socket.io/socket.io.js"></script> before main.js.'
  );
}

const LOCAL_SOCKET_URL = 'http://localhost:3000';
// Replace once Render service has been created
const PRODUCTION_SOCKET_URL = 'https://ar-poker-counter.onrender.com/';

const socketUrl =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? LOCAL_SOCKET_URL
    : PRODUCTION_SOCKET_URL;

export const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  timeout: 10000
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