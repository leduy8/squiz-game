const mongoose = require("mongoose");
const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const playerSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
  },
  pin: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128
  }
});

playerSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  this.password = hash;
}

playerSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
}

playerSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
}

playerSchema.methods.setPin = async function (pin) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pin, salt);
  this.pin = hash;
}

playerSchema.methods.checkPin = async function (pin) {
  console.log(pin);
  return bcrypt.compare(pin, this.pin);
}

const Player = mongoose.model("Player", playerSchema);

function validatePlayer(player) {
  const schema = Joi.object({
    username: Joi.string().min(6).max(20).required(),
    password: Joi.string().min(6).max(255).required(),
    name: Joi.string().min(2).max(20).required(),
    pin: Joi.string().length(6).required()
  })

  return schema.validate(player)
}

exports.Player = Player;
exports.validate = validatePlayer;
