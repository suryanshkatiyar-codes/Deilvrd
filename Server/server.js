import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDb from "./src/config/db.js";
import config from "./src/config/config.js";
import "./src/queues/releaseWorker.js";

connectDb();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

export { io };

httpServer.listen(config.PORT, () => {
  console.log("Server is running on port 3000");
});