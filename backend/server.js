const express = require("express");
const http = require("http");
const { join } = require('node:path');
const { Server } = require("socket.io");

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

function createLobby(roomCode, playerName) {
  if (lobbies.has(roomCode)) return null;

  const hostPlayer = {
    playerName: playerName,
    chips: 100,
    isHost: true,
    connected: true,
    folded: false,
    allIn: false,
    bet: 0
  };

  const lobby = {
    roomCode,
    players: [hostPlayer],
    round: 1,
    pot: 0,
    bet: 0,
    turn: 0,
    button: 0,
    lastRaised: 0
  };

  console.log(`Creating lobby with code: ${lobby.roomCode} and host player: ${playerName}`);
  lobbies.set(roomCode, lobby);
  console.log(`returning ${lobby.roomCode} and host player: ${hostPlayer.playerName}`);
  return {lobby, player: hostPlayer, isHost: true};
}

function joinLobby(roomCode, playerName) {
  console.log(`Joining lobby ${roomCode} as ${playerName}`);
  const lobby = lobbies.get(roomCode);
  if (!lobby) return null;

  const player = {
    playerName: playerName,
    chips: 100,
    isHost: false,
    connected: true,
    folded: false,
    allIn: false,
    bet: 0
  };

  const existingPlayer = lobby.players.find(p => p.name === playerName);
  if (existingPlayer) {
    if (existingPlayer.connected) {
      player.playerName = `${playerName}_${Math.floor(Math.random() * 1000)}`;
    } else {
      existingPlayer.connected = true;
      lobby.players[lobby.players.indexOf(existingPlayer)] = existingPlayer;
      return {lobby, player: existingPlayer, isHost: false};
    }
  }

  lobby.players.push(player);
  return {lobby, player, isHost: false};
}

function startHand(lobby) {
  lobby.round = 1;
  lobby.pot = 0;
  lobby.bet = 0;
  lobby.turn = (lobby.button + 1) % lobby.players.length;
  lobby.lastRaised = lobby.turn;
}

function nextRound(lobby) {
  lobby.round++;
  lobby.bet = 0;
  lobby.turn = (lobby.button + 1) % lobby.players.length;
  lobby.lastRaised = lobby.turn;
  if (lobby.round > 4) {
    const winnerName = determineWinner(lobby);
    endHand(lobby, winnerName);
  }
}

function determineWinner(lobby) {
  const activePlayers = lobby.players.filter(p => !p.folded);
  if (activePlayers.length === 1) {
    return activePlayers[0].name;
  }
  // Placeholder for hand evaluation logic
  return activePlayers[Math.floor(Math.random() * activePlayers.length)].name;
}

function endHand(lobby, playerName) {
  const player = lobby.players.find(p => p.name === playerName);
  if (player) {
    player.chips += lobby.pot;
  }

  lobby.round = 0;
  lobby.pot = 0;
  lobby.bet = 0;
  lobby.turn = 0;
  lobby.lastRaised = 0;
  lobby.players.forEach(p => {
    p.bet = 0;
    p.folded = false;
    p.allIn = false;
  });
  lobby.button = (lobby.button + 1) % lobby.players.length;
}

function fold(lobby, playerName) {
  const player = lobby.players.find(p => p.name === playerName);
  
  if(!player || lobby.indexOf(player) !== lobby.turn) return false;

  player.folded = true;
  return true;
}

function raise(lobby, playerName, amount) {
  const player = lobby.players.find(p => p.name === playerName);

  if(lobby.indexOf(player) !== lobby.turn) return false;

  const contribution = lobby.bet - player.bet + amount;
  if (!player || player.chips < contribution) return false;

  lobby.bet += amount;
  player.bet = lobby.bet;
  player.chips -= contribution;
  lobby.pot += contribution;
  lobby.lastRaised = lobby.turn;
  return true;
}

function call(lobby, playerName) {
  raise(lobby, playerName, 0);
}

function allIn(lobby, playerName) {
  const player = lobby.players.find(p => p.name === playerName);
  if (!player || lobby.indexOf(player) !== lobby.turn) return false;

  const contribution = player.chips;
  if (player.bet + contribution > lobby.bet) {
    lobby.bet = player.bet + contribution;
  }
  lobby.pot += contribution;
  player.bet += contribution;
  player.chips = 0;
  player.allIn = true;
  lobby.lastRaised = lobby.turn;
  return true;
}

function runGameLoop() {
  while (lobby.round < 4) {
    const currentPlayer = lobby.players[lobby.turn];
    if (currentPlayer.folded || currentPlayer.allIn) {
      lobby.turn = (lobby.turn + 1) % lobby.players.length;
      continue;
    }

    // Wait for player action (fold, call, raise, all-in)
    // This would typically be handled via socket events in a real implementation

    // For demonstration, we'll just move to the next player
    lobby.turn = (lobby.turn + 1) % lobby.players.length;

    if (lobby.turn === lobby.lastRaised) {
      nextRound(lobby);
    }

    // Check if all players have acted and if the round should end
    const activePlayers = lobby.players.filter(p => !p.folded && !p.allIn);
    if (activePlayers.length <= 1) {
      break; // End the round if only one player is left
    }
  }
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-lobby', ({ roomCode, playerName }, callback) => {
    console.log(`Join lobby request: ${roomCode} as ${playerName}`);
    let lobby = lobbies.get(roomCode);
    if (!lobby) {
      console.log(`Creating new lobby with code: ${roomCode}`);
      result = createLobby(roomCode, playerName);
    } else {
      result = joinLobby(roomCode, playerName);
    }

    if (result.lobby) {
      socket.join(roomCode);
      socket.broadcast.to(roomCode).emit('joined-lobby', {
        roomCode: result.lobby.roomCode,
        playerName: result.player.playerName,
        chips: result.player.chips
      });
      console.log(`lobby ${result.lobby.roomCode} has players: ${result.lobby.players.map(p => p.playerName).join(', ')}`);
      if (callback) callback({ success: true, player: result.player, lobby: result.lobby });
    } else {
      if (callback) callback({ success: false, message: 'Failed to join lobby' });
    }
  });

  socket.on('add-chips', ({ roomCode, amount }, callback) => {
    const lobby = lobbies.get(roomCode);
    if (!lobby) return;

    const player = lobby.players.find(p => p.name === socket.id);
    if (!player) return;

    player.chips += amount;
    io.to(roomCode).emit('chip-update', {
      playerName: player.name,
      chips: player.chips
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    lobbies.forEach(lobby => {
      const player = lobby.players.find(p => p.name === socket.id);
      if (player) {
        player.connected = false;
        io.to(lobby.roomCode).emit('player-disconnected', {
          playerName: player.name
        });
      }
    });
  });

  socket.on('start-hand', ({ roomCode }, callback) => {
    const lobby = lobbies.get(roomCode);
    if (!lobby) return;
    startHand(lobby);
    io.to(roomCode).emit('start-hand', {
      round: lobby.round,
      pot: lobby.pot,
      bet: lobby.bet,
      turn: lobby.turn,
      button: lobby.button,
      lastRaised: lobby.lastRaised
    });
    if(callback) callback({ success: true });
  })
});

app.get('/', (_req, res) => {
  res.send('AR Poker backend running');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
