const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const port = 5000;

const appServer = createServer(app);
const io = new Server(appServer, {
  cors: {
    origin: "https://chat-app-delta-three-25.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active users
const activeUsers = new Map();

app.get("/", (req, res) => {
  res.send("Server status : Running");
});

// Function to broadcast updated user list to all clients
function broadcastUserList() {
  const usersArray = Array.from(activeUsers.values());
  io.emit("update_user_list", usersArray);
}

io.on("connection", (socket) => {
  console.log(`user connected (${socket.id})`);

  // Register new user with username
  socket.on("register_user", (userData) => {
    const user = {
      id: socket.id,
      username: userData.username || `User_${socket.id.substring(0, 5)}`,
      status: "online",
      lastSeen: new Date(),
    };

    activeUsers.set(socket.id, user);
    socket.emit("user_registered", user);
    broadcastUserList();

    // Notify all other users that a new user has connected
    socket.broadcast.emit("user_connected", user);
    console.log(`User registered: ${user.username} (${socket.id})`);
  });

  // send message to a specific user by their ID
  socket.on("send_message_by_id", ({ receiver, message, sender }) => {
    const messageData = {
      id: Date.now(),
      sender: sender || activeUsers.get(socket.id)?.username || "Unknown",
      receiver,
      message,
      timestamp: new Date(),
    };

    socket.to(receiver).emit("receive_message_by_id", messageData);
    socket.emit("message_sent", messageData);
  });

  // Broadcast message to all users
  socket.on("send_broadcast_message", ({ message, sender }) => {
    const messageData = {
      id: Date.now(),
      sender: sender || activeUsers.get(socket.id)?.username || "Unknown",
      message,
      timestamp: new Date(),
    };

    socket.broadcast.emit("receive_broadcast_message", messageData);
    socket.emit("message_sent", messageData);
  });

  // Create a Room and send message
  socket.on("create_and_chat_in_room", ({ roomName, message, sender }) => {
    socket.join(roomName); // Join the room

    const messageData = {
      id: Date.now(),
      sender: sender || activeUsers.get(socket.id)?.username || "Unknown",
      roomName,
      message,
      timestamp: new Date(),
    };

    io.to(roomName).emit("receive_room_message", messageData); // Broadcast to everyone in the room
    socket.emit("message_sent", messageData);
  });

  // Handle typing indicators
  socket.on("typing", ({ receiver, isTyping }) => {
    socket.to(receiver).emit("user_typing", {
      userId: socket.id,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.status = "offline";
      user.lastSeen = new Date();
      activeUsers.delete(socket.id);
      broadcastUserList();
      console.log(`user disconnected: ${user.username} (${socket.id})`);
    } else {
      console.log(`user disconnected (${socket.id})`);
    }
  });
});

appServer.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
