const { Player } = require('../models/player');
const { Room } = require('../models/room');
const { randomGameId, sortByKeyDesc } = require("../utils");

module.exports = function (io) {
  io.on("connection", socket => {
    socket.on("createRoom", data => {
      const gameId = randomGameId();
      const room = new Room({
        "hostId": data.hostId,
        "gameId": gameId,
        "content": data.content,
        "timePerRound": data.timePerRound,
        "numOfPlayers": data.numOfPlayers,
        "playerData": [{
          id: data.hostId,
          name: data.hostName,
          score: 0
        }]
      });
      room.save()
          .then(() => {
            socket.emit("roomCreated", gameId);
          })
          .catch(err => console.error(err));
    });

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
                return socket.emit("joinedRoom", result);
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
          return socket.emit("leftRoom", result);
        }
      )
    })

    socket.on("startGame", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            room.isLive = true;
            room.save()
                .then(updatedRoom => {
                  return socket.emit("start", updatedRoom);
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

    socket.on("top3", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            leaderboard = room.playerData;
            leaderboard = leaderboard.filter(e => e.score !== 0);
            leaderboard = sortByKeyDesc(leaderboard, "score");
            return socket.emit("highScore", leaderboard.slice(0, 3));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    })

    socket.on("leaderboard", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            leaderboard = room.playerData;
            leaderboard = sortByKeyDesc(leaderboard, "score");
            return socket.emit("gameResult", leaderboard);
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    })

    // ? utils sockets
    socket.on("roomInfo", data => {
      Room.findOne({ gameId: data.gameId })
            .then(room => {
              return socket.emit("roomInfoRes", room);
            })
            .catch(err => {
              console.error(err);
              return socket.emit("roomNotFound", "Cannot find room with given ID");
            });
    })
  });
}