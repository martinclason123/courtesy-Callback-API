var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://127.0.0.1:27017/";
const queryBetweenDates = (startDate, endDate, callbackNumber, callback) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("courtesyCallback");
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    endDate.setUTCHours(23, 59, 59, 59);
    console.log("start Date: " + startDate);
    console.log("end date :" + endDate);
    dbo
      .collection("callbackRequests")
      .find({
        date: { $gte: startDate, $lt: endDate },
        callbackNumber: { $regex: callbackNumber },
      })
      .toArray(function (err, result) {
        if (err) throw err;
        callback(result);
        db.close();
      });
  });
};

module.exports = queryBetweenDates;
