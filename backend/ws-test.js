const { io } = require('socket.io-client');
const socket = io('ws://localhost:5000');
socket.on('connect', () => {
  console.log('Povezan!');
  process.exit(0);
});
socket.on('connect_error', (err) => {
  console.error('Greška:', err.message);
  process.exit(1);
});
