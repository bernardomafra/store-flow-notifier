const amqp = require('amqplib/callback_api');
const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const server = express().listen(PORT, () =>
  console.log(`Listening on ${PORT}`),
);

const wss = new Server({ server });

try {
  const users = [];

  let user = {
    id: null,
    socket: null,
  };

  wss.on('connection', (socket) => {
    console.log(socket);
    const userId = socket.handshake.query.userId;
    if (userId === user.id) {
      console.log(`User ${user.id} already connected, skipping...`);
      user.socket = socket;
      return;
    }

    user.id = userId;
    user.socket = socket;
    users.push(user);
    console.log('New user connected: ', user.id);

    socket.on('close', () => console.log('Client disconnected'));
    socket.on('disconnect', () => console.log('socket disconnected'));
  });

  wss.on('disconnect', () => {
    console.log('disconnected');
  });
} catch (err) {
  console.error('ws error: ', err);
}

try {
  amqp.connect(url, function (connectionError, connection) {
    if (connectionError) throw connectionError;

    console.log('Connected to RabbitMQ');

    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const queueName = 'store-flow-steps';

      channel.assertQueue(queueName, {
        durable: true,
      });

      console.log(
        ' [*] Waiting for messages in queue "%s". To exit press CTRL+C',
        queueName,
      );

      channel.prefetch(1);

      channel.consume(
        queueName,
        function (msg) {
          console.log(' [x] Received %s', msg.content.toString());
          if (user.socket) {
            console.log(' [x] Emitting %s', msg.content.toString());
            user.socket.emit('ws_sfa::STEP', msg.content.toString());
          }
          setTimeout(() => channel.ack(msg), 500);
        },
        {
          noAck: false,
        },
      );
    });
  });
} catch (error) {
  console.error('amqp error: ', err);
}
