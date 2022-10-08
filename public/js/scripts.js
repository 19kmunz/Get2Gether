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
    for(let t = meetingData.startTime; t <= meetingData.endTime; t++){
        contents += "<tr>"
        contents += "<th>" + t + ":00</th>"
        let tNorm = (t < 10) ? '0'+t : t.toString();
        meetingData.days.forEach((day) => {
            contents += "<td id=\"total-"+tNorm+"-"+day+"\">" + totalAvailability[day][t].length + "</td>"
        })
        contents += "</tr>";
    }
    totalAvailabilityTable.innerHTML = contents;
}

window.onload = function() {
    /*
    const button = document.querySelector( '#createPet' )
    button.onclick = submit
    submitNoFields()
    */
    requestMeetingData('77429c8c-e46d-4886-9fc1-ff69e0880645')
}

window.onpageshow = function () {
    //submitNoFields()
    requestMeetingData('77429c8c-e46d-4886-9fc1-ff69e0880645')
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