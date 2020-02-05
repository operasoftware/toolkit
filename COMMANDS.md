## Commands API

Commands API is a part of the dedicated state management mechanism for Toolkit.
It allows to transition the Web Component's view model from one state to another with simple API calls.

The concept is based on reducer functions as Redux but is more focused on the API, code clarity (no boilerplate) and convenience for the client.

### All about the API

The implementation of Commands API is just a creation of a plain object declaring API methods. These methods take arbitrary domain-specific arguments and return a reducer function defining how given command call transforms the current state to the updated one.

```js
const API = {
  setPersonalData(name, surname) {
    return state => ({
      ...state,
      name,
      surname,
    });
  },
};
```

Once connected to a Web Component, the command can be issued from component methods:

```js
class FormComponent extends opr.Toolkit.WebComponent {

  getCommands() {
    return API;
  }

  onPersonalDataChange({name, surname}) {
    this.commands.setPersonalData(name, surname);
  }
}
```

Such call triggers the component state update and the DOM update, if necessary.

### Under the hood

Issuing the command causes the returned reducer function to be invoked on the current state of the component. The reducer also has access to the arguments the command was issued with. The result of that reducer call, the newly calculated state object, is then set on the component instance.

If the new state object differs from the previous one, the `render()` method is called on the component to calculate the new template and if that altered from the previously rendered one, both the virtual and actual DOM will be patched to reflect the changes.

If the reducer function returns the same object or it is equal to the previous one (deep comparison) no action is taken.

### Immutable data

Since the state comparison checks the deep equality of the objects, all the used data needs to be immutable. Modifying the existing state object may result in unpredictable behaviour. To avoid the incidental modifications Toolkit deeply freezes the state object in the `debug` mode. Any arbitrary modification will result in errors being thrown, to detect programmer's mistakes as early as possible.

### Execution

Commands are usually issued on either user actions or underlying data changes. In such circumstances the invocation of the command is synchronous, once it's completed, both virtual and the actual DOM are updated.

They may also be called from the component's lifecycle methods, in the middle of the state transition. In such case all invocations are queued and performed atomically once the original cycle has completed. Toolkit also detects if such cycles do not cause infinite update loops.

### Example

```js
const StackCommands = {
  push(item) {
    return state => ({
      items: [...state.items, item],
    });
  },
  pop() {
    return state => {
      const items = [...state.items];
      const removed = items.shift();
      return {
        items,
        removed,
      };
    };
  },
};

export default class Stack extends opr.Toolkit.WebComponent {

  getInitialState() {
    return {
      items: [],
    };
  }

  getCommands() {
    return StackCommands;
  }

  pushItem() {
    const item = parseInt(256 * Math.random());
    console.log('Pushing item:', item);
    this.commands.push(item);
  }

  popItem() {
    const state = this.commands.pop();
    const item = state.removed;
    console.log('Removed item:', item);
  }
};
```

### Using multiple APIs

Web Components can use multiple Command APIs at the same time.
The `getCommands()` method may return an array containing many command objects.

```js
class FormComponent extends opr.Toolkit.WebComponent {

  getCommands() {
    return [FooCommands, BarCommands];
  }
}
```

In such case the specified APIs are checked for any potential name conflicts.
If none are detected, the component will be able to utilize all the defined methods.

When responsibilies are divided correctly and command names are descriptive enough, conflicts should happen very rarely, if ever.

### Testing

Since all the state management logic is within the API object, it's extremally easy to debug and unit test it.

```js
describe('pushes the item to the stack', () => {

  // given
  const item = 10;
  const state = {
    items: [1, 2, 3],
  };

  // when
  const reducer = StackCommands.push(item);
  const result = reducer(state);

  // then
  assert(result !== state);
  assert.deepEqual([1, 2, 3, 10], result);
});
```
