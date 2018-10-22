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
  class Diff {

    /*
     * Creates a new instance bound to a root component
     * with an empty list of patches.
     */
    constructor(root) {
      this.root = root;
      this.patches = [];
    }

    /*
     * Adds the patch to the underlying list.
     */
    addPatch(patch) { return this.patches.push(patch); }

    /*
     * Applies all the patches onto the bound root node.
     */
    apply() {
      if (this.patches.length) {
        opr.Toolkit.Lifecycle.beforeUpdate(this.patches);
        for (const patch of this.patches) {
          patch.apply();
        }
        opr.Toolkit.Lifecycle.afterUpdate(this.patches);
      }
    }

    /*
     * Calculates and returns all patches needed for transformation
     * of the rendered DOM fragment from one state to another.
     */
    rootPatches(currentState, nextState) {

      if (!currentState) {
        this.addPatch(opr.Toolkit.Patch.initRootComponent(this.root));
      }

      if (Diff.deepEqual(currentState, nextState)) {
        return [];
      }

      const description = opr.Toolkit.Template.describe([
        this.root.constructor,
        nextState,
      ]);

      this.componentPatches(this.root, description);
      this.root.state = nextState;
      return this.patches;
    }

    /**
     * Renders the descendants with normalized props and children passed
     * from the parent component.
     *
     * Calculates the patches needed for transformation of a component
     * to match the given description.
     */
    componentPatches(component, description) {

      if (Diff.deepEqual(component.description, description)) {
        // TODO(aswitalski): do this properly!
        if (component.isRoot()) {
          if (component.state !== null) {
            return;
          }
        } else {
          return;
        }
      }

      const childDescription = opr.Toolkit.Renderer.render(
          component, description.props, description.childrenAsTemplates, true);
      this.componentChildPatches(component.child, childDescription,
                                 /*= parent */ component);

      this.addPatch(opr.Toolkit.Patch.updateNode(component, description));
    }

    componentChildPatches(child, description, parent) {

      const {
        Diff,
        Patch,
        VirtualDOM,
      } = opr.Toolkit;

      if (!child && !description) {
        return;
      }

      // insert
      if (!child && description) {
        const node = VirtualDOM.createFromDescription(description, parent);
        this.addPatch(Patch.appendChild(node, parent));
        return;
      }

      // remove
      if (child && !description) {
        this.addPatch(Patch.removeChild(child, parent));
        return;
      }

      // update
      if (child.description.isCompatible(description)) {
        if (Diff.deepEqual(child.description, description)) {
          return;
        }
        this.childPatches(child, description, parent);
        return;
      }

      // replace
      const node =
          VirtualDOM.createFromDescription(description, parent, this.root);
      this.addPatch(Patch.replaceChild(child, node, parent));
    }

    /*
     * Calculates patches for transformation of specified child node
     * to match given description.
     */
    childPatches(child, description) {
      if (child.isComponent()) {
        if (child.isRoot()) {
          return child.update(description);
        }
        return this.componentPatches(child, description);
      }
      if (child.isElement()) {
        return this.elementPatches(child, description);
      }
      throw new Error('Unsupported node type:', child.nodeType);
    }

    /*
     * Calculates patches for transformation of an element to match given
     * description.
     */
    elementPatches(element, description) {

      if (Diff.deepEqual(element.description, description)) {
        return;
      }

      const isDefined = value => value !== undefined && value !== null;

      this.classNamePatches(element.description.class, description.class,
                            element);
      this.stylePatches(element.description.style, description.style, element);
      this.attributePatches(element.description.attrs, description.attrs,
                            element);
      this.listenerPatches(element.description.listeners, description.listeners,
                           element);
      this.datasetPatches(element.description.dataset, description.dataset,
                          element);
      this.propertiesPatches(element.description.properties,
                             description.properties, element);

      if (element.description.custom || description.custom) {
        this.attributePatches(
            element.description.custom && element.description.custom.attrs,
            description.custom && description.custom.attrs, element, true);
        this.listenerPatches(
            element.description.custom && element.description.custom.listeners,
            description.custom && description.custom.listeners, element, true);
      }

      // TODO: handle text as a child
      if (isDefined(element.description.text) && !isDefined(description.text)) {
        this.addPatch(opr.Toolkit.Patch.removeTextContent(element));
      }
      if (element.children || description.children) {
        this.elementChildrenPatches(element.children, description.children,
                                    element);
      }
      if (isDefined(description.text) &&
          description.text !== element.description.text) {
        this.addPatch(
            opr.Toolkit.Patch.setTextContent(element, description.text));
      }

      this.addPatch(opr.Toolkit.Patch.updateNode(element, description));
    }

    classNamePatches(current = '', next = '', target) {
      if (current !== next) {
        this.addPatch(opr.Toolkit.Patch.setClassName(next, target));
      }
    }

    stylePatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const props = Object.keys(current);
      const nextProps = Object.keys(next);

      const added = nextProps.filter(prop => !props.includes(prop));
      const removed = props.filter(prop => !nextProps.includes(prop));
      const changed = props.filter(prop => nextProps.includes(prop) &&
                                           current[prop] !== next[prop]);

      for (let prop of added) {
        this.addPatch(Patch.setStyleProperty(prop, next[prop], target));
      }
      for (let prop of removed) {
        this.addPatch(Patch.removeStyleProperty(prop, target));
      }
      for (let prop of changed) {
        this.addPatch(Patch.setStyleProperty(prop, next[prop], target));
      }
    }

    attributePatches(current = {}, next = {}, target = null, isCustom = false) {
      const Patch = opr.Toolkit.Patch;

      const attrs = Object.keys(current);
      const nextAttrs = Object.keys(next);

      const added = nextAttrs.filter(attr => !attrs.includes(attr));
      const removed = attrs.filter(attr => !nextAttrs.includes(attr));
      const changed = attrs.filter(attr => nextAttrs.includes(attr) &&
                                           current[attr] !== next[attr]);

      for (let attr of added) {
        this.addPatch(Patch.setAttribute(attr, next[attr], target, isCustom));
      }
      for (let attr of removed) {
        this.addPatch(Patch.removeAttribute(attr, target, isCustom));
      }
      for (let attr of changed) {
        this.addPatch(Patch.setAttribute(attr, next[attr], target, isCustom));
      }
    }

    listenerPatches(current = {}, next = {}, target = null, isCustom = false) {
      const Patch = opr.Toolkit.Patch;

      const listeners = Object.keys(current);
      const nextListeners = Object.keys(next);

      const added = nextListeners.filter(event => !listeners.includes(event));
      const removed = listeners.filter(event => !nextListeners.includes(event));
      const changed = listeners.filter(
          event => nextListeners.includes(event) &&
                   current[event] !== next[event] &&
                   (current[event].source === undefined &&
                        next[event].source === undefined ||
                    current[event].source !== next[event].source));

      for (let event of added) {
        this.addPatch(Patch.addListener(event, next[event], target, isCustom));
      }
      for (let event of removed) {
        this.addPatch(
            Patch.removeListener(event, current[event], target, isCustom));
      }
      for (let event of changed) {
        this.addPatch(Patch.replaceListener(
            event, current[event], next[event], target, isCustom));
      }
    }

    datasetPatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const attrs = Object.keys(current);
      const nextAttrs = Object.keys(next);

      const added = nextAttrs.filter(attr => !attrs.includes(attr));
      const removed = attrs.filter(attr => !nextAttrs.includes(attr));
      const changed = attrs.filter(attr => nextAttrs.includes(attr) &&
                                           current[attr] !== next[attr]);

      for (let attr of added) {
        this.addPatch(Patch.setDataAttribute(attr, next[attr], target));
      }
      for (let attr of removed) {
        this.addPatch(Patch.removeDataAttribute(attr, target));
      }
      for (let attr of changed) {
        this.addPatch(Patch.setDataAttribute(attr, next[attr], target));
      }
    }

    propertiesPatches(current = {}, next = {}, target = null) {
      const Patch = opr.Toolkit.Patch;

      const keys = Object.keys(current);
      const nextKeys = Object.keys(next);

      const added = nextKeys.filter(key => !keys.includes(key));
      const removed = keys.filter(key => !nextKeys.includes(key));
      const changed =
          keys.filter(key => nextKeys.includes(key) &&
                             !Diff.deepEqual(current[key], next[key]));

      for (let key of added) {
        this.addPatch(Patch.setProperty(key, next[key], target));
      }
      for (let key of removed) {
        this.addPatch(Patch.deleteProperty(key, target));
      }
      for (let key of changed) {
        this.addPatch(Patch.setProperty(key, next[key], target));
      }
    }

    elementChildrenPatches(sourceNodes = [], targetDescriptions = [], parent) {

      const {
        Patch,
        Reconciler,
        VirtualDOM,
      } = opr.Toolkit;
      const Move = Reconciler.Move;

      const created = [];
      const createdNodesMap = new Map();

      const createNode = (description, key) => {
        const node =
            VirtualDOM.createFromDescription(description, parent, this.root);
        created.push(node);
        createdNodesMap.set(key, node);
        return node;
      };

      const from =
          sourceNodes.map((node, index) => node.description.key || index);
      const to = targetDescriptions.map((description, index) =>
                                            description.key || index);

      const getNode = (key, isMove) => {
        if (from.includes(key)) {
          return sourceNodes[from.indexOf(key)];
        }
        if (isMove) {
          return createdNodesMap.get(key);
        }
        const index = to.indexOf(key);
        return createNode(targetDescriptions[index], key);
      };

      if (opr.Toolkit.isDebug()) {
        const assertUniqueKeys = keys => {
          if (keys.length) {
            const uniqueKeys = [...new Set(keys)];
            if (uniqueKeys.length !== keys.length) {
              throw new Error('Non-unique keys detected in:', keys);
            }
          }
        };
        assertUniqueKeys(from);
        assertUniqueKeys(to);
      }

      const nodeFavoredToMove =
          sourceNodes.find(node => node.description.props &&
                                   node.description.props.beingDragged);

      const moves = Reconciler.calculateMoves(
          from, to, nodeFavoredToMove && nodeFavoredToMove.key);

      const children = [...sourceNodes];
      for (const move of moves) {
        const node = getNode(move.item, move.name === Move.Name.MOVE);
        switch (move.name) {
        case Move.Name.REMOVE:
          this.addPatch(Patch.removeChildNode(node, move.at, parent));
          Move.remove(node, move.at).make(children);
          continue;
        case Move.Name.INSERT:
          this.addPatch(Patch.insertChildNode(node, move.at, parent));
          Move.insert(node, move.at).make(children);
          continue;
        case Move.Name.MOVE:
          this.addPatch(Patch.moveChildNode(node, move.from, move.to, parent));
          Move.move(node, move.from, move.to).make(children);
          continue;
        }
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!created.includes(child)) {
          const targetDescription = targetDescriptions[i];
          this.elementChildPatches(child, targetDescription, parent);
        }
      }
    }

    elementChildPatches(child, description, parent) {
      if (child.description.isCompatible(description)) {
        if (opr.Toolkit.Diff.deepEqual(child.description, description)) {
          return;
        }
        this.childPatches(child, description, parent);
      } else {
        const node = opr.Toolkit.VirtualDOM.createFromDescription(
            description, parent, this.root);
        this.addPatch(opr.Toolkit.Patch.replaceChildNode(child, node, parent));
      }
    }

    /*
     * Returns a normalized type of given item.
     */
    static getType(item) {
      const type = typeof item;
      if (type !== 'object') {
        return type;
      }
      if (item === null) {
        return 'null';
      }
      if (Array.isArray(item)) {
        return 'array';
      }
      return 'object';
    }

    static deepEqual(current, next) {
      if (Object.is(current, next)) {
        return true;
      }
      const type = this.getType(current);
      const nextType = this.getType(next);
      if (type !== nextType) {
        return false;
      }
      if (type === 'array') {
        if (current.length !== next.length) {
          return false;
        }
        for (let i = 0; i < current.length; i++) {
          const equal = this.deepEqual(current[i], next[i]);
          if (!equal) {
            return false;
          }
        }
        return true;
      } else if (type === 'object') {
        if (current.constructor !== next.constructor) {
          return false;
        }
        const keys = Object.keys(current);
        const nextKeys = Object.keys(next);
        if (keys.length !== nextKeys.length) {
          return false;
        }
        keys.sort();
        nextKeys.sort();
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (key !== nextKeys[i]) {
            return false;
          }
          const equal = this.deepEqual(current[key], next[key]);
          if (!equal) {
            return false;
          }
        }
        return true;
      }
      return false;
    }
  }

  module.exports = Diff;
}
