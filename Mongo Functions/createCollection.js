var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const createCollection = (date) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("courtesyCallback");
    dbo.createCollection(date, function (err, res) {
      if (err) {
        throw err;
      } else {
        console.log("Collection created!");
      }
      db.close();
    });
  });
};

module.exports = createCollection;
