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
  } catch (e) {
    console.log(e);
  }
}

function randomGameId() {
  return Math.floor(Math.random() * 900000 + 100000).toString();
}

function sortByKey(array, key) {
  return array.sort(function(a, b)
  {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function sortByKeyDesc(array, key) {
  return array.sort(function(a, b)
  {
    var x = a[key]; var y = b[key];
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
  });
}

exports.isValidObjectId = isValidObjectId;
exports.verifyToken = verifyToken;
exports.randomGameId = randomGameId;
exports.sortByKey = sortByKey;
exports.sortByKeyDesc = sortByKeyDesc;
