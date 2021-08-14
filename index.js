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

// Bottleneck
/*
var Bottleneck = require('bottleneck');
const limiter = new Bottleneck ({
    minTime: 200
}); */

// Random Integer Function
function randInt(max) {
    return Math.floor(Math.random() * max);
}

// Objects
var Character = {
    name: "",
    image_src: "",
    origin: ""
};
var Anime = {
    status: false,
    mal_id: "",
    title: "",
    characters: []
};
var AnimeList = [];


function callAnimeList(username, watchtype) {
    console.log('Calling API: Anime list of ' + username + " (WT: " + watchtype + ")");
    return new Promise(function (resolve, reject) {
        jikanjs.loadUser(username, 'animelist', watchtype).then(
            (response) => {
                var result = response.anime;
                console.log('Processing Data: Animelist of ' + username + " (WT: " + watchtype + ")");
                setTimeout(() => resolve(result), 1000);
            }, (err) => {
                console.log('List FAILED: ' + watchtype);
                console.log('Error: ' + err);
                reject('failed');
            }
        );
    });
}


io.sockets.on('connection', function(socket) {
    console.log('>>> socket connection to server');

    socket.on('client connected', function() {
        console.log('>>> client connected');
    });

    // Data: MALuser, watchtypes (array), numOfQuestions
    socket.on('start', async function(data) {
        AnimeList = [];

        for await (wt of data.watchtypes) {
            var dataAPI_AnimeList = await callAnimeList(data.MALuser, wt);

            Promise.all(dataAPI_AnimeList).then(anime => {
                if (anime != 'failed') {
                    anime.forEach(anime => {
                        AnimeList.push(anime.title);
                    });
                }
            });
        }
        console.log("\n\n\nout " + AnimeList.length);

        //console.log(AnimeList[2]);
        var duplicate = 0;
        for (var i = 1; i <= data.numOfQuestions; i++) {
            console.log('Question ' + i);
            var chosenIndex = [];
            for (var j = 0; j < 4; j++) {
                var index = randInt(AnimeList.length);
                if (chosenIndex.length >= 2 && randInt(100) <= 4) {
                    index = chosenIndex[randInt(chosenIndex.length)];
                    duplicate++;
                }

                chosenIndex.push(index);
                console.log('  Anime chosen (' + index + '): ' + AnimeList[index]);
            }
        }
        console.log(duplicate);

    });
});
