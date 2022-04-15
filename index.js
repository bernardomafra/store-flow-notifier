require('dotenv').config();
const { connectAMQP } = require('./amqp');

const UserNamespace = require('./socket/namespaces/user');
const { server } = require('./socket/setup/server');

const PORT = process.env.PORT || 3000;

UserNamespace.init();
server.listen(PORT, () => console.log(`🔥 Socket listening on port ${PORT}!`));

const users = [];

let user = {
  id: null,
  socket: null,
};
