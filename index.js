
let settings = require('./settings');
let fs = require('fs');

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
    
    const json = JSON.parse(message.toString());
    const update = history.addReading(json);
    
    currentSockets.forEach((socket) => {
        socket.emit('update', JSON.stringify(json));
    });
});


io.on('connection', (socket) => {
    // Client connection
    currentSockets.push(socket);
    
    history.getRecentReadings().forEach(reading => {
        socket.emit('update', JSON.stringify(reading));
    });

    socket.on('disconnect', () => {
        // Client disconnected
        currentSockets = currentSockets.filter((s) => s !== socket);
        console.log('user disconnected');
    });
});


// Load initial data
[
    "recordings/sebastiano-1.json"
].forEach(fileName => {
    const data = fs.readFileSync(fileName).toString();
    const readings = JSON.parse(data);
    const difference = new Date().getTime() - readings[readings.length - 1].timestamp;
    readings.forEach(reading => {
        history.addReading({
            reading,
            timestamp: new Date().setTime(reading.timestamp + difference)
        });
    });
    console.log(`[MAIN] ${readings.length} readings added (moved into the future of ${difference / 360} minutes)`);
});

