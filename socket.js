// socket.js
import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // ajuste selon ton frontend
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log("🟢 Client connecté :", socket.id);
  });
  return io;
};

export default {
  emit: (...args) => io?.emit(...args),
};
