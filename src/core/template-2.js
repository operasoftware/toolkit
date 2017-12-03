{
  const SUPPORTED_EVENTS = [
    // mouse events
    'onAuxClick',
    'onClick',
    'onContextMenu',
    'onDoubleClick',
    'onDrag',
    'onDragEnd',
    'onDragEnter',
    'onDragExit',
    'onDragLeave',
    'onDragOver',
    'onDragStart',
    'onDrop',
    'onMouseDown',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseOut',
    'onMouseOver',
    'onMouseUp',
    // keyboard events
    'onKeyDown',
    'onKeyPress',
    'onKeyUp',
    // focus events
    'onFocus',
    'onBlur',
    // form events
    'onChange',
    'onInput',
    'onSubmit',
    // clipboard events
    'onCopy',
    'onCut',
    'onPaste',
    // composition events
    'onCompositionEnd',
    'onCompositionStart',
    'onCompositionUpdate',
    // selection events
    'onSelect',
    // touch events
    'onTouchCancel',
    'onTouchEnd',
    'onTouchMove',
    'onTouchStart',
    // UI events
    'onScroll',
    // wheel events
    'onWheel',
    // media events
    'onAbort',
    'onCanPlay',
    'onCanPlayThrough',
    'onDurationChange',
    'onEmptied',
    'onEncrypted',
    'onEnded',
    'onError',
    'onLoadedData',
    'onLoadedMetadata',
    'onLoadStart',
    'onPause',
    'onPlay',
    'onPlaying',
    'onProgress',
    'onRateChange',
    'onSeeked',
    'onSeeking',
    'onStalled',
    'onSuspend',
    'onTimeUpdate',
    'onVolumeChange',
    'onWaiting',
    // image events
    'onLoad',
    'onError',
    // animation events
    'onAnimationStart',
    'onAnimationEnd',
    'onAnimationIteration',
    // transition events
    'onTransitionEnd',
    // search events
    'onSearch',
  ];

  const SUPPORTED_ATTRIBUTES = [
    // most used attributes
    'tabIndex', 'href',  'draggable', 'name',      'disabled',
    'type',     'value', 'id',        'checked',   'contentEditable',
    'readOnly', 'alt',   'title',     'width',     'height',
    'required', 'for',   'label',     'minLength', 'maxLength',
    'method',   'src',   'rel',
  ];

  class Description {

    constructor(type, key, template) {
      this.type = type;
      this.key = key;
      Object.defineProperty(this, 'template', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: template,
      });
    }

    isCompatible(desc) {
      return desc && desc.type === this.type;
    }

    isComponent() {
      return this instanceof ComponentDescription;
    }

    isElement() {
      return this instanceof ElementDescription;
    }
  }

  class ComponentDescription extends Description {

    constructor({component, props, children}, template) {
      super('component', props && props.key, template);
      this.component = component;
      if (props) {
        this.props = props;
      }
      if (children) {
        this.children = children;
      }
    }

    isCompatible(desc) {
      return super.isCompatible(desc) && desc.component === this.component;
    }
  }

  /*
   * Defines a normalized description of an element. Is used to determine the
   * differences between compatible elements (with the same tag name).
   *
   * Enumerable properties:
   * - element (a string representing tag name),
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
   * - template: a reference to the source template.
   */
  class ElementDescription extends Description {

    constructor({element, text = null, children, props}, template) {
      super('element', props && props.key, template);

      this.element = element;
      this.text = text;

      if (children && children.length > 0) {
        this.children = children;
      }

      if (props) {

        const normalized = {};

        const keys = Object.keys(props);

        // listeners
        const listeners = {};
        const events = keys.filter(key => SUPPORTED_EVENTS.includes(key));
        for (const event of events) {
          const listener = props[event];
          if (typeof listener === 'function') {
            listeners[event] = listener;
          }
        }
        if (Object.keys(listeners).length) {
          normalized.listeners = listeners;
        }

        // attributes
        const attrs = {};
        const attrNames =
            keys.filter(key => SUPPORTED_ATTRIBUTES.includes(key));
        for (const attr of attrNames) {
          const value = Template.getAttributeValue(props[attr]);
          if (value !== null && value !== undefined) {
            attrs[attr] = value;
          }
        }
        if (Object.keys(attrs).length) {
          normalized.attrs = attrs;
        }

        // data attributes
        if (props.dataset) {
          const dataset = {};
          for (const key of Object.keys(props.dataset)) {
            const value = Template.getAttributeValue(props.dataset[key]);
            if (value !== null && value !== undefined) {
              dataset[key] = String(value);
            }
          }
          if (Object.keys(dataset).length) {
            normalized.dataset = dataset;
          }
        }

        // class names
        if (props.class) {
          const className = Template.getClassName(props.class);
          if (className.length) {
            normalized.className = className;
          }
        }

        // style
        if (props.style) {
          const style = {};
          const keys = Object.keys(props.style)
                           .filter(key => SUPPORTED_STYLES.includes(key));
          for (const key of keys) {
            const value = Template.getStyleValue(props.style[key], key);
            if (value !== null && value !== undefined) {
              style[key] = value;
            }
          }
          if (Object.keys(style).length) {
            normalized.style = style;
          }
        }

        // metadata
        if (props.metadata) {
          const metadata = {};
          for (const key of Object.keys(props.metadata)) {
            metadata[key] = props.metadata[key];
          }
          if (Object.keys(metadata).length) {
            normalized.metadata = metadata;
          }
        }

        if (Object.keys(normalized).length) {
          this.props = normalized;
        }
      }
    }

    isCompatible(desc) {
      return super.isCompatible(desc) && desc.element === this.element;
    }
  }

  class Template {

    static getClassName(value) {
      if (!value) {
        return '';
      }
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value)) {
        return value
            .reduce(
                (result, item) => {
                  if (!item) {
                    return result;
                  }
                  if (typeof item === 'string') {
                    result.push(item);
                    return result;
                  }
                  result.push(this.getClassName(item));
                  return result;
                },
                [])
            .filter(item => item)
            .join(' ');
      }
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) {
          return [];
        }
        return Object.keys(value)
            .map(key => value[key] && key)
            .filter(item => item)
            .join(' ');
      }
      return '';
    }

    static getCompositeValue(obj = {}, whitelist) {
      const names = Object.keys(obj).filter(name => whitelist.includes(name));
      return this.getAttributeValue(names.reduce((result, name) => {
        const value = this.getAttributeValue(obj[name], false);
        if (value) {
          result[name] = value;
        }
        return result;
      }, {}));
    }

    static getAttributeValue(value, allowEmptyString = true) {
      if (value === undefined || value === null) {
        return null;
      }
      if (value.constructor === Function) {
        return null;
      }
      if (value.constructor === Array) {
        return value.length > 0 ? value.join('') : null;
      }
      if (value.constructor === Object) {
        const entries = Object.entries(value);
        if (entries.length > 0) {
          return entries.map(([name, value]) => `${name}(${value})`).join(' ');
        }
        return null;
      }
      if (value === '') {
        return allowEmptyString ? '' : null;
      }
      return String(value);
    }

    static getStyleValue(value, prop = null) {
      switch (prop) {
        case 'filter':
          return this.getCompositeValue(value, opr.Toolkit.SUPPORTED_FILTERS);
        case 'transform':
          return this.getCompositeValue(
              value, opr.Toolkit.SUPPORTED_TRANSFORMS);
        default:
          return this.getAttributeValue(value);
      }
    }

    static get ItemType() {
      return {
        STRING: 'string',
        NUMBER: 'number',
        BOOLEAN: 'boolean',
        UNDEFINED: 'undefined',
        NULL: 'null',
        COMPONENT: 'component',
        ELEMENT: 'element',
        PROPS: 'props',
        RENDERER: 'renderer',
        SYMBOL: 'symbol',
      };
    }

    static getItemType(item) {

      const Type = Template.ItemType;
      const type = typeof item;

      switch (type) {
        case 'string':
          return Type.STRING;
        case 'number':
          return Type.NUMBER;
        case 'boolean':
          return Type.BOOLEAN;
        case 'undefined':
          return Type.UNDEFINED;
        case 'symbol':
          return Type.SYMBOL;
        case 'function':
          if (type.prototype instanceof opr.Toolkit.Component) {
            return Type.COMPONENT;
          }
          return Type.RENDERER;
        case 'object':
          if (item === null) {
            return Type.NULL;
          } else if (Array.isArray(item)) {
            return Type.ELEMENT;
          }
          return Type.PROPS;
      }
    }

    static describe(template) {

      if (template === false || template === null) {
        return null;
      }

      if (Array.isArray(template) && template.length > 0) {

        const Type = this.ItemType;
        const details = {};

        const type = this.getItemType(template[0]);
        details[type] = template[0];

        let index = 1;
        if (template.length > 1 &&
            this.getItemType(template[1]) === Type.PROPS) {
          details.props = template[1];
          index = 2;
        }

        for (let i = index; i < template.length; i++) {
          const item = template[i];
          if (item !== null && item !== false) {
            const type = this.getItemType(item);
            if (type === Type.ELEMENT) {
              if (details.children) {
                details.children.push(item);
              } else {
                details.children = [item];
              }
            } else {
              throw new Error('Invalid item!');
            }
          }
        }
        return this.normalize(details, template);
      }
      throw new Error('Invalid template!');
    }

    static normalize(details, template = null) {
      return details.component ? new ComponentDescription(details, template) :
                                 new ElementDescription(details, template);
    }
  }

  for (let i = 0; i < 10000; i++) {
    Template.describe([
      'tr', {
        key: i,
        metadata: {
          data_id: i,
        },
        class: '',
      },
      [
        'td',
        {
          class: 'col-md-1',
        },
        String(i),
      ],
      [
        'td',
        {
          class: 'col-md-4',
        },
        [
          'a',
          {
            class: 'lbl',
          },
          `label-{$i}`,
        ],
      ],
      [
        'td',
        {
          class: 'col-md-1',
        },
        [
          'a',
          {
            class: 'remove',
          },
          [
            'span',
            {
              class: 'glyphicon glyphicon-remove remove',
            },
          ],
        ],
      ],
      [
        'td',
        {
          class: 'col-md-6',
        },
      ]
    ]);
  }
}