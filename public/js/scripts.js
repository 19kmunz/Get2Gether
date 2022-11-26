console.log("Welcome to Get2Gether!")


let selection;
let columnSize = 5;
sessionStorage.setItem('max', 1)

function setupSelection() {
    return new SelectionArea({
        selectables: ["tr > .user-availability"],
        boundaries: [".no-select"]
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
            //refreshUserDataView(userData)
            sendUserData(userData)
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
        let opacity = (1/sessionStorage.getItem('max')) * arr.length;
        console.log(opacity)
        element.style.background = "rgba(var(--blue-r),var(--blue-g),var(--blue-b)," + opacity + ")"
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

function updateSessionUserVariables(userId, username) {
    sessionStorage.setItem("userId", userId)
    sessionStorage.setItem("userName", username)
}

function updateSignInConfirmationHTML(username) {
    const confirm = document.getElementById("sign-in-confirm")
    confirm.innerText = "Signed In As: " + username;
    const button = document.getElementById("sign-in")
    button.disabled = true;
}

function login() {
    const username = document.querySelector('input[name="username"]').value
    if(!username || username === '') { return }
    const body = JSON.stringify({username: username, meetingId: sessionStorage.getItem('meetingId')})
    console.log(body)

    fetch('/login', {
        method:'POST',
        body,
        headers:{
            "Content-Type": "application/json"
        }
    })
        .then( function(response) {
            return response.json()
        })
        .then( function(response) {
            console.log(response)
            selection = setupSelection();
            refreshUserDataView(response.user)
            updateSignInConfirmationHTML(username);
            updateSessionUserVariables(response.user._id, response.user.name);
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
function sendUserData(userData) {
    let body = JSON.stringify(userData)
    fetch( '/sendUserData', {
        method:'POST',
        body,
        headers:{
            "Content-Type": "application/json"
        }
    })
        .then( function( response ) {
            return response.json();
        })
        .then( function(json) {
            if(json.modifiedCount === 0) {
                console.log("WARNING: Modified count is 0 for update with " + userData.userId +". This happens for unsetting, if this was a set then it is fine.")
            }
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
            refreshMeetingDataView(json.meetingData, json.totalAvailability)
        })
}

function refreshMeetingDataView(meetingData, totalAvailability) {
    let max = 0
    for (let day in totalAvailability) {
        for(let time in totalAvailability[day]) {
            max = Math.max(max, totalAvailability[day][time].length)
        }
    }
    sessionStorage.setItem("max", max.toString())

    const title = document.querySelector('#title')
    const totalAvailabilityTable = document.querySelector('#total-availability')
    totalAvailabilityTable.style.minWidth = meetingData.days.length * columnSize + "rem"
    title.textContent = meetingData.name
    let contents = '';
    contents += "<thead>"
    contents += "<th></th>"
    meetingData.days.forEach((day) => {
        contents += "<th>" + day + "</th>"
    })
    contents += "</thead>";
    for(let t = meetingData.startTime; t <= meetingData.endTime; t+=0.5){
        let time = getTimeStringFromDouble(t)
        contents += "<tr>"
        contents += "<th>" + time + "</th>"
        meetingData.days.forEach((day) => {
            let users = totalAvailability[day][time]
            if (t !== meetingData.endTime) {
                contents += "<td " +
                    "id=\"total-" + time + "-" + day + "\" " +
                    "data-users='" + users + "' " +
                    "data-length='" + users.length + "' " +
                    "style=\"background: rgba(var(--blue-r),var(--blue-g),var(--blue-b)," + (1 / max) * users.length + ");\" " +
                    "onmouseover='updateHoverToAvailability(this)' " +
                    "onmouseout='updateHoverToDefault()'" +
                    ">" + users.length +
                    "</td>"
            }
        })
        contents += "</tr>";
    }
    totalAvailabilityTable.innerHTML = contents;
}

function updateHoverToAvailability(element){
    let split = element.id.split('-');
    let day = split[2];
    let time = split[1];
    let users = element.dataset.users.replace(',', ', ')
    let hoverElement = document.getElementById("hover")
    hoverElement.innerText = "Users available at " + time + " on " + day + ": " + users
}

function updateHoverToDefault() {
    let hoverElement = document.getElementById("hover")
    hoverElement.innerText = "Hover To See Availability!"
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
    if(sessionStorage.getItem("days")){
        let days = JSON.parse(sessionStorage.getItem("days"))
        let startTime = JSON.parse(sessionStorage.getItem("startTime"))
        let endTime = JSON.parse(sessionStorage.getItem("endTime"))
        userAvailabilityTable.style.minWidth = days.length * columnSize + "rem";
        let contents = '';
        contents += "<thead>"
        contents += "<th></th>"
        days.forEach((day) => {
            contents += "<th>" + day + "</th>"
        })
        contents += "</thead>";
        for(let t = startTime; t <= endTime; t+= 0.5){
            let time = getTimeStringFromDouble(t)
            contents += "<tr>"
            contents += "<th>" + time + "</th>"
            if(t !== endTime) {
                days.forEach((day) => {
                    let avail = (userData.availability[day]) ? ((userData.availability[day][time]) ? " selected" : "") : ""
                    contents += "<td id=\"user-" + time + "-" + day + "\" class=\"user-availability" + avail + "\"></td>"
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
    sessionStorage.setItem('meetingId', meetingId)
    requestMeetingData(meetingId)
    //requestUserData("63433238212c3e62680e0171")
    //selection = setupSelection()
}
