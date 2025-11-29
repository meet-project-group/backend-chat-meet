import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // importante para Render
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("join_room", (roomId, userName) => {
    socket.join(roomId);
    console.log(`⚡ Usuario ${userName} se unió: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    console.log("Message sent:", data);

    io.to(data.roomId).emit("receive_message", {
      sender: data.sender,
      message: data.message,
      time: data.time,
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

// 🔥 Render necesita esto para funcionar
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Servidor en", PORT));

