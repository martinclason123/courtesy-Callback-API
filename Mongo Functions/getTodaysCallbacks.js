var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
const getTodaysCallbacks = (todaysCollection, callback) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("courtesyCallback");
    dbo
      .collection(todaysCollection)
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        callback(result);
        db.close();
      });
  });
};

module.exports = getTodaysCallbacks;
