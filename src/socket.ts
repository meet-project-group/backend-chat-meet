import { Server, Socket } from "socket.io";

export function registerChatHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // === UNIRSE A UN ROOM ===
    socket.on("join_room", (roomId: string, userName: string) => {
      socket.join(roomId);

      socket.to(roomId).emit("userJoined", {
        id: socket.id,
        name: userName,
      });

      console.log(`User ${userName} joined room: ${roomId}`);
    });

    // === MENSAJE DE CHAT ===
    socket.on("send_message", (data) => {
      // data = { roomId, sender, message, time }
      io.to(data.roomId).emit("receive_message", data);
      console.log("Message sent:", data);
    });

    // === AL DESCONECTAR ===
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
