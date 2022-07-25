var MongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var url = "mongodb://127.0.0.1:27017/";

const updateOne = (objId, todaysCollection, newValues, callback, message) => {
  console.log(typeof objId);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("courtesyCallback");
    dbo
      .collection(todaysCollection)
      .updateOne({ _id: ObjectID(objId) }, newValues, function (err, res) {
        if (err) throw err;
        console.log(message);
        db.close();
        callback(204);
      });
  });
};
module.exports = updateOne;
