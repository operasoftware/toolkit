{
  class Diff {

    constructor(root) {
      this.root = root;
      this.patches = [];
    }

    addPatch(patch) {
      return this.patches.push(patch);
    }

    updateComponent(component, prevProps, description) {
      if (!Diff.deepEqual(component.description, description) ||
          !Diff.deepEqual(component.props, prevProps)) {
        if ((component.hasOwnMethod('onPropsReceived') ||
             component.hasOwnMethod('onUpdated')) &&
            !Diff.deepEqual(prevProps, component.props)) {
          this.addPatch(
              opr.Toolkit.Patch.updateComponent(component, prevProps));
        }
        this.componentChildPatches(component.child, description, component);
        component.description = description;
      }
    }

    rootPatches(prevState, nextState, initial) {
      const description = opr.Toolkit.Renderer.render(this.root);
      if (initial) {
        this.addPatch(opr.Toolkit.Patch.initRootComponent(this.root));
      }
      this.updateComponent(this.root, prevState, description);
      return this.patches;
    }

    /**
     * Calculates patches for conversion of a component to match the given
     * description.
     */
    componentPatches(component, description) {

      const {
        props = {},
        children = [],
      } = description;

      // TODO: add support for direct references to component classes and
      // renderer
      const ComponentClass =
          opr.Toolkit.VirtualDOM.getComponentClass(description.symbol);

      opr.Toolkit.assert(
          ComponentClass,
          `Module not found for path: ${String(description.symbol)}`);
      opr.Toolkit.assert(component.constructor === ComponentClass);

      const prevProps = component.props;

      component.props =
          opr.Toolkit.VirtualDOM.normalizeProps(component.constructor, props);
      component.children = children;

      this.updateComponent(
          component, prevProps, opr.Toolkit.Renderer.render(component));
    }

    /**
     * Calculates patches for conversion of an element to match the given
     * description.
     */
    elementPatches(element, description, parent) {

      const {
        props = {},
        children,
        text,
      } = description;

      const {
        attrs,
        dataset,
        style,
        className,
        listeners,
        metadata,
      } = props;

      this.attributePatches(element.attrs, attrs, element);
      this.datasetPatches(element.dataset, dataset, element);
      this.stylePatches(element.style, style, element);
      this.classNamePatches(element.className, className, element);
      this.listenerPatches(element.listeners, listeners, element);
      this.metadataPatches(element.metadata, metadata, element);
      // TODO: handle text as a child
      if (element.text !== null && text === null) {
        this.addPatch(opr.Toolkit.Patch.removeTextContent(element));
      }
      if (element.children.length || children) {
        this.elementChildrenPatches(element.children, children, element);
      }
      if (text !== null && element.text !== text) {
        this.addPatch(opr.Toolkit.Patch.setTextContent(element, text));
      }

      element.description = description;
    }

    listenerPatches(current = {}, next = {}, target = null) {
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
        this.addPatch(Patch.addListener(event, next[event], target));
      }
      for (let event of removed) {
        this.addPatch(Patch.removeListener(event, current[event], target));
      }
      for (let event of changed) {
        this.addPatch(
            Patch.replaceListener(event, current[event], next[event], target));
      }
    }

    metadataPatches(current = {}, next = {}, target = null) {
      const Patch = opr.Toolkit.Patch;

      const keys = Object.keys(current);
      const nextKeys = Object.keys(next);

      const added = nextKeys.filter(key => !keys.includes(key));
      const removed = keys.filter(key => !nextKeys.includes(key));
      const changed = keys.filter(
          key => nextKeys.includes(key) &&
              !Diff.deepEqual(current[key], next[key]));

      for (let key of added) {
        this.addPatch(Patch.addMetadata(key, next[key], target));
      }
      for (let key of removed) {
        this.addPatch(Patch.removeMetadata(key, target));
      }
      for (let key of changed) {
        this.addPatch(Patch.replaceMetadata(key, next[key], target));
      }
    }

    stylePatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const props = Object.keys(current);
      const nextProps = Object.keys(next);

      const added = nextProps.filter(prop => !props.includes(prop));
      const removed = props.filter(prop => !nextProps.includes(prop));
      const changed = props.filter(
          prop => nextProps.includes(prop) && current[prop] !== next[prop]);

      for (let prop of added) {
        this.addPatch(Patch.addStyleProperty(prop, next[prop], target));
      }
      for (let prop of removed) {
        this.addPatch(Patch.removeStyleProperty(prop, target));
      }
      for (let prop of changed) {
        this.addPatch(Patch.replaceStyleProperty(prop, next[prop], target));
      }
    }

    classNamePatches(current = '', next = '', target) {
      if (current !== next) {
        this.addPatch(opr.Toolkit.Patch.setClassName(next, target));
      }
    }

    datasetPatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const attrs = Object.keys(current);
      const nextAttrs = Object.keys(next);

      const added = nextAttrs.filter(attr => !attrs.includes(attr));
      const removed = attrs.filter(attr => !nextAttrs.includes(attr));
      const changed = attrs.filter(
          attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

      for (let attr of added) {
        this.addPatch(Patch.addDataAttribute(attr, next[attr], target));
      }
      for (let attr of removed) {
        this.addPatch(Patch.removeDataAttribute(attr, target));
      }
      for (let attr of changed) {
        this.addPatch(Patch.replaceDataAttribute(attr, next[attr], target));
      }
    }

    attributePatches(current = {}, next = {}, target) {
      const Patch = opr.Toolkit.Patch;

      const attrs = Object.keys(current);
      const nextAttrs = Object.keys(next);

      const added = nextAttrs.filter(attr => !attrs.includes(attr));
      const removed = attrs.filter(attr => !nextAttrs.includes(attr));
      const changed = attrs.filter(
          attr => nextAttrs.includes(attr) && current[attr] !== next[attr]);

      for (let attr of added) {
        this.addPatch(Patch.addAttribute(attr, next[attr], target));
      }
      for (let attr of removed) {
        this.addPatch(Patch.removeAttribute(attr, target));
      }
      for (let attr of changed) {
        this.addPatch(Patch.replaceAttribute(attr, next[attr], target));
      }
    }

    elementChildrenPatches(current = [], templates = [], parent) {
      const {Patch, Reconciler, VirtualDOM} = opr.Toolkit;
      const Move = Reconciler.Move;

      const created = [];
      const createdNodesMap = new Map();

      const createNode = (template, key) => {
        const node = VirtualDOM.createFromTemplate(template, parent, this.root);
        created.push(node);
        createdNodesMap.set(key, node);
        return node;
      };

      const from = current.map((node, index) => node.key || index);
      const to = templates.map(
          (template, index) => template[1] && template[1].key || index);

      const getNode = (key, isMove) => {
        if (from.includes(key)) {
          return current[from.indexOf(key)];
        }
        if (isMove) {
          return createdNodesMap.get(key);
        }
        const index = to.indexOf(key);
        return createNode(templates[index], key);
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

      const moves = Reconciler.calculateMoves(from, to);

      const children = [...current];
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
            this.addPatch(
                Patch.moveChildNode(node, move.from, move.to, parent));
            Move.move(node, move.from, move.to).make(children);
            continue;
        }
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!created.includes(child)) {
          const index = from.indexOf(child.key || i);
          let sourceTemplate = null;
          if (index >= 0) {
            sourceTemplate = parent.description.children[index];
          }
          this.elementChildPatches(
              child, sourceTemplate, templates[i], parent, i);
        }
      }
    }

    elementChildPatches(child, sourceTemplate, template, parent, index) {
      const {Patch, VirtualDOM, Template} = opr.Toolkit;

      const areCompatible = (currentTemplate, nextTemplate) => {
        return currentTemplate && currentTemplate[0] === nextTemplate[0];
      };

      if (areCompatible(sourceTemplate, template)) {
        if (opr.Toolkit.Diff.deepEqual(sourceTemplate, template)) {
          return;
        }
        const description = Template.describe(template);
        if (child.isElement()) {
          this.elementPatches(child, description, parent);
          child.description = description;
        } else if (!child.isRoot()) {
          this.componentPatches(child, description);
          child.description = description;
        }
      } else {
        const node = VirtualDOM.createFromTemplate(template, parent, this.root);
        this.addPatch(Patch.replaceChildNode(child, node, parent));
      }
    }

    componentChildPatches(child, description, parent) {
      const {Diff, Patch, VirtualDOM} = opr.Toolkit;

      if (!child && !description) {
        return;
      }

      // insert
      if (!child && description) {
        const node =
            VirtualDOM.createFromDescription(description, parent, this.root);
        if (node.isElement()) {
          return this.addPatch(Patch.addElement(node, parent));
        }
        return this.addPatch(Patch.addComponent(node, parent));
      }

      // remove
      if (child && !description) {
        if (child.isElement()) {
          return this.addPatch(Patch.removeElement(child, parent));
        }
        return this.addPatch(Patch.removeComponent(child, parent));
      }

      const areCompatible = (node, description) => {
        if (node.isElement()) {
          return node.name === description.name;
        }
        return node.id === description.symbol;
      };

      // update
      if (areCompatible(child, description)) {
        if (child.isElement()) {
          if (Diff.deepEqual(child.description, description)) {
            return;
          }
          return this.elementPatches(child, description, parent);
        }
        if (!child.isRoot()) {
          return this.componentPatches(child, description);
        }
      }

      // replace
      const node =
          VirtualDOM.createFromDescription(description, parent, this.root);
      this.addPatch(Patch.replaceChild(child, node, parent));
    }

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
