const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  transports: ['websocket', 'polling'],
});

module.exports = {
  io,
  server,
};

// send html file on /
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

io.on('connection', (socket) => {
  console.log(socket.id, ' user connected');
  socket.on('disconnect', () => console.log('user disconnected'));
});

io.on('error', (err) => console.log(err));

io.on('close', () => console.log('Client disconnected'));
io.on('disconnect', () => console.log('socket disconnected'));
