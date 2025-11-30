import { io } from 'socket.io-client';

// Initialize Socket.IO client
const socket = io('https://farmmy-backend.onrender.com', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

// Authentication function
export const authenticateSocket = (userId, userType) => {
  socket.emit('authenticate', { userId, userType });
};

// Join a chat room
export const joinRoom = (productId, otherUserId) => {
  socket.emit('joinRoom', { productId, otherUserId });
};

// Send a message
export const sendMessage = (data) => {
  socket.emit('sendMessage', data);
};

// Listen for incoming messages
export const onReceiveMessage = (callback) => {
  socket.on('receiveMessage', callback);
};

// Remove listener for incoming messages
export const offReceiveMessage = (callback) => {
  socket.off('receiveMessage', callback);
};

export default socket;