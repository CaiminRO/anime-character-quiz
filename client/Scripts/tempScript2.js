/* jshint esversion: 10 */

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

// Random Integer Function
function randInt(max) {
    return Math.floor(Math.random() * max);
}

// Objects
var Character = {
    status: "",
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
    return jikanjs.loadUser(username, 'animelist', watchtype).then((response) => {
        response.anime.forEach(ani => {
            var temp_ani = Object.create(Anime);
            temp_ani.status = true;
            temp_ani.mal_id = ani.mal_id;
            temp_ani.title = ani.title;

            AnimeList.push(temp_ani);
        });
    }).catch((err) => {
        console.error(err); // in case a error happens
    });

    return new Promise(function (resolve, reject) {
        jikanjs.loadUser(username, 'animelist', watchtype).then(
            (response) => {
                var result = response.anime;
                for (var ani of result) {
                    var temp_ani = Object.create(Anime);
                    temp_ani.status = true;
                    temp_ani.mal_id = ani.mal_id;
                    temp_ani.title = ani.title;

                    AnimeList.push(temp_ani);
                }
                console.log('Processing Data: Animelist of ' + username + " (WT: " + watchtype + ")");
                resolve(result);
            },
            (err) => {
                console.log('List FAILED: ' + watchtype);
                reject(err);
            }
        ).catch((err) => {
            console.error(err); // in case a error happens
        });
    });
}
function callAnime(MALid) {
    console.log('Calling API: Anime ' + MALid);
    return new Promise(function (resolve, reject) {
        jikanjs.loadAnime(MALid, 'characters_staff').then(
            (response) => {
                var result = response.characters;
                for (var i = 0; i < AnimeList.length; i++) {
                    if (AnimeList[i].mal_id == MALid) {
                        var temp_charlist = [];
                        for (char of result) {
                            var temp_char = Object.create(Character);
                            temp_char.status = true;
                            temp_char.name = char.name;
                            temp_char.image_src = char.image_url;
                            temp_char.origin = AnimeList[i].title;

                            temp_charlist.push(temp_char);
                        }
                        AnimeList[i].characters = temp_charlist;
                    }
                }
                console.log('Processing Data: Anime ' + MALid);
                resolve(result);
            },
            (err) => {
                console.log('Anime FAILED: ' + MALid);
                reject(err);
            }
        ).catch((err) => {
            console.error(err); // in case a error happens
        });
    });
}


io.sockets.on('connection', function(socket) {
    console.log('>>> socket connection to server');

    socket.on('client connected', function() {
        console.log('>>> client connected');
    });

    // Data: MALuser, watchtypes (array), numOfQuestions
    socket.on('start', async function(data) {
        // List Reset
        AnimeList = [];

        for await (var wt of data.watchtypes) {
            var dataAPI_AnimeList = await callAnimeList(data.MALuser, wt);
            await Promise.all(dataAPI_AnimeList).then().catch();
        }
        console.log("\n\n" + "Number of Available Animes in List: " + AnimeList.length + "\n\n");

        var dupe = 0;
        for (var i = 1; i <= data.numOfQuestions; i++) {
            console.log('Question ' + i);
            var chosenIndex = [];
            for (var j = 0; j < 4; j++) {
                var index = randInt(AnimeList.length);
                if (chosenIndex.length >= 2 && randInt(100) <= 4) {
                    index = chosenIndex[randInt(chosenIndex.length)];
                    dupe++;
                }

                chosenIndex.push(index);
                console.log('   Anime chosen (' + index + '): ' + AnimeList[index].title);
            }
            console.log(chosenIndex);
        }
        console.log('Duplicates: ' + dupe);


    });
});











/* jshint esversion: 10 */

const jikanjs = require('jikanjs');

function callAnime(user, watchtype) {

    jikanjs.loadUser(user, 'animelist', watchtype).then(response => {
        console.log(watchtype + ': ' + response);
    }).catch(err => {
        console.log(err);
    });
}

async function main(user, watchtypes) {
    for await (var watchtype of watchtypes) {
        callAnime(user, watchtype);
    }
    Promise.all
    console.log("All lists attempted to be grabbed");
}

var MALuser = 'Iceehiphop';
var watchtypes = [ 'watching', 'completed', 'onhod', 'dropped', 'ptw' ];
main(MALuser, watchtypes);
