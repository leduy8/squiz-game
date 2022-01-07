const express = require("express");
const app = express();
const { createServer } = require('http');
const httpServer = createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

require("./startup/keySetup")();
require("./startup/db")();
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/validation")();
require("./events")(io);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});