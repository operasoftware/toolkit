{
  const isFunction = (target, property) =>
      typeof target[property] === 'function';

  const delegated = [
    'commands',
    'constructor',
    'container',
    'dispatch',
    'elementName',
    'getKey',
    'id',
    'ref',
  ];
  const methods = [
    'broadcast',
    'connectTo',
  ];

  const CHILDREN = 'children';
  const PROPS = 'props';

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
      const state = {};
      return new Proxy(component, {
        get: (target, property, receiver) => {
          if (property === '$component') {
            return component;
          }
          if (property === PROPS) {
            if (state.props !== undefined) {
              return state.props;
            }
            return target instanceof opr.Toolkit.Root ? target.state :
                                                        target.props;
          }
          if (property === CHILDREN) {
            if (state.children !== undefined) {
              return state.children;
            }
            return target.children;
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
        set: (target, property, value) => {
          if ([CHILDREN, PROPS].includes(property)) {
            state[property] = value;
          }
          return true;
        },
      });
    }
  }

  module.exports = Sandbox;
}
