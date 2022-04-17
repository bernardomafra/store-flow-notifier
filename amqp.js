const amqp = require('amqplib/callback_api');
const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';

module.exports = class AMQP {
  connected = false;
  userId = null;

  static connect(userId, socket) {
    if (this.connected || this.userId === userId) {
      return;
    }

    this.userId = userId;
    this.socket = socket;

    try {
      amqp.connect(url, (connectionError, connection) => {
        if (connectionError) {
          this.connected = false;
          throw connectionError;
        }

        console.log('Connected to RabbitMQ');

        connection.createChannel((error1, channel) => {
          if (error1) {
            this.connected = false;
            throw error1;
          }
          const queueName = 'store-flow-steps';
          this.connected = true;

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
            (msg) => {
              console.log(' [x] Received %s', msg.content.toString());
              console.log('user: ', this.userId);
              if (socket) {
                console.log(' [x] (step) Emitting %s', msg.content.toString());
                const messageBufferInJSON = JSON.parse(msg.content.toString());
                socket.emit('step', messageBufferInJSON);
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
  }
};
