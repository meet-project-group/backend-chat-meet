import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Cuando alguien entra a una sala
  socket.on("join_room", (roomId, userName) => {
    socket.join(roomId);
    console.log(`⚡ Usuario ${userName} se unió: ${roomId}`);
  });

  // Cuando alguien envía mensaje
  socket.on("send_message", (data) => {
    console.log("Message sent:", data);

    // Redistribuir el mensaje a todos los de la sala
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

server.listen(4000, () => console.log("Servidor en 4000"));
