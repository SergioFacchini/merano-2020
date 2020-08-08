
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

// Load initial data
Object.entries({
    "CC:74:2F:87:DC:17": "recordings/lorenzo-1.json",
    "client-0": "recordings/sebastiano-1.json",
    "client-1": "recordings/slava-1.json",
    "client-2": "recordings/simone-1.json",
}).forEach(([mac, fileName]) => {
    const data = fs.readFileSync(fileName).toString();
    const readings = JSON.parse(data);
    const difference = new Date().getTime() - readings[readings.length - 1].timestamp;
    readings.forEach(reading => {
        history.addReading({
            ...reading,
            timestamp: new Date().setTime(reading.timestamp + difference),
            mac
        });
    });
    console.log(`[MAIN] ${readings.length} readings added (moved into the future of ${Math.floor(difference / (1000 * 60))} minutes)`);
});

http.listen(3000, () => {
    console.log("Listening port 3000");
});
