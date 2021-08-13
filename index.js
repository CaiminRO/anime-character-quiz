function randInt(max) {
    return Math.floor(Math.random() * max);
}

// JikanJS
var jikanjs  = require('jikanjs'); // Uses per default the API version 3
// Simple Rate Limiter - Using on JikanJS to rate limit
var limit = require("simple-rate-limiter");
var request = limit(require("jikanjs")).to(2).per(1000);

// List of Anime IDs
var listAnime = [];



function test() {
    jikanjs.loadUser('Iceehiphop', 'animelist', 'watching').then((response) => {
        response.anime.forEach(element => {
            listAnime.push(`${element.mal_id}`);
            //console.log(`${element.mal_id}`);
        });

        console.log(listAnime);
    }).catch((err) => {
        console.error(err); // in case a error happens
    });

    while (listAnime == 0) {

    }

    return listAnime;
}

var listAnime2 = test();
console.log(listAnime2);
