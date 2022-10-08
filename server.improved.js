const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library used in the following line of code
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

const appdata = [
  { 'id':1, 'name': 'Pippi', 'link': 'https://cdn.discordapp.com/attachments/428381972545404928/884522236025913374/image0.jpg', 'call': 'ARF', 'type': 'cat' },
  { 'id':2, 'name': 'Mordecai', 'link': 'https://cdn.discordapp.com/attachments/428381972545404928/884522261237882910/image0.jpg', 'call': 'MEOW', 'type': 'dog' },
  { 'id':3, 'name': 'Bubba', 'link': 'https://i.imgur.com/Db4cRax.png', 'call': 'I LOVE YOU', 'type':'other'}
];

const meetingData = {
  "77429c8c-e46d-4886-9fc1-ff69e0880645" : {
    id: "77429c8c-e46d-4886-9fc1-ff69e0880645",
    name: "Lovely Meeting",
    days: ["Monday", "Tuesday", "Wednesday"],
    startTime: 9,
    endTime: 11,
  }
}

const userData = {
  "6f0f383f-60c2-4138-840b-3dee7c3e901b": {
    id: "6f0f383f-60c2-4138-840b-3dee7c3e901b",
    name: "exampleUser",
    password: "",
    availability: {
      Monday: [ {startTime: 9, endTime: 10}],
      Tuesday: [],
      Wednesday: [ {startTime: 9, endTime: 9} ]
    }
  }
};

let currId=4;

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }
})

function getTotalAvailability(days, startTime, endTime, users) {
  let totalAvailability = {}

  // Set up availability matrix
  days.forEach( (day) => {
    totalAvailability[day] = {};
    for(let t = startTime; t <= endTime; t++){
      totalAvailability[day][t] = [];
    }
  })

  // For each user, add their availability to the total availability
  for(let userKey in users){
    let user = users[userKey];
    for(let dayKey in user.availability){ // For each day
      user.availability[dayKey].forEach( (segment) => { // For each segment of availability
        for(let t = segment.startTime; t <= segment.endTime; t++){ // For each time in the segment
          totalAvailability[dayKey][t].push(user.name);
        }
      })
    }
  }

  return totalAvailability;
}

function getMeetingInfo(meetingId) {
  return meetingData[meetingId];
}

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 )
  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }
  else if (request.url.toString().slice(0,15) === '/getMeetingData') {
    let url = request.url.toString()
    let meetingId = url.slice(-36)
    if(url.includes('meetingId') && meetingData[meetingId] !== undefined) {
      let meetingInfo = getMeetingInfo(meetingId);
      let totalAvailability = getTotalAvailability(meetingInfo.days, meetingInfo.startTime, meetingInfo.endTime, userData)

      response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({
        meetingData: meetingInfo,
        totalAvailability: totalAvailability
      }))
    } else {
      response.writeHead(400, "Bad Meeting Id For Retrieval", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({}))
    }
  }
  else if (request.url.toString().slice(0,12) === '/getUserData') {
    let url = request.url.toString();
    let userId = url.slice(-36)
    if(url.includes('userId') && userData[userId] !== undefined){
      let user = userData[userId];
      response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify(user))
    } else {
      response.writeHead(400, "Bad User Id For Retrieval", {'Content-Type': 'text/plain'})
      response.end(JSON.stringify({}))
    }
  }
  else{
    sendFile( response, filename )
  }
}

function determineCall(obj, flip) {
  switch (obj.type) {
    case 'Dog':
      call = (flip > 0.5) ? "ARF" : "WOOF";
      break;
    case 'Cat':
      call = (flip > 0.5) ? "MEOW" : "PURR";
      break;
    case 'Snake':
      call = (flip > 0.5) ? "TSSS" : "SSSWEET";
      break;
    case 'Bird':
      call = (flip > 0.5) ? "TWEET" : "CHIRP";
      break;
    default:
      return (flip > 0.5) ? "HEWWO" : "I LOVE YOU";
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    if(request.url === '/submit') {
      let obj = JSON.parse(dataString);

      if (obj.name !== '' && obj.link !== '' && obj.type !== '') {
        obj.call = determineCall(obj, Math.random());
        obj.id = currId;
        currId++;
        appdata.push(obj)

        response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
        response.end(JSON.stringify(appdata))
      } else {
        response.writeHead(200, "Request Had No Valid Content to Add, sending Current Unchanged State.", {'Content-Type': 'text/plain'})
        response.end(JSON.stringify(appdata))
      }
    }
    else if (request.url === '/delete') {
      let idObj = JSON.parse(dataString);
      if(idObj.id < 0 || idObj.id > currId){
        response.writeHead(400, "Bad Id For Deletion", {'Content-Type': 'text/plain'})
        response.end(JSON.stringify(appdata))
      } else {
        console.log(idObj)
        var index = appdata.findIndex(function(item){
          return item.id == idObj.id // using this on purpose cause idObj stores id as string
        });
        console.log(index)
        if(index < 0) {
          response.writeHead(400, "Bad Id For Deletion", {'Content-Type': 'text/plain'})
          response.end(JSON.stringify(appdata))
        } else {
          appdata.splice(index, 1)
          response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
          response.end(JSON.stringify(appdata))
        }
      }
    }
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )
