require("dotenv").config();
const http = require("http");
const connectDB = require("./config/db");
const app = require("./app");
const { connectRedis } = require("./config/redis");
const socketHandler = require("./socket/chatSocket");

connectDB();

const server = http.createServer(app); // ✅ Use this server for both HTTP and Socket.IO
socketHandler(server); // ✅ Attach socket.io to this server

(async () => {
  await connectRedis(); // connect only once
})();

const PORT = process.env.PORT || 8002;

// ❌ DO NOT use app.listen()
// ✅ Use server.listen() so socket.io works
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
