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
var jikan = require('jikanjs'); // Uses per default the API version 3

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
    title: "",
    characters: []
};

// Lists
var AnimeList = [];

// API Call Functions
function callAnimeList(user, wt) {
    return new Promise((resolve, reject) => {
        jikan.loadUser(user, 'animelist', wt).then((response) => {
            var called_AnimeList = response.anime;

            for (var anime of called_AnimeList) {
                var temp_anime = Object.create(Anime);

                temp_anime.mal_id = anime.mal_id;
                temp_anime.title = anime.title;

                AnimeList.push(temp_anime);
            }

            console.log(wt + ': PASSED');

            setTimeout(() => resolve(), 1100);
        }).catch(() => {
            console.log(wt + ': FAILED');

            reject();
        });
    });
}
function callAnime(MALid) {
    return new Promise((resolve, reject) => {
        jikan.loadAnime(MALid, 'characters_staff').then((response) => {
            var called_CharacterList = response.characters;

            var temp_charlist = [];
            for (var char of called_CharacterList) {
                var temp_char = Objectr.create(Character);
                console.log(char.name);
                temp_char.name = char.name;
                temp_char.image_src = char.image_url;
                for (var ani of AnimeList)
                    if (ani.mal_id == MALid)
                        temp_char.origin = ani.title;

                temp_charlist.push(temp_char);
            }

            for (var anime of AnimeList)
                if (anime.mal_id == MALid)
                    anime.characters = temp_charlist;

            console.log(MALid + ': PASSED');

            setTimeout(() => resolve(), 1100);
        }).catch(() => {
            console.log(MALid + ': FAILED');

            reject();
        });
    });
}

// Main Function
async function main(user, watchtypes) {
    // Clear lists
    AnimeList = [];

    var api_AnimeLists = [];
    for await (var watchtype of watchtypes) {
        api_AnimeLists.push(callAnimeList(user, watchtype));
    }

    var IndexList = [];
    var api_CharacterLists = [];
    Promise.allSettled(api_AnimeLists).then(() => {
        console.log('Number of Animes grabbed: ' + AnimeList.length);
        var dupe = 0;
        for (var i = 1; i <= 3/*data.numOfQuestions*/; i++) { // (var i = 1; i <= 10/*data.numOfQuestions*/; i++)
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
            IndexList.push(chosenIndex);
        }
        console.log('Duplicates: ' + dupe);
    }).then(async () => {
        api_CharacterLists = [];
        var L = 0;
        for await (var list of IndexList) {
            var ind = list[L];
            var malID = AnimeList[ind].mal_id;
            api_CharacterLists.push(await callAnime(malID));
            L++;
        }
    });

    Promise.allSettled(api_CharacterLists).then(() => {
        for (var i = 0; i < IndexList.length; i++) {
            for (var j = 0; j < IndexList[i].length; j++) {
                var list = IndexList[i];
                var ind = list[j];
                console.log(AnimeList[ind].characters.length);
            }
        }
    });
}



var MALuser = 'Iceehiphop';
var watchtypes = [ 'watching', 'completed', 'onhold', 'dropped', 'ptw' ];
main(MALuser, watchtypes);
