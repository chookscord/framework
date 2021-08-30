# @chookscord/validate

Small Discord interaction validation library.

## Usage

Returns `null` for passing tests, returns a `string` when failing.

```ts
import { testCommandName, testDescription } from './src';

testCommandName('valid-name'); // OK: null
testCommandName('Invalid Name'); // FAIL: error message

testDescription('Short description.'); // OK
testDescription('Just imagine this is over 100 chars.'); // FAIL

// And a few other tests.
```
