console.log('Mounting main.js');
import { mountMenuView } from './views/menu-view.js';
import { mountLobbyView } from './views/lobby-view.js';
import { mountGameplayView } from './views/gameplay-view.js';
import { socket } from './socket-client.js';
import { appState } from './state.js';

const root = document.querySelector('#app');
let activeView = null;

function showMenu() {
  activeView?.unmount();

  activeView = mountMenuView({
    root,

    onCreateLobby({ playerName }) {
      return new Promise((resolve, reject) => {
        socket.timeout(5000).emit(
          'create-lobby',
          { playerName },
          (error, response) => {
            if (error) {
              reject(new Error('The server did not respond.'));
              return;
            }

            appState.session.playerId = response.playerId;
            appState.session.playerName = response.playerName;
            appState.session.roomCode = response.roomCode;
            appState.game.playersById = response.playersById;

            showLobby();
            resolve();
          }
        );
      });
    },

    onJoinLobby({ playerName, roomCode }) {
        console.log(`Joining lobby with code: ${roomCode} and name: ${playerName}`);
        socket.emit('join-lobby', {
            roomCode,
            playerName
        }, message => {
        console.log('Join lobby response:', message);
        if (!message.success) {
            return;
        }
        console.log(`players: ${message.lobby.players.map(player => player.playerName).join(', ')}`);
        appState.session.roomCode = roomCode;
        appState.session.playerName = message.player.playerName;
        appState.session.playerId = message.player.playerId;
        appState.session.isHost = message.player.isHost;
        appState.game.playerIds = message.lobby.playerIds;
        appState.game.roomCode = message.lobby.roomCode;
        appState.game.phase = message.lobby.phase;
        message.lobby.players.forEach(player => {
           appState.game.playersById[player.playerId] = player;
        });
        // appState.game.playersById;
        // appState.chips = message.player.chips;
        appState.session.connected = true;

        if (appState.game.phase === 'playing') {
            showGameplay();
        } else {
            showLobby();
        }
        });
    //   return new Promise((resolve, reject) => {
    //     socket.timeout(5000).emit(
    //       'join-lobby',
    //       { playerName, roomCode },
    //       (error, response) => {
    //         if (error) {
    //           reject(new Error('Could not reach the lobby server.'));
    //           return;
    //         }

    //         if (!response.ok) {
    //           reject(new Error(response.message));
    //           return;
    //         }

    //         appState.playerId = response.playerId;
    //         appState.playerName = response.playerName;
    //         appState.roomCode = response.roomCode;
    //         appState.players = response.players;

    //         showLobby();
    //         resolve();
    //       }
    //     );
    //   });
    }
  });
}

function showLobby() {
  console.log('Next: mount the lobby view', appState.session.roomCode);
    activeView?.unmount();

    activeView = mountLobbyView({
      root,

      onStartGame: ({ roomCode }) => {
        console.log(`Starting game in room: ${roomCode}`);
        return new Promise((resolve, reject) => {
        socket.timeout(5000).emit(
          'start-hand',
          { roomCode },
          (error, response) => {
            if (error) {
              reject(new Error('The server did not respond.'));
              return;
            }

            showGameplay();
            resolve();
          }
        );
      });
    }
  });
}

function showGameplay() {
    console.log('Next: mount the gameplay view', appState.session.roomCode);
    activeView?.unmount();

    activeView = mountGameplayView({
        root,

        onAction: ({ action, roomCode, amount, playerId }) => {
          console.log(`Player ${appState.game.playersById[playerId].playerName} performed action: ${action} with amount: ${amount}`);
          return new Promise((resolve, reject) => {
          socket.timeout(5000).emit(
            'action',
            { action: action, roomCode: roomCode, amount: amount, playerId: playerId },
            (error, response) => {
              if (error) {
                reject(new Error('The server did not respond.'));
                return;
              }

              return;
            }
          )})
        }
    });
}

window.addEventListener(
    'update-values',
    (event) => {
        appState.game.phase = event.detail.lobby.phase;
        appState.game.playerIds = event.detail.lobby.playerIds;
        const players = event.detail.lobby.players;
        players.forEach(p => {
            appState.game.playersById[p.playerId] = p;
        })
        appState.game.round = event.detail.lobby.round;
        appState.game.pot = event.detail.lobby.pot;
        appState.game.bet = event.detail.lobby.bet;
        appState.game.turn = event.detail.lobby.turn;
        appState.game.button = event.detail.lobby.button;
        appState.game.lastRaised = event.detail.lobby.lastRaised;
        window.dispatchEvent(
            new CustomEvent('update-screen', {
                detail: event.detail
            })
        )
    }
)

window.addEventListener(
    'start-hand',
    (event) => {
        const lobby = event.detail.lobby;
        appState.game.phase = lobby.phase;
        appState.game.round = lobby.round;
        appState.game.pot = lobby.pot,
        appState.game.bet = lobby.bet,
        appState.game.turn = lobby.turn,
        appState.game.button = lobby.button,
        appState.game.lastRaised = lobby.lastRaised
        if (appState.game.phase === 'playing') {
            showGameplay();
        } else {
            showLobby();
        }
    }
)

showMenu();