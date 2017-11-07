{
  const isFunction = (target, property) =>
      typeof target[property] === 'function';

  const delegated = [
    'children',
    'commands',
    'constructor',
    'container',
    'dispatch',
    'elementName',
    'getKey',
    'id',
    'preventDefault',
    'ref',
    'stopEvent',
  ];
  const methods = [
    'broadcast',
    'connectTo',
  ];

  const createBoundListener = (listener, component, context) => {
    const boundListener = listener.bind(context);
    boundListener.source = listener;
    boundListener.component = component;
    return boundListener;
  };

  class Sandbox {

    static create(component) {
      const blacklist =
          Object.getOwnPropertyNames(opr.Toolkit.Component.prototype);
      const autobound = {};
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (property === '$component') {
            return component;
          }
          if (property === 'props') {
            if (target instanceof opr.Toolkit.Root) {
              return target.state;
            }
            return target.props;
          }
          if (delegated.includes(property)) {
            return target[property];
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
        set: (target, property, value) => true,
      });
    }
  }

  module.exports = Sandbox;
}
