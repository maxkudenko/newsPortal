class EventEmitter {

  constructor() {
    this.events = {};
  }

  subscribe(name, callback) {
    if(!name in this.events){
      console.log('name not found');
    } else {
      this.events[name].push(callback);
    }
  }

  unsubscribe(name, callback) {
    if(name in this.events) {
      this.events[name] = this.events[name].filter( (event) => event !== callback );
      if(this.events[name].length === 0) {
        delete this.events[name];
      }
    }
  }

  emit(name, data) {
    if(name in this.events) {
      this.events[name].forEach( (event) => event(data) );
    }
  }

}

module.exports = EventEmitter;