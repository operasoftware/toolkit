{
  const Type = Object.freeze({

    CREATE_ROOT_COMPONENT: Symbol('init-root-component'),
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

    ADD_METADATA: Symbol('add-metadata'),
    REPLACE_METADATA: Symbol('replace-metadata'),
    REMOVE_METADATA: Symbol('remove-metadata'),

    INSERT_CHILD_NODE: Symbol('insert-child-node'),
    MOVE_CHILD_NODE: Symbol('move-child-node'),
    REMOVE_CHILD_NODE: Symbol('remove-child-node'),

    SET_TEXT_CONTENT: Symbol('set-text-content'),
    REMOVE_TEXT_CONTENT: Symbol('remove-text-content'),
  });

  class Patch {

    constructor(type, props) {
      Object.assign(this, {type}, props);
    }

    static createRootComponent(root) {
      return new Patch(Type.CREATE_ROOT_COMPONENT, {
        root,
        apply: () => {
          root.props = null;
        }
      });
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
          opr.Toolkit.Document.setAttribute(target.ref, name, value);
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
          opr.Toolkit.Document.setAttribute(target.ref, name, value);
        }
      });
    }

    static removeAttribute(name, target) {
      return new Patch(Type.REMOVE_ATTRIBUTE, {
        name,
        target,
        apply: () => {
          target.removeAttribute(name);
          opr.Toolkit.Document.removeAttribute(target.ref, name);
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
          opr.Toolkit.Document.setDataAttribute(target.ref, name, value);
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
          opr.Toolkit.Document.setDataAttribute(target.ref, name, value);
        }
      });
    }

    static removeDataAttribute(name, target) {
      return new Patch(Type.REMOVE_DATA_ATTRIBUTE, {
        name,
        target,
        apply: () => {
          target.removeDataAttribute(name);
          opr.Toolkit.Document.removeDataAttribute(target.ref, name);
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
          opr.Toolkit.Document.setStyleProperty(target.ref, property, value);
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
          opr.Toolkit.Document.setStyleProperty(target.ref, property, value);
        }
      });
    }

    static removeStyleProperty(property, target) {
      return new Patch(Type.REMOVE_STYLE_PROPERTY, {
        property,
        target,
        apply: () => {
          target.removeStyleProperty(property);
          opr.Toolkit.Document.removeStyleProperty(target.ref, property);
        }
      });
    }

    static addClassName(name, target) {
      return new Patch(Type.ADD_CLASS_NAME, {
        name,
        target,
        apply: () => {
          target.addClassName(name);
          opr.Toolkit.Document.addClassName(target.ref, name);
        }
      });
    }

    static removeClassName(name, target) {
      return new Patch(Type.REMOVE_CLASS_NAME, {
        name,
        target,
        apply: () => {
          target.removeClassName(name);
          opr.Toolkit.Document.removeClassName(target.ref, name);
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
          opr.Toolkit.Document.addEventListener(target.ref, event, listener);
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
          opr.Toolkit.Document.removeEventListener(target.ref, event, removed);
          target.addListener(event, added);
          opr.Toolkit.Document.addEventListener(target.ref, event, added);
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
          opr.Toolkit.Document.removeEventListener(target.ref, event, listener);
        }
      });
    }

    static addMetadata(key, value, target) {
      return new Patch(Type.ADD_METADATA, {
        key,
        value,
        target,
        apply: () => {
          target.metadata[key] = value;
          opr.Toolkit.Document.setMetadata(target.ref, key, value);
        }
      });
    }

    static replaceMetadata(key, value, target) {
      return new Patch(Type.REPLACE_METADATA, {
        key,
        value,
        target,
        apply: () => {
          target.metadata[key] = value;
          opr.Toolkit.Document.setMetadata(target.ref, key, value);
        }
      });
    }

    static removeMetadata(key, target) {
      return new Patch(Type.REMOVE_METADATA, {
        key,
        target,
        apply: () => {
          delete target.metadata[key];
          opr.Toolkit.Document.removeMetadata(target.ref, key);
        }
      });
    }

    static addElement(element, parent) {
      return new Patch(Type.ADD_ELEMENT, {
        element,
        parent,
        apply: () => {
          parent.appendChild(element);
          opr.Toolkit.Document.attachElementTree(element, domElement => {
            parent.parentElement.ref.appendChild(domElement);
          });
        }
      });
    }

    static removeElement(element, parent) {
      return new Patch(Type.REMOVE_ELEMENT, {
        element,
        parent,
        apply: () => {
          parent.removeChild(element);
          element.ref.remove();
        }
      });
    }

    static addComponent(component, parent) {
      return new Patch(Type.ADD_COMPONENT, {
        component,
        parent,
        apply: () => {
          const comment = parent.placeholder.ref;
          const parentDomNode = parent.parentElement.ref;
          if (parent.isRoot()) {
            parent.appendChild(component);
            opr.Toolkit.Document.attachElementTree(component, domNode => {
              if (parentDomNode.hasChildNodes()) {
                opr.Toolkit.Document.replaceChild(
                    domNode, parentDomNode.firstChild, parentDomNode);
              } else {
                opr.Toolkit.Document.appendChild(domNode, parentDomNode);
              }
            });
          } else {
            parent.appendChild(component);
            opr.Toolkit.Document.attachElementTree(component, domNode => {
              opr.Toolkit.Document.replaceChild(
                  domNode, comment, parentDomNode);
            });
          }
        }
      });
    }

    static removeComponent(component, parent) {
      return new Patch(Type.REMOVE_COMPONENT, {
        component,
        parent,
        apply: () => {
          const domChildNode =
              (component.childElement || component.placeholder).ref;
          parent.removeChild(component);
          parent.placeholder.ref =
              opr.Toolkit.Document.createComment(parent.placeholder);
          parent.parentElement.ref.replaceChild(
              parent.placeholder.ref, domChildNode);
        }
      });
    }

    static insertChildNode(node, at, parent) {
      return new Patch(Type.INSERT_CHILD_NODE, {
        node,
        at,
        parent,
        apply: () => {
          parent.insertChild(node, at);
          opr.Toolkit.Document.attachElementTree(node, domNode => {
            parent.ref.insertBefore(domNode, parent.ref.childNodes[at]);
          });
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
          parent.moveChild(node, from, to);
          opr.Toolkit.Document.moveChild(node.ref, from, to, parent.ref);
        }
      });
    }

    static removeChildNode(node, at, parent) {
      return new Patch(Type.REMOVE_CHILD_NODE, {
        node,
        at,
        parent,
        apply: () => {
          parent.removeChild(node);
          opr.Toolkit.Document.removeChild(node.ref, parent.ref);
        }
      });
    }

    static setTextContent(element, text) {
      return new Patch(Type.SET_TEXT_CONTENT, {
        element,
        text,
        apply: () => {
          element.text = text;
          opr.Toolkit.Document.setTextContent(element.ref, text);
        }
      });
    }

    static removeTextContent(element) {
      return new Patch(Type.REMOVE_TEXT_CONTENT, {
        element,
        apply: () => {
          element.text = null;
          opr.Toolkit.Document.setTextContent(element.ref, '');
        }
      });
    }

    static get Type() {
      return Object.assign({}, Type);
    }
  }

  module.exports = Patch;
}
