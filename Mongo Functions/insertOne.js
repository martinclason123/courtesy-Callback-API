var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

// inserts on record into the db, and then runs callback function
const insertRecord = (record, collection, callback) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("courtesyCallback");
    var myobj = record;
    dbo.collection(collection).insertOne(myobj, function (err, res) {
      if (err) throw err;
      let id = myobj._id;
      callback(id);
      db.close();
    });
  });
};

module.exports = insertRecord;
