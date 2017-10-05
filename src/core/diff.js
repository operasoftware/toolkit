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
      patches.push(Patch.addListener(event, next[event], target));
    }
    for (let event of removed) {
      patches.push(Patch.removeListener(event, current[event], target));
    }
    for (let event of changed) {
      patches.push(
          Patch.replaceListener(event, current[event], next[event], target));
    }
  };

  const metadataPatches = (current = {}, next = {}, target = null, patches) => {
    const Patch = opr.Toolkit.Patch;

    const keys = Object.keys(current);
    const nextKeys = Object.keys(next);

    const added = nextKeys.filter(key => !keys.includes(key));
    const removed = keys.filter(key => !nextKeys.includes(key));
    const changed = keys.filter(
        key =>
            nextKeys.includes(key) && !Diff.deepEqual(current[key], next[key]));

    for (let key of added) {
      patches.push(Patch.addMetadata(key, next[key], target));
    }
    for (let key of removed) {
      patches.push(Patch.removeMetadata(key, target));
    }
    for (let key of changed) {
      patches.push(Patch.replaceMetadata(key, next[key], target));
    }
  };

  const stylePatches = (current = {}, next = {}, target, patches) => {

    const props = Object.keys(current);
    const nextProps = Object.keys(next);

    const added = nextProps.filter(prop => !props.includes(prop));
    const removed = props.filter(prop => !nextProps.includes(prop));
    const changed = props.filter(
        prop => nextProps.includes(prop) && current[prop] !== next[prop]);

    for (let prop of added) {
      patches.push(
          opr.Toolkit.Patch.addStyleProperty(prop, next[prop], target));
    }
    for (let prop of removed) {
      patches.push(opr.Toolkit.Patch.removeStyleProperty(prop, target));
    }
    for (let prop of changed) {
      patches.push(
          opr.Toolkit.Patch.replaceStyleProperty(prop, next[prop], target));
    }
  };

  const classNamePatches = (current = [], next = [], target, patches) => {

    const added = next.filter(attr => !current.includes(attr));
    const removed = current.filter(attr => !next.includes(attr));

    for (let name of added) {
      patches.push(opr.Toolkit.Patch.addClassName(name, target));
    }
    for (let name of removed) {
      patches.push(opr.Toolkit.Patch.removeClassName(name, target));
    }
  };

  const datasetPatches = (current = {}, next = {}, target, patches) => {

    const attrs = Object.keys(current);
    const nextAttrs = Object.keys(next);

    const added = nextAttrs.filter(attr => !attrs.includes(attr));
    const removed = attrs.filter(attr => !nextAttrs.includes(attr));
    const changed = attrs.filter(
        attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

    for (let attr of added) {
      patches.push(
          opr.Toolkit.Patch.addDataAttribute(attr, next[attr], target));
    }
    for (let attr of removed) {
      patches.push(opr.Toolkit.Patch.removeDataAttribute(attr, target));
    }
    for (let attr of changed) {
      patches.push(
          opr.Toolkit.Patch.replaceDataAttribute(attr, next[attr], target));
    }
  };

  const attributePatches =
      (current = {}, next = {}, target = null, patches) => {
        const attrs = Object.keys(current);
        const nextAttrs = Object.keys(next);

        const added = nextAttrs.filter(attr => !attrs.includes(attr));
        const removed = attrs.filter(attr => !nextAttrs.includes(attr));
        const changed = attrs.filter(
            attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

        for (let attr of added) {
          patches.push(
              opr.Toolkit.Patch.addAttribute(attr, next[attr], target));
        }
        for (let attr of removed) {
          patches.push(opr.Toolkit.Patch.removeAttribute(attr, target));
        }
        for (let attr of changed) {
          patches.push(
              opr.Toolkit.Patch.replaceAttribute(attr, next[attr], target));
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

  const childrenPatches = (current = [], next = [], parent, patches) => {

    const Patch = opr.Toolkit.Patch;
    const Move = opr.Toolkit.Reconciler.Move;

    const source = current.map((node, index) => node.key || index);
    const target = next.map((node, index) => node.key || index);

    const getNode = key => {
      if (source.includes(key)) {
        return current[source.indexOf(key)];
      } else {
        return next[target.indexOf(key)];
      }
    };

    const moves = opr.Toolkit.Reconciler.calculateMoves(source, target);

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

  const elementPatches = (current, next, patches) => {
    attributePatches(current.attrs, next.attrs, current, patches);
    datasetPatches(current.dataset, next.dataset, current, patches);
    stylePatches(current.style, next.style, current, patches);
    classNamePatches(current.classNames, next.classNames, current, patches);
    listenerPatches(current.listeners, next.listeners, current, patches);
    metadataPatches(current.metadata, next.metadata, current, patches);
    if (current.text !== null && next.text === null) {
      patches.push(opr.Toolkit.Patch.removeTextContent(current));
    }
    childrenPatches(current.children, next.children, current, patches);
    if (next.text !== null && current.text !== next.text) {
      patches.push(opr.Toolkit.Patch.setTextContent(current, next.text));
    }
  };

  const reconcileNode = (current, next, parent, index, patches) => {

    if (current === next) {
      // already inserted
      return;
    }
    if (areCompatible(current, next)) {
      if (current.isElement()) {
        elementPatches(current, next, patches);
      }
      if (current.isComponent()) {
        if (!Diff.deepEqual(current.props, next.props)) {
          patches.push(opr.Toolkit.Patch.updateComponent(current, next.props));
        }
        calculatePatches(current.child, next.child, current, patches);
      }
    } else {
      patches.push(opr.Toolkit.Patch.removeChildNode(current, index, parent));
      patches.push(opr.Toolkit.Patch.insertChildNode(next, index, parent));
    }
  };

  const calculatePatches =
      (current, next, parent = null, patches = []) => {

        const Patch = opr.Toolkit.Patch;

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
                patches.push(Patch.updateComponent(current, next.props));
              }
              calculatePatches(current.child, next.child, current, patches);
            } else {
              // different components
              patches.push(Patch.removeComponent(current, parent));
              patches.push(Patch.addComponent(next, parent));
            }
          } else if (next.isElement()) {
            // replace component with an element
            patches.push(Patch.removeComponent(current, parent));
            patches.push(Patch.addElement(next, parent));
          }
        } else if (current.isElement()) {
          if (next.isComponent()) {
            // replace element with a component
            patches.push(Patch.removeElement(current, parent));
            patches.push(Patch.addComponent(next, parent));
          } else if (next.isElement()) {
            if (current.name === next.name) {
              // compatible elements
              elementPatches(current, next, patches);
            } else {
              // different elements
              patches.push(Patch.removeElement(current, parent));
              patches.push(Patch.addElement(next, parent));
            }
          }
        }
        return patches;
      }

  class Diff {

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

    static calculate(tree, nextTree, root) {
      return calculatePatches(tree, nextTree, root);
    }
  }

  module.exports = Diff;
}
