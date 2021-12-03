const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  gameId: {
    type: Number,
    min: 6,
    max: 6,
  },
  content: [mongoose.Schema.Types.Mixed],
  timePerRound: {
    type: Number,
    min: 1
  },
  numOfPlayers: {
    type: Number,
    min: 1
  },
  playerIds: {
    type: [mongoose.Schema.Types.ObjectId]
  }
});

const Room = mongoose.model("Room", roomSchema);

exports.Room = Room;
