const AMQP = require('../../../amqp');
const { io } = require('../../setup/server');
const UserEvents = require('./events');

exports.init = () => {
  console.log('👤 [Namespace:User] Initialized');
  io.of('/user').on('connection', (socket) => {
    console.log(`ID: (${socket.id}) connected in user namespace`);

    socket.on('new-user', (userId) => {
      console.log(`[User::Event] new-user: ${userId}`);
      AMQP.connect(userId, socket);
    });
    socket.on('pause', UserEvents.pause);
    socket.on('sync', UserEvents.sync);
  });
};
