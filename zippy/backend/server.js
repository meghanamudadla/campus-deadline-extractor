const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

const connectedUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    io.emit('user_status', { userId, status: 'online' });
  });

  socket.on('send_message', (data) => {
    const receiverSocketId = connectedUsers.get(data.receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        io.emit('user_status', { userId, status: 'offline' });
        break;
      }
    }
  });
});

server.listen(5000, () => console.log('Backend running on port 5000'));