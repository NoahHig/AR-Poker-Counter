import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const roomCodeInput = document.querySelector('#roomCode');
const playerNameInput = document.querySelector('#playerName');
const joinBtn = document.querySelector('#joinBtn');
const addChipsBtn = document.querySelector('#addChipsBtn');
const statusEl = document.querySelector('#status');

const express = require("express");
const app = express();
const port = 3000;

app.listen(port);
app.set("view engine", "ejs");

joinBtn.addEventListener('click', () => {
  const roomCode = roomCodeInput.value.trim().toUpperCase();
  const playerName = playerNameInput.value.trim() || 'Player';

  socket.emit('join-game', {
    roomCode,
    playerName
  });
});

addChipsBtn.addEventListener('click', () => {
  const roomCode = roomCodeInput.value.trim().toUpperCase();
  socket.emit('add-chips', {
    roomCode,
    amount: 10
  });
});

socket.on('connection', () => {
  console.log('Client connected');
  statusEl.textContent = 'Socket connected';
});

socket.on('joined-game', (payload) => {
  statusEl.textContent = `Joined ${payload.roomCode} as ${payload.playerName}`;
  window.appState.chips = payload.chips;
  document.querySelector('#chipCount').textContent = `Chips: ${payload.chips}`;
  document.querySelector('#markerText').setAttribute('value', `Chips: ${payload.chips}`);
});

socket.on('chip-update', (payload) => {
  window.appState.chips = payload.chips;
  document.querySelector('#chipCount').textContent = `Chips: ${payload.chips}`;
  document.querySelector('#markerText').setAttribute('value', `Chips: ${payload.chips}`);
});

app.get("/poker", (req, res) => {
  res.render("index");
});