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
        case 'root':
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
        case 'root':
        case 'component':
          return this.onComponentAttached(node);
        case 'element':
          return this.onElementAttached(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static onComponentReceivedProps(component, props) {
      component.onPropsReceived(props);
    }

    static onComponentUpdated(component, props) {
      component.onUpdated(props);
    }

    static onComponentDestroyed(component) {
      component.onDestroyed();
      if (component.child) {
        this.onNodeDestroyed(component.child);
      }
    }

    static onElementDestroyed(element) {
      for (const child of element.children) {
        this.onNodeDestroyed(child);
      }
    }

    static onNodeDestroyed(node) {
      switch (node.nodeType) {
        case 'root':
        case 'component':
          return this.onComponentDestroyed(node);
        case 'element':
          return this.onElementDestroyed(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static onComponentDetached(component) {
      if (component.child) {
        this.onNodeDetached(component.child);
      }
      component.onDetached();
    }

    static onElementDetached(element) {
      for (const child of element.children) {
        this.onNodeDetached(child);
      }
    }

    static onNodeDetached(node) {
      switch (node.nodeType) {
        case 'root':
        case 'component':
          return this.onComponentDetached(node);
        case 'element':
          return this.onElementDetached(node);
        default:
          throw new Error('Unsupported node type:' + node.nodeType);
      }
    }

    static beforePatchApplied(patch) {
      const Type = Reactor.Patch.Type;
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentReceivedProps(patch.target, patch.props);
        case Type.CREATE_ROOT_COMPONENT:
          return this.onComponentCreated(patch.root);
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
          return this.onNodeDestroyed(patch.node);
      }
    }

    static beforeUpdate(patches) {
      for (const patch of patches) {
        this.beforePatchApplied(patch);
      }
    }

    static afterPatchApplied(patch) {
      const Type = Reactor.Patch.Type;
      switch (patch.type) {
        case Type.UPDATE_COMPONENT:
          return this.onComponentUpdated(patch.target, patch.props);
        case Type.CREATE_ROOT_COMPONENT:
          return this.onComponentAttached(patch.root);
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
          return this.onNodeDetached(patch.node);
      }
    }

    static afterUpdate(patches) {
      for (const patch of patches) {
        this.afterPatchApplied(patch);
      }
    }
  }

  module.exports = ComponentLifecycle;
}
