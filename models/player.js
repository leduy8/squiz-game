const mongoose = require("mongoose");

const playerSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 20,
  },
});

const Player = mongoose.model("Player", playerSchema);

exports.Player = Player;
exports.playerSchema = playerSchema;
