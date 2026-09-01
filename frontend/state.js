// export const appState = {
//   roomCode: null,
//   playerName: '',
//   players: [],
//   chips: 0,
//   chipsByPlayerId: {},
//   visibleMarkerId: null,
//   connected: false,
//   isHost: false
// };
export const appState = {
  // Client/session identity: unique to this browser/player.
  session: {
    playerId: null,
    playerName: '',
    roomCode: null,
    isHost: false,
    connected: false
  },

  // Server-owned public game snapshot.
  game: {
    roomCode: null,
    phase: 'menu', // 'lobby' | 'playing' | 'finished'
    playersById: {},
    playerIds: [],
    updatedAt: null,
    round: 1,
    pot: 0,
    bet: 0,
    turn: 0,
    button: 0,
    lastRaised: 0
  },

  // Browser/device/UI-only state. Never send this as game truth.
  ui: {
    visibleMarkerId: null,
    activeView: 'menu',
    errorMessage: ''
  }
};