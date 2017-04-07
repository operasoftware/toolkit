{
  const isFunction = (target, property) =>
    typeof target[property] === 'function';

  const whitelist = ['props', 'children', 'broadcast'];

  const Sandbox = class {

    static create(component) {
      const blacklist = Object.getOwnPropertyNames(
        opr.Toolkit.Component.prototype);
      const autobound = {};
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (whitelist.includes(property)) {
            return autobound[property];
          }
          if (blacklist.includes(property)) {
            return undefined;
          }
          if (isFunction(autobound, property)) {
            return autobound[property];
          }
          if (isFunction(target, property)) {
            return autobound[property] = target[property].bind(receiver);
          }
          return undefined;
        },
        set: (target, property, value) => {
          if (whitelist.includes(property)) {
            autobound[property] = value;
          }
          return true;
        }
      });
    }
  }

  module.exports = Sandbox;
}
