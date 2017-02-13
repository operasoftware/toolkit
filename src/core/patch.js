{
  const Type = Object.freeze({
    UPDATE_COMPONENT: Symbol('update-component'),
    ADD_ELEMENT: Symbol('add-element'),
    REMOVE_ELEMENT: Symbol('remove-element'),
    ADD_COMPONENT: Symbol('add-component'),
    REMOVE_COMPONENT: Symbol('remove-component'),
    ADD_ATTRIBUTE: Symbol('add-attribute'),
    REPLACE_ATTRIBUTE: Symbol('replace-attribute'),
    REMOVE_ATTRIBUTE: Symbol('remove-attribute'),
    ADD_LISTENER: Symbol('add-listener'),
    REPLACE_LISTENER: Symbol('replace-listener'),
    REMOVE_LISTENER: Symbol('remove-listener'),
    INSERT_CHILD_NODE: Symbol('insert-child-node'),
    MOVE_CHILD_NODE: Symbol('move-child-node'),
    REMOVE_CHILD_NODE: Symbol('remove-child-node'),
  });

  const Patch = class {

    constructor(type, props) {
      Object.assign(this, {
        type
      }, props);
    }

    static updateComponent(target, props) {
      return new Patch(Type.UPDATE_COMPONENT, {
        target, props,
        apply: () => {} 
      });
    }

    static addElement(element, parent) {
      return new Patch(Type.ADD_ELEMENT, {
        element, parent,
        apply: ({element, parent}) => {
          parent.appendChild(element);
        } 
      });
    }

    static removeElement(element, parent) {
      return new Patch(Type.REMOVE_ELEMENT, {
        element, parent,
        apply: ({element, parent}) => {
          element.remove();
        } 
      });
    }

    static addComponent(component, parent) {
      return new Patch(Type.ADD_COMPONENT, {
        component, parent,
        apply: ({component}) => {
          component.mount();
        } 
      });
    }

    static removeComponent(component, parent) {
      return new Patch(Type.REMOVE_COMPONENT, {
        component, parent,
        apply: ({component}) => {
          component.destroy();
        } 
      });
    }

    static addAttribute(name, value, target) {
      return new Patch(Type.ADD_ATTRIBUTE, {
        name, value, target,
        apply: element => {
          element.setAttribute(name, value);
        }
      });
    }

    static replaceAttribute(name, value, target) {
      return new Patch(Type.REPLACE_ATTRIBUTE, {
        name, value, target,
        apply: element => {
          element.setAttribute(name, value);
        }
      });
    }

    static removeAttribute(name, target) {
      return new Patch(Type.REMOVE_ATTRIBUTE, {
        name, target,
        apply: element => {
          element.removeAttribute(name, value);
        }
      });
    }

    static addListener(name, listener, target) {
      return new Patch(Type.ADD_LISTENER, {
        name, listener, target,
        apply: element => {
          element.addEventListener(name, listener);
        }
      });
    }

    static replaceListener(name, removed, added, target) {
      return new Patch(Type.REPLACE_LISTENER, {
        name, removed, added, target,
        apply: element => {
          element.removeEventListener(name, removed);
          element.addEventListener(name, added);
        }
      });
    }

    static removeListener(name, listener, target) {
      return new Patch(Type.REMOVE_LISTENER, {
        name, listener, target,
        apply: element => {
          element.removeEventListener(name, listener);
        }
      });
    }

    static insertChildNode(node, at, parent) {
      return new Patch(Type.INSERT_CHILD_NODE, {
        node, at, parent,
        apply: element => {
          // TODO: implement
        }
      });
    }

    static moveChildNode(node, from, to, parent) {
      return new Patch(Type.MOVE_CHILD_NODE, {
        node, from, to, parent,
        apply: element => {
          // TODO: implement
        }
      });
    }

    static removeChildNode(node, at, parent) {
      return new Patch(Type.REMOVE_CHILD_NODE, {
        node, at, parent,
        apply: element => {
          // TODO: implement
        }
      });
    }

    static get Type() {
      return Object.assign({}, Type);
    } 
  };

  module.exports = Patch;
}