// Database


// Server
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/main.html');
});
app.use(express.static('client'));

serv.listen(2000);
console.log('<<< server started');

// Sockets
var io = require('socket.io')(serv, {});

// JikanJS
var jikanjs  = require('jikanjs'); // Uses per default the API version 3
// Simple Rate Limiter - Using on JikanJS to rate limit
var limit = require("simple-rate-limiter");
var request = limit(require("jikanjs")).to(2).per(1000);

// List of Anime IDs
var animeID = [];
function getAnimeListIDs(user, watchtype) {
    jikanjs.loadUser(user, 'animelist', watchtype).then((response) => {
        response.anime.forEach(element => {
            //console.log(`${element.mal_id}`);
            animeID.push(`${element.mal_id}`);
        });
    }).catch((err) => {
        console.error(err); // in case a error happens
    });
}

// List of Anime Characters
function getAnimeCharacter(anID) {
    jikanjs.loadAnime(anID, characters_staff).then((response) => {
        response.characters.forEach(element => {

        });
    }).catch((err) => {
        console.error(err); // in case a error happens
    });
}

function randInt(max) {
    return Math.floor(Math.random() * max);
}

io.sockets.on('connection', function(socket) {
    console.log('>>> socket connection to server');

    socket.on('client connected', function() {
        console.log('>>> client connected');
    });

    // Data: MALuser, watchtypes (array), numOfQuestions
    socket.on('start', function(data) {
        data.watchtypes.forEach(element => {
            getAnimeListIDs(data.MALuser, element);
        });

        var animeToSend = [];
        for (var i = 0; i < data.numOfQuestions; i++)
            animeToSend.push(animeID[randInt(animeID.length)]);

        animeToSend.forEach(element => {

        });

    });
});








// List of Anime IDs
var animeID = [];
function getAnimeListIDs(username, wt) {
    jikanjs.loadUser(username, 'animelist', wt).then((response) => {
        var temp = [];
        response.anime.forEach(element => {
            //console.log(`${element.mal_id}`);
            temp.push((`${element.mal_id}`).toString());
        });
        animeID = temp;
    }).catch((err) => {
        console.error(err); // in case a error happens
    });
}

// List of Anime Characters
function getAnimeCharacter(anID) {
    jikanjs.loadAnime(anID, 'characters_staff').then((response) => {
        console.log(response.characters[0].mal_id + " : " + response.characters[0].name);
    }).catch((err) => {
        console.error(err); // in case a error happens
    });
}


getAnimeListIDs('Iceehiphop', 'watching');
console.log(animeID);

for (var i = 0; i < 5; i++) {
    console.log(animeID[randInt(animeID.length)]);
    //getAnimeCharacter(animeID[randInt(animeID.length)]);
}
