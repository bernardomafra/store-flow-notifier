exports.newUser = (socket, data) => {
  console.log('[User::Event] new-user:', socket.id, data);
  socket.join(`user_${data}`);
};
exports.pause = (data) => console.log('pause', data);
exports.sync = (data) => console.log('sync', data);
