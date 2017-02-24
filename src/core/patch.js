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

    ADD_DATA_ATTRIBUTE: Symbol('add-data-attribute'),
    REPLACE_DATA_ATTRIBUTE: Symbol('replace-data-attribute'),
    REMOVE_DATA_ATTRIBUTE: Symbol('remove-data-attribute'),

    ADD_STYLE_PROPERTY: Symbol('add-style-property'),
    REPLACE_STYLE_PROPERTY: Symbol('replace-style-property'),
    REMOVE_STYLE_PROPERTY: Symbol('remove-style-property'),

    ADD_CLASS_NAME: Symbol('add-class-name'),
    REMOVE_CLASS_NAME: Symbol('remove-class-name'),

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
        target,
        props,
        apply: () => {
          target.props = props;
        }
      });
    }

    static addAttribute(name, value, target) {
      return new Patch(Type.ADD_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setAttribute(name, value);
          Reactor.Document.setAttribute(target.ref, name, value);
        }
      });
    }

    static replaceAttribute(name, value, target) {
      return new Patch(Type.REPLACE_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setAttribute(name, value);
          Reactor.Document.setAttribute(target.ref, name, value);
        }
      });
    }

    static removeAttribute(name, target) {
      return new Patch(Type.REMOVE_ATTRIBUTE, {
        name,
        target,
        apply: () => {
          target.removeAttribute(name);
          Reactor.Document.removeAttribute(target.ref, name);
        }
      });
    }

    static addDataAttribute(name, value, target) {
      return new Patch(Type.ADD_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setDataAttribute(name, value);
          Reactor.Document.setDataAttribute(target.ref, name, value);
        }
      });
    }

    static replaceDataAttribute(name, value, target) {
      return new Patch(Type.REPLACE_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: () => {
          target.setDataAttribute(name, value);
          Reactor.Document.setDataAttribute(target.ref, name, value);
        }
      });
    }

    static removeDataAttribute(name, target) {
      return new Patch(Type.REMOVE_DATA_ATTRIBUTE, {
        name,
        target,
        apply: () => {
          target.removeDataAttribute(name);
          Reactor.Document.removeDataAttribute(target.ref, name);
        }
      });
    }
    static addStyleProperty(property, value, target) {
      return new Patch(Type.ADD_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: () => {
          target.setStyleProperty(property, value);
          Reactor.Document.setStyleProperty(target.ref, property, value);
        }
      });
    }

    static replaceStyleProperty(property, value, target) {
      return new Patch(Type.REPLACE_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: () => {
          target.setStyleProperty(property, value);
          Reactor.Document.setStyleProperty(target.ref, property, value);
        }
      });
    }

    static removeStyleProperty(property, target) {
      return new Patch(Type.REMOVE_STYLE_PROPERTY, {
        property,
        target,
        apply: () => {
          target.removeStyleProperty(property);
          Reactor.Document.removeStyleProperty(target.ref, property);
        }
      });
    }

    static addClassName(name, target) {
      return new Patch(Type.ADD_CLASS_NAME, {
        name,
        target,
        apply: () => {
          target.addClassName(name);
          Reactor.Document.addClassName(target.ref, name);
        }
      });
    }

    static removeClassName(name, target) {
      return new Patch(Type.REMOVE_CLASS_NAME, {
        name,
        target,
        apply: () => {
          target.removeClassName(name);
          Reactor.Document.removeClassName(target.ref, name);
        }
      });
    }

    static addListener(event, listener, target) {
      return new Patch(Type.ADD_LISTENER, {
        event,
        listener,
        target,
        apply: () => {
          target.addListener(event, listener);
          Reactor.Document.addEventListener(target.ref, event, listener);
        }
      });
    }

    static replaceListener(event, removed, added, target) {
      return new Patch(Type.REPLACE_LISTENER, {
        event,
        removed,
        added,
        target,
        apply: () => {
          target.removeListener(event, removed);
          Reactor.Document.removeEventListener(target.ref, event, removed);
          target.addListener(event, added);
          Reactor.Document.addEventListener(target.ref, event, added);
        }
      });
    }

    static removeListener(event, listener, target) {
      return new Patch(Type.REMOVE_LISTENER, {
        event,
        listener,
        target,
        apply: () => {
          target.removeListener(event, listener);
          Reactor.Document.removeEventListener(target.ref, event, listener);
        }
      });
    }

    static addElement(element, parent) {
      return new Patch(Type.ADD_ELEMENT, {
        element,
        parent,
        apply: () => {
          parent.appendChild(element);
          const tree = Reactor.Document.attachElementTree(element);
          parent.parentElement.ref.appendChild(tree);
        }
      });
    }

    static removeElement(element, parent) {
      return new Patch(Type.REMOVE_ELEMENT, {
        element,
        parent,
        apply: () => {
          parent.child.remove();
          element.ref.remove();
        }
      });
    }

    static addComponent(component, parent) {
      return new Patch(Type.ADD_COMPONENT, {
        component,
        parent,
        apply: () => {
          parent.appendChild(component);
          Reactor.Document.attachElementTree(component);
        }
      });
    }

    static removeComponent(component, parent) {
      return new Patch(Type.REMOVE_COMPONENT, {
        component,
        parent,
        apply: () => {
          parent.child.remove();
          if (component.childElement) {
            component.childElement.ref.remove();
          }
        }
      });
    }

    static insertChildNode(node, at, parent) {
      return new Patch(Type.INSERT_CHILD_NODE, {
        node,
        at,
        parent,
        apply: () => {
          parent.children = parent.children || [];
          parent.children[at] = node;
          const element = Reactor.Document.attachElementTree(node);
          if (element) {
            parent.ref.insertBefore(element, parent.ref.childNodes[at]);
          } else {
           // TODO: check
           const comment = document.createComment('placeholder');
           parent.ref.insertBefore(comment, parent.ref.childNodes[at]);
          }
        }
      });
    }

    static moveChildNode(node, from, to, parent) {
      return new Patch(Type.MOVE_CHILD_NODE, {
        node,
        from,
        to,
        parent,
        apply: () => {
          throw 'Function "moveChildNode" not implemented!';
          // TODO: implement
        }
      });
    }

    static removeChildNode(node, at, parent) {
      return new Patch(Type.REMOVE_CHILD_NODE, {
        node,
        at,
        parent,
        apply: () => {
          throw 'Function "removeChildNode" not implemented!';
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