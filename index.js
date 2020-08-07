
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
    const json   = JSON.parse(message.toString());
    const update = history.addReading(json);

    console.log('Received: ' + JSON.stringify(update));

    currentSockets.forEach((socket) => {
        socket.emit('update', update);
    });
});


io.on('connection', (socket) => {
    // Client connection
    currentSockets.push(socket);

    setTimeout(() => {
        history.getRecentReadings().forEach(reading => {
            socket.emit('update', reading);
        });
    }, 500);


    socket.on('disconnect', () => {
        // Client disconnected
        currentSockets = currentSockets.filter((s) => s !== socket);
        console.log('user disconnected');
    });
});


http.listen(3000, () => {
    console.log("Listening port 3000");
});