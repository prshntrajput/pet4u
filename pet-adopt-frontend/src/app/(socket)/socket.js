// socket.js

import { io } from "socket.io-client";

// ⚠️ Make sure this URL matches your backend Socket.IO server
export const socket = io("http://localhost:8002", {
  transports: ["websocket"],
  withCredentials: true,
});
