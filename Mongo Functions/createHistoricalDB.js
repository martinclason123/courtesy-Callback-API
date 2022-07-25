var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const createHistoricalDB = (date) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var dbo = db.db("courtesyCallback");
    const collections = dbo.listCollections({ name: "callbackRequests" });
    if (!collections) {
      dbo.createCollection("callbackRequests", function (err, res) {
        if (err) {
          throw err;
        } else {
          console.log("Collection created!");
        }
        db.close();
      });
    } else {
      console.log("collection already exists...");
    }
  });
};

module.exports = createHistoricalDB;
