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
  const Lifecycle = {

    onComponentCreated(component) {
      if (component.hasOwnMethod('onCreated')) {
        component.onCreated.call(component.sandbox);
      }
      if (component.content) {
        this.onNodeCreated(component.content);
      }
    },

    onElementCreated(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeCreated(child);
        }
      }
    },

    onNodeCreated(node) {
      if (node.isElement()) {
        return this.onElementCreated(node);
      } else if (node.isComponent() && !node.isRoot()) {
        return this.onComponentCreated(node);
      }
    },

    onRootCreated(root) {
      if (root.hasOwnMethod('onCreated')) {
        root.onCreated.call(root.sandbox);
      }
    },

    onComponentAttached(component) {
      if (component.content) {
        this.onNodeAttached(component.content);
      }
      if (component.hasOwnMethod('onAttached')) {
        component.onAttached.call(component.sandbox);
      }
    },

    onElementAttached(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeAttached(child);
        }
      }
    },

    onNodeAttached(node) {
      if (node.isElement()) {
        return this.onElementAttached(node);
      } else if (node.isComponent() && !node.isRoot()) {
        return this.onComponentAttached(node);
      }
    },

    onNodeReceivedDescription(node, description) {
      if (node.isComponent()) {
        this.onComponentReceivedProps(node, description.props);
      }
    },

    onNodeUpdated(node, prevDescription) {
      if (node.isComponent()) {
        this.onComponentUpdated(node, prevDescription.props);
      }
    },

    onRootAttached(root) {
      if (root.hasOwnMethod('onAttached')) {
        root.onAttached.call(root.sandbox);
      }
    },

    onComponentReceivedProps(component, nextProps = {}) {
      if (component.hasOwnMethod('onPropsReceived')) {
        component.onPropsReceived.call(component.sandbox, nextProps);
      }
    },

    onComponentUpdated(component, prevProps = {}) {
      if (component.hasOwnMethod('onUpdated')) {
        component.onUpdated.call(component.sandbox, prevProps);
      }
    },

    onComponentDestroyed(component) {
      component.destroy();
      if (component.hasOwnMethod('onDestroyed')) {
        component.onDestroyed.call(component.sandbox);
      }
      if (component.content) {
        this.onNodeDestroyed(component.content);
      }
    },

    onElementDestroyed(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeDestroyed(child);
        }
      }
    },

    onNodeDestroyed(node) {
      if (node.isElement()) {
        return this.onElementDestroyed(node);
      } else if (node.isComponent() && !node.isRoot()) {
        return this.onComponentDestroyed(node);
      }
    },

    onComponentDetached(component) {
      if (component.content) {
        this.onNodeDetached(component.content);
      }
      if (component.hasOwnMethod('onDetached')) {
        component.onDetached.call(component.sandbox);
      }
    },

    onElementDetached(element) {
      if (element.children) {
        for (const child of element.children) {
          this.onNodeDetached(child);
        }
      }
    },

    onNodeDetached(node) {
      if (node.isElement()) {
        this.onElementDetached(node);
        node.parentNode = null;
      } else if (node.isComponent() && !node.isRoot()) {
        this.onComponentDetached(node);
        node.parentNode = null;
      }
    },

    beforeUpdate(patches) {
      for (const patch of patches) {
        this.beforePatchApplied(patch);
      }
    },

    beforePatchApplied(patch) {
      const Type = opr.Toolkit.Patch.Type;
      switch (patch.type) {
        case Type.INIT_ROOT_COMPONENT:
          this.onRootCreated(patch.root);
          return;
        case Type.INSERT_CHILD:
          this.onNodeCreated(patch.node);
          return;
        case Type.REPLACE_CHILD:
        case Type.SET_CONTENT:
          this.onNodeDestroyed(patch.child);
          this.onNodeCreated(patch.node);
          return;
        case Type.REMOVE_CHILD:
          this.onNodeDestroyed(patch.child);
          return;
        case Type.UPDATE_NODE:
          this.onNodeReceivedDescription(patch.node, patch.description);
          return;
      }
    },

    afterUpdate(patches) {
      patches = [...patches].reverse();
      for (const patch of patches) {
        this.afterPatchApplied(patch);
      }
    },

    afterPatchApplied(patch) {
      const Type = opr.Toolkit.Patch.Type;
      switch (patch.type) {
        case Type.INIT_ROOT_COMPONENT:
          this.onRootAttached(patch.root);
          return;
        case Type.INSERT_CHILD:
          this.onNodeAttached(patch.node);
          return;
        case Type.REPLACE_CHILD:
        case Type.SET_CONTENT:
          this.onNodeDetached(patch.child);
          this.onNodeAttached(patch.node);
          return;
        case Type.REMOVE_CHILD:
          this.onNodeDetached(patch.child);
          return;
        case Type.UPDATE_NODE:
          this.onNodeUpdated(patch.node, patch.prevDescription);
          return;
      }
    },
  };

  module.exports = Lifecycle;
}
