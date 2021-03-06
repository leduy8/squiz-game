const express = require("express");
require("dotenv").config();
const players = require("../routes/players");
const rooms = require("../routes/rooms");
const auth = require("../routes/auth");
const helmet = require("helmet");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
  app.use("/api/players", players);
  app.use("/api/rooms", rooms);
  app.use("/api/auth", auth);
}