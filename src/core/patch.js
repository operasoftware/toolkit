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
      this.root.container.appendChild(this.root.content.ref);
    },
  };
  const UPDATE_NODE = {
    type: Symbol('update-node'),
    apply: function() {
      this.node.description = this.description;
    },
  };

  const SET_ATTRIBUTE = {
    type: Symbol('set-attribute'),
    apply: function() {
      const attr = this.isCustom ?
          this.name :
          opr.Toolkit.utils.getAttributeName(this.name);
      this.target.ref.setAttribute(attr, this.value);
    },
  };
  const REMOVE_ATTRIBUTE = {
    type: Symbol('remove-attribute'),
    apply: function() {
      const attr = this.isCustom ?
          this.name :
          opr.Toolkit.utils.getAttributeName(this.name);
      this.target.ref.removeAttribute(attr);
    },
  };

  const SET_DATA_ATTRIBUTE = {
    type: Symbol('set-data-attribute'),
    apply: function() {
      this.target.ref.dataset[this.name] = this.value;
    },
  };
  const REMOVE_DATA_ATTRIBUTE = {
    type: Symbol('remove-data-attribute'),
    apply: function() {
      delete this.target.ref.dataset[this.name];
    },
  };

  const SET_STYLE_PROPERTY = {
    type: Symbol('set-style-property'),
    apply: function() {
      this.target.ref.style[this.property] = this.value;
    },
  };
  const REMOVE_STYLE_PROPERTY = {
    type: Symbol('remove-style-property'),
    apply: function() {
      this.target.ref.style[this.property] = null;
    },
  };

  const SET_CLASS_NAME = {
    type: Symbol('set-class-name'),
    apply: function() {
      this.target.ref.className = this.className;
    },
  };

  const ADD_LISTENER = {
    type: Symbol('add-listener'),
    apply: function() {
      const event =
          this.isCustom ? this.name : opr.Toolkit.utils.getEventName(this.name);
      this.target.ref.addEventListener(event, this.listener);
    },
  };
  const REPLACE_LISTENER = {
    type: Symbol('replace-listener'),
    apply: function() {
      const event =
          this.isCustom ? this.name : opr.Toolkit.utils.getEventName(this.name);
      this.target.ref.removeEventListener(event, this.removed);
      this.target.ref.addEventListener(event, this.added);
    },
  };
  const REMOVE_LISTENER = {
    type: Symbol('remove-listener'),
    apply: function() {
      const event =
          this.isCustom ? this.name : opr.Toolkit.utils.getEventName(this.name);
      this.target.ref.removeEventListener(event, this.listener);
    },
  };

  const SET_PROPERTY = {
    type: Symbol('set-property'),
    apply: function() {
      this.target.ref[this.key] = this.value;
    },
  };
  const DELETE_PROPERTY = {
    type: Symbol('delete-property'),
    apply: function() {
      delete this.target.ref[this.key];
    },
  };

  const INSERT_CHILD = {
    type: Symbol('insert-child'),
    apply: function() {
      this.parent.insertChild(this.node, this.at);
    },
  };
  const REPLACE_CHILD = {
    type: Symbol('replace-child'),
    apply: function() {
      this.parent.replaceChild(this.child, this.node);
    },
  };
  const MOVE_CHILD = {
    type: Symbol('move-child'),
    apply: function() {
      this.parent.moveChild(this.child, this.from, this.to);
    },
  };
  const REMOVE_CHILD = {
    type: Symbol('remove-child'),
    apply: function() {
      this.parent.removeChild(this.child);
    },
  };

  const SET_CONTENT = {
    type: Symbol('set-content'),
    apply: function() {
      this.parent.setContent(this.node);
    },
  };

  const Types = {
    INIT_ROOT_COMPONENT,
    UPDATE_NODE,
    SET_ATTRIBUTE,
    REMOVE_ATTRIBUTE,
    SET_DATA_ATTRIBUTE,
    REMOVE_DATA_ATTRIBUTE,
    SET_STYLE_PROPERTY,
    REMOVE_STYLE_PROPERTY,
    SET_CLASS_NAME,
    ADD_LISTENER,
    REPLACE_LISTENER,
    REMOVE_LISTENER,
    SET_PROPERTY,
    DELETE_PROPERTY,
    INSERT_CHILD,
    REPLACE_CHILD,
    MOVE_CHILD,
    REMOVE_CHILD,
    SET_CONTENT,
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

    static updateNode(node, description) {
      const patch = new Patch(UPDATE_NODE);
      patch.node = node;
      patch.prevDescription = node.description;
      patch.description = description;
      return patch;
    }

    static insertChild(node, at, parent) {
      const patch = new Patch(INSERT_CHILD);
      patch.node = node;
      patch.at = at;
      patch.parent = parent;
      return patch;
    }

    static moveChild(child, from, to, parent) {
      const patch = new Patch(MOVE_CHILD);
      patch.child = child;
      patch.from = from;
      patch.to = to;
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

    static removeChild(child, at, parent) {
      const patch = new Patch(REMOVE_CHILD);
      patch.child = child;
      patch.at = at;
      patch.parent = parent;
      return patch;
    }

    static setContent(node, parent) {
      const patch = new Patch(SET_CONTENT);
      patch.node = node;
      patch.child = parent.content;
      patch.parent = parent;
      return patch;
    }

    static setAttribute(name, value, target, isCustom) {
      const patch = new Patch(SET_ATTRIBUTE);
      patch.name = name;
      patch.value = value;
      patch.target = target;
      patch.isCustom = isCustom;
      return patch;
    }

    static removeAttribute(name, target, isCustom) {
      const patch = new Patch(REMOVE_ATTRIBUTE);
      patch.name = name;
      patch.target = target;
      patch.isCustom = isCustom;
      return patch;
    }

    static setDataAttribute(name, value, target) {
      const patch = new Patch(SET_DATA_ATTRIBUTE);
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

    static setStyleProperty(property, value, target) {
      const patch = new Patch(SET_STYLE_PROPERTY);
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

    static addListener(name, listener, target, isCustom) {
      const patch = new Patch(ADD_LISTENER);
      patch.name = name;
      patch.listener = listener;
      patch.target = target;
      patch.isCustom = isCustom;
      return patch;
    }

    static replaceListener(name, removed, added, target, isCustom) {
      const patch = new Patch(REPLACE_LISTENER);
      patch.name = name;
      patch.removed = removed;
      patch.added = added;
      patch.target = target;
      patch.isCustom = isCustom;
      return patch;
    }

    static removeListener(name, listener, target, isCustom) {
      const patch = new Patch(REMOVE_LISTENER);
      patch.name = name;
      patch.listener = listener;
      patch.target = target;
      patch.isCustom = isCustom;
      return patch;
    }

    static setProperty(key, value, target) {
      const patch = new Patch(SET_PROPERTY);
      patch.key = key;
      patch.value = value;
      patch.target = target;
      return patch;
    }

    static deleteProperty(key, target) {
      const patch = new Patch(DELETE_PROPERTY);
      patch.key = key;
      patch.target = target;
      return patch;
    }

    static get Type() {
      return PatchTypes;
    }
  }

  module.exports = Patch;
}
