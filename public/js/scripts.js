console.log("Welcome to Get2Gether!")


let selection;

function setupSelection() {
    return new SelectionArea({
        selectables: ["tr > .user-availability"],
        boundaries: [".container"]
    })
        .on("move",
            ({
                 store: {
                     changed: {added, removed}
                 }
             }) => {
                scrollable = false;

                for (const el of added) {
                    el.classList.add("selected");

                    let split = el.id.split("-");
                    let time = split[1];
                    let day = split[2];
                    let totalId = "total-" + time + "-" + day
                    addCurrentUserToTotalAvailability(totalId)
                }

                for (const el of removed) {
                    el.classList.remove("selected");

                    let split = el.id.split("-");
                    let time = split[1];
                    let day = split[2];
                    let totalId = "total-" + time + "-" + day
                    removeCurrentUserFromTotalAvailability(totalId)
                }
            }
        )
        .on("stop", ({store: {stored}}) => {
            scrollable = true;
            let userData = convertHtmlElementsToUserData(stored)
            refreshUserDataView(userData)
        });
}

function addCurrentUserToTotalAvailability(totalId) {
    let element = document.getElementById(totalId)
    let arr = element.dataset.users.split(',')
    if(arr[0] === ""){
        arr = [];
    }
    if(!arr.includes(sessionStorage.getItem('userName'))){
        arr.push(sessionStorage.getItem('userName'))
        element.innerHTML = arr.length.toString()
        element.dataset.users = arr.toString();
    }
}

function removeCurrentUserFromTotalAvailability(totalId) {
    let element = document.getElementById(totalId)
    let arr = element.dataset.users.split(',')
    let index = arr.indexOf(sessionStorage.getItem('userName'))
    if(index > -1){
        arr.splice(index, 1)
        element.innerHTML = arr.length.toString()
        element.dataset.users = arr.toString();
    }
}

let scrollable = true;
document.addEventListener('touchmove', (e) => {
        if (! scrollable) {
            e.preventDefault();
        }
    }, { passive:false });

function login() {
    console.log("Clicked!")
    const username = document.querySelector('input[name="username"]').value
    if(!username || username === '') { return }
    const body = JSON.stringify({'username':username.value, 'meetingId': sessionStorage.getItem('meetingId')})

    fetch('/login', {
        method:'POST',
        body
    })
        .then( function(response) {
            return response.json()
        })
        .then( function(response) {
            sessionStorage.setItem("userId", response.user.id)
            sessionStorage.setItem("userName", response.user.name)
            refreshUserDataView(response.user)
            selection = setupSelection();
        })
}

function convertHtmlElementsToUserData(stored) {
    let availability = {}

    // Set up availability matrix
    JSON.parse(sessionStorage.getItem('days')).forEach( (day) => {
        availability[day] = {};
    })
    stored.forEach((element) => {
        let split = element.id.split('-')
        let time = split[1]
        let day = split[2]
        availability[day][time] = true;
    })

    return {
        'userId': sessionStorage.getItem("userId"),
        'availability': availability
    };
}

// Backend Interaction + View Refreshes
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
            refreshMeetingDataView(json.meetingData, json.totalAvailability)
        })
}

function refreshMeetingDataView(meetingData, totalAvailability) {
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
            contents += "<td id=\"total-"+time+"-"+day+"\" data-users='"+totalAvailability[day][time]+"'>" +
                (( t !== meetingData.endTime) ? totalAvailability[day][time].length : "") +
                "</td>"
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
            sessionStorage.setItem("userId", json.user.id)
            sessionStorage.setItem("userName", json.user.name)
            refreshUserDataView(json.user)
        })
}

function refreshUserDataView(userData) {
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
            if(t !== endTime) {
                days.forEach((day) => {
                    let avail = (userData.availability[day][time]) ? " selected" : ""
                    contents += "<td id=\"user-" + time + "-" + day + "\" class=\"user-availability" + avail + "\">" + avail + "</td>"
                })
            }
            contents += "</tr>";
        }
        userAvailabilityTable.innerHTML = contents;

        if(selection) {
            selection.resolveSelectables();
            selection.clearSelection();
            selection.select('.selected', true);
        }
    } else {
        userAvailabilityTable.innerHTML = "<p>Something went wrong! Local storage does not contain meeting data. Try refreshing.</p>"
    }
}

window.onload = function() {
    let meetingId = new URLSearchParams(document.location.search).get("meetingId")
    requestMeetingData(meetingId)
    //requestUserData("63433238212c3e62680e0171")
    //selection = setupSelection()
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