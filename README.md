# chromium-reactor
A framework for Chromium-based browsers for building their user interfaces

[![Build Status](https://snap-ci.com/aswitalski/chromium-reactor/branch/master/build_image)](https://snap-ci.com/aswitalski/chromium-reactor/branch/master) [![npm version](https://img.shields.io/npm/v/chromium-reactor.svg?style=flat)](https://www.npmjs.com/package/chromium-reactor)

## What is it?

Chromium Reactor is a framework intended for building Web UIs for Chromium-based browsers.
It utilises the engine’s latest features and provides a convenient way to build native, modular and dynamic web apps.

## Design principles

* **native** - take advantage of the latest Chromium engine features,
* **modular** - define each component, reducer, service as a separate module,
* **dynamic** - build in discovery service, lazy-load required modules for flexibility or preload for performance,
* **fast** - utilise virtual DOM, minimise the number of DOM modifications, benchmark all operations to ensure high performance,
* **simple** - no millions of callbacks and events, utilise one-way model-view binding and dispatch commands to update the model,
* **isolated** - reduce globals usage to bare minimum (module loader methods),
* **deterministic** - no race conditions, control all asynchronous operations,
* **debuggable** - have fun during development, use live-reload, logging and time-saving "debug mode" tools.

## UI first

Building user interfaces for a browser requires pretty much two things: a mechanism to render the UI in the DOM and the way to load and manipulate the data utilised by that UI.

Reactor builds the UI as an sandboxed app that renders DOM elements in the specified container.

As a rule of thumb, no excess resources are fetched unless they are needed to render the user interface. Dependencies required for rendering particular UI fragments are defined within the UI components and resolved with the built-in module loader.

All dependencies shared with other apps are stateless and all stateful components are encapsulated within the app.

## Running an app
The creation and execution of apps is as simple as possible:

```js
// import app definition
const MyApp = require.def('apps/my-app');
// create new app
const app = Reactor.create(MyApp);
// render in body element
await demo.render(document.body);
```

## Behind the scenes

Creation of an app is synchronous, it is instantiated together with all its internal components (store, core reducer, renderer). Definitions of components are loaded.

The initialisation is asynchronous and it can be triggered manually or automatically before the initial rendering.
During the initialisation all the required dependencies are resolved, the view model is created and fed with the initial state provided by the data services.

Te rendering cycle starts with the construction of the component tree. The component tree is based on the initial state and then used to create the virtual DOM, which gets mirrored as DOM element tree and inserted into the specified container. Event listeners are bound to the app's command dispatcher.

From this point forward background data changes and user actions result in commands dispatched to the app.
The app processes the commands with the defined set of reducers, which calculate the transition to the next state. Each state update triggers the next rendering cycle.

## Dynamic nature

Before anything is shown to the user, Reactor detects which modules are required for the initial rendering and loads them.
By default all modules are lazy-loaded in order to minimise the memory usage.
The dependencies are detected while traversing the component tree during rendering. Starting with the root component its  `render()` method is invoked to get a template defining the node structure. The template is calculated using the component properties (application state for the root component). It consists of static elements (like 'div', 'span') and definitions of subcomponents:

```js
const Application = class extends Reactor.Component {
  render() {
    return [
      'div', {
        class: 'my-app'
      },
      [
        'h1', this.props.title      
      ],
      [
        NavigationMenu, this.props.navigation
      ]
    ];
  }
};

const NavigationMenu = require.def('/components/navigation/menu');
```
If any subcomponent definitions are found in the returned template the subcomponent classes are loaded together with their dependencies. The subcomponent instances are created and they receive their own properties (as specified by the parent component) and the rendering continues:

```js
const NavigationMenu = class extends Reactor.Component {
  render() {
    return [
      'div', {
        class: 'navigation'
      }, ...this.props.items.map(item => [
        NavigationItem, { label: item.label, url: item.url }
      ])
    ];
  }
};

const NavigationItem = require.def('/components/navigation/item');
```

By design components only receive properties they are interested in, usually fragments of the appliation state.
All the properties on static elements are converted into event listeners and element attributes (based on the built-in dictionaries):

```js
const NavigationItem = class extends Reactor.Component {
  render() {
    return [
      'a', {
        class: 'item',
        href: this.props.url
      }, this.props.label
    ];
  }
};
```

## Performance

Lazy loading and multiple asynchronous operations can significantly impact the app's responsiveness, therefore any component tree fragment (with all related modules) can be preloaded at any point in time. This allows to synchronously render the particular element tree to get the best performance when needed.

Preloading is very handy when a switch to a totally different view happens, what usually requires a different set of components and services. There only is a single expensive operation and after that all updates triggered by user actions are optimised and as performant as possible.

Both virtual DOM and the renderer perform several optimisations to minimise the number of reflows and repaints. Components are not re-rendered if they receive the same properties and child nodes as in the previous cycle. DOM is not modified if the structure and attributes remain the same and only event listeners change on the components. Preloaded components and all the descendants update synchronously in a single stack frame.

## Modules

Apps needs to read and write data, render the user interface and process commands representing user actions and data changes. There are three main module types needed to develop a fully fledged app:

**Components** - represent UI fragments, define what is rendered in the DOM
```js
const Component = class extends Reactor.Component {
  render() {
    return [
      'div', {
        class: 'main'
      },
      [
        Subcomponent, {
          onClick: this.animate()
        }
      ]
    ];
  }
};

const Subcomponent = require.def('/components/subcomponent');
```
**Reducers** - process commands but also provide an API for creation of commands that they can understand
```js
const VALUE_CHANGED = Symbol('value-changed')

const reducer = (state, command) {
  switch (command.type) {
    case VALUE_CHANGED:
      return {
        settings: Object.assign({}, state.settings, {
          [command.name]: command.value
        });
      };
    default:
      return state;
  }
};

reducer.commands = {
  valueChanged: (name, value) => ({
    type: VALUE_CHANGED,
    name,
    value
  })
};
```
**Services** - read and write data, allow to subscribe to data changes
```js
const service = class Service {
  async getState() {
    return await this.getSettings().toState();
  }
  subscribe(reducer) {
    this.onSettingChange((name, value) => {
      const command = reducer.commands.valueChanged(name, value);
      reducer(command);
    });
  }
}
```

# Coming when it's done!
