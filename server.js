import express from "express";
import next from "next";
import http from "http";
import { initSocket } from "./src/lib/socket.server.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // ✅ init socket
  initSocket(httpServer);

  server.all("*", (req, res) => handle(req, res));

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});