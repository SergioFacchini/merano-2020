
let settings = require('./settings');

let mqtt = require('mqtt')
let clientMqtt = mqtt.connect('mqtt://81.161.233.141', {
    'username': 'hackathon:dev',
    'password': 'systems123'
})

let app  = require('express')();
let http = require('http').createServer(app);
let io   = require('socket.io')(http);

let History = require('./history');
let history = new History();

let currentSockets = [];

clientMqtt.on('connect', function () {
    clientMqtt.subscribe(settings.TOPIC, function (err) {
        if (err) {
            console.log('ERROR SUBSCRIPTION: ' + err);
        } else {
            console.log('SUBSCRIBED');
        }
    })
})

clientMqtt.on('message', function (topic, message) {
    console.log('Recieved: ' + message.toString());
    
    currentSockets.forEach((socket) => {
        socket.emit('update', message);
    });

    history.addMessage(JSON.parse(message.toString()));
});


io.on('connection', (socket) => {
    // Client connection
    currentSockets.push(socket);
    
    history.getRecentMesages().forEach(message => socket.emit('update', JSON.stringify(message)));

    socket.on('disconnect', () => {
        // Client disconnected
        currentSockets = currentSockets.filter((s) => s !== socket);
        console.log('user disconnected');
    });
});

