const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');
var attrs = [{ name: 'commonName', value: 'contoso.com' }];
var pems = selfsigned.generate(attrs, { days: 365 });
const express = require("express");
const app = express();
const { createServer } = require('https');
const httpsServer = createServer({
  key: pems.private,
  cert: pems.cert,
  rejectUnauthorized: false
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