require('dotenv').config();
const { connectAMQP } = require('./amqp');

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const server = express().listen(PORT, () =>
  console.log(`Listening on ${PORT}`),
);

const wss = new Server({ server });

const users = [];

let user = {
  id: null,
  socket: null,
};

try {
  wss.on('connection', (socket) => {
    socket.send(
      JSON.stringify({ type: 'welcome', message: 'socket connected' }),
    );

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'new-user') {
        if (message.userId === user.id) {
          console.log(`User ${user.id} already connected, skipping...`);
        } else {
          user.id = message.userId;
          user.socket = socket;
          users.push(user);
          console.log('New user connected: ', user.id);
        }
        connectAMQP(user);
      }
    });

    socket.on('close', () => console.log('Client disconnected'));
    socket.on('disconnect', () => console.log('socket disconnected'));
  });
} catch (err) {
  console.error('ws error: ', err);
}
