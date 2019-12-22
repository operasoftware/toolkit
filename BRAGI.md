## Bragi

Bragi is a templating engine, allowing to express rendered content by objects, arrays and primitive types.

```js
[
  'section',
  {
    class: 'rectangle',
    style: {
      backgroundColor: 'white',
      height: [120, 'px'],
      width: [80, 'px'],
    },
  },
]
```

```js
[
  'a',
  {
    class: ['link', {
      'highlighted': highlighted,
    }],
    href: 'https://www.opera.com',
  },
  'Opera',
]
```

```js
[
  'ul',
  [
    'li',
    'First item',
  ],
  [
    'li',
    'Second item',
  ],
]
```