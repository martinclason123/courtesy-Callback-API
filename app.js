const express = require("express");
const app = express();

// Imports
const cors = require("cors"); // allows API calls from react front end
const insertOne = require("./Mongo Functions/insertOne"); // needed for inserting new records into db after a callback is requested
const updateOne = require("./Mongo Functions/updateOne"); // needed for updating records after a callback is fulfilled
const nodeCron = require("node-cron"); // needed for creating a new collection daily
const createCollection = require("./Mongo Functions/createCollection"); // needed to create a daily collection
const dateString = require("./JS functions/dateString"); //returns a date object in mm/dd/yyyy string format
const formattedTime = require("./JS functions/formattedTime"); // used to send date objects as formatted strings to API requests
const getTodaysCallbacks = require("./Mongo Functions/getTodaysCallbacks"); // queries the db for todays calls only. Used for front end dashboard
const getElapsedTime = require("./JS functions/getElapsedTime"); // takes a date object, and estimates the time since it was created, returned as a sting hh:mm:ss
const queryBetweenDates = require("./Mongo Functions/queryBetweenDates"); // takes a query string and queries the db

//global variables
let todaysCollection = dateString(new Date()); // variable for creating a new collection daily to keep db reads quick

// allows react front end to make API calls without being blocked by cors
app.use(
  cors({
    origin: "*",
  })
);
// Adds the previous days data to the historical collection, and creates new daily table
nodeCron.schedule(
  "47 6 * * *",
  () => {
    // creating a variable to be added to the historical collection
    getTodaysCallbacks(todaysCollection, (result) => {
      console.log(result);
      // loops through the calls for the day and adds them to the historical collection
      for (let i = 0; i < result.length; i++) {
        insertOne(result[i], "callbackRequests", () => {
          console.log("Data added to historical collection...");
        });
      }
    });

    // creates a new collection daily, to keep live dashboard queries light
    todaysCollection = dateString(new Date());
    createCollection(todaysCollection);
  },
  { timezone: "America/Detroit" }
);

//GET endpoint. receives a phone number, adds it to the database, and responds with the unique ID
// this endpoint can be reached at http://[ip address]:3000/requestCallback
app.get("/requestCallback", (req, res) => {
  // variable for response string
  let message = "";
  // local variable to store callback number
  let callbackNumber = req.query.callbackNumber;
  // API will not add a record unless token is present in query params
  if (
    (req.query.token =
      null || req.query.token != "821004e3-2e54-43d8-a4aa-18ecaf9e3113")
  ) {
    res.status(401);
    res.send();
  } else {
    try {
      // Makes sure a number is present
      if (callbackNumber != null) {
        //makes sure a 10 character string is received
        if (
          typeof callbackNumber === "string" &&
          callbackNumber.length === 10
        ) {
          console.log(req.socket.remoteAddress);
          // creates record to insert into DB
          let record = {
            agent: "unselected",
            status: "pending",
            date: new Date(),
            callbackNumber: callbackNumber,
          };
          //inserts record into DB and responds with unique id, which will be used for fulfillment in the /fulfill API endpoint
          insertOne(record, todaysCollection, (id) => {
            res.status(200);
            res.send(id);
          });
        } else {
          message = "Bad Request";
          res.status(400);
          res.send(message);
        }
      }
    } catch (err) {
      res.status(500);
      if (err) res.send(err.message);
    }
  }
});

//GET endpoint. receives a unique id provided earlier by /requestCallback, as well as the agent name. It then updates the record in the db.
// this endpoint can be reached at http://[ip address]:3000/requestCallback
app.get("/fulfill", (req, res) => {
  let id = req.query.id;
  let agent = req.query.agent;
  let error = new Error();
  try {
    // verifies correct token, and that agent and id query params are present
    if (req.query.token != "821004e3-2e54-43d8-a4aa-18ecaf9e3113") {
      res.status(401);
      res.send();
    } else {
      if (id == null || id == "") {
        error.message = "Bad ID";
        throw error;
      }
      if (agent == null || agent == "") {
        error.message = "Bad Agent";
        throw error;
      }

      let formattedId = id.replace(/"/g, "");
      let timeNow = new Date();

      updateOne(
        formattedId,
        todaysCollection,
        { $set: { status: "fulfilled", agent: agent, fulfilledAt: timeNow } },
        () => {
          res.status(204);
          res.send();
        },
        "record updated to fulfilled"
      );
    }
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// Queries the db and returns todays callback requests only
app.get("/dashboard", (req, res) => {
  if (req.query.token != "821004e3-2e54-43d8-a4aa-18ecaf9e3113") {
    res.status(401);
    res.send();
  } else {
    try {
      getTodaysCallbacks(todaysCollection, (data) => {
        // loops through response formatting data for easy API use
        for (let i = 0; i < data.length; i++) {
          let dateString = data[i].date;

          data[i].formattedDate = formattedTime(dateString);
          if (data[i].status !== "fulfilled") {
            data[i].elapsedTime = getElapsedTime(dateString);
          } else {
            data[i].fulfilledAtFormatted = formattedTime(data[i].fulfilledAt);
          }
        }
        res.send(data);
      });
    } catch (err) {
      res.status(500);
      res.send(err.message);
    }
  }
});

// used to query the db by date and optionally phone number
app.get("/reporting", (req, res) => {
  console.log(req.query.startDate);
  console.log(req.query.endDate);
  queryBetweenDates(
    req.query.startDate,
    req.query.endDate,
    req.query.phoneNumber,
    (result) => {
      for (let i = 0; i < result.length; i++) {
        let dateString = result[i].date;
        result[i].formattedDate = formattedTime(dateString);
        result[i].fulfilledAtFormatted = formattedTime(result[i].fulfilledAt);
      }
      res.send(result);
    }
  );
});

// API listens on port 3000
app.listen(3000, () => {
  console.log(`API listening on port 3000`);
});
