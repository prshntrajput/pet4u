// socket.js

import { io } from "socket.io-client";

// ⚠️ Make sure this URL matches your backend Socket.IO server
export const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
