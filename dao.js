// DB SETUP
const { getTimeStringFromDouble } = require("./public/js/util");
const mongodb = require("mongodb");
const {ObjectId} = require("mongodb");

const uri = "mongodb+srv://"+process.env.DBUSERNAME+":"+process.env.DBPASSWORD+"@cluster0.vpqtu1c.mongodb.net?retryWrites=true&w=majority";

class DAO {
    constructor() {
        this.client = new mongodb.MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
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
        if (!meetingId) {
            return undefined
        }
        return this.client.db("Get2Gether").collection("meetings").findOne( {_id: ObjectId(meetingId)});
    }

    getUsersForMeeting(meetingId) {
        return this.client.db("Get2Gether").collection("users").find( {meetingId: ObjectId(meetingId)});
    }

    getUser(userId) {
        return this.client.db("Get2Gether").collection("users").findOne( {_id: ObjectId(userId)});
    }

    getUserFromUsername(username, meetingId) {
        return this.client.db("Get2Gether").collection("users").findOne( {name: username, meetingId: ObjectId(meetingId)});
    }

    updateUserAvailability(userId, availability){
        return this.client.db("Get2Gether").collection("users").updateOne({_id: ObjectId(userId)}, {$set:{availability: availability}})
    }

    createUser(username, meetingId) {
        return this.client.db("Get2Gether").collection("users").insertOne( {meetingId: meetingId, name: username, availability: {}, password: ""})
    }
}

exports.DAO = DAO;

