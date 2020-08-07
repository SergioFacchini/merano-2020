
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
            const data = {
                mac: 'client-' + Math.floor(Math.random() * settings.MAX_CLIENTS),
                bpm: Math.floor(Math.random() * 20 + 60),
                timestamp: new Date().getTime()
            };
            console.log(data);

            client.publish(settings.TOPIC, JSON.stringify(data));
        }, 1000);
    })
})

