require("dotenv").config();

module.exports = function () {
  if (!process.env.SECRET_KEY) {
    console.error(new Error("FATAL ERROR: secret key is not defined."));
    process.exit(1);
  }
}