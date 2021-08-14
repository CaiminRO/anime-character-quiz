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
    return new Promise(function (resolve, reject) {
        jikanjs.loadUser(username, 'animelist', watchtype).then(
            (response) => {
                var result = response.anime;
                console.log('Processing Data: Animelist of ' + username + " (WT: " + watchtype + ")");
                resolve(result);
            }, (err) => {
                console.log('List FAILED');
                return 'failed';
            }
        );
    });
}
function callAnimeCharacters(animeID) {
    return new Promise(function (resolve, reject) {
        jikanjs.loadAnime(animeID, 'characters_staff').then(
            (response) => {
                var result = response.characters;
                console.log('Processing Data: Character list in anime ID ' + animeID);
                setTimeout(() => resolve(result), 2050);
            }, (err) => {
                console.log('Character FAILED, Anime ID: ' + animeID);
                reject(err);
            }
        );
    });
}

async function getAnimeList(username, watchtype) {
    try {
        console.log("Gathering Anime");
        var dataAPI_AnimeList = await callAnimeList(username, watchtype);
        dataAPI_AnimeList.forEach(anime => {
            var temp_anime = Object.create(Anime);
            temp_anime.mal_id = (`${anime.mal_id}`).toString();
            temp_anime.title = (`${anime.title}`).toString();

            AnimeList.push(temp_anime);
        });

        console.log('Number of Animes in ' + username + ' List: ' + AnimeList.length);
        console.log("Gathering Characters for Each Anime");
        for await (var anime of AnimeList) {
            var dataAPI_CharacterList = await callAnimeCharacters(anime.mal_id);

            Promise.all(dataAPI_CharacterList).then(char => {
                if (char != 'failed') {
                    anime.status = true;
                    var temp_charlist = [];
                    char.forEach(char => {
                        var temp_char = Object.create(Character);
                        temp_char.name = (`${char.name}`).toString();
                        temp_char.image_src = (`${char.image_url}`).toString();
                        temp_char.origin = anime.title;

                        temp_charlist.push(temp_char);
                    });
                    anime.characters = temp_charlist;
                }
            });
        }

        console.log(watchtype + ' grabbed');

        console.log('---> ' + watchtype + ' <---')
        for (var i = 0; i < AnimeList.length; i++) {
            var curr = AnimeList[i];
            console.log((i+1) + ' ' + curr.title + ' - ' + curr.characters.length);
        }
    } catch (err) {
        console.log(err);
        console.log(watchtype + ' FAILED to grab');
    }
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
            var wtList = await getAnimeList(data.MALuser, wt);
        }
    });
});


















































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

var WTCall = {
    status: false,
    watchtype: "",
    anime_list: []
};

function callAnimeList(username, watchtype) {
    console.log('Calling API: Anime list of ' + username + " (WT: " + watchtype + ")");
    return new Promise(function (resolve, reject) {
        jikanjs.loadUser(username, 'animelist', watchtype).then(
            (response) => {
                var result = response.anime;

                var wtrc = Object.create(WTCall);
                wtrc.status = true;
                wtrc.watchtype = watchtype;
                wtrc.anime_list = result;

                console.log('Processing Data: Animelist of ' + username + " (WT: " + watchtype + ")");
                setTimeout(() => resolve(wtrc), 1000);
            }, (err) => {
                console.log('List FAILED: ' + watchtype);
                reject(err);
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
        WTCall.anime_list = [];

        for await (wt of data.watchtypes) {
            var dataAPI_AnimeList = await callAnimeList(data.MALuser, wt);

            Promise.all(dataAPI_AnimeList).then(wtrc => {
                if (wtrc.status) {
                    wtrc.anime_list.forEach(anime => {
                        AnimeList.push(anime.title);
                    });
                }
            });
        }
        console.log("\n\n\nout " + AnimeList.length);

        //console.log(AnimeList[2]);
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
