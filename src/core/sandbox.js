{
  const isFunction = (target, property) =>
    typeof target[property] === 'function';

  const properties = [
    'commands',
    'constructor',
    'container',
    'dispatch',
    'id',
    'ref',
    'getKey',
  ];
  const methods = [
    'broadcast',
    'connectTo',
  ];
  const stateProperties = [
    'props',
    'children',
  ];

  const createBoundListener = (listener, component, context) => {
    const boundListener = listener.bind(context);
    boundListener.source = listener;
    boundListener.component = component;
    return boundListener;
  };

  class Sandbox {

    static create(component) {
      const blacklist = Object.getOwnPropertyNames(
        opr.Toolkit.Component.prototype);
      const autobound = {};
      const state = {};
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (properties.includes(property)) {
            return target[property];
          }
          if (stateProperties.includes(property)) {
            return state[property];
          }
          if (methods.includes(property) && isFunction(target, property)) {
            return createBoundListener(target[property], target, target);
          }
          if (blacklist.includes(property)) {
            return undefined;
          }
          if (isFunction(autobound, property)) {
            return autobound[property];
          }
          if (isFunction(target, property)) {
            return autobound[property] =
              createBoundListener(target[property], target, receiver);
          }
          return undefined;
        },
        set: (target, property, value) => {
          if (stateProperties.includes(property)) {
            state[property] = value;
          }
          return true;
        }
      });
    }
  }

  module.exports = Sandbox;
}
