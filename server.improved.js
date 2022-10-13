const express = require("express");
const bodyParser = require("body-parser");
const cookie = require("cookie-session");
const {DAO} = require("./dao");
const app = express();
const dao = new DAO();

app.use(express.urlencoded({ extended: true }));

// COOKIE MIDDLEWARE
app.use(
    cookie({
      name: "session",
      keys: ["4zFTJx2rVu3AkB", "aMPnwJ9c4f4DZy"]
    })
)

// API
// get
app.get("/getMeetingData", (request, response) => {
  let meetingId = request.query.meetingId
  dao.getMeeting(meetingId).then (meeting => {
    if (meeting) {
      dao.getUsersForMeeting(meetingId).toArray().then(users => {
        let totalAvailability = dao.generateTotalAvailability(meeting.days, meeting.startTime, meeting.endTime, users)

        response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
        response.end(JSON.stringify({
          meetingData: meeting,
          totalAvailability: totalAvailability
        }))
      })
    } else {
      response.writeHead(400, "Bad Meeting Id For Retrieval", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({}))
    }
  })
});

app.get("/getUserData", (request, response) => {
  let userId = request.query.userId
  dao.getUser(userId).then(user => {
    console.log(user)
    if (user) {
      response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({
        user: user
      }))
    } else {
      response.writeHead(400, "Bad User Id For Retrieval", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({}))
    }
  })
});
//post
app.post("/login", bodyParser.json(), (request, response) => {
  console.log("User login detected!");
  console.log(request.body)
  dao.getUserFromUsername(request.body.username, request.body.meetingId).then(user => {
    if (user) {
      // Successful sign in
      response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({
        user: user
      }))
    } else {
      // Create new user
      dao.createUser(request.body.username, request.body.meetingId).then(result => {
        if(result.acknowledged) {
          dao.getUser(result.insertedId).then(user => {
            response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
            response.end(JSON.stringify({
              user: user
            }))
          })
        } else {
          response.writeHead(400, "Sometime went wrong and you could not be signed in", {'Content-Type': 'text/plain'})
          response.end(JSON.stringify({}))
        }
      })
    }
  })
});

app.post("/sendUserData", bodyParser.json(), (request, response) => {
  console.log("User data detected!");
  dao.updateUserAvailability(request.body.userId, request.body.availability).then(res => {
    if (res.acknowledged) {
      response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({
        modifiedCount: res.modifiedCount
      }))
    } else {
      response.writeHead(400, "Bad User Id For Update", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({}))
      console.log(res)
    }
  })
});

// Express setup
app.use(express.static("./public/"));

// Listen!!!
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});