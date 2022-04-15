const amqp = require('amqplib/callback_api');
const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';

exports.connectAMQP = (userId, socket) => {
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
            console.log('user: ', userId);
            if (socket) {
              console.log(' [x] Emitting %s', msg.content.toString());
              const messageBufferInJSON = JSON.parse(msg.content.toString());

              const data = {
                type: 'new-step',
                ...messageBufferInJSON,
              };
              console.log('done: ', messageBufferInJSON);
              socket.emit('step', JSON.stringify(data));
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
};
