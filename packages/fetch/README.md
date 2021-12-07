# @chookscord/fetch

A small wrapper around [`node-fetch@3`](https://www.npmjs.com/package/node-fetch) that provides
CommonJS support and a few extra utilities.

## Installation

`node-fetch` is added as a peer dependency, so `node-fetch@2` should also
work.

```sh
yarn add @chookscord/fetch node-fetch
```

## Utilities

### HTTP Methods

```js
const { fetch } = require('@chookscord/fetch');

// Plain POST request
fetch('https://example.com', { method: 'POST' });

// Using the utility POST request method
// Other methods are available as well
fetch.post('https://example.com');
```

### Consuming body

```js
const { fetch } = require('@chookscord/fetch');

// Sending a get request and consuming the json body
fetch('https://example.com')
  .then(res => res.json())
  .then(data => console.log(data));

// Same as above but using utility methods
// text(), blob(), and arrayBuffer() are also available
fetch('https://example.com')
  .json()
  .then(data => console.log(data));
```

### Chaining

```js
const { fetch } = require('@chookscord/fetch');

// Send a POST request and consume the response body as json
fetch
  .post('https://example.com')
  .json()
  .then(data => console.log(data));
```

## License

MIT
