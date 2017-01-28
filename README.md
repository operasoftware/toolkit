# chromium-reactor
A framework for Chromium-based browsers for building their user interfaces

[![Build Status](https://snap-ci.com/aswitalski/chromium-reactor/branch/master/build_image)](https://snap-ci.com/aswitalski/chromium-reactor/branch/master)

### What is it?

Chromium Reactor is a framework intended for building browser Web UIs.
It utilizes the Chromium engine’s latest features and simplifies the development of user interfaces by providing a way to build native, modular and dynamic Apps and an enjoyable development experience.

### Design principles

* **native** - take advantage of the latest Chromium engine features,
* **modular** - define each component, reducer, service as a separate module,
* **dynamic** - build in discovery service, lazy-load required modules for flexibility or preload for performance,
* **fast** - utilise virtual DOM, minimise the number of manipulations, benchmark all operations to ensure high performance,
* **simple** - no millions of callbacks and events, utilise one-way model-to-view binding and dispatch commands to update the model,
* **isolated** - reduce globals usage to bare minimum (module loader and constants)
* **deterministic** - no race conditions, understand all asynchronous operations,
* **debuggable** - have fun during development, use live-reload, logging and time-saving "debug mode" tools.

### UI first

It is a framework for building user interfaces, what pretty much requires just two things: rendering the UI and the way to load and manipulate the data. The UI is built as an isolated App operating in the specified DOM element. All dependencies shared with other Apps are stateless and all stateful modules are instantiated within the app.

### Create an App
The creation and execution of an App is as simple as possible:

```js
// import app definition
const MyApp = require.defer(‘apps/my-app’);
// create new app
const app = Reactor.create(MyApp);
// render in body element
await demo.render(document.body);
```

### Behind the scences

Creation of an App is synchronous, it is instantiated together with all the internal components (store, core reducer, renderer). Definitions of dependencies are loaded.

The initialisation is asynchronous and happens before the initial rendering. Required dependencies are resolved, the view model is created and fed with data provided by background services.

Based on the initial state the virtual node tree is created, it is replicated into the DOM container. Event listeners are bound to the command dispatcher and an interactive app is ready to work with. From this point forward each user action and background data refresh result in a command dispatched to the App. The application processes the commands with the imported reducers, which calculate the next state. Any changes in the state trigger the DOM update.

### Module types

There are a few main types of modules:
* **components** - represent UI fragments, define what is rendered in the DOM
```js
const Subcomponent = require.defer('/components/subcomponent');

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
```
* **reducers** - process commands but also provide an API for creation of commands that they can understand
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
* **services** - provide data and allow to subscribe to data changes
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
