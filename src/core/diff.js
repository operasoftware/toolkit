{
  const getType = item => {
    const type = typeof item;
    switch (type) {
      case 'object':
        if (item === null) {
          return 'null';
        } else if (Array.isArray(item)) {
          return 'array'
        } else {
          return 'object'
        }
      default:
        return type;
    }
  };

  const listenerPatches = (current = {}, next = {}, target = null, patches) => {
    const Patch = Reactor.Patch;

    const listeners = Object.keys(current);
    const nextListeners = Object.keys(next);

    const added = nextListeners.filter(event => !listeners.includes(event));
    const removed = listeners.filter(event => !nextListeners.includes(event));
    const changed = listeners.filter(
      event => nextListeners.includes(event) && current[event] !== next[event]);

    for (let event of added) {
      patches.push(Patch.addListener(event, next[event], target));
    }
    for (let event of removed) {
      patches.push(Patch.removeListener(event, current[event], target));
    }
    for (let event of changed) {
      patches.push(Patch.replaceListener(event, current[event], next[event], target));
    }
  };

  const attributePatches = (current = {}, next = {}, target = null, patches) => {
    const Patch = Reactor.Patch;

    const attrs = Object.keys(current);
    const nextAttrs = Object.keys(next);

    const added = nextAttrs.filter(attr => !attrs.includes(attr));
    const removed = attrs.filter(attr => !nextAttrs.includes(attr));
    const changed = attrs.filter(
      attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

    for (let attr of added) {
      patches.push(Patch.addAttribute(attr, next[attr], target));
    }
    for (let attr of removed) {
      patches.push(Patch.removeAttribute(attr, target));
    }
    for (let attr of changed) {
      patches.push(Patch.replaceAttribute(attr, next[attr], target));
    }
  };

  const areCompatible = (current, next) => {
    if (current.nodeType !== next.nodeType) {
      return false;
    }
    if (current.isComponent()) {
      return current.constructor === next.constructor;
    }
    if (current.isElement()) {
      return current.name === next.name;
    }
  };

  const reconcileNode = (current, next, parent, index, patches) => {

    const Patch = Reactor.Patch;

    if (current === next) {
      // already inserted
      return;
    }
    if (areCompatible(current, next)) {
      if (current.isElement()) {
        attributePatches(current.attrs, next.attrs, current, patches);
        listenerPatches(current.listeners, next.listeners, current, patches);
        childrenPatches(current.children, next.children, current, patches);
      } else if (current.isComponent()) {
        if (!Diff.deepEqual(current.props, next.props)) {
          patches.push(Patch.updateComponent(current, next.props));
          calculatePatches(current.child, next.child, current, patches);
        } else {
          // no patch needed
        }
      }
    } else {
      patches.push(Patch.removeChildNode(current, index, parent));
      patches.push(Patch.insertChildNode(next, index, parent));
    }
  };

  const childrenPatches = (current = [], next = [], parent, patches) => {

    const Patch = Reactor.Patch;
    const Move = Reactor.Reconciler.Move;

    const source = current.map((node, index) => node.key || index);
    const target = next.map((node, index) => node.key || index);

    const getNode = key => {
      if (source.includes(key)) {
        return current[source.indexOf(key)];
      }
      if (target.includes(key)) {
        return next[target.indexOf(key)];
      }
      throw `Node not found for key: ${key}`;
    };

    const moves = Reactor.Reconciler.calculateMoves(source, target);

    const children = [...current];
    for (const move of moves) {
      const node = getNode(move.item);
      switch (move.name) {
        case Move.Name.INSERT:
          patches.push(Patch.insertChildNode(node, move.at, parent));
          Move.insert(node, move.at).make(children);
          continue;
        case Move.Name.MOVE:
          patches.push(Patch.moveChildNode(node, move.from, move.to, parent));
          Move.move(node, move.from, move.to).make(children);
          continue;
        case Move.Name.REMOVE:
          patches.push(Patch.removeChildNode(node, move.at, parent));
          Move.remove(node, move.at).make(children);
          continue;
      }
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      reconcileNode(child, next[i], parent, i, patches);
    }
  };

  const calculatePatches = (current, next, parent = null, patches = []) => {

    const Patch = Reactor.Patch;

    if (!current && !next) {
      return patches;
    }

    if (!current && next) {
      if (next.isComponent()) {
        patches.push(Patch.addComponent(next, parent));
      } else if (next.isElement()) {
        patches.push(Patch.addElement(next, parent));
      }
      return patches;
    }

    if (current && !next) {
      if (current.isComponent()) {
        patches.push(Patch.removeComponent(current, parent));
      } else if (current.isElement()) {
        patches.push(Patch.removeElement(current, parent));
      }
      return patches;
    }

    if (current.isComponent()) {
      if (next.isComponent()) {
        if (current.constructor === next.constructor) {
          if (!Diff.deepEqual(current.props, next.props)) {
            // component props change
            patches.push(Patch.updateComponent(current, next.props));
            calculatePatches(current.child, next.child, current, patches);
          } else {
            // no component props change - no patch needed
          }
        } else {
          // different components
          patches.push(Patch.removeComponent(current, parent));
          patches.push(Patch.addComponent(next, parent));
        }
      } else if (next.isElement()) {
        // replace component with an element
        patches.push(Patch.removeComponent(current, parent));
        patches.push(Patch.addElement(next, parent));
      } else {
        throw 'Unknown operation';
      }
    } else if (current.isElement()) {
      if (next.isComponent()) {
        // replace element with a component
        patches.push(Patch.removeElement(current, parent));
        patches.push(Patch.addComponent(next, parent));
      } else if (next.isElement()) {
        if (current.name === next.name) {
          // compatible elements
          attributePatches(current.attrs, next.attrs, current, patches);
          listenerPatches(current.listeners, next.listeners, current, patches);
          childrenPatches(current.children, next.children, current, patches);
        } else {
          // different elements
          patches.push(Patch.removeElement(current, parent));
          patches.push(Patch.addElement(next, parent));
        }
      }
    }
    return patches;
  }

  const Diff = class {

    static deepEqual(current, next) {
      const type = getType(current);
      const nextType = getType(next);
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
      } else {
        return current === next;
      }
    }

    static calculate(tree, nextTree) {
      return calculatePatches(tree, nextTree);
    }
  };

  module.exports = Diff;
}
