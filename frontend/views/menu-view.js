import { socket } from '../socket-client.js';
import { appState } from '../state.js';

console.log('Mounting menu view');
export function mountMenuView({
  root,
  onCreateLobby,
  onJoinLobby
}) {
  const controller = new AbortController();

  root.innerHTML = `
    <button id="infoBtn">ⓘ</button>
    <div class="info">
        <div class="horizontal">
            <!-- <img src="poker-chips.png" alt="Poker Chips" class="logo"> -->
            <button id="closeInfo">X</button>
            <h1>AR Poker Counter</h1>
        </div>
        <p>Welcome to the AR Poker Counter project! This project is designed to help poker players keep track of their chips and bets using augmented reality technology. With this tool, you can easily visualize your chip stack and make informed decisions during the game.</p>
            
        <h2>Features</h2>
        <ul>
            <li>Real-time chip counting using AR technology</li>
            <li>Visual representation of chip stacks</li>
            <li>Easy-to-use interface for tracking bets and wins</li>
            <li>Compatibility with various poker games</li>
        </ul>

        <h2>Getting Started</h2>
        <p>To get started with the AR Poker Counter, follow these steps:</p>
        <ol>
            <li>Download and install the AR Poker Counter app on your device.</li>
            <li>Set up your poker table and ensure good lighting for optimal AR performance.</li>
            <li>Open the app and point your device's camera at your chip stack.</li>
            <li>The app will automatically detect and count your chips, displaying the total value on the screen.</li>
            <li>You can also use the app to track bets and wins throughout the game.</li>
        </ol>

        <h2>Contact Us</h2>
        <p>If you have any questions or feedback about the AR Poker Counter, please feel free to contact us at noahhigpen@gmail.com</p>
    </div>

    <!-- <video id="video" autoplay="true"></video> -->

    <div class="hud">
        <form id="joinLobbyForm">
            <input id="roomCode" placeholder="Lobby code" />
            <input id="playerName" placeholder="Player name" />
            <div class="menu-actions">
                <button type="submit">Join lobby</button>
                <button id="createLobbyBtn" type="button">Create lobby</button>
            </div>
            <button id="joinBtn">Join lobby</button>
        </form>
        <div id="status">Not connected</div>
        <div id="chipCount">Chips: --</div>
    </div>
    
    <script>
        document.getElementById('closeInfo').addEventListener('click', () => {
            document.querySelector('.info').style.display = 'none';
        });
        document.getElementById('infoBtn').addEventListener('click', () => {
            document.querySelector('.info').style.display = 'block';
        });
    </script>
    `;
//     <section class="menu-view" aria-labelledby="menuTitle">
//       <header>
//         <p class="eyebrow">AR Poker Counter</p>
//         <h1 id="menuTitle">Start a table</h1>
//         <p>Create a new lobby or enter a friend’s lobby code.</p>
//       </header>

//       <form id="joinLobbyForm">
//         <label for="playerName">Your name</label>
//         <input
//           id="playerName"
//           name="playerName"
//           type="text"
//           maxlength="24"
//           autocomplete="nickname"
//           required
//         />

//         <label for="roomCode">Lobby code</label>
//         <input
//           id="roomCode"
//           name="roomCode"
//           type="text"
//           maxlength="6"
//           autocomplete="off"
//           placeholder="ABC123"
//         />

//         <p id="formMessage" role="status" aria-live="polite"></p>

//         <div class="menu-actions">
//           <button type="submit">Join lobby</button>
//           <button id="createLobbyBtn" type="button">Create lobby</button>
//         </div>
//       </form>
//     </section>
//   `;

//   const form = root.querySelector('#joinLobbyForm');
//   const nameInput = root.querySelector('#playerName');
//   const roomCodeInput = root.querySelector('#roomCode');
//   const message = root.querySelector('#formMessage');
//   const createButton = root.querySelector('#createLobbyBtn');

  const form = root.querySelector('#joinLobbyForm');
  const roomCodeInput = document.getElementById('roomCode');
  const playerNameInput = document.getElementById('playerName');
  const joinBtn = document.getElementById('joinBtn');
  const statusEl = document.getElementById('status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const roomCode = roomCodeInput.value.trim().toUpperCase();
    const playerName = playerNameInput.value.trim() || 'Player';
    onJoinLobby({ playerName, roomCode });
  }, { signal: controller.signal });

//   form.addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const playerName = nameInput.value.trim();
//     const roomCode = roomCodeInput.value.trim().toUpperCase();

//     if (!playerName) {
//       message.textContent = 'Enter a display name first.';
//       nameInput.focus();
//       return;
//     }

//     if (!roomCode) {
//       message.textContent = 'Enter the lobby code you received.';
//       roomCodeInput.focus();
//       return;
//     }

//     message.textContent = 'Joining lobby…';

//     try {
//       await onJoinLobby({ playerName, roomCode });
//     } catch (error) {
//       message.textContent = error.message || 'Could not join the lobby.';
//     }
//   }, { signal: controller.signal });

//   createButton.addEventListener('click', async () => {
//     const playerName = nameInput.value.trim();

//     if (!playerName) {
//       message.textContent = 'Enter a display name first.';
//       nameInput.focus();
//       return;
//     }

//     message.textContent = 'Creating lobby…';

//     try {
//       await onCreateLobby({ playerName });
//     } catch (error) {
//       message.textContent = error.message || 'Could not create the lobby.';
//     }
//   }, { signal: controller.signal });

//   joinBtn.addEventListener('click', () => {
//     const roomCode = roomCodeInput.value.trim().toUpperCase();
//     const playerName = playerNameInput.value.trim() || 'Player';
//     console.log(`Joining lobby with code: ${roomCode} and name: ${playerName}`);
//     socket.emit('join-lobby', {
//       roomCode,
//       playerName
//     }, message => {
//       console.log('Join lobby response:', message);
//       if (!message.success) {
//         statusEl.textContent = `Failed to join lobby: ${message.message}`;
//         return;
//       }
//       appState.roomCode = roomCode;
//       appState.playerName = message.playerName;
//       appState.chips = message.chips;
//       appState.connected = true;
//       appState.isHost = message.isHost;
//       statusEl.textContent = `Joined ${roomCode} as ${message.playerName}`;
//       document.querySelector('#chipCount').textContent = `Chips: ${message.chips}`;
//     });
//   });

  return {
    unmount() {
      controller.abort();
      root.innerHTML = '';
    }
  };
}