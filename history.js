const RECENT_THRESHOLDS_MINUTES = 10;

class History {
    
    _messages = [];
    
    addMessage(message) {
        this._messages.push(message);
    }

    getRecentMesages() {
        this._removeOldMessages();
        return this._messages;
    }
    
    _removeOldMessages() {
        const tenMiutesAgo = this._tenMinutesAgo();
        let toRemove = 0;
        for (let message of this._messages) {
            if (message.timestamp < tenMiutesAgo) {
                toRemove++;
            } else {
                break;
            }
        }
        this._messages.splice(0, toRemove);
        console.log(`[HISTORY] Removed ${toRemove} old messages`);
    }

    _tenMinutesAgo() {
        const now = new Date();
        return now.setMinutes(now.getMinutes() - RECENT_THRESHOLDS_MINUTES);
    }
}

module.exports = History;
