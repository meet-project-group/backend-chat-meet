import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

/**
 * Root endpoint used to verify that the chat backend is running.
 * Returns a simple text response.
 */
app.get("/", (req, res) => {
  res.send("Chat backend is running 🚀");
});

const server = http.createServer(app);

/**
 * Initializes the Socket.IO server with CORS enabled.
 * "origin: *" is required when hosting on Render or similar platforms
 * to allow connections from any frontend domain.
 */
const io = new Server(server, {
  cors: {
    origin: "*", // important for Render hosting
    methods: ["GET", "POST"],
  },
});

/**
 * Handles new WebSocket connections.
 * Each connected client receives a unique socket ID.
 */
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  /**
   * Handles a user's request to join a specific chat room.
   * Rooms allow grouping messages so only users in the same room
   * receive each other's messages.
   *
   * @param roomId - The room identifier.
   * @param userName - The display name of the user joining.
   */
  socket.on("join_room", (roomId, userName) => {
    socket.join(roomId);
    console.log(`⚡ Usuario ${userName} se unió: ${roomId}`);
  });

  /**
   * Handles incoming chat messages.
   * When a message is sent, it is emitted to all users within the same room.
   *
   * Expected "data" format:
   * {
   *   roomId: string,
   *   sender: string,
   *   message: string,
   *   time: string
   * }
   */
  socket.on("send_message", (data) => {
    console.log("Message sent:", data);

    io.to(data.roomId).emit("receive_message", {
      sender: data.sender,
      message: data.message,
      time: data.time,
    });
  });

  /**
   * Triggered when a client disconnects from the server.
   * Logs the socket ID for reference.
   */
  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

/**
 * Starts the HTTP and WebSocket server.
 * Uses PORT from environment variables if available (important for deployment).
 */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Servidor en", PORT));
