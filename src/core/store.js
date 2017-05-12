{
  class Store {

    constructor() {
      this.stack = [];
    }

    get state() {
      if (this.stack.length === 0) {
        return null;
      }
      return Object.assign({}, this.stack[this.stack.length - 1]);
    }

    set state(state) {
      this.stack.push(state);
    }
  }

  module.exports = Store;
}
