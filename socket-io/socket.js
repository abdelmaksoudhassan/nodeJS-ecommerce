let io;

module.exports = {
  init: (httpServer,cors) => {
    io = require('socket.io')(httpServer,cors);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
