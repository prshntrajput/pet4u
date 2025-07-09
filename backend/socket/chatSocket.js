// backend/socket/chatSocket.js

const Message = require("../models/Message");

const onlineUsers = {}; // userId -> socketId

module.exports = function (server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Add user to online map
    socket.on("addUser", (userId) => {
      if (userId) {
        onlineUsers[userId] = socket.id;
        console.log("🟢 User online:", userId);
      } else {
        console.warn("⚠️ No userId passed to addUser");
      }
    });

    // Handle sending message
    socket.on("sendMessage", async ({ from, to, text }) => {
      if (!from || !to || !text) {
        console.error("❌ Invalid message payload:", { from, to, text });
        return;
      }

      try {
        const newMessage = await Message.create({ from, to, text });

        // Send to receiver if online
        const receiverSocketId = onlineUsers[to];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // Send to sender as well (for confirmation)
        socket.emit("newMessage", newMessage);
      } catch (err) {
        console.error("❌ Error creating message:", err.message);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );
      if (userId) {
        delete onlineUsers[userId];
        console.log("🔴 User offline:", userId);
      }
    });
  });
};
