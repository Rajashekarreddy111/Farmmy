import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './configs/mongodb.js';
import authRouter from './routes/authRoutes.js';
import sellerRouter from './routes/sellerRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/ProductRoutes.js';
import cartRouter from './routes/cartRoute.js';
import adressRouter from './routes/AdressRoute.js';
import orderRouter from './routes/OrderRoute.js';
import messageRouter from './routes/messageRoutes.js';
import newsletterRouter from './routes/newsletterRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// Export io instance for use in other modules
export const getIO = () => io;

try {
  await connectDB();
  await connectCloudinary();
} catch (err) {
  console.error("Startup failed:", err.message);
  process.exit(1);
}

app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true              
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('API is working');
});

app.use('/api/user', authRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/adress', adressRouter);
app.use('/api/order', orderRouter);
app.use('/api/message', messageRouter);
app.use('/api/newsletter', newsletterRouter);

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user authentication
  socket.on('authenticate', (data) => {
    const { userId, userType } = data;
    connectedUsers.set(socket.id, { userId, userType });
    console.log(`User authenticated: ${userId} (${userType})`);
  });
  
  // Handle joining a chat room
  socket.on('joinRoom', (data) => {
    const { productId, otherUserId } = data;
    const roomName = `${productId}-${otherUserId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  });
  
  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    const { productId, otherUserId, content, senderId, senderType } = data;
    const roomName = `${productId}-${otherUserId}`;
    
    // Emit message to room
    io.to(roomName).emit('receiveMessage', {
      content,
      senderId,
      senderType,
      productId,
      otherUserId,
      timestamp: new Date()
    });
    
    console.log(`Message sent to room ${roomName}: ${content}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});