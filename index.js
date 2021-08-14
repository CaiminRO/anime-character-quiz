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
    return new Promise(function (resolve, reject) {
        jikanjs.loadUser(username, 'animelist', watchtype).then(
            (response) => {
                var result = response.anime;
                for (ani of result) {
                    var temp_ani = Object.create(Anime);
                    temp_ani.status = true;
                    temp_ani.mal_id = ani.mal_id;
                    temp_ani.title = ani.title;

                    AnimeList.push(temp_ani);
                }
                console.log('Processing Data: Animelist of ' + username + " (WT: " + watchtype + ")");
                setTimeout(() => resolve(result), 1000);
            }, (err) => {
                console.log('List FAILED: ' + watchtype);
                return 'failed';
            }
        );
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
                        try {
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
                        } catch (err) {
                            console.log('Error with Character grab, Anime ' + MALid);
                        }
                    }
                }
                console.log('Processing Data: Anime ' + MALid);
                setTimeout(() => resolve(result), 1000);
            }, (err) => {
                console.log('Anime FAILED: ' + MALid);
                return 'failed';
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
        // List Reset
        AnimeList = [];

        for await (wt of data.watchtypes) {
            var dataAPI_AnimeList = await callAnimeList(data.MALuser, wt);

            Promise.all(dataAPI_AnimeList).then().catch();
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
                console.log('   Anime chosen (' + index + '): ' + AnimeList[index]);
            }
        }
        console.log('Duplicates: ' + dupe);


    });
});
