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
* **deterministic** - no race conditions, isolate all asynchronous operations,
* **simple** - no millions of callbacks and events, utilise one-way model-to-view binding and dispatch commands to update the model,
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

### // TODO
Write more...

## Coming when it's done!
