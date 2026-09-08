import { appState } from '../state.js';

console.log('Mounting menu view');
export function mountMenuView({
  root,
  onCreateLobby,
  onJoinLobby
}) {
  const controller = new AbortController();
    root.innerHTML = `
    <section class="info stack">
        <div>
        <span class="status">AR poker lobby</span>
        <h1>AR Poker Counter</h1>
        <p>
            Create a private table for your group, or enter a room code to join one.
        </p>
        </div>

        <form id="create-lobby-form" class="card stack">
        <div>
            <span class="label">Host a game</span>
            <h2>Create a table</h2>
            <p>Start a new room and share its code with your players.</p>
        </div>

        <label class="stack">
            <span class="label">Your name</span>
            <input
            id="create-player-name"
            name="playerName"
            type="text"
            maxlength="20"
            autocomplete="nickname"
            placeholder="Enter your name"
            required
            />
        </label>

        <div class="horizontal">
            <button type="submit">Create room</button>
        </div>
        </form>

        <form id="join-lobby-form" class="card stack">
            <div>
                <span class="label">Join a game</span>
                <h2>Enter a room</h2>
                <p>Use the room code supplied by the host.</p>
            </div>

            <label class="stack">
                <span class="label">Your name</span>
                <input
                id="join-player-name"
                name="playerName"
                type="text"
                maxlength="20"
                autocomplete="nickname"
                placeholder="Enter your name"
                required
                />
            </label>

            <label class="stack">
                <span class="label">Room code</span>
                <input
                id="room-code"
                name="roomCode"
                type="text"
                maxlength="12"
                autocomplete="off"
                autocapitalize="characters"
                placeholder="e.g. A7K9"
                required
                />
            </label>

            <div class="horizontal">
                <button type="submit">Join room</button>
            </div>
        </form>

        <div id="menu-error" class="card" hidden aria-live="polite"></div>
    </section>
    `;
//   root.innerHTML = `
//     <button id="infoBtn">ⓘ</button>
//     <div class="info">
//         <div class="horizontal">
//             <!-- <img src="poker-chips.png" alt="Poker Chips" class="logo"> -->
//             <button id="closeInfo">X</button>
//             <h1>AR Poker Counter</h1>
//         </div>
//         <p>Welcome to the AR Poker Counter project! This project is designed to help poker players keep track of their chips and bets using augmented reality technology. With this tool, you can easily visualize your chip stack and make informed decisions during the game.</p>
            
//         <h2>Features</h2>
//         <ul>
//             <li>Real-time chip counting using AR technology</li>
//             <li>Visual representation of chip stacks</li>
//             <li>Easy-to-use interface for tracking bets and wins</li>
//             <li>Compatibility with various poker games</li>
//         </ul>

//         <h2>Getting Started</h2>
//         <p>To get started with the AR Poker Counter, follow these steps:</p>
//         <ol>
//             <li>Download and install the AR Poker Counter app on your device.</li>
//             <li>Set up your poker table and ensure good lighting for optimal AR performance.</li>
//             <li>Open the app and point your device's camera at your chip stack.</li>
//             <li>The app will automatically detect and count your chips, displaying the total value on the screen.</li>
//             <li>You can also use the app to track bets and wins throughout the game.</li>
//         </ol>

//         <h2>Contact Us</h2>
//         <p>If you have any questions or feedback about the AR Poker Counter, please feel free to contact us at noahhigpen@gmail.com</p>
//     </div>

//     <!-- <video id="video" autoplay="true"></video> -->

//     <div class="hud">
//         <form id="joinLobbyForm">
//             <input id="roomCode" placeholder="Lobby code" />
//             <input id="playerName" placeholder="Player name" />
//             <div class="menu-actions">
//                 <button type="submit">Join lobby</button>
//                 <button id="createLobbyBtn" type="button">Create lobby</button>
//             </div>
//             <button id="joinBtn">Join lobby</button>
//         </form>
//         <div id="status">Not connected</div>
//         <div id="chipCount">Chips: --</div>
//     </div>
    
//     <script>
//         document.getElementById('closeInfo').addEventListener('click', () => {
//             document.querySelector('.info').style.display = 'none';
//         });
//         document.getElementById('infoBtn').addEventListener('click', () => {
//             document.querySelector('.info').style.display = 'block';
//         });
//     </script>
//     `;

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

  const createLobbyForm = root.querySelector('#create-lobby-form');
  const joinLobbyForm = root.querySelector('#join-lobby-form');
  const roomCodeInput = document.getElementById('room-code');
//   const playerNameInput = document.getElementById('player-name');
  const createPlayerName = document.getElementById('create-player-name');
  const joinPlayerName = document.getElementById('join-player-name');
//   const joinBtn = document.getElementById('joinBtn');
  const statusEl = document.getElementById('status');

  createLobbyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const roomCode = "1234";
    const playerName = createPlayerName.value.trim() || 'Player';
    onJoinLobby({ playerName, roomCode });
  }, { signal: controller.signal });
  
  joinLobbyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const roomCode = roomCodeInput.value.trim().toUpperCase();
    const playerName = joinPlayerName.value.trim() || 'Player';
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