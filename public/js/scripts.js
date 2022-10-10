console.log("Welcome to Get2Gether!")

const login = function(e) {
    e.preventDefault()
    const username = document.querySelector('input[name="username"]')
    const body = JSON.stringify(username.value)

    fetch('/login', {
        method:'POST',
        body
    })
        .then( function(response) {
            return response.json()
        })
        .then( function(response) {
            refreshMeetingData(response.meetingData, response.totalAvailability)
        })
}

function requestMeetingData(meetingId) {
    fetch('/getMeetingData?meetingId=' + meetingId)
        .then( function( response ) {
            return response.json();
        })
        .then( function(json) {
            console.log(json)
            sessionStorage.setItem("days", JSON.stringify(json.meetingData.days))
            sessionStorage.setItem("startTime", json.meetingData.startTime)
            sessionStorage.setItem("endTime", json.meetingData.endTime)
            refreshMeetingData(json.meetingData, json.totalAvailability)
        })
}

function refreshMeetingData(meetingData, totalAvailability) {
    const title = document.querySelector('#title')
    const totalAvailabilityTable = document.querySelector('#total-availability')
    title.textContent = meetingData.name
    let contents = '';
    contents += "<tr>"
    contents += "<th>.</th>"
    meetingData.days.forEach((day) => {
        contents += "<th>" + day + "</th>"
    })
    contents += "</tr>";
    for(let t = meetingData.startTime; t <= meetingData.endTime; t+=0.5){
        let time = getTimeStringFromDouble(t)
        contents += "<tr>"
        contents += "<th>" + time + "</th>"
        meetingData.days.forEach((day) => {
            contents += "<td id=\"total-"+time+"-"+day+"\">" + totalAvailability[day][time].length + "</td>"
        })
        contents += "</tr>";
    }
    totalAvailabilityTable.innerHTML = contents;
}

function requestUserData(userId) {
    fetch('/getUserData?userId=' + userId)
        .then( function( response ) {
            return response.json();
        })
        .then( function(json) {
            console.log(json)
            sessionStorage.setItem("userId", json.user.userId)
            refreshUserData(json.user)
        })
}

function refreshUserData(userData) {
    const userAvailabilityTable = document.querySelector('#user-availability')
    let contents = '';
    contents += "<tr>"
    contents += "<th>.</th>"
    if(sessionStorage.getItem("days")){
        let days = JSON.parse(sessionStorage.getItem("days"))
        let startTime = JSON.parse(sessionStorage.getItem("startTime"))
        let endTime = JSON.parse(sessionStorage.getItem("endTime"))
        days.forEach((day) => {
            contents += "<th>" + day + "</th>"
        })
        contents += "</tr>";
        for(let t = startTime; t <= endTime; t+= 0.5){
            let time = getTimeStringFromDouble(t)
            contents += "<tr>"
            contents += "<th>" + time + "</th>"
            days.forEach((day) => {
                let avail = (userData.availability[day][time]) ? "Yes" : "No"
                contents += "<td>" +
                    "<button id=\"user-"+time+"-"+day+"\" type=\"button\">" +
                    avail +
                    "</button>" +
                    "</td>"
            })
            contents += "</tr>";
        }
        userAvailabilityTable.innerHTML = contents;
    } else {
        userAvailabilityTable.innerHTML = "<p>Something went wrong! Local storage does not contain meeting data. Try refreshing.</p>"
    }
}

window.onload = function() {
    /*
    const button = document.querySelector( '#createPet' )
    button.onclick = submit
    submitNoFields()
    */
    let meetingId = new URLSearchParams(document.location.search).get("meetingId")
    requestMeetingData(meetingId)
    requestUserData("6f0f383f-60c2-4138-840b-3dee7c3e901b")
}

// OLD CODE
/*





const submit = function( e ) {
    // prevent default form action from being carried out
    e.preventDefault()

    const name = document.querySelector( 'input[name="name"]' ),
        link = document.querySelector( 'input[name="link"]' ),
        type = document.querySelector( 'select[name="type"]' ),
        json = { name: name.value, link: link.value, type: type.value },
        body = JSON.stringify( json )

    fetch( '/submit', {
        method:'POST',
        body
    })
        .then( function( response ) {
            return response.json();
        })
        .then( function(json) {
            refreshGalleryContents(json)
        })

    return false
}

const submitNoFields = function( e ) {

    const json = { name: '', link: '', type: '' },
        body = JSON.stringify( json )

    fetch( '/submit', {
        method:'POST',
        body
    })
        .then( function( response ) {
            return response.json();
        })
        .then( function(json) {
            refreshGalleryContents(json)
        })

    return false
}

const refreshGalleryContents = function(json) {
    let galleryContents = '';
    for(let i = 0; i < json.length; i++){
        galleryContents += '<li> <figure> <img class="petTile" src="'+json[i].link+'" alt="Cute picture of '+json[i].name+'"> <figcaption>'+json[i].name+' says '+json[i].call+'</figcaption> </figure> <button id="'+json[i].id+'" onclick="deleteEntry(this.id)" class="delete">Delete</button> </li>';
    }
    const gallery = document.querySelector( '#gallery' )
    gallery.innerHTML = galleryContents;
}
const deleteEntry = function (clickedId) {
    body = JSON.stringify({"id": clickedId});
    fetch( '/delete', {
        method:'POST',
        body
    })
        .then( function( response ) {
            return response.json();
        })
        .then( function(json) {
            refreshGalleryContents(json)
        })
}

 */