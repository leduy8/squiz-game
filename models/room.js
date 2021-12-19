const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  gameId: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6
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
  playerData: {
    type: [mongoose.Schema.Types.Mixed]
  },
  isLive: {
    type: Boolean,
    default: false
  }
});

const Room = mongoose.model("Room", roomSchema);

exports.Room = Room;
