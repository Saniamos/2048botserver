const EventEmitter = require('events').EventEmitter;

class ObeservableStorage extends EventEmitter {
    constructor() {
        super();
        this.state = []
    }

    add(item) {
        let id = this.state.push(item) - 1;
        this.emit('add', {id, item});
        return id;
    }

    udpate(id, item) {
        this.state[id] = item;
        this.emit('change', {id, item});
        return true;
    }

    get(id) {
        return this.state[id];
    }

    getall() {
        return this.state;
    }
}

module.exports = ObeservableStorage;