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
console.log('server started');

// Sockets
var io = require('socket.io')(serv, {});

// JikanJS
var jikanjs  = require('jikanjs'); // Uses per default the API version 3
// Simple Rate Limiter - Using on JikanJS to rate limit
var limit = require("simple-rate-limiter");
var request = limit(require("jikanjs")).to(2).per(1000);

var username = 'Iceehiphop';

/*
var i = 1;
jikanjs.loadUser(username, 'animelist', 'watching').then((response) => {
    response.anime.forEach(element => {
        console.log(i + ` ${element.title}`);
        i++;
    });
}).catch((err) => {
    console.error(err); // in case a error happens
});
*/

io.sockets.on('connection', function(socket) {
    console.log('socket connection');
});
