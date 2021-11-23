const express = require("express");
require("dotenv").config();
const helmet = require("helmet");

module.exports = function (app) {
  app.use(express.json());
  app.use(helmet());
}