
let settings = require('./settings');

var mqtt   = require('mqtt')
var client = mqtt.connect('mqtt://81.161.233.141', {
    'username': 'hackathon:dev',
    'password': 'systems123'
});


client.on('connect', function () {
    client.subscribe(settings.TOPIC, function (err) {
        console.log();
        setInterval(() => {
            [0, 1, 2, 3, 4].forEach((i) => {
                const data = {
                    mac: 'client-' + i,
                    bpm: Math.floor(Math.random() * 20 + 60),
                    timestamp: new Date().getTime(),
                    battery: Math.floor(Math.random() * 30 + 50),
                };
                client.publish(settings.TOPIC, JSON.stringify(data));
            })

        }, 7000);
    })
})

