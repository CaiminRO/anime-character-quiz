var jikanjs  = require('jikanjs'); // Uses per default the API version 3

var limit = require("simple-rate-limiter");
var request = limit(require("jikanjs")).to(2).per(1000);

var i = 1;

var username = 'Iceehiphop';

jikanjs.loadUser(username, 'animelist', 'watching').then((response) => {
    response.anime.forEach(element => {
        console.log(i + ` ${element.title}`);
        i++;
    });
}).catch((err) => {
    console.error(err); // in case a error happens
});

jikanjs.loadUser(username, 'animelist', 'completed').then((response) => {
    response.anime.forEach(element => {
        console.log(i + ` ${element.title}`);
        i++;
    });
}).catch((err) => {
    console.error(err); // in case a error happens
});

jikanjs.loadUser(username, 'animelist', 'onhold').then((response) => {
    response.anime.forEach(element => {
        console.log(i + ` ${element.title}`);
        i++;
    });
}).catch((err) => {
    console.error(err); // in case a error happens
});
