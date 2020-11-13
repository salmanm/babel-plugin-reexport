# babel-plugin-reexport
Allows re-exporting a node module

## Usage

#### CLI

```sh
npx babel ./node_modules/some-package/dir --out-dir ./export-dir --plugins=reexport
```

#### Programatically

Typically this is what you'd need to do to make sure that the path of the package you're trying to export is resolved by node..

```js
/* eslint-disable no-console */

const path = require('path');
const { spawn } = require('child_process');

const pkgPath = path.dirname(require.resolve('some-package/dir'));
const babelPath = require.resolve('@babel/cli/bin/babel');
const configPath = path.join(__dirname, '.babelrc');
const outPath = path.join(process.cwd(), 'export-dir');

const babel = spawn(
  babelPath,
  [pkgPath, '--out-dir', outPath, '--config-file', configPath],
  {
    stdio: [process.stdin, process.stdout, process.stderr],
  }
);
```

## Output

The generated output files would contain only the re-export statements from the original package.

For example this

```js
// some-package/dir/MyClass.js

class MyClass {}

export default MyClass
```

outputs this

```js
export { default } from 'some-package/dir/MyClass'
```

This plugin supports the following

- Default exports: `export default MyClass` -> `export { default } from "<path>"`

- Named default exports: `export { default } from './MyClass'` -> `export { default } from "<path>"`

- Named exports: `export const Foo = 'bar'` -> `export * from "<path>"`
