# opera-toolkit

Opera Toolkit is a UI library created for rendering Opera Desktop browser's internal Web pages.
It allows to build the user interface natively by utilising the engine's latest features.

## Why?

All JavaScript frameworks are intended for rendering Web pages which work across a variety of browsers with diversified support for latest HTML5+ features. That results in compromises and requires a number of techniques to make this possible - transpilation, polyfills, external live-reload servers to name a few.

A solution dedicated for a single browser asks for a different approach, an attempt to use as many tools provided by the browser itself as possible. Support for async/await, object spread and other syntactic sugar allows to write nifty code without any need of transpilation. Native templating system makes possible to describe rendered DOM elements and components with arrays and objects. Single execution environment pushes away the worries of browser compatibility issues. DevTools workspaces provide built-in live reload system, neither external tools nor constant builds and browser restarts are necessary.

## Design principles

* **native** - take advantage of the latest Chromium engine features,
* **modular** - define each component, reducer, service as a separate module,
* **dynamic** - build in discovery service, lazy-load modules for flexibility or preload for performance,
* **fast** - utilise virtual DOM, minimise the number of DOM modifications, benchmark all operations to ensure high performance,
* **simple** - no millions of callbacks and events, utilise one-way model-to-view binding and unidirectional data flow,
* **encapsulated** - isolate apps as Web components, reduce usage of global variables to bare minimum,
* **deterministic** - do not worry about race conditions, let the framework control the asynchronous operations properly,
* **testable** - unit test all your components with little effort,
* **debuggable** - easily inspect your apps, use live reload, instrumentation and time saving debug tools.

## Web Apps

Toolkit renders Web Apps as a composition of Web Components encapsulated within custom elements.
Web Components manage their own state, use isolated stylesheets, provide rendering context with Commands API and support plugins.

Toolkit also encourages functional programming by utilizing pure functions and pure components.
These components always generate the same template when given the same props object.

```js
const Square = props => [
  'section',
  {
    class: 'square',
    style: {
      backgroundColor: props.color,
      height: [props.size, 'px'],
      width: [props.size, 'px'],
    },
  },
];
```

There is no transpilation phase, the sources are directly used by the browser in the form of ES modules.

## State management

Instead of using the centralized state, as in Redux, Web Component manages only the view model that is necessary
to render the particular fragment of the UI it is responsible for.

There is no need to traverse and clone complex data structures in order to amend the state.
By design Web Components are small, single-purpose nestable apps. Their state is based on the props received from the parent.
They can fetch the additional data asynchronously and handle the data changes themselves. The ancestor Web Components are not involved when not interested in that data.

Web Components use commands to make a transition between one state and another.

Read more about the [Commands API](COMMANDS.md).

## Templating

Toolkit uses **Bragi** templates, which allow to express HTML nodes with pure JavaScript code, using only objects, arrays and primitive types.

Find out more about [Bragi templates](BRAGI.md)

## Examples

Here are a few conceptual examples of [Web Components](EXAMPLES.md)

## Build

To build a single-script, production version of Toolkit with no external dependencies just run:
```
npm run release
```

## Demo

A simple demo in both `debug` and `release` mode:

```sh
npm run demo
```

The debug mode uses the logger plugin showing all executed commands, patches applied on the DOM and time taken on each operation.
