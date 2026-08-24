console.log('Mounting main.js');
import { mountMenuView } from './views/menu-view.js';
import { mountLobbyView } from './views/lobby-view.js';
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

            appState.playerId = response.playerId;
            appState.playerName = response.playerName;
            appState.roomCode = response.roomCode;
            appState.players = response.players;

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
        console.log(`players: ${message.lobby.players.map(p => p.playerName).join(', ')}`);
        appState.roomCode = roomCode;
        appState.playerName = message.player.playerName;
        appState.players = message.lobby.players;
        appState.chips = message.player.chips;
        appState.connected = true;
        appState.isHost = message.player.isHost;

        showLobby();
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
  console.log('Next: mount the lobby view', appState.roomCode);
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

showMenu();