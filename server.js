import express from "express";
import next from "next";
import http from "http";
import { initSocket } from "./src/lib/socket.server.js"; // ✅ correct import

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// ✅ Render uses dynamic PORT
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // ✅ Init socket
  initSocket(httpServer);

  // ✅ Express v5 fix (use regex instead of "*")
  server.all(/.*/, (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});