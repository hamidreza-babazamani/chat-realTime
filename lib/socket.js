import { Server } from "socket.io";

// userId -> socketId (چند تب: آخرین socket)
export const userSocketMap = {};
// مجموعه userId های آنلاین
export const onlineUsers = new Set();

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL?.split(",") || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      onlineUsers.add(userId);
      console.log(" User connected:", userId);
    }

    io.emit("getOnlineUsers", [...onlineUsers]);

    socket.on("disconnect", () => {
      // فقط اگر همین socket هنوز map شده، پاک کن
      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        onlineUsers.delete(userId);
        console.log(" User disconnected:", userId);
      }
      io.emit("getOnlineUsers", [...onlineUsers]);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

// helper: ارسال event به یک کاربر خاص
export const emitToUser = (userId, event, payload) => {
  const socketId = userSocketMap[userId];
  if (socketId && io) io.to(socketId).emit(event, payload);
};
