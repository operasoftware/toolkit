{
  const ComponentLifecycle = class {

    /*
     * onCreated(), onAttached(), onPropsReceived(), onUpdated(), onDestroyed(), onDetached()
     */

    static onComponentCreated(component) {
      component.onCreated();
      if (component.child) {
        this.onNodeCreated(component.child);
      }
    }

    static onElementCreated(element) {
      for (const child of element.children) {
        this.onNodeCreated(child);
      }
    }

    static onNodeCreated(node) {
      switch (node.nodeType) {
        case 'component':
          return this.onComponentCreated(node);
        case 'element':
          return this.onElementCreated(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static onComponentAttached(component) {
      if (component.child) {
        this.onNodeAttached(component.child);
      }
      component.onAttached();
    }

    static onElementAttached(element) {
      for (const child of element.children) {
        this.onNodeAttached(child);
      }
    }

    static onNodeAttached(node) {
      switch (node.nodeType) {
        case 'component':
          return this.onComponentAttached(node);
        case 'element':
          return this.onElementAttached(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static onComponentReceivedProps() {
      component.onPropsReceived();
    }

    static onComponentUpdated(component) {
      component.onUpdated();
    }

    static onComponentDestroyed(component) {
      component.onDestroyed();
    }

    static onElementDestroyed(element) {

    }

    static onComponentDetached(component) {
      component.onDetached();
    }

    static onElementDetached(element) {

    }

    static beforePatchApplied(patch) {
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentReceivedProps(patch.target);
        case Type.ADD_COMPONENT:
          return this.onComponentCreated(patch.component);
        case Type.ADD_ELEMENT:
          return this.onElementCreated(patch.element);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeCreated(patch.node);
        case Type.REMOVE_COMPONENT:
          return this.onComponentDestroyed(patch.component);
        case Type.REMOVE_ELEMENT:
          return this.onElementDestroyed(patch.element);
        case Type.REMOVE_CHILD_NODE:
          switch (patch.node.nodeType) {
            case 'component':
              return this.onComponentDestroyed(patch.node);
            case 'element':
              return this.onElementDestroyed(patch.node);
            default:
              throw new Error('Unsupported node type:' + patch.node.nodeType);
          }
      }
    }

    static beforeUpdate(patches) {
      const Type = Reactor.Patch.Type;
      for (const patch of patches) {
        this.beforePatchApplied(patch);
      }
    }

    static afterPatchApplied(patch) {
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentUpdated(patch.target);
        case Type.ADD_COMPONENT:
          return this.onComponentAttached(patch.component);
        case Type.ADD_ELEMENT:
          return this.onElementAttached(patch.element);
        case Type.INSERT_CHILD_NODE:
          return this.onNodeAttached(patch.node);
        case Type.REMOVE_COMPONENT:
          return this.onComponentDetached(patch.component);
        case Type.REMOVE_ELEMENT:
          return this.onElementDetached(patch.element);
        case Type.REMOVE_CHILD_NODE:
          switch (patch.node.nodeType) {
            case 'component':
              return this.onComponentDetached(patch.node);
            case 'element':
              return this.onElementDetached(patch.node);
            default:
              throw new Error('Unsupported node type');
          }
      }
    }

    static afterUpdate(patches) {
      const Type = Reactor.Patch.Type;
      for (const patch of patches) {
        this.afterPatchApplied(patch);
      }
    }
  }

  module.exports = ComponentLifecycle;
}