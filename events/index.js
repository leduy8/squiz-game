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
            const foundPlayer = room.playerData.some(el => el.id === data.playerId);
            if (!foundPlayer) {
              room.playerData = [...room.playerData, {
                id: data.playerId,
                name: data.playerName,
                score: 0
              }];
            }

            room.save()
                .then(updatedRoom => {
                  return socket.emit("joinedRoom", updatedRoom);
                })
                .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound");
          });
    })

    socket.on("leaveRoom", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            const playerIndex = room.playerData.findIndex(el => el.id === data.playerId);
            if (playerIndex !== -1) {
              const player = room.playerData.splice(playerIndex, 1);
              console.log(player);
              room.save()
                  .then(updatedRoom => {
                    return socket.emit("leftRoom", updatedRoom);
                  })
                  .catch(err => console.error(err));
            }
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound");
          });
    })

    socket.on("startGame", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            room.isLive = true;
            room.save()
                .then(() => {
                  return socket.emit("start");
                })
                .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound");
          });
    })

    socket.on("timeUp", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            const playerIndex = room.playerData.findIndex(el => el.id === data.playerId);
            if (playerIndex !== -1) {
              room.playerData[playerIndex] = {
                id: data.playerId,
                name: data.playerName,
                score: data.playerScore
              };
            }

            room.save()
                .then(updatedRoom => {
                  return socket.emit("updatedPlayerData", updatedRoom);
                })
                .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound");
          });
    })

    socket.on("leaderboard", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            leaderboard = room.playerData;
            leaderboard = sortByKey(leaderboard, "score");
            return socket.emit("highScore", leaderboard.slice(0, 3));
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound");
          });
    })

    socket.on("result", data => {
      Room.findOne({ gameId: data.gameId })
          .then(room => {
            leaderboard = room.playerData;
            leaderboard = sortByKey(leaderboard, "score");
            return socket.emit("highScore", leaderboard);
          })
          .catch(err => {
            console.error(err);
            return socket.emit("roomNotFound");
          });
    })
  });
}