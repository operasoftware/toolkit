/*
Copyright 2017-2018 Opera Software AS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

{
  const INIT_ROOT_COMPONENT = {
    type: Symbol('init-root-component'),
    apply: function() {
      this.root.container.appendChild(this.root.placeholder.ref);
    },
  };
  const UPDATE_COMPONENT = {
    type: Symbol('update-component'),
  };

  const ADD_ELEMENT = {
    type: Symbol('add-element'),
    apply: function() {
      const ref = this.parent.placeholder.ref;
      this.parent.appendChild(this.element);
      ref.replaceWith(this.element.ref);
    },
  };
  const REMOVE_ELEMENT = {
    type: Symbol('remove-element'),
    apply: function() {
      const ref = this.element.ref;
      this.parent.removeChild(this.element);
      ref.replaceWith(this.parent.placeholder.ref);
    },
  };

  const ADD_COMPONENT = {
    type: Symbol('add-component'),
    apply: function() {
      const ref = this.parent.placeholder.ref;
      this.parent.appendChild(this.component);
      ref.replaceWith(this.component.ref);
    },
  };
  const REMOVE_COMPONENT = {
    type: Symbol('remove-component'),
    apply: function() {
      const ref = this.component.ref;
      this.parent.removeChild(this.component);
      ref.replaceWith(this.parent.placeholder.ref);
    },
  };

  const REPLACE_CHILD = {
    type: Symbol('replace-child'),
    apply: function() {
      const ref = this.child.ref;
      this.parent.replaceChild(this.child, this.node);
      ref.replaceWith(this.node.ref);
    },
  };

  const ADD_ATTRIBUTE = {
    type: Symbol('add-attribute'),
    apply: function() {
      this.target.setAttribute(this.name, this.value);
    },
  };
  const REPLACE_ATTRIBUTE = {
    type: Symbol('replace-attribute'),
    apply: function() {
      this.target.setAttribute(this.name, this.value);
    },
  };
  const REMOVE_ATTRIBUTE = {
    type: Symbol('remove-attribute'),
    apply: function() {
      this.target.removeAttribute(this.name);
    },
  };

  const ADD_DATA_ATTRIBUTE = {
    type: Symbol('add-data-attribute'),
    apply: function() {
      this.target.setDataAttribute(this.name, this.value);
    },
  };
  const REPLACE_DATA_ATTRIBUTE = {
    type: Symbol('replace-data-attribute'),
    apply: function() {
      this.target.setDataAttribute(this.name, this.value);
    },
  };
  const REMOVE_DATA_ATTRIBUTE = {
    type: Symbol('remove-data-attribute'),
    apply: function() {
      this.target.removeDataAttribute(this.name);
    },
  };

  const ADD_STYLE_PROPERTY = {
    type: Symbol('add-style-property'),
    apply: function() {
      this.target.setStyleProperty(this.property, this.value);
    },
  };
  const REPLACE_STYLE_PROPERTY = {
    type: Symbol('replace-style-property'),
    apply: function() {
      this.target.setStyleProperty(this.property, this.value);
    },
  };
  const REMOVE_STYLE_PROPERTY = {
    type: Symbol('remove-style-property'),
    apply: function() {
      this.target.removeStyleProperty(this.property);
    },
  };

  const SET_CLASS_NAME = {
    type: Symbol('set-class-name'),
    apply: function() {
      this.target.setClassName(this.className);
    },
  };

  const ADD_LISTENER = {
    type: Symbol('add-listener'),
    apply: function() {
      this.target.addListener(this.name, this.listener);
    },
  };
  const REPLACE_LISTENER = {
    type: Symbol('replace-listener'),
    apply: function() {
      this.target.removeListener(this.name, this.removed);
      this.target.addListener(this.name, this.added);
    },
  };
  const REMOVE_LISTENER = {
    type: Symbol('remove-listener'),
    apply: function() {
      this.target.removeListener(this.name, this.listener);
    },
  };

  const ADD_METADATA = {
    type: Symbol('add-metadata'),
    apply: function() {
      this.target.setMetadata(this.key, this.value);
    },
  };
  const REPLACE_METADATA = {
    type: Symbol('replace-metadata'),
    apply: function() {
      this.target.setMetadata(this.key, this.value);
    },
  };
  const REMOVE_METADATA = {
    type: Symbol('remove-metadata'),
    apply: function() {
      this.target.removeMetadata(this.key);
    },
  };

  const INSERT_CHILD_NODE = {
    type: Symbol('insert-child-node'),
    apply: function() {
      this.parent.insertChild(this.node, this.at);
    },
  };
  const MOVE_CHILD_NODE = {
    type: Symbol('move-child-node'),
    apply: function() {
      this.parent.moveChild(this.node, this.from, this.to);
    },
  };
  const REPLACE_CHILD_NODE = {
    type: Symbol('replace-child-node'),
    apply: function() {
      this.parent.replaceChild(this.child, this.node);
    },
  };
  const REMOVE_CHILD_NODE = {
    type: Symbol('remove-child-node'),
    apply: function() {
      this.parent.removeChild(this.node);
    },
  };

  const SET_TEXT_CONTENT = {
    type: Symbol('set-text-content'),
    apply: function() {
      this.element.setTextContent(this.text);
    },
  };
  const REMOVE_TEXT_CONTENT = {
    type: Symbol('remove-text-content'),
    apply: function() {
      this.element.removeTextContent();
    },
  };

  const Types = {
    INIT_ROOT_COMPONENT,
    UPDATE_COMPONENT,
    ADD_ELEMENT,
    REMOVE_ELEMENT,
    ADD_COMPONENT,
    REMOVE_COMPONENT,
    REPLACE_CHILD,
    ADD_ATTRIBUTE,
    REPLACE_ATTRIBUTE,
    REMOVE_ATTRIBUTE,
    ADD_DATA_ATTRIBUTE,
    REPLACE_DATA_ATTRIBUTE,
    REMOVE_DATA_ATTRIBUTE,
    ADD_STYLE_PROPERTY,
    REPLACE_STYLE_PROPERTY,
    REMOVE_STYLE_PROPERTY,
    SET_CLASS_NAME,
    ADD_LISTENER,
    REPLACE_LISTENER,
    REMOVE_LISTENER,
    ADD_METADATA,
    REPLACE_METADATA,
    REMOVE_METADATA,
    INSERT_CHILD_NODE,
    MOVE_CHILD_NODE,
    REPLACE_CHILD_NODE,
    REMOVE_CHILD_NODE,
    SET_TEXT_CONTENT,
    REMOVE_TEXT_CONTENT,
  };
  const PatchTypes = Object.keys(Types).reduce((result, key) => {
    result[key] = Types[key].type;
    return result;
  }, {});

  class Patch {
    constructor(def) {
      this.type = def.type;
      this.apply = def.apply || opr.Toolkit.noop;
    }

    static initRootComponent(root) {
      const patch = new Patch(INIT_ROOT_COMPONENT);
      patch.root = root;
      return patch;
    }

    static updateComponent(target, prevProps) {
      const patch = new Patch(UPDATE_COMPONENT);
      patch.target = target;
      patch.prevProps = prevProps;
      patch.props = target.sandbox.props;
      return patch;
    }

    static addElement(element, parent) {
      const patch = new Patch(ADD_ELEMENT);
      patch.element = element;
      patch.parent = parent;
      return patch;
    }

    static removeElement(element, parent) {
      const patch = new Patch(REMOVE_ELEMENT);
      patch.element = element;
      patch.parent = parent;
      return patch;
    }

    static addComponent(component, parent) {
      const patch = new Patch(ADD_COMPONENT);
      patch.component = component;
      patch.parent = parent;
      return patch;
    }

    static removeComponent(component, parent) {
      const patch = new Patch(REMOVE_COMPONENT);
      patch.component = component;
      patch.parent = parent;
      return patch;
    }

    static replaceChild(child, node, parent) {
      const patch = new Patch(REPLACE_CHILD);
      patch.child = child;
      patch.node = node;
      patch.parent = parent;
      return patch;
    }

    static addAttribute(name, value, target) {
      const patch = new Patch(ADD_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceAttribute(name, value, target) {
      const patch = new Patch(REPLACE_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeAttribute(name, target) {
      const patch = new Patch(REMOVE_ATTRIBUTE);
      patch.name = name;
      patch.target = target;
      return patch;
    }

    static addDataAttribute(name, value, target) {
      const patch = new Patch(ADD_DATA_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceDataAttribute(name, value, target) {
      const patch = new Patch(REPLACE_DATA_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeDataAttribute(name, target) {
      const patch = new Patch(REMOVE_DATA_ATTRIBUTE);
      patch.name = name;
      patch.target = target;
      return patch;
    }

    static addStyleProperty(property, value, target) {
      const patch = new Patch(ADD_STYLE_PROPERTY);
      patch.property = property;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceStyleProperty(property, value, target) {
      const patch = new Patch(REPLACE_STYLE_PROPERTY);
      patch.property = property;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeStyleProperty(property, target) {
      const patch = new Patch(REMOVE_STYLE_PROPERTY);
      patch.property = property;
      patch.target = target;
      return patch;
    }

    static setClassName(className, target) {
      const patch = new Patch(SET_CLASS_NAME);
      patch.className = className;
      patch.target = target;
      return patch;
    }

    static addListener(name, listener, target) {
      const patch = new Patch(ADD_LISTENER);
      patch.name = name;
      patch.listener = listener;
      patch.target = target;
      return patch;
    }

    static replaceListener(name, removed, added, target) {
      const patch = new Patch(REPLACE_LISTENER);
      patch.name = name;
      patch.removed = removed;
      patch.added = added;
      patch.target = target;
      return patch;
    }

    static removeListener(name, listener, target) {
      const patch = new Patch(REMOVE_LISTENER);
      patch.name = name;
      patch.listener = listener;
      patch.target = target;
      return patch;
    }

    static addMetadata(key, value, target) {
      const patch = new Patch(ADD_METADATA);
      patch.key = key;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static replaceMetadata(key, value, target) {
      const patch = new Patch(REPLACE_METADATA);
      patch.key = key;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static removeMetadata(key, target) {
      const patch = new Patch(REMOVE_METADATA);
      patch.key = key;
      patch.target = target;
      return patch;
    }

    static insertChildNode(node, at, parent) {
      const patch = new Patch(INSERT_CHILD_NODE);
      patch.node = node;
      patch.at = at;
      patch.parent = parent;
      return patch;
    }

    static moveChildNode(node, from, to, parent) {
      const patch = new Patch(MOVE_CHILD_NODE);
      patch.node = node;
      patch.from = from;
      patch.to = to;
      patch.parent = parent;
      return patch;
    }

    static replaceChildNode(child, node, parent) {
      const patch = new Patch(REPLACE_CHILD_NODE);
      patch.child = child;
      patch.node = node;
      patch.parent = parent;
      return patch;
    }

    static removeChildNode(node, at, parent) {
      const patch = new Patch(REMOVE_CHILD_NODE);
      patch.node = node;
      patch.at = at;
      patch.parent = parent;
      return patch;
    }

    static setTextContent(element, text) {
      const patch = new Patch(SET_TEXT_CONTENT);
      patch.element = element;
      patch.text = text;
      return patch;
    }

    static removeTextContent(element) {
      const patch = new Patch(REMOVE_TEXT_CONTENT);
      patch.element = element;
      return patch;
    }

    static get Type() {
      return PatchTypes;
    }
  }

  module.exports = Patch;
}
