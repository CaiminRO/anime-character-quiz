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
//var request = limit(require("jikanjs")).to(1).per(2000);

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
    mal_id: "",
    title_EN: "",
    title_JP: "",
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
                reject(err);
            }
        );
    });
}
function callAnime(animeID) {
    return new Promise(function (resolve, reject) {
        jikanjs.loadAnime(animeID).then(
            (response) => {
                var result = response;
                console.log('Processing Data: Anime ' + animeID);
                resolve(result);
            }, (err) => {
                console.log('Anime FAILED');
                reject(err);
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
                resolve(result);
            }, (err) => {
                console.log('Character FAILED');
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

            AnimeList.push(temp_anime);
        });

        console.log('Number of Animes:' + AnimeList.length);
        console.log("Gathering Characters for Each Anime");
        for (var i = 0; i < AnimeList.length; i++) {
            var temp_anime = AnimeList[i];

            var dataAPI_Anime = await callAnime(temp_anime.mal_id);
            temp_anime.title_EN = dataAPI_Anime.title_english;
            temp_anime.title_JP = dataAPI_Anime.title_japanese;

            var dataAPI_CharacterList = await callAnimeCharacters(temp_anime.mal_id);
            dataAPI_CharacterList.forEach(char => {
                var temp_char = Object.create(Character);
                temp_char.name = (`${char.name}`).toString();
                temp_char.image_src = (`${char.name}`).toString();
                temp_char.origin = temp_anime.title_EN;

                temp_anime.characters.push(temp_char);
            });

            AnimeList[i] = temp_anime;

            setTimeout(function() {}, 1000);
        }

        console.log(watchtype + ' grabbed');

        console.log('---> ' + watchtype + ' <---')
        for (var i = 0; i < AnimeList.length; i++) {
            var curr = AnimeList[i];
            console.log(i + ' ' + curr.title_EN + ' - ' + curr.characters.length);
        }
    } catch (err) {
        console.log(err);
        console.log(watchtype + ' failed to grab');
    }
}

io.sockets.on('connection', function(socket) {
    console.log('>>> socket connection to server');

    socket.on('client connected', function() {
        console.log('>>> client connected');
    });

    // Data: MALuser, watchtypes (array), numOfQuestions
    socket.on('start', function(data) {
        AnimeList = [];

        for (var i = 0; i < data.watchtypes.length; i++) {
            getAnimeList(data.MALuser, data.watchtypes[i]);
        }
    });
});
