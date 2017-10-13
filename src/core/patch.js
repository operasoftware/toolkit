{
  const Type = Object.freeze({

    INIT_ROOT_COMPONENT: Symbol('init-root-component'),
    UPDATE_COMPONENT: Symbol('update-component'),

    ADD_ELEMENT: Symbol('add-element'),
    REMOVE_ELEMENT: Symbol('remove-element'),

    ADD_COMPONENT: Symbol('add-component'),
    REMOVE_COMPONENT: Symbol('remove-component'),

    REPLACE_CHILD: Symbol('replace-child'),

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

    ADD_METADATA: Symbol('add-metadata'),
    REPLACE_METADATA: Symbol('replace-metadata'),
    REMOVE_METADATA: Symbol('remove-metadata'),

    INSERT_CHILD_NODE: Symbol('insert-child-node'),
    MOVE_CHILD_NODE: Symbol('move-child-node'),
    REPLACE_CHILD_NODE: Symbol('replace-child-node'),
    REMOVE_CHILD_NODE: Symbol('remove-child-node'),

    SET_TEXT_CONTENT: Symbol('set-text-content'),
    REMOVE_TEXT_CONTENT: Symbol('remove-text-content'),
  });

  class Patch {

    constructor(type, props) {
      Object.assign(this, {type}, props);
    }

    static initRootComponent(root) {
      return new Patch(Type.INIT_ROOT_COMPONENT, {
        root,
        apply: function() {
          root.container.appendChild(root.ref);
        },
      });
    }

    static updateComponent(target) {
      return new Patch(Type.UPDATE_COMPONENT, {
        target,
        props: target.props,
        apply: function() {
          this.prevProps = target.props;
        },
      });
    }

    static addAttribute(name, value, target) {
      return new Patch(Type.ADD_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setAttribute(name, value);
        },
      });
    }

    static replaceAttribute(name, value, target) {
      return new Patch(Type.REPLACE_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setAttribute(name, value);
        },
      });
    }

    static removeAttribute(name, target) {
      return new Patch(Type.REMOVE_ATTRIBUTE, {
        name,
        target,
        apply: function() {
          target.removeAttribute(name);
        },
      });
    }

    static addDataAttribute(name, value, target) {
      return new Patch(Type.ADD_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setDataAttribute(name, value);
        },
      });
    }

    static replaceDataAttribute(name, value, target) {
      return new Patch(Type.REPLACE_DATA_ATTRIBUTE, {
        name,
        value,
        target,
        apply: function() {
          target.setDataAttribute(name, value);
        },
      });
    }

    static removeDataAttribute(name, target) {
      return new Patch(Type.REMOVE_DATA_ATTRIBUTE, {
        name,
        target,
        apply: function() {
          target.removeDataAttribute(name);
        },
      });
    }
    static addStyleProperty(property, value, target) {
      return new Patch(Type.ADD_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: function() {
          target.setStyleProperty(property, value);
        },
      });
    }

    static replaceStyleProperty(property, value, target) {
      return new Patch(Type.REPLACE_STYLE_PROPERTY, {
        property,
        value,
        target,
        apply: function() {
          target.setStyleProperty(property, value);
        },
      });
    }

    static removeStyleProperty(property, target) {
      return new Patch(Type.REMOVE_STYLE_PROPERTY, {
        property,
        target,
        apply: function() {
          target.removeStyleProperty(property);
        },
      });
    }

    static addClassName(name, target) {
      return new Patch(Type.ADD_CLASS_NAME, {
        name,
        target,
        apply: function() {
          target.addClassName(name);
        },
      });
    }

    static removeClassName(name, target) {
      return new Patch(Type.REMOVE_CLASS_NAME, {
        name,
        target,
        apply: function() {
          target.removeClassName(name);
        },
      });
    }

    static addListener(name, listener, target) {
      return new Patch(Type.ADD_LISTENER, {
        name,
        listener,
        target,
        apply: function() {
          target.addListener(name, listener);
        },
      });
    }

    static replaceListener(name, removed, added, target) {
      return new Patch(Type.REPLACE_LISTENER, {
        name,
        removed,
        added,
        target,
        apply: function() {
          target.removeListener(name, removed);
          target.addListener(name, added);
        },
      });
    }

    static removeListener(name, listener, target) {
      return new Patch(Type.REMOVE_LISTENER, {
        name,
        listener,
        target,
        apply: function() {
          target.removeListener(name, listener);
        },
      });
    }

    static addMetadata(key, value, target) {
      return new Patch(Type.ADD_METADATA, {
        key,
        value,
        target,
        apply: function() {
          target.setMetadata(key, value);
        },
      });
    }

    static replaceMetadata(key, value, target) {
      return new Patch(Type.REPLACE_METADATA, {
        key,
        value,
        target,
        apply: function() {
          target.setMetadata(key, value);
        },
      });
    }

    static removeMetadata(key, target) {
      return new Patch(Type.REMOVE_METADATA, {
        key,
        target,
        apply: function() {
          target.removeMetadata(key);
        },
      });
    }

    static addElement(element, parent) {
      return new Patch(Type.ADD_ELEMENT, {
        element,
        parent,
        apply: function() {
          const ref = parent.ref;
          parent.appendChild(element);
          ref.replaceWith(element.ref);
        },
      });
    }

    static removeElement(element, parent) {
      return new Patch(Type.REMOVE_ELEMENT, {
        element,
        parent,
        apply: function() {
          const ref = element.ref;
          parent.removeChild(element);
          ref.replaceWith(parent.ref);
        },
      });
    }

    static addComponent(component, parent) {
      return new Patch(Type.ADD_COMPONENT, {
        component,
        parent,
        apply: function() {
          const ref = parent.ref;
          parent.appendChild(component);
          ref.replaceWith(component.ref);
        },
      });
    }

    static removeComponent(component, parent) {
      return new Patch(Type.REMOVE_COMPONENT, {
        component,
        parent,
        apply: function() {
          const ref = component.ref;
          parent.removeChild(component);
          ref.replaceWith(parent.ref);
        },
      });
    }

    static replaceChild(child, node, parent) {
      return new Patch(Type.REPLACE_CHILD, {
        child,
        node,
        parent,
        apply: function() {
          const ref = parent.ref;
          parent.replaceChild(child, node);
          ref.replaceWith(node.ref);
        },
      });
    }

    static insertChildNode(node, at, parent) {
      return new Patch(Type.INSERT_CHILD_NODE, {
        node,
        at,
        parent,
        apply: function() {
          parent.insertChild(node, at);
        },
      });
    }

    static moveChildNode(node, from, to, parent) {
      return new Patch(Type.MOVE_CHILD_NODE, {
        node,
        from,
        to,
        parent,
        apply: function() {
          parent.moveChild(node, from, to);
        },
      });
    }

    static replaceChildNode(child, node, parent) {
      return new Patch(Type.REPLACE_CHILD_NODE, {
        child,
        node,
        parent,
        apply: function() {
          parent.replaceChild(child, node);
        },
      })
    }

    static removeChildNode(node, at, parent) {
      return new Patch(Type.REMOVE_CHILD_NODE, {
        node,
        at,
        parent,
        apply: function() {
          parent.removeChild(node);
        },
      });
    }

    static setTextContent(element, text) {
      return new Patch(Type.SET_TEXT_CONTENT, {
        element,
        text,
        apply: function() {
          element.setTextContent(text);
        },
      });
    }

    static removeTextContent(element) {
      return new Patch(Type.REMOVE_TEXT_CONTENT, {
        element,
        apply: function() {
          element.removeTextContent();
        },
      });
    }

    static get Type() {
      return Object.assign({}, Type);
    }
  }

  module.exports = Patch;
}
