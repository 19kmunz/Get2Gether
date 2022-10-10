// DB SETUP
const { getTimeStringFromDouble } = require("./public/js/util");
const mongodb = require("mongodb");

const uri = "mongodb+srv://"+process.env.DBUSERNAME+":"+process.env.DBPASSWORD+"@cluster0.vpqtu1c.mongodb.net?retryWrites=true&w=majority";

const meetingData = {
    "77429c8c-e46d-4886-9fc1-ff69e0880645" : {
        id: "77429c8c-e46d-4886-9fc1-ff69e0880645",
        name: "Lovely Meeting",
        days: ["Monday", "Tuesday", "Wednesday"],
        startTime: 9,
        endTime: 11,
        users: ["6f0f383f-60c2-4138-840b-3dee7c3e901b"]
    }
}

const userData = {
    "6f0f383f-60c2-4138-840b-3dee7c3e901b": {
        id: "6f0f383f-60c2-4138-840b-3dee7c3e901b",
        meetingId: "77429c8c-e46d-4886-9fc1-ff69e0880645",
        name: "exampleUser",
        password: "",
        availability: {
            Monday: { '09:00': true, '09:30': true, '10:00':true,'10:30':true, '11:00' :false },
            Tuesday: {},
            Wednesday: { '09:00':true, '09:30':false }
        }
    }
};

class DAO {
    constructor() {
        this.client = new mongodb.MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.collection = null;
        this.client
            .connect()
            .then(() => {
                // will only create collection if it doesn't exist
                return this.client.db("Get2Gether").collection("meetings");
            })
            .then(__collection => {
                // store reference to collection
                console.log("DB Connection Success")
                this.collection = __collection;
            });
    }

    generateTotalAvailability(days, startTime, endTime, users) {
        let totalAvailability = {}

        // Set up availability matrix
        days.forEach( (day) => {
            totalAvailability[day] = {};
            for(let t = startTime; t <= endTime; t+=0.5){
                let time = getTimeStringFromDouble(t);
                totalAvailability[day][time] = [];
            }
        })

        // For each user, add their availability to the total availability
        for(let userKey in users){
            let user = users[userKey];
            for(let dayKey in user.availability){ // For each day
                let day = user.availability[dayKey];
                for(let hourKey in day){ // For each segment of availability
                    if(day[hourKey]) {
                        totalAvailability[dayKey][hourKey].push(user.name)
                    }
                }
            }
        }

        return totalAvailability;
    }

    getMeeting(meetingId) {
        if(!meetingId){
            return undefined
        }
        return meetingData[meetingId];
    }

    getUsersForMeeting(meetingId) {
        let users = [];
        meetingData[meetingId].users.forEach((userId) => users.push(this.getUser(userId)))
        return users;
    }

    getUser(userId) {
        return userData[userId]
    }
}

exports.DAO = DAO;

