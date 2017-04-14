{
  const isFunction = (target, property) =>
    typeof target[property] === 'function';

  const delegated = ['id', 'constructor'];
  const whitelist = ['props', 'children', 'dispatch', 'broadcast'];

  const Sandbox = class {

    static create(component) {
      const blacklist = Object.getOwnPropertyNames(
        opr.Toolkit.Component.prototype);
      const autobound = {};
      const state = {};
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (whitelist.includes(property)) {
            return state[property];
          }
          if (delegated.includes(property)) {
            return target[property];
          }
          if (blacklist.includes(property)) {
            return undefined;
          }
          if (isFunction(autobound, property)) {
            return autobound[property];
          }
          if (isFunction(target, property)) {
            const boundListener = target[property].bind(receiver);
            boundListener.source = target[property];
            boundListener.component = target;
            return autobound[property] = boundListener;
          }
          return undefined;
        },
        set: (target, property, value) => {
          if (whitelist.includes(property)) {
            state[property] = value;
          }
          return true;
        }
      });
    }
  }

  module.exports = Sandbox;
}
