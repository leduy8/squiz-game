const express = require('express');
const _ = require("lodash");
const { Player, validate } = require("../models/player");
const router = express.Router();
const { isValidObjectId } = require("../utils")

router.get("/", async (req, res) => {
    const players = await Player.find();

    if (!players) return res.status(404).send("No player found.");

    return res.send(players);
})

router.get("/:id", async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id))
            return res.status(400).send("Invalid Id.");

        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).send("Player not found.");
    } catch (e) {
        console.error(e.message);
    }
});

router.post("/", async (req, res) => {
    const { error, value } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let player = await Player.findOne({ username: req.body.username });
    if (player) return res.status(400).send("User is already registered.");

    try {
        player = new Player(_.pick(req.body, ["username", "password", "name", "pin"]));
        await player.setPassword(req.body.password);
        player = await player.save();

        return res.status(201).send(_.pick(player, ["_id", "username", "name"]));
    } catch (e) {
        console.log(e.message);
    }
})

module.exports = router;