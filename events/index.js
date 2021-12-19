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

            const foundPlayer = room.playerData.some(el => el.id === data.playerId);
            if (!foundPlayer) {
              room.playerData = [...room.playerData, {
                id: data.playerId,
                name: data.playerName,
                score: 0
              }];
            }

            room.markModified('playerData');
            room.save()
                .then(updatedRoom => {
                  return socket.emit("joinedRoom", updatedRoom);
                })
                .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    })

    socket.on("leaveRoom", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            const playerIndex = room.playerData.findIndex(el => el.id === data.playerId);
            if (playerIndex === -1) {
              return socket.emit("playerNotFound", "Can't find player with given index in the room")
            }

            const player = room.playerData.splice(playerIndex, 1);
            room.markModified('playerData');
            room.save()
                .then(updatedRoom => {
                  return socket.emit("leftRoom", updatedRoom);
                })
                .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
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

    socket.on("timeUp", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            const playerIndex = room.playerData.findIndex(el => el.id === data.playerId);
            if (playerIndex === -1) {
              return socket.emit("playerNotFound", "Can't find player with given index in the room")
            }

            room.playerData[playerIndex].score = data.playerScore;
            room.markModified('playerData');
            room.save()
                .then(updatedRoom => {
                  return socket.emit("updatedPlayerData", updatedRoom);
                })
                .catch(err => console.error(err));
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
            return socket.emit("highScore", leaderboard.slice(0, 3));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound", "Cannot find room with given ID");
          });
    })

    socket.on("result", data => {
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
  });
}