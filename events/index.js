const { Room } = require('../models/room');

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
                socket.emit("joinedRoom", result);
                return socket.broadcast.emit("joinedRoom", result);
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
          socket.emit("leftRoom", result);
          return socket.broadcast.emit("leftRoom", result);
        }
      )
    })

    socket.on("startGame", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            room.isLive = true;
            room.currentQuestionCount = 1;
            room.save()
                .then(updatedRoom => {
                  const result = {
                    ...updatedRoom,
                    content: updatedRoom.content[0]
                  }

                  socket.emit("start", result)
                  return socket.broadcast.emit("start", result);
                })
                .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    })

    socket.on("nextQuestion", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            const result = {
              ...room,
              content: room.content[room.currentQuestionCount]
            }

            if (room.content.length == 2) {
              socket.emit("hostLastQuestion", result);
              return socket.broadcast.emit("playerLastQuestion", result);
            }
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });

      console.log("asdasdasdasd")
      Room.findOneAndUpdate(
        { gameId: data.gameId },
        { $inc: { currentQuestionCount: 1 } },
        (err, result) => {
          if (err) {
            console.error(err);
            return socket.emit("somethingWrong");
          }

          const returned = {
            ...result,
            content: result.content[result.currentQuestionCount]
          }

          if (result.currentQuestionCount == result.content.length - 2) {
            socket.emit("hostLastQuestion", returned);
            return socket.broadcast.emit("playerLastQuestion", returned);
          }

          socket.emit("hostNextQuestion", returned);
          return socket.broadcast.emit("playerNextQuestion", returned);
        }
      )
    });

    socket.on("lastQuestion", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            console.log(room.content[room.content.length - 1]);
            const result = {
              ...room,
              content: room.content[room.content.length - 1]
            }

            socket.emit("hostEndGame", result);
            return socket.broadcast.emit("playerEndGame", result)
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    });

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