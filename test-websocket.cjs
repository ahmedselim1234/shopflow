
const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected successfully!');
  console.log('Socket ID:', socket.id);

  // Send a test message
  socket.emit('ping', {
    message: 'Hello NestJS',
  });
});

socket.on('pong', (data) => {
  console.log('Server response:', data);
});

socket.on('connect_error', (error) => {
  console.log('Connection failed:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
