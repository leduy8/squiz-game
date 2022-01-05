const { Room } = require('../models/room');
const { randomGameId, sortByKeyDesc } = require("../utils");

module.exports = function (io) {
  io.on("connection", socket => {
    socket.on("joinRoom", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            if (room.playerData.length >= room.numOfPlayers) {
              return socket.emit("roomFull", "Room is full!");
            }

            Room.findOneAndUpdate(
              { gameId: data.gameId }, 
              { $push: { "playerData": { 
                "id": data.playerId,
                "name": data.playerName,
                "score": 0
              } } }, 
              { new: true },
              (err, result) => {
                if (err) 
                  return console.error(err);
                return socket.boardcast.emit("joinedRoom", result);
              }
            )
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    })

    socket.on("leaveRoom", data => {
      Room.findOneAndUpdate(
        { gameId: data.gameId, "playerData.id": data.playerId }, 
        { $pull: { "playerData": { "id": data.playerId } } }, 
        { new: true },
        (err, result) => {
          if (err) 
            return console.error(err);
          return socket.boardcast.emit("leftRoom", result);
        }
      )
    })

    socket.on("startGame", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            room.isLive = true;
            room.save()
                .then(updatedRoom => {
                  return socket.boardcast.emit("start", updatedRoom);
                })
                .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    })

    socket.on("submitAnswer", data => {
      Room.findOneAndUpdate(
        { gameId: data.gameId, "playerData.id": data.playerId }, 
        { $set: { "playerData.$.score": data.playerScore } }, 
        { new: true },
        (err, result) => {
          if (err) {
            console.error(err);
            return socket.emit("somethingWrong");
          }
          return socket.emit("submited", { gameId: data.gameId });
        }
      )
    })
  });
}