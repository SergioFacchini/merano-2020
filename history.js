const RECENT_THRESHOLDS_MINUTES = 10;

let fs = require('fs');


class History {
    
    _readings = [];
    
    addReading(reading) {
        this._readings.push(reading);
        reading.statistics = this._computeStatistics(reading.mac);
        return reading;
    }

    getRecentReadings() {
        this._removeOldMessages();
        return this._readings;
    }
    
    _removeOldMessages() {
        const tenMiutesAgo = this._tenMinutesAgo();
        let toRemove = 0;
        for (let reading of this._readings) {
            if (reading.timestamp < tenMiutesAgo) {
                toRemove++;
            } else {
                break;
            }
        }
        this._readings.splice(0, toRemove);
        if (toRemove > 0) {
            console.log(`[HISTORY] Removed ${toRemove} old readings`);
        }
    }

    _tenMinutesAgo() {
        const now = new Date();
        return now.setMinutes(now.getMinutes() - RECENT_THRESHOLDS_MINUTES);
    }

    _computeStatistics(mac) {
        this._removeOldMessages();
        const readings = this._readings
            .filter(reading => reading.mac === mac)
            .map(reading => reading.bpm);
        return {
            max: Math.max(...readings),
            min: Math.min(...readings),
            avg: readings.reduce((a, b) => a + b) / readings.length
        };
    }


    // Call this function using the debugger
    storeReadings(fileName) {
        fs.writeFileSync(`recordings/${fileName}`, JSON.stringify(this._readings));
    }
}

module.exports = History;
