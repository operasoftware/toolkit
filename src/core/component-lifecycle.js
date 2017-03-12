{
  const ComponentLifecycle = class {

    /*
     * onCreated(), onAttached(), onPropsReceived(), onUpdated(), onDestroyed(), onDetached()
     */

    static onComponentCreated(component) {

    }

    static onElementCreated(element) {

    }

    static onComponentAttached(component) {

    }

    static onElementAttached(element) {

    }

    static onComponentReceivedProps() {

    }

    static onComponentUpdated(component) {

    }

    static onComponentDestroyed(component) {

    }

    static onElementDestroyed(element) {

    }

    static onComponentDetached(component) {

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
          switch (patch.node.nodeType) {
            case 'component':
              return this.onComponentCreated(patch.node);
            case 'element':
              return this.onElementCreated(patch.node);
            default:
              throw new Error('Unsupported node type');
          }
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
              throw new Error('Unsupported node type');
          }
      }
    }

    static beforeUpdate(patches) {
      const Type = Reactor.Patch.Type;
      for (const patch of patches) {
        this.beforePatchApplied(patch);
      }
    }

    static beforePatchApplied(patch) {
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentUpdated(patch.target);
        case Type.ADD_COMPONENT:
          return this.onComponentAttached(patch.component);
        case Type.ADD_ELEMENT:
          return this.onElementAttached(patch.element);
        case Type.INSERT_CHILD_NODE:
          switch (patch.node.nodeType) {
            case 'component':
              return this.onComponentAttached(patch.node);
            case 'element':
              return this.onElementAttached(patch.node);
            default:
              throw new Error('Unsupported node type');
          }
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