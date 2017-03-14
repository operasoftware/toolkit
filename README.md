# chromium-reactor
A framework for Chromium-based browsers for building their user interfaces

[![Build Status](https://travis-ci.org/aswitalski/chromium-reactor.svg?branch=master)](https://travis-ci.org/aswitalski/chromium-reactor)
[![Coverage Status](https://coveralls.io/repos/github/aswitalski/chromium-reactor/badge.svg?branch=master)](https://coveralls.io/github/aswitalski/chromium-reactor?branch=master)
[![npm version](https://img.shields.io/npm/v/chromium-reactor.svg?style=flat)](https://www.npmjs.com/package/chromium-reactor)

## What is it?

Chromium Reactor is a framework intended for building Web UIs for Chromium-based browsers.
It utilises the engine’s latest features and provides a convenient way to build native, modular and dynamic web apps.

## Design principles

* **native** - take advantage of the latest Chromium engine features,
* **modular** - define each component, reducer, service as a separate module,
* **dynamic** - build in discovery service, lazy-load modules for flexibility or preload for performance,
* **fast** - utilise virtual DOM, minimise the number of DOM modifications, benchmark all operations to ensure high performance,
* **simple** - no millions of callbacks and events, utilise one-way model-to-view binding and unidirectional data flow,
* **encapsulated** - isolate apps, reduce usage of global variables to bare minimum,
* **deterministic** - do not worry about race conditions, let the framework control the asynchronous operations properly,
* **testable** - unit test all your components with little effort,
* **debuggable** - easily inspect your apps, use live reload, instrumentation and time saving debug tools.

## UI first

Building user interfaces for a browser requires pretty much two things: a mechanism to render the UI in the DOM and the way to load and manipulate the data utilised by that UI.

Reactor builds the UI as an sandboxed app that renders DOM elements in the specified container.

As a rule of thumb, no excess resources are fetched unless they are needed to render the requested interface.
Dependencies required for showing particular UI fragments are defined within the components responsible for rendering those fragments. All dependencies are resolved with the built-in discovery service and module loader.

Multiple apps can be rendered on the same page. They also can share dependencies, as these are stateless by design. All stateful components are encapsulated within apps.

## Running an app
The creation and execution of apps is as simple as possible:

```js
// import app definition
const MyApp = require.def('apps/my-app');
// create new app
const app = Reactor.create(MyApp);
// render in body element
await app.render(document.body);
```

## Behind the scenes

Creation of an app is synchronous, it is instantiated together with all its internal components (store, core reducer, renderer). Definitions of components are loaded.

The initialisation is asynchronous and it can be triggered manually or automatically before the initial rendering.
During the initialisation all the required dependencies are resolved, the view model is created and fed with the initial state provided by the data services.

Te rendering cycle starts with the construction of the component tree. The component tree is based on the initial state and then used to create the virtual DOM, which gets mirrored as DOM element tree and inserted into the specified container. Event listeners are bound to the app's command dispatcher.

From this point forward background data changes and user actions result in commands dispatched to the app.
The app processes the commands with the defined set of reducers, which calculate the transition to the next state. Each state update triggers the next rendering cycle.

## Dynamic nature

Before anything is shown to the user, Reactor loads all modules that are required for the initial rendering to start.
All optional dependencies can be lazy-loaded in order to minimise the memory usage and can be discovered just-in-time while traversing the component tree during rendering. The rendering begins with the root component which defines the app itself. Its `render()` method is invoked to get a template defining the node structure. The template is calculated using the component properties (application state for the root component). It consists of static elements (like 'div' and 'span') and definitions of subcomponents.

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

By design components only receive properties they are interested in, usually fragments of the application state.
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

Both virtual DOM and the renderer perform several optimisations to minimise the number of reflows and repaints. Components are not re-rendered if they receive exactly the same properties and child nodes as in the previous cycle. DOM is not modified if the structure and attributes remain the same and only event listeners change on the components. Preloaded components and all the descendants update synchronously in a single stack frame.

## Modules

Apps needs to read and write data, render the user interface and process the commands representing user actions and data changes. There are three main module types needed to develop a fully fledged app:

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
**Reducers** - process commands to update the application state, but also provide an API for creation of commands that they can understand
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

## Bundling apps

All the app's dependencies are defined within the components it consists of. This allows to reuse the discovery service and module loader's mechanisms at build time to bundle up the all the required modules into production-ready files.

Bunding doesn't use any transpilation or source maps and does nothing impacting the readability of the code. The original formatting is maintained. The only necessary amendment in the code is a change of the path-agnostic CommonJS pattern `module.exports = App` declarations into `define('/components/app', App)` to be able to package multiple modules from different paths into a single file.

It's up to the developers how they want to bundle their apps, but there are several built-in strategies: generating a single script for the whole app, splitting the code by top-level view or bundling UI components and services separately.

To bundle your app from command line with default settings just run:
```
node run bundle-app /components/my-app
```
Apps using bundled scripts in production don't loose their dynamic nature, service discovery and lazy loading can still be used if needed.

## Testing

It is much easier to ensure high quality of developed apps if all of their components are fully testable.
And of course if the framework they are built with is created from ground up with convenient testing in mind.

Reactor simplifies unit testing by providing a dedicated module loader which automatically mocks dependencies of tested modules. UI components can also use shallow render mode not to rely on their subcomponents.

The built-in assertion library allows to avoid boilerplate code in tests and improves their readability:
```js
// given
const component = createComponent('/components/panel');
component.props = {
  active: true
};

// when
const template = component.render();
const node = shallowRender(template);

// then
assert(node.is('div'));
assert(node.hasClass('active'));
assert(node.hasChildren());
assert(node.getFirstChild().is('span'));
```

# Coming when it's done!
