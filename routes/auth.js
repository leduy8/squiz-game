const express = require("express");
const Joi = require('joi');
const { Player } = require("../models/player");
const router = express.Router();
const { verifyToken, isValidObjectId } = require('../utils');

router.post("/round1", async (req, res) => {
    const body = verifyToken(req.body.data, ["username", "password"]);
    if (body === "Invalid secret key") {
        return res.status(401).send("Invalid secret key.");
    }

    const { error, value } = validateRound1(body);
    if (error) return res.status(400).send(error.details[0].message);

    let player = await Player.findOne({ username: body.username });
    if (!player) return res.status(400).send("Invalid username or password.");

    try {
        const isValid = await player.checkPassword(body.password);
        if (!isValid) return res.status(400).send("Invalid username or password.");

        const token = player.generateToken();
        res.send(token);
    } catch (e) {
        console.log(e.message);
    }
});

router.post("/round2", async (req, res) => {
    const body = verifyToken(req.body.data, ["_id", "pin"]);
    if (body === "Invalid secret key") {
        return res.status(401).send("Invalid secret key.");
    }

    const { error, value } = validateRound2(body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!isValidObjectId(body._id)) return res.status(400).send("Invalid id.");

    let player = await Player.findById(body._id);
    if (!player) return res.status(400).send("Invalid id.");

    try {
        const isValid = player.checkPin(body.pin);
        if (!isValid) return res.status(400).send("Invalid pin.");

        res.send("Login successfully.");
    } catch (e) {
        console.log(e.message);
    }
});

function validateRound1(req) {
    const schema = Joi.object({
        username: Joi.string().min(6).max(20).required(),
        password: Joi.string().min(6).max(255).required(),
    });

    return schema.validate(req);
}

function validateRound2(req) {
    const schema = Joi.object({
        _id: Joi.string().required(),
        pin: Joi.string().length(6).required()
    });

    return schema.validate(req);
}

module.exports = router;
