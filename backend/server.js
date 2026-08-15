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

const games = new Map();

function createGame(roomCode, playerName) {
  if (games.has(roomCode)) return null;

  const leadPlayer = {
    name: playerName,
    chips: 100,
    leader: true,
    connected: true,
    folded: false,
    allIn: false,
    bet: 0
  };

  const game = {
    roomCode,
    players: [leadPlayer],
    round: 1,
    pot: 0,
    bet: 0,
    turn: 0,
    button: 0,
    lastRaised: 0
  };

  console.log(`Creating game with code: ${game.roomCode} and lead player: ${playerName}`);
  games.set(roomCode, game);
  console.log(`returning ${game.roomCode} and lead player: ${leadPlayer.name}`);
  return {game, player: leadPlayer};
}

function joinGame(roomCode, playerName) {
  console.log(`Joining game ${roomCode} as ${playerName}`);
  const game = games.get(roomCode);
  if (!game) return null;

  const player = {
    name: playerName,
    chips: 100,
    leader: false,
    connected: true,
    folded: false,
    allIn: false,
    bet: 0
  };

  const existingPlayer = game.players.find(p => p.name === playerName);
  if (existingPlayer) {
    if (existingPlayer.connected) {
      player.name = `${playerName}_${Math.floor(Math.random() * 1000)}`;
    } else {
      existingPlayer.connected = true;
      game.players[game.players.indexOf(existingPlayer)] = existingPlayer;
      return {game, player: existingPlayer};
    }
  }

  game.players.push(player);
  return {game, player};
}

function startHand(game) {
  game.round = 1;
  game.pot = 0;
  game.bet = 0;
  game.turn = (game.button + 1) % game.players.length;
  game.lastRaised = game.turn;
}

function nextRound(game) {
  game.round++;
  game.bet = 0;
  game.turn = (game.button + 1) % game.players.length;
  game.lastRaised = game.turn;
  if (game.round > 4) {
    const winnerName = determineWinner(game);
    endHand(game, winnerName);
  }
}

function determineWinner(game) {
  const activePlayers = game.players.filter(p => !p.folded);
  if (activePlayers.length === 1) {
    return activePlayers[0].name;
  }
  // Placeholder for hand evaluation logic
  return activePlayers[Math.floor(Math.random() * activePlayers.length)].name;
}

function endHand(game, playerName) {
  const player = game.players.find(p => p.name === playerName);
  if (player) {
    player.chips += game.pot;
  }

  game.round = 0;
  game.pot = 0;
  game.bet = 0;
  game.turn = 0;
  game.lastRaised = 0;
  game.players.forEach(p => {
    p.bet = 0;
    p.folded = false;
    p.allIn = false;
  });
  game.button = (game.button + 1) % game.players.length;
}

function fold(game, playerName) {
  const player = game.players.find(p => p.name === playerName);
  
  if(!player || game.indexOf(player) !== game.turn) return false;

  player.folded = true;
  return true;
}

function raise(game, playerName, amount) {
  const player = game.players.find(p => p.name === playerName);

  if(game.indexOf(player) !== game.turn) return false;

  const contribution = game.bet - player.bet + amount;
  if (!player || player.chips < contribution) return false;

  game.bet += amount;
  player.bet = game.bet;
  player.chips -= contribution;
  game.pot += contribution;
  game.lastRaised = game.turn;
  return true;
}

function call(game, playerName) {
  raise(game, playerName, 0);
}

function allIn(game, playerName) {
  const player = game.players.find(p => p.name === playerName);
  if (!player || game.indexOf(player) !== game.turn) return false;

  const contribution = player.chips;
  if (player.bet + contribution > game.bet) {
    game.bet = player.bet + contribution;
  }
  game.pot += contribution;
  player.bet += contribution;
  player.chips = 0;
  player.allIn = true;
  game.lastRaised = game.turn;
  return true;
}

function runGameLoop() {
  while (game.round < 4) {
    const currentPlayer = game.players[game.turn];
    if (currentPlayer.folded || currentPlayer.allIn) {
      game.turn = (game.turn + 1) % game.players.length;
      continue;
    }

    // Wait for player action (fold, call, raise, all-in)
    // This would typically be handled via socket events in a real implementation

    // For demonstration, we'll just move to the next player
    game.turn = (game.turn + 1) % game.players.length;

    if (game.turn === game.lastRaised) {
      nextRound(game);
    }

    // Check if all players have acted and if the round should end
    const activePlayers = game.players.filter(p => !p.folded && !p.allIn);
    if (activePlayers.length <= 1) {
      break; // End the round if only one player is left
    }
  }
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-game', ({ roomCode, playerName }, callback) => {
    console.log(`Join game request: ${roomCode} as ${playerName}`);
    let game = games.get(roomCode);
    if (!game) {
      console.log(`Creating new game with code: ${roomCode}`);
      result = createGame(roomCode, playerName);
    } else {
      result = joinGame(roomCode, playerName);
    }

    if (result.game) {
      socket.join(roomCode);
      socket.broadcast.to(roomCode).emit('joined-game', {
        roomCode: result.game.roomCode,
        playerName: result.player.name,
        chips: result.player.chips
      });
      if (callback) callback({ success: true, playerName: result.player.name, chips: result.player.chips });
    } else {
      if (callback) callback({ success: false, message: 'Failed to join game' });
    }
  });

  socket.on('add-chips', ({ roomCode, amount }) => {
    const game = games.get(roomCode);
    if (!game) return;

    const player = game.players.find(p => p.name === socket.id);
    if (!player) return;

    player.chips += amount;
    io.to(roomCode).emit('chip-update', {
      playerName: player.name,
      chips: player.chips
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    games.forEach(game => {
      const player = game.players.find(p => p.name === socket.id);
      if (player) {
        player.connected = false;
        io.to(game.roomCode).emit('player-disconnected', {
          playerName: player.name
        });
      }
    });
  });
});

app.get('/', (_req, res) => {
  res.send('AR Poker backend running');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
