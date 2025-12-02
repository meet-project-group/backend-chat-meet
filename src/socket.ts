import { Server, Socket } from "socket.io";

/**
 * Registers all chat-related Socket.IO event handlers.
 * This function sets up listeners for room joining, sending messages,
 * and user disconnections.
 *
 * @param io - The Socket.IO server instance.
 */
export function registerChatHandlers(io: Server) {
  // Runs when a new client establishes a socket connection.
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // === JOIN A ROOM ===
    /**
     * Handles a client's request to join a specific room.
     * Broadcasts an event to other users in the room notifying that
     * a new user has joined.
     *
     * @param roomId - Unique identifier of the chat room.
     * @param userName - Display name of the user joining the room.
     */
    socket.on("join_room", (roomId: string, userName: string) => {
      socket.join(roomId);

      socket.to(roomId).emit("userJoined", {
        id: socket.id,
        name: userName,
      });

      console.log(`User ${userName} joined room: ${roomId}`);
    });

    // === CHAT MESSAGE ===
    /**
     * Receives a chat message payload from a user and emits it
     * to all clients inside the same room.
     *
     * Expected data format:
     * {
     *   roomId: string,
     *   sender: string,
     *   message: string,
     *   time: string
     * }
     */
    socket.on("send_message", (data) => {
      io.to(data.roomId).emit("receive_message", data);
      console.log("Message sent:", data);
    });

    // === ON DISCONNECT ===
    /**
     * Triggered when a user disconnects from the Socket.IO server.
     * Logs the disconnection event using the socket ID.
     */
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
