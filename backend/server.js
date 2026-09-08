const express = require("express");
const http = require("http");
const { join } = require('node:path');
const { Server } = require("socket.io");
const crypto = require('node:crypto');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(join(__dirname, '../frontend')));

app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, '../frontend/index.html'));
});

const lobbies = new Map();

function makeLobbySnapshot(roomCode) {
  const lobby = lobbies.get(roomCode);
  if (!lobby) {
    console.log("Couldn't find lobby");
    return null;
  }
  return {
    roomCode: roomCode,
    phase: lobby.phase,
    players: lobby.playerIds.map(playerId => lobby.playersById[playerId]),
    playerIds: lobby.playerIds,
    round: lobby.round,
    pot: lobby.pot,
    bet: lobby.bet,
    turn: lobby.turn,
    button: lobby.button,
    lastRaised: lobby.lastRaised
  };
}

function createLobby(roomCode, playerName) {
  if (lobbies.has(roomCode)) return null;

  const hostPlayer = {
    playerId: crypto.randomUUID(),
    playerName: playerName,
    chips: 100,
    isHost: true,
    connected: true,
    folded: false,
    allIn: false,
    bet: 0
  };

  const lobby = {
    roomCode: roomCode,
    phase: 'lobby', // 'lobby' | 'playing' | 'finished'
    playersById: { [hostPlayer.playerId]: hostPlayer },
    playerIds: [hostPlayer.playerId],
    round: 1,
    pot: 0,
    bet: 0,
    turn: 0,
    button: 0,
    lastRaised: 0,
    lastRaisedRound: 0
  };

  console.log(`Creating lobby with code: ${lobby.roomCode} and host player: ${playerName}`);
  lobbies.set(roomCode, lobby);
  console.log(`returning ${lobby.roomCode} and host player: ${hostPlayer.playerName}`);
  return {lobby: makeLobbySnapshot(lobby.roomCode), player: hostPlayer, isHost: true};
}

function joinLobby(roomCode, playerName) {
  console.log(`Joining lobby ${roomCode} as ${playerName}`);
  const lobby = lobbies.get(roomCode);
  if (!lobby) {
    console.log("Couldn't find lobby");
    return null;
  }
  console.log(`Found lobby with room code: ${lobby.roomCode}`);

  const player = {
    playerId: crypto.randomUUID(),
    playerName: playerName,
    chips: 100,
    isHost: false,
    connected: true,
    folded: false,
    allIn: false,
    bet: 0
  };

  lobby.playerIds.forEach(playerId => {
    const existingPlayer = lobby.playersById[playerId];
    if (existingPlayer.playerName == player.playerName) {
      if (existingPlayer.connected) {
        player.playerName = `${playerName}_${Math.floor(Math.random() * 1000)}`;
      } else {
        existingPlayer.connected = true;
        lobby.playersById[existingPlayer.playerId] = existingPlayer;
        const lobbySnap = makeLobbySnapshot(lobby.roomCode);
        console.log(`Made snapshot with room code: ${lobbySnap.roomCode}`);
        return {lobby: makeLobbySnapshot(lobby.roomCode), player: existingPlayer, isHost: false};
      }
    }
  });
  // const existingPlayer = lobby.playersById[player.playerId];
  // if (existingPlayer) {
  //   if (existingPlayer.connected) {
  //     player.playerName = `${playerName}_${Math.floor(Math.random() * 1000)}`;
  //   } else {
  //     existingPlayer.connected = true;
  //     lobby.playersById[existingPlayer.playerId] = existingPlayer;
  //     const lobbySnap = makeLobbySnapshot(lobby.roomCode);
  //     console.log(`Made snapshot with room code: ${lobbySnap.roomCode}`);
  //     return {lobby: makeLobbySnapshot(lobby.roomCode), player: existingPlayer, isHost: false};
  //   }
  // }

  lobby.playersById[player.playerId] = player;
  lobby.playerIds.push(player.playerId);
  const lobbySnap = makeLobbySnapshot(lobby.roomCode);
  console.log(`Made snapshot with room code: ${lobbySnap.roomCode}`);
  return {lobby: makeLobbySnapshot(lobby.roomCode), player, isHost: false};
}

function startHand(lobby) {
  lobby.phase = 'playing';
  lobby.playerIds.forEach(playerId => {
    const player = lobby.playersById[playerId];
    if(player.connected) {
      player.folded = false;
      player.allIn = false;
      player.bet = 0;
    } else {
      player.folded = true;
    }
  });
  lobby.round = 1;
  lobby.pot = 0;
  lobby.bet = 0;
  lobby.turn = (lobby.button + 1) % lobby.playerIds.length;
  lobby.lastRaised = lobby.turn;
  lobby.lastRaisedRound = lobby.turn;
}

function nextRound(lobby) {
  lobby.round++;
  // lobby.turn = (lobby.button + 1) % lobby.playerIds.length;
  lobby.lastRaisedRound = lobby.button;
  lobby.turn = lobby.button;
  nextTurn(lobby);
  lobby.lastRaisedRound = lobby.turn;
  if (lobby.round > 4) {
    const winnerId = determineWinner(lobby);
    io.to(lobby.roomCode).emit('message', {
      message: `Game ended, winner: ${lobby.playersById[winnerId]}`
    });
    endHand(lobby, winnerId);
  }
}

function determineWinner(lobby) {
  const activePlayers = lobby.playerIds.map(playerId => lobby.playersById[playerId]).filter(p => !p.folded);
  if (activePlayers.length === 1) {
    return activePlayers[0].playerId;
  }
  // Placeholder for hand evaluation logic
  return activePlayers[Math.floor(Math.random() * activePlayers.length)].playerId;
}

function endHand(lobby, playerId) {
  const player = lobby.playersById[playerId];
  if (player) {
    player.chips += lobby.pot;
  }

  lobby.round = 0;
  lobby.pot = 0;
  lobby.bet = 0;
  lobby.turn = 0;
  lobby.lastRaised = 0;
  lobby.lastRaisedRound = 0;
  lobby.playerIds.forEach(playerId => {
    const p = lobby.playersById[playerId];
    p.bet = 0;
    p.folded = false;
    p.allIn = false;
  });
  lobby.button = (lobby.button + 1) % lobby.playerIds.length;
  io.to(lobby.roomCode).emit('update', {
    lobby: makeLobbySnapshot(lobby.roomCode),
    playerName: player.playerName,
    chips: player.chips
  });
}

function fold(lobby, playerId) {
  const player = lobby.playersById[playerId];
  
  if (!player || lobby.playerIds.indexOf(playerId) !== lobby.turn) return false;

  player.folded = true;
  return true;
}

function raise(lobby, playerId, amount) {
  const player = lobby.playersById[playerId];

  if (!player || lobby.playerIds.indexOf(playerId) !== lobby.turn) return false;

  const contribution = lobby.bet - player.bet + amount;
  if (player.chips < contribution) return false;

  lobby.bet += amount;
  player.bet = lobby.bet;
  player.chips -= contribution;
  lobby.pot += contribution;
  if (amount > 0) {
    lobby.lastRaised = lobby.turn;
    lobby.lastRaisedRound = lobby.turn;
  }
  return true;
}

function call(lobby, playerId) {
  return raise(lobby, playerId, 0);
}

function nextTurn(lobby) {
  lobby.turn = (lobby.turn + 1) % lobby.playerIds.length;
  if (lobby.turn == lobby.lastRaisedRound) {
    nextRound(lobby);
  } else if (lobby.playersById[lobby.playerIds[lobby.turn]].folded || lobby.playersById[lobby.playerIds[lobby.turn]].allIn) {
    nextTurn(lobby);
  }
}

function allIn(lobby, playerId) {
  const player = lobby.playersById[playerId];
  if (!player || lobby.playerIds.indexOf(playerId) !== lobby.turn) return false;

  const contribution = player.chips;
  if (player.bet + contribution > lobby.bet) {
    lobby.bet = player.bet + contribution;
    lobby.lastRaised = lobby.turn;
    lobby.lastRaisedRound = lobby.turn;
  }
  lobby.pot += contribution;
  player.bet += contribution;
  player.chips = 0;
  player.allIn = true;
  return true;
}

// function runGameLoop() {
//   while (lobby.round < 4) {
//     const currentPlayer = lobby.playersById[lobby.playerIds[lobby.turn]];
//     if (currentPlayer.folded || currentPlayer.allIn) {
//       lobby.turn = (lobby.turn + 1) % lobby.playerIds.length;
//       continue;
//     }

//     // Wait for player action (fold, call, raise, all-in)
//     // This would typically be handled via socket events in a real implementation

//     // For demonstration, we'll just move to the next player
//     lobby.turn = (lobby.turn + 1) % lobby.playerIds.length;

//     if (lobby.turn === lobby.lastRaised) {
//       nextRound(lobby);
//     }

//     // Check if all players have acted and if the round should end
//     const activePlayers = lobby.playerIds.map(playerId => lobby.playersById[playerId]).filter(p => !p.folded && !p.allIn);
//     if (activePlayers.length <= 1) {
//       break; // End the round if only one player is left
//     }
//   }
// }

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-lobby', ({ roomCode, playerName }, callback) => {
    console.log(`Join lobby request: ${roomCode} as ${playerName}`);
    const lobby = lobbies.get(roomCode);
    let result;
    if (!lobby) {
      console.log(`Creating new lobby with code: ${roomCode}`);
      result = createLobby(roomCode, playerName);
    } else {
      result = joinLobby(roomCode, playerName);
    }

    if (result.lobby) {
      socket.join(roomCode);
      socket.broadcast.to(roomCode).emit('joined-lobby', {
        lobby: makeLobbySnapshot(result.lobby.roomCode),
        playerName: result.player.playerName,
        chips: result.player.chips
      });
      console.log(`lobby ${result.lobby.roomCode} has players: ${result.lobby.players.map(player => player.playerName).join(', ')}`);
      if (callback) callback({ success: true, player: result.player, lobby: result.lobby });
    } else {
      if (callback) callback({ success: false, message: 'Failed to join lobby' });
    }
  });

  socket.on('add-chips', ({ roomCode, amount, playerId }, callback) => {
    const lobby = lobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.playersById[playerId];
    if (!player) return;

    player.chips += amount;
    io.to(roomCode).emit('update', {
      lobby: makeLobbySnapshot(roomCode),
      playerName: player.playerName,
      chips: player.chips
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    lobbies.forEach(lobby => {
      const player = lobby.playersById[socket.id];
      if (player) {
        player.connected = false;
        io.to(lobby.roomCode).emit('player-disconnected', {
          playerName: player.playerName
        });
      }
    });
  });

  socket.on('start-hand', ({ roomCode }, callback) => {
    const lobby = lobbies.get(roomCode);
    if (!lobby) return;
    startHand(lobby);
    io.to(roomCode).emit('start-hand', {
      lobby: makeLobbySnapshot(roomCode),
      // players: lobby.playerIds.map(playerId => lobby.playersById[playerId]),
      // playerIds: lobby.playerIds,
      // round: lobby.round,
      // pot: lobby.pot,
      // bet: lobby.bet,
      // turn: lobby.turn,
      // button: lobby.button,
      // lastRaised: lobby.lastRaised
    });
    if(callback) callback({ success: true });
  });

  socket.on('action', ({ action, roomCode, amount, playerId }, callback) => {
    const lobby = lobbies.get(roomCode);
    if (!lobby) {
      console.log("Lobby not found");
      if(callback) callback({ success: false });
      return;
    }

    const player = lobby.playersById[playerId];
    if (!player || lobby.turn != lobby.playerIds.indexOf(playerId)) {
      console.log("Not player's turn");
      if(callback) callback({ success: false });
      return;
    }
    
    if (action === 'raise') {
      raise(lobby, playerId, amount);
      nextTurn(lobby);
    } else if (action === 'fold') {
      fold(lobby, playerId);
      nextTurn(lobby);
    } else if (action === 'call') {
      call(lobby, playerId);
      nextTurn(lobby);
    }
    io.to(roomCode).emit('message', {
      message: `${lobby.playersById[playerId].playerName} performed ${action} with amount: ${amount}`
    });
    io.to(roomCode).emit('update', {
      lobby: makeLobbySnapshot(roomCode),
      playerName: player.playerName,
      chips: player.chips
    });
    if(callback) callback({ success: true });
  });
});

app.get('/', (_req, res) => {
  res.send('AR Poker backend running');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
