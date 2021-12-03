const ObjectId = require("mongoose").Types.ObjectId;
const jwt = require("jsonwebtoken");
const _ = require("lodash");


function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

function verifyToken(token, picks) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    return _.pick(decoded, picks);
  } catch(e) {
    console.log(e);
  }
}

exports.isValidObjectId = isValidObjectId;
exports.verifyToken = verifyToken;
