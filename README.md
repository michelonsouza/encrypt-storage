<img width="400" style="margin-bottom: 30px; max-width: 100%;" src="./docs/resources/encrypt-storage-logo.png" />

[![stargazers count](https://img.shields.io/github/stars/michelonsouza/encrypt-storage?style=social)](https://github.com/michelonsouza/encrypt-storage) ![maintenance](https://img.shields.io/npms-io/maintenance-score/encrypt-storage) [![npm](https://img.shields.io/npm/dm/encrypt-storage)](https://www.npmjs.com/package/encrypt-storage) ![sponsors](https://img.shields.io/github/sponsors/michelonsouza?logo=github-sponsors) ![package size](https://img.shields.io/bundlephobia/min/encrypt-storage?color=%232ebd4f&label=package%20size&logo=npm) [![Code Size](https://img.shields.io/github/languages/code-size/michelonsouza/encrypt-storage)](https://github.com/michelonsouza/encrypt-storage) [![Version](https://img.shields.io/github/package-json/v/michelonsouza/encrypt-storage/main)](https://github.com/michelonsouza/encrypt-storage/blob/main/package.json#L3) [![Build Status](https://img.shields.io/github/actions/workflow/status/michelonsouza/encrypt-storage/ci.yml)](https://img.shields.io/github/actions/workflow/status/michelonsouza/encrypt-storage/ci.yml) [![Coverage Status](https://coveralls.io/repos/github/michelonsouza/encrypt-storage/badge.svg)](https://coveralls.io/github/michelonsouza/encrypt-storage) [![License](https://img.shields.io/npm/l/encrypt-storage?color=%230e7fc0&label=license)](https://github.com/michelonsouza/encrypt-storage/blob/main/LICENSE) [![Node CI](https://github.com/michelonsouza/encrypt-storage/actions/workflows/ci.yml/badge.svg)](https://github.com/michelonsouza/encrypt-storage/actions/workflows/codeql-analysis.yml) [![CodeQL](https://github.com/michelonsouza/encrypt-storage/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/michelonsouza/encrypt-storage/actions/workflows/codeql-analysis.yml) [![npm published](https://github.com/michelonsouza/encrypt-storage/actions/workflows/release.yml/badge.svg)](https://github.com/michelonsouza/encrypt-storage/actions/workflows/release.yml) [![jsdelivery](https://img.shields.io/jsdelivr/npm/hm/encrypt-storage)](https://www.jsdelivr.com/package/npm/encrypt-storage)

OBS: This is the new version of Encrypt Storage, it has breaking changes that will not be described below. For version `1.3.X` documentation, access this [link](./docs/README_V1.md).

The `Encrypt Storage` is a `wrapper` for native `Storage` of browser.

Using the [`crypto-js`](https://github.com/brix/crypto-js) library as an encryption engine, it saves the encrypted data on the `selected storage` in the same way as the native `Storage`.

> **HELP THIS PROJECT**: Your Github `star` can help this project. Leave a `star`, it costs nothing.

> **⚠️ IMPORTANT**: Nothing on the front end is entirely secure. The library's proposal is to make it difficult for the user to see the data through the console, but as the secret key is on the front end, if the user searches hard enough, he will end up finding it. Just to make it clear that nothing is completely secure on the front end. Thank you for your attention.

- [Encrypt Storage](#encrypt-storage)
  - [Features](#features)
  - [Installing](#installing)
  - [Options](#options)
  - [Usage](#usage)
    - [Conventions](#conventions)
    - [Parameters](#parameters)
    - [CommonJS](#commonjs)
    - [JS Import (ES6+)](#js-import-es6)
    - [Multiple instances](#multiple-instances)
    - [Options implementation](#options-implementation)
      - [_prefix_](#prefix)
      - [_storageType_](#storagetype)
      - [_stateManagementUse_](#statemanagementuse)
      - [_encAlgorithm_](#encalgorithm)
      - [_notifyHandler_](#notifyhandler)
      - [_doNotEncryptValues_](#doNotEncryptValues)
      - [_doNotParseValues_](#doNotParseValues)
    - [Methods](#methods)
      - [_setItem_](#setitem)
      - [_setMultipleItems_](#setmultipleitems)
      - [_getItem_](#getitem)
      - [_getMultipleItems_](#getmultipleitems)
      - [_removeItem_](#removeitem)
      - [_removeMultipleItems_](#removemultipleitems)
      - [_getItemFromPattern_](#getitemfrompattern)
      - [_removeItemFromPattern_](#removeitemfrompattern)
      - [_key_](#key)
      - [_length_](#length)
      - [_clear_](#clear)
      - [_encryptString_](#encryptstring)
      - [_decryptString_](#decryptstring)
      - [_encryptValue_](#encryptvalue)
      - [_decryptValue_](#decryptvalue)
      - [_hash_](#hash)
      - [_md5Hash_](#md5hash)
    - [NextJS](#nextjs)
    - [AsyncEncryptStorage](#asyncencryptstorage)
    - [AWS Amplify](#aws-amplify)
    - [State Management Persisters](#state-management-persisters)
      - [_vuex-persist_](#vuex-persist)
      - [_redux-persist_](#redux-persist)
      - [_pinia-plugin-persist_](#pinia-plugin-persist)
      - [_pinia-plugin-persistedstate_](#pinia-plugin-persistedstate)
- [License](#license)

## Features

- Save encrypted data in `localStorage` and `sessionStorage`
- Recover encrypted data with `get` functions
- Use in the same way as native `Web Storage` (localStorage and sessionStorage)
- If you use the `stateManagementUse` option, the data acquired in `get` functions will `not` have their return transformed into `Javascript objects`.
- Use with `stateManagement` persisters (`vuex-persist` and `redux-persist`\*)

## Installing

> To run this project in the development mode, you'll need to have a basic environment with NodeJs and Yarn installed.

Using npm:

```bash
$ npm install encrypt-storage
```

Or yarn:

```bash
$ yarn add encrypt-storage
```

Using `CDNs`:

`Unpkg`:

```html
<body>
  <!-- ...after other codes -->
  <script src="https://unpkg.com/encrypt-storage@latest/dist/index.js"></script>
  <script>
    const encryptStorage = new EncryptStorage('secret-key-value');
  </script>
</body>
```

OBS: `Unpkg` doesn't have a counter badge

`JS Delivery`:

```html
<body>
  <!-- ...after other codes -->
  <script src="https://cdn.jsdelivr.net/npm/encrypt-storage@latest/dist/index.js"></script>
  <script>
    const encryptStorage = new EncryptStorage('secret-key-value');
  </script>
</body>
```

## Options

The `options` object is optional and consists of the following properties:

| Property name        | Default        | Type                                | required |
| -------------------- | -------------- | ----------------------------------- | -------- |
| `prefix`             | `''`           | `string`                            | `false`  |
| `storageType`        | `localStorage` | [StorageType](./src/types.ts#L3)    | `false`  |
| `encAlgorithm`       | `AES`          | [EncAlgorithm](./src/types.ts#L1)   | `false`  |
| `notifyHandler`      | `undefined`    | [NotifyHandler](./src/types.ts#L23) | `false`  |
| `stateManagementUse` | `false`        | `boolean`                           | `false`  |
| `doNotEncryptValues` | `false`        | `boolean`                           | `false`  |
| `doNotParseValues`   | `false`        | `boolean`                           | `false`  |

## Usage

### Conventions

Create a `file` containing the `EncryptStorage` instance in a `utils` folder or folder of your choice. It is recommended to use it as a `singleton` for better use of the library.

> Directory Layout

```
📦 src
 ┣ 📂 utils
 ┃ ┗ 📜 storage.ts
 ┗ 📜 index.ts
 ...
```

### Parameters

_secretKey_: **required** = A string containing at least 10 characters;

**NOTE**: If you are using a `SPA` model (vue, react or angular) prefer to store this information in your application's `.env` file.

_options_: **optional** = An object as described above and which will be shown below;

### CommonJS

```typescript
const { EncryptStorage } = require('encrypt-storage');

// Example of secret_key variable in an .env file
// const encryptStorage = new EncryptStorage(process.env.SECRET_KEY, options);
const encryptStorage = new EncryptStorage('secret-key-value', options);

module.exports = encryptStorage;
```

### JS Import (ES6+)

```typescript
import { EncryptStorage } from 'encrypt-storage';

// Example of secret_key variable in an .env file
// const encryptStorage = new EncryptStorage(process.env.SECRET_KEY, options);
export const encryptStorage = new EncryptStorage('secret-key-value', options);
```

### Multiple instances

To use `multiple instances`, it is `strictly necessary` to pass the `prefix` to `all` of them. As shown below:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage1 = new EncryptStorage('secret-key-value', {
  prefix: '@instance1',
});

export const encryptStorage2 = new EncryptStorage('secret-key-value', {
  prefix: '@instance2',
});

encryptStorage1.setItem('any-key', 'any-value');
encryptStorage2.setItem('any-key', 'any-value');
```

in your `storage`:

| Key                  | Value                                      |
| -------------------- | ------------------------------------------ |
| `@instance1:any-key` | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |
| `@instance2:any-key` | `U2FsdGVkX1/w4QaIcyq5521ZXB5pqw2KEwOH+`... |

### Options implementation

#### _prefix_

default `''` - is optional and is the prefix of all keys used in the selected storage as shown below:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  prefix: '@example',
});
```

#### _storageType_

default `localStorage` - is the type of storage that will be used, at the moment only `localStorage` and `sessionStorage` are allowed:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  storageType: 'sessionStorage',
});
```

#### _stateManagementUse_

**NOTE**: This property is also `required` for completely `identical` use to the browser's native. Therefore, it will `not` have the native library behavior when `parsing` data to `javascript objects` or type casting such as `'true'` being a `boolean`, `'2'` being a `number`, etc.

default `false` - is a `boolean` value that, when true allows the use of it with `vuex-persist` and `redux-persist`:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  stateManagementUse: true,
});
```

#### _encAlgorithm_

default `AES` - Is the selected encryption algorithm.:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  encAlgorithm: 'Rabbit',
});
```

#### _doNotEncryptValues_

default `false` - This option `NOT` encrypt values, but use those options like `prefix` our `multiple-instances`.:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  doNotEncryptValues: true,
});
```

#### _doNotParseValues_

default `false` - This option `NOT` parse values, but use those options like `prefix` our `multiple-instances`.:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  doNotParseValues: true,
});

encryptStorage.setItem('key', JSON.stringfy({ name: 'John Doe' }));

const value = JSON.parse(encryptStorage.getItem('key')); // { name: 'John Doe' }
```

> NOTE: This option `does not` `JSON.stringify` or `JSON.parse` the data, making `return typing` useless or unnecessary.
> **This is similar to standard browser behavior.**

#### _notifyHandler_

default `undefined` - is a `function` that is `called` every time another `EncryptStorage function` is `called`. Good for logging API and monitoring `localStorage/sessionStorage`.:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  notifyHandler: (params: NotifyHandlerParams) => console.info({ params }),
});
```

console:

```bash
{
  params: {
    type: 'get'
    key: 'any-key',
    value: 'any-value',
    index: 1,
  }
}
```

**OBS**: Check [NotifyHandlerParams](./src/types.ts#L7) for more information.

### Methods

From here, we will have the following code as the EncryptStorage instance model:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key-value', {
  prefix: '@example',
});
```

#### _setItem_

Add `key` and `encrypted` value to selected `storage`.

```typescript
encryptStorage.setItem('token', 'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2');
encryptStorage.setItem(
  'token-not-encrypted',
  'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2',
  true,
);
```

in your `storage`:

| Key                            | Value                                      |
| ------------------------------ | ------------------------------------------ |
| `@example:token`               | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |
| `@example:token-not-encrypted` | `edbe38e0-748a-49c8-9f8f-b68f38dbe5a2`     |

#### _setMultipleItems_

Add `keys` and `encrypted` values to selected `storage`.

```typescript
encryptStorage.setMultipleItems([
  ['token', 'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2'],
  [
    'user',
    {
      id: '123456',
      name: 'John Doe',
    },
  ],
]);
```

in your `storage`:

| Key              | Value                                      |
| ---------------- | ------------------------------------------ |
| `@example:token` | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |
| `@example:user`  | `U2FsdGVkX1/tT67hnb*\afcb`...              |

#### _getItem_

Returns the value `decrypted` or `undefined` by the `key` passed by `parameter`. Default type is `any`;

**NOTE**: It is possible to pass a `generics` (typescript case) to obtain a consistent and typed return for better use in the `typescript`.

```typescript
const value = encryptStorage.getItem<T = any>('token');
const value2 = encryptStorage.getItem<T = any>('token-not-encrypted', true);
```

result of `getItem`:

```typescript
const value = 'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2';
const value2 = 'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2';
```

#### _getMultipleItems_

Returns the key value pairs `decrypted` or `undefined` by the `keys` passed by `parameter`.;

```typescript
const value = encryptStorage.getMultipleItems(['token', 'user', 'any-key']);
```

result of `getMultipleItems`:

```typescript
const value = {
  token: 'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2',
  user: {
    id: '123456',
    name: 'John Doe',
  },
  'any-key': undefined,
};
```

#### _removeItem_

Remove item from selected `storage`.

in your `storage`:

| Key              | Value                                      |
| ---------------- | ------------------------------------------ |
| `@example:token` | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
encryptStorage.removeItem('token');
```

now in your `storage`:

| Key | Value |
| --- | ----- |
| ` ` | ` `   |

#### _removeMultipleItems_

Remove items from selected `storage`.

in your `storage`:

| Key              | Value                                      |
| ---------------- | ------------------------------------------ |
| `@example:token` | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |
| `@example:user`  | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
encryptStorage.removeMultipleItems(['token', 'user']);
```

now in your `storage`:

| Key | Value |
| --- | ----- |
| ` ` | ` `   |

#### _getItemFromPattern_

Returns an `object` containing the `original` keys (no prefix) and `decrypted` values or `undefined` when no value found.

in your `storage`:

| Key                          | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `@example:fruit:apple`       | `U2FsdGVkX1/2KEwOH+w4QaIc`                 |
| `@example:fruit:grape`       | `U2FsdGVkX1/yq5521ZXB5pqw`                 |
| `@example:vegetable:lettuce` | `U2FsdGVkX1/tT67hnb*\afcb`                 |
| `@example:token`             | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
const values = encryptStorage.getItemFromPattern('fruit');
```

result of `getItemFromPattern`:

```typescript
const values = {
  'fruit:apple': 'apple',
  'fruit:grape': 'grape',
};
```

#### _removeItemFromPattern_

Removes `all` items that have the `pattern` passed by `parameter` from the selected `storage`.

in your `storage`:

| Key                          | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `@example:fruit:apple`       | `U2FsdGVkX1/2KEwOH+w4QaIc`                 |
| `@example:fruit:grape`       | `U2FsdGVkX1/yq5521ZXB5pqw`                 |
| `@example:vegetable:lettuce` | `U2FsdGVkX1/tT67hnb*\afcb`                 |
| `@example:token`             | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
encryptStorage.removeItemFromPattern('fruit');
```

now in your `storage`:

| Key                          | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `@example:vegetable:lettuce` | `U2FsdGVkX1/tT67hnb*\afcb`                 |
| `@example:token`             | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

#### _key_

Returns the `key` corresponding to the `index` passed by `parameter` or `null`.

in your `storage`:

| Key                          | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `@example:vegetable:lettuce` | `U2FsdGVkX1/tT67hnb*\afcb`                 |
| `@example:token`             | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
const key = encryptStorage.key(0);
```

result of `key`:

```bash
'@example:vegetable:lettuce'
```

#### _length_

Returns the `amount` of values from the selected `storage`.

in your `storage`:

| Key                          | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `@example:vegetable:lettuce` | `U2FsdGVkX1/tT67hnb*\afcb`                 |
| `@example:token`             | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
const length = encryptStorage.length;
```

result of `length`:

```bash
2
```

#### _clear_

Removes `all` keys and values from the selected `storage`.

in your `storage`:

| Key                          | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `@example:vegetable:lettuce` | `U2FsdGVkX1/tT67hnb*\afcb`                 |
| `@example:token`             | `U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
encryptStorage.clear();
```

now in your `storage`:

| Key | Value |
| --- | ----- |
| ` ` | ` `   |

#### _encryptString_

Encrypts a `string` passed by `parameter`.

```typescript
const value = encryptStorage.encryptString('John Doe');
```

result of `encryptString`:

```typescript
const value = 'U2FsdGVkX1/tT67hnb*afcb';
```

#### _decryptString_

Decrypts a `string` passed by `parameter`.

```typescript
const value = encryptStorage.decryptString('U2FsdGVkX1/tT67hnb*afcb');
```

result of `decryptString`:

```typescript
const value = 'John Doe';
```

#### _encryptValue_

Encrypts a `value` passed by `parameter`.

```typescript
const value = encryptStorage.encryptValue({
  id: '123456',
  name: 'John Doe',
});
```

result of `encryptValue`:

```typescript
const value = 'U2FsdGVkX1/tT67hnb*afcb';
```

#### _decryptValue_

Decrypts a `string` passed by `parameter`.

```typescript
// Using typescript
interface User {
  id: string;
  name: string;
}

const value = encryptStorage.decryptValue<User>('U2FsdGVkX1/tT67hnb*afcb');
```

result of `decryptValue`:

```typescript
const value = {
  id: '123456',
  name: 'John Doe',
};
```

#### _hash_

Encrypts a `string` passed by `parameter` with `SHA256` encryptation.

```typescript
const value = encryptStorage.hash('John Doe');
```

result of `hashed value`:

```typescript
const value =
  '52bec733f066a11182798f4defec648ea00e374a1cda73111a443b295fd8e028';
```

#### _md5Hash_

Encrypts a `string` passed by `parameter` with `MD5` encryptation.

```typescript
const value = encryptStorage.md5Hash('John Doe');
```

result of `hashed value`:

```typescript
const value = '284e512750fb7d41f1cc5284a2c56a13';
```

### NextJS

When used in NextJS, validation must be done.

example:

```typescript
// utils/storage.(ts|js)
import { EncryptStorage } from 'encrypt-storage';

const encryptStorage = (): EncryptStorage | null => {
  const isInClientSide =
    typeof window !== 'undefined' && typeof window?.self !== 'undefined';

  if (isInClientSide) {
    return new EncryptStorage(
      String(process.env.NEXT_PUBLIC_STORAGE_SECRET),
      // options,
    );
  }

  return null;
};
```

usage:

```typescript
'use client';
import { encryptStorage } from '../utils/storage.ts';

// ...rest of code
encryptStorage()?.setItem('any-key', { name: 'John Doe', age: 40 });
```

### AsyncEncryptStorage

EncryptStorage can also be used asynchronously, simply using its corresponding version already exported by the library.

**NOTE**: This functionality has its usefulness revealed in the context of redux-persist, shown below.

example:

```typescript
import { AsyncEncryptStorage } from 'encrypt-storage';

export const encryptStorage = new AsyncEncryptStorage('secret-key-value', options);

async function getDecryptedValue('key'): Promise<any | undefined> {
  const value = await encryptStorage.getItem('key');
}
```

### AWS Amplify

In the case of `aws-amplify`, if you want to use the facility of not needing to use `JSON.parse` in the rest of the application, prefer to create an instance within the `amplify` configuration file, as follows:

```typescript
import Amplify from 'aws-amplify';
import { EncryptStorage } from 'encrypt-storage';

const encryptStorage = new EncryptStorage('secret-key-value', {
  ...,
  stateManagementUse: true,
});

...

Amplify.configure({
  Auth: {
    ...,
    storage: encryptStorage,
  },
});
```

### State Management Persisters

This library can be used to encrypt data from `state management persisters` like [vuex-persist](https://www.npmjs.com/package/vuex-persist), [redux-persist](https://www.npmjs.com/package/redux-persist) and [pinia-plugin-persist](https://www.npmjs.com/package/pinia-plugin-persist). Below are their respective implementations:

**NOTE**: the `stateManagementUse` option must be used in the `EncryptStorage` instance to work `correctly`.

#### _vuex-persist_

```typescript
import VuexPersistence from 'vuex-persist';

import { encryptStorage } from 'path/to/encryptStorage';

const vuexLocal = new VuexPersistence<RootState>({
  storage: encryptStorage,
});
```

#### _redux-persist_

```typescript
// ...
import { AsyncEncryptStorage } from 'encrypt-storage';

export const encryptStorage = new AsyncEncryptStorage('secret-key-value', options);

const persistConfig = {
  key: 'root',
  storage: encryptStorage,
  whitelist: ['navigation'],
  ...
};
```

#### _pinia-plugin-persist_

```typescript
// ...
import { encryptStorage } from 'path/to/encryptStorage';

export const useUserStore = defineStore('storeUser', {
  state() {
    return {
      firstName: 'S',
      lastName: 'L',
      accessToken: 'xxxxxxxxxxxxx',
    };
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: encryptStorage,
        paths: ['accessToken'],
      },
    ],
  },
});
```

#### _pinia-plugin-persistedstate_

```typescript
import { defineStore } from 'pinia'
import { encryptStorage } from 'path/to/encryptStorage';

export const useStore = defineStore('store', {
  state: () => ({
    return: {
      first: 'John',
      last: 'Doe',
      accessToken: 'xxxxxxxxxxxxx'.
    },
  }),
  persist: {
    storage: encryptStorage,
    paths: ['accessToken'],
  },
});
```

# License

[MIT License](/LICENSE)
