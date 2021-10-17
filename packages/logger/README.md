# @chookscord/logger

A small logging library built around [`picocolors`](https://www.npmjs.com/package/picocolors),
adding support for log levels and error formatting.

## Installation

```sh
$ yarn add @chookscord/logger picocolors
```

## Log levels

```sh
LOG_LEVEL=-1 # Silent
LOG_LEVEL=0  # Fatal
LOG_LEVEL=1  # Error
LOG_LEVEL=2  # Warn
LOG_LEVEL=3  # Success, Info
LOG_LEVEL=4  # Log (default)
LOG_LEVEL=5  # Debug
LOG_LEVEL=6  # Trace
```

## Usage

```js
const { createLogger } = require('@chookscord/logger');

const logger = createLogger('app');

// Prominent messages
logger.fatal(new RangeError('An unrecoverable error occured!'));
logger.error(new Error('An error has occured!'));
logger.warn(new TypeError('Something unexpected happened!'));

// Normal messages
logger.success('Performed task successfully!');
logger.info('Doing something.');
logger.log('Hello there.');

// Hidden by default
logger.debug('Checking some value.');
logger.trace('I am currently here.');
```

## License

MIT
