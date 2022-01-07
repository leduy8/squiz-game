const fs = require('fs');
const path = require('path');
const express = require("express");
const app = express();
const { createServer } = require('https');
const httpsServer = createServer({
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem"))
}, app);
const { Server } = require("socket.io");
const io = new Server(httpsServer, {
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
httpsServer.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});