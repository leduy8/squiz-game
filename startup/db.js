const mongoose = require("mongoose");
require("dotenv").config();

module.exports = function () {
  mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log(`Connected to database...`))
  .catch((err) => console.error(new Error(err)));
}