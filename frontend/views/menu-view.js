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

  const createLobbyForm = root.querySelector('#create-lobby-form');
  const joinLobbyForm = root.querySelector('#join-lobby-form');
  const roomCodeInput = document.getElementById('room-code');
  const createPlayerName = document.getElementById('create-player-name');
  const joinPlayerName = document.getElementById('join-player-name');
  const statusEl = document.getElementById('status');

  createLobbyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let roomCode = "";
    for (let i = 0; i < 6; i++) {
        const digit = Math.floor(Math.random() * 36);
        if (digit < 10) {
            roomCode += String(digit);
        } else {
            roomCode += String.fromCharCode(digit + 55);
        }
    }
    const playerName = createPlayerName.value.trim() || 'Player';
    onJoinLobby({ playerName, roomCode });
  }, { signal: controller.signal });
  
  joinLobbyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const roomCode = roomCodeInput.value.trim().toUpperCase();
    const playerName = joinPlayerName.value.trim() || 'Player';
    onJoinLobby({ playerName, roomCode });
  }, { signal: controller.signal });

  return {
    unmount() {
      controller.abort();
      root.innerHTML = '';
    }
  };
}