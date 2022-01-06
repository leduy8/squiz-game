const express = require('express');
const { Room, validate } = require("../models/room"); 
const { randomGameId, sortByKeyDesc } = require("../utils")
const router = express.Router();

router.get("/", async (req, res) => {
    const rooms = await Room.find();

    if (!rooms) return res.status(404).send("No room found.");

    return res.send(rooms);
});

router.get("/:id", async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).send("No room with given game ID found.");

    return res.send(room);
});

router.post("/", async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let room = await Room.findOne({ gameId: req.body.gameId });
    if (room) return res.status(400).send("Room is already created.");

    try {
        room = new Room({
            gameId: randomGameId(),
            hostId: req.body.hostId,
            content: req.body.content,
            timePerRound: req.body.timePerRound,
            numOfPlayers: req.body.numOfPlayers,
            playerData: [],
            currentQuestionCount: 0,
            isLive: false
        });
        room = await room.save();

        return res.status(201).send(room);
    } catch (e) {
        console.log(e.message);
    }
})

router.get("/:id/top3", async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).send("No room with given game ID found.");

    leaderboard = room.playerData;
    leaderboard = leaderboard.filter(e => e.score !== 0);
    leaderboard = sortByKeyDesc(leaderboard, "score");

    return res.send(leaderboard.slice(0, 3));
})

router.get("/:id/leaderboard", async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).send("No room with given game ID found.");

    leaderboard = room.playerData;
    leaderboard = leaderboard.filter(e => e.score !== 0);
    leaderboard = sortByKeyDesc(leaderboard, "score");

    return res.send(leaderboard);
})

// ! Only use in development
router.delete("/deleteAll", async (req, res) => {
    await Room.deleteMany({});

    return res.send("Deleted all.");
})

module.exports = router;