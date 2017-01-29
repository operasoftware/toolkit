# chromium-reactor
A framework for Chromium-based browsers for building their user interfaces

[![Build Status](https://snap-ci.com/aswitalski/chromium-reactor/branch/master/build_image)](https://snap-ci.com/aswitalski/chromium-reactor/branch/master) [![npm version](https://img.shields.io/npm/v/chromium-reactor.svg?style=flat)](https://www.npmjs.com/package/chromium-reactor)

## What is it?

Chromium Reactor is a framework intended for building browser Web UIs.
It utilizes the Chromium engine’s latest features and simplifies the development of user interfaces by providing a way to build native, modular and dynamic Apps and an enjoyable development experience.

## Design principles

* **native** - take advantage of the latest Chromium engine features,
* **modular** - define each component, reducer, service as a separate module,
* **dynamic** - build in discovery service, lazy-load required modules for flexibility or preload for performance,
* **fast** - utilise virtual DOM, minimise the number of manipulations, benchmark all operations to ensure high performance,
* **simple** - no millions of callbacks and events, utilise one-way model-to-view binding and dispatch commands to update the model,
* **isolated** - reduce globals usage to bare minimum (module loader and constants)
* **deterministic** - no race conditions, understand all asynchronous operations,
* **debuggable** - have fun during development, use live-reload, logging and time-saving "debug mode" tools.

## UI first

It is a framework for building user interfaces, what pretty much requires just two things: rendering the UI and the way to load and manipulate the data. The UI is built as an isolated App operating in the specified DOM element. All dependencies shared with other Apps are stateless and all stateful modules are instantiated within the app.

### Create an App
The creation and execution of an App is as simple as possible:

```js
// import app definition
const MyApp = require.def('apps/my-app');
// create new app
const app = Reactor.create(MyApp);
// render in body element
await demo.render(document.body);
```

## Behind the scenes

Creation of an App is synchronous, it is instantiated together with all its internal components (store, core reducer, renderer). Definitions of dependencies are loaded.

The initialisation is asynchronous and happens before the initial rendering. Required dependencies are resolved, the view model is created and fed with data provided by the background services.

Based on the initial state the component tree is used to create the virtual DOM, which gets mirrored as DOM element tree and inserted into the requested container. Event listeners are bound to the command dispatcher and the app is ready to work with. From this point forward any user action and background data refresh result in a command dispatched to the App.
The application processes the commands with the defined reducers, which calculate the next state. Whenever the state is updated the next DOM update cycle is triggered.

## Dynamic nature

Before anything is shown to the user, Reactor detects which modules are required for rendering and loads them.
By default all modules are lazy-loaded in order to minimise the resources usage and maximise the battery life.
The dependencies are detected while traversing the component tree during rendering. Starting with the root component its  `render()` method is invoked to get a template defining the node structure. The template is calculated using the component properties (application state for the root component). It consists of static elements (like 'div', 'span') and definitions of subcomponents:

```js
const Application = class extends Reactor.Component {
  render() {
    return [
      'div', {
        class: 'header'
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
If any component definitions are found in the returned template the components are loaded with their dependencies. The respective instances are created, they receive their own properties (as specified by the template) and the rendering continues:

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

Components only receive properties they are interested in - usually fragments of the appliation state.
All the properties on static elements are converted into event listeners and element attributes (based on built-in dictionaries):

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

Lazy loading and multiple asynchronous operations can significantly impact the application responsiveness, therefore any component tree fragment (with all related modules) can be preloaded at any point in time. This allows to synchronously render the particular element tree to get the best performance when needed.

Preloading is very handy when user switches to a totally different view, which requires a different set of components and services. There only is a single expensive operation and after that all updates triggered by user actions are optimised and as performant as possible.

Both Virtual DOM and the renderer perform several optimisations to minimise the number of reflows and repaints. Components are not re-rendered if they receive the same properties and child nodes as in the previous cycle. DOM is not modified if only event listeners change on the components. Preloaded components and all the descendants update synchronously in a single stack frame.

## Module types

There are a few main types of modules:

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
**Services** - provide data and allow to subscribe to data changes
```js
const service = class Service {
  async getState() {
    return await this.getSettings().toState();
  }
  subscribe(reducer) {
    this.onSettingChange((name, value) => {
      const command = reducer.valueChanged(name, value);
      reducer(command);
    });
  }
}
```

## Coming when it's done!
