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
  /*
   * Normalized description of a template.
   * Is used to calculate differences between nodes.
   */
  class Description {

    static create(options) {
      return options.type === 'component' ?
                                  new ComponentDescription(options) :
                                  new ElementDescription(options);
    }

    constructor(type, key = null) {
      this.type = type;
      this.key = key;
    }

    get childrenAsTemplates() {
      if (this.children) {
        return this.children.map(child => child.asTemplate);
      }
    }

    isCompatible(desc) {
      return desc && desc.type === this.type;
    }

    get isComponent() {
      return this instanceof ComponentDescription;
    }

    get isElement() {
      return this instanceof ElementDescription;
    }
  }

  /*
   * Defines a normalized description of a component.
   *
   * Enumerable properties:
   * - key (a unique node identifier within its parent),
   * - component (an object with meta information)
   * - children (an array of child nodes)
   * - props (an object of any component rendering props)
   *
   * Non-enumerable properties:
   * - asTemplate: returns component description as a normalized template
   */
  class ComponentDescription extends Description {

    constructor({key, component, children, props}) {
      super(opr.Toolkit.Component.NodeType, key);
      this.component = component;
      if (children) {
        this.children = children;
      }
      if (props) {
        this.props = props;
      }
      Object.defineProperty(this, 'asTemplate', {
        enumerable: false,
        configurable: false,
        get: () => {
          const template = [this.component];
          if (this.props) {
            template.push(this.props);
          }
          if (this.children) {
            template.push(...this.children.map(child => child.asTemplate));
          }
          return template;
        },
      });
    }

    get isRoot() {
      return this.component.prototype instanceof opr.Toolkit.Root;
    }

    isCompatible(desc) {
      return super.isCompatible(desc) && this.component === desc.component;
    }
  }

  /*
   * Defines a normalized description of an element.
   *
   * Enumerable properties:
   * - key (a unique node identifier within its parent),
   * - name (a string representing tag name),
   * - text (a string representing text content),
   * - children (an array of child nodes),
   * - props (an object) defining:
   *    - listeners (an object for event name to listener mapping)
   *    - attrs (an object for normalized attribute name to value mapping)
   *    - dataset (an object representing data attributes)
   *    - classNames (an array of sorted class names)
   *    - style (an object for style property to string value mapping)
   *    - metadata (an object for properties set directly on DOM element)
   *
   * Non-enumerable properties:
   * - asTemplate: returns element description as a normalized template
   */
  class ElementDescription extends Description {

    constructor({type, name, text, children, details}) {
      
      super(opr.Toolkit.VirtualElement.NodeType, details && details.key);
      
      this.type = type;
      this.name = name;
      if (children) {
        this.children = children;
      }
      if (text) {
        this.text = text;
      }
      if (details) {
        Object.assign(this, details);
      }

      Object.defineProperty(this, 'asTemplate', {
        enumerable: false,
        configurable: false,
        get: () => {
          const template = [this.name];
          if (details) {
            const toProps = () => {
              const props = {};
              if (details.key) {
                props.key = details.key;
              }
              if (details.class) {
                props.class = details.class;
              }
              if (details.style) {
                props.style = details.style;
              }
              if (details.attrs) {
                Object.assign(props, details.attrs);
              }
              if (details.dataset) {
                props.dataset = details.dataset;
              }
              if (details.listeners) {
                Object.assign(props, details.listeners);
              }
              if (details.properties) {
                props.properties = details.properties;
              }
              return props;
            };
            template.push(toProps(details));
          }
          if (this.children) {
            template.push(...this.children.map(child => child.asTemplate));
          } else if (typeof this.text === 'string') {
            template.push(this.text);
          }
          return template;
        },
      });
    }

    isCompatible(desc) {
      return super.isCompatible(desc) && desc.name === this.name;
    }
  }

  Description.ElementDescription = ElementDescription;
  Description.ComponentDescription = ComponentDescription;

  module.exports = Description;
}
