import type {
  AsyncCookieInterface,
  GetFromPatternOptions,
  RemoveFromPatternOptions,
  SetItemWithTTLParams,
} from './common.ts';

export interface EncryptStorageCryptoWebApiInterface {
  /**
   * `setItem` - Is the function to be set `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
   * @return {void} `void`
   * @example
   * await encryptStorage.setItem('any_key', {key: 'value', another_key: 2});
   * await encryptStorage.setItem('any_key', 'any value');
   */
  setItem(key: string, value: any, doNotEncrypt?: boolean): Promise<void>;
  /**
   * `setItemWithTTL` - Is the function to set an `safeItem` with `ttl` in `selected storage`
   * @param {SetItemWithTTLParams} params - Is de `params` of function.
   * @return {Promise<void>} `Promise<void>`
   * @example
   * await encryptStorage.setItemWithTTL({
   *    key: 'any_key',
   *    value: { key: 'value', another_key: 2 },
   *    ttl: 60, // in seconds or Date
   * });
   */
  setItemWithTTL?: (params: SetItemWithTTLParams) => Promise<void>;

  /**
   * `setMultipeItems` - Is the function to be set `safeItem` in `selected storage`
   * @param {[string, any][]} param - .
   * @param {any} value - It's an `array` of `tuples` to be set at once...
   * @return {Promise<void>} `Promise<void>`
   * @example
   * await encryptStorage.setItem(['any_key', {key: 'value', another_key: 2}]);
   * await encryptStorage.setItem(['any_key', 'any value']);
   */
  setMultipleItems(
    param: [string, any][],
    doNotEncrypt?: boolean,
  ): Promise<void>;

  /**
   * `hash` - Is the function to be `hash` value width SHA256 encryptation
   * @param {any} value - Value to be `hashed`, the same being a `string`.
   * @return {Promise<string>} `hashed Promise<string>`
   * @example
   * await encryptStorage.hash('any_string');
   */
  hash(value: string): Promise<string>;

  /**
   * `getItem` - Is the function to be get `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {Promise<string | DataType | undefined>} - Returns a formatted value when the same is an object or string when not.
   * Returns `Promise<undefined>` when value not exists.
   * @example
   * await encryptStorage.getItem('any_key'); -> `{key: 'value', another_key: 2}`
   * await encryptStorage.getItem('any_key'); -> `'any value'`
   */
  getItem<DataType = any>(
    key: string,
    doNotDecrypt?: boolean,
  ): Promise<string | DataType | undefined>;

  /**
   * `getMulpleItems` - Is the function to be get `safeItems` in `selected storage`
   * @param {string[]} keys - Is the keys of `data` in `selected storage`.
   * @return {Promise<Record<string, any> | undefined>} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @example
   * await encryptStorage.getMultipleItems(['any_key']); -> `{any_key: {key: 'value', another_key: 2}}`
   * await encryptStorage.getMultipleItems(['any_key']); -> `{any_key: 'any value'}`
   */
  getMultipleItems(
    keys: string[],
    doNotDecrypt?: boolean,
  ): Promise<Record<string, any> | undefined>;

  /**
   * `removeItem` - Is the function to be remove `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {Promise<void>} `Promise<void>`.
   * @example
   * encryptStorage.removeItem('any_key');
   */
  removeItem(key: string): void;

  /**
   * `removeMultipleItems` - Is the function to be remove `safeItems` in `selected storage`
   * @param {string[]} keys - Is the keys of `data` in `selected storage`.
   * @return {void} `void`.
   * @example
   * encryptStorage.removeMultipleItems(['any_key_1'm 'any_key_2']);
   */
  removeMultipleItems(keys: string[]): void;

  /**
   * `getItemFromPattern` - Is the function to be get `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @return {Promise<any | Record<string, any> | undefined>}
   * Returns `Promise<any | Record<string, any> | undefined>`.
   * @example
   * // itemKey = '12345678:user'
   * // another itemKey = '12345678:item'
   * await encryptStorage.getItemFromPattern('12345678'); // -> {'12345678:user': 'value', '12345678:item': 'otherValue'}
   */
  getItemFromPattern(
    pattern: string,
    options?: GetFromPatternOptions,
  ): Promise<any | Record<string, any> | undefined>;

  /**
   * `removeItemFromPattern` - Is the function to be remove `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @return {void}
   * Returns `void`.
   * @example
   * // itemKey = '12345678:user'
   * // another itemKey = '12345678:item'
   * encryptStorage.removeItem('12345678'); // -> item removed from `selected storage`
   */
  removeItemFromPattern(
    pattern: string,
    options?: RemoveFromPatternOptions,
  ): void;

  /**
   * `clear` - Clear all selected storage
   * @return {void} `void`
   * @example
   * encryptStorage.clear();
   */
  clear(): void;

  /**
   * `key` - Return a `key` in selected storage index or `null`
   * @param {number} index - Index of `key` in `selected storage`
   * @returns {string | null} `string | null`
   * @example
   * await encryptStorage.key(0); // -> 'any_key'
   */
  key(index: number): string | null;

  /**
   * `encryptValue` - Is the function to be `encrypt` any value and return encrypted value
   * @param {string} value - A `value|object|array` to be encrypted.
   * @return {Promise<string>} `Promise<string>`
   * @example
   * await encryptStorage.encryptString('any_string'); // -> 'encrypted value'
   */
  encryptValue(value: any): Promise<string>;

  /**
   * `decryptString` - Is the function to be `decrypt` any value encrypted by `encryptValue` and return decrypted value
   * @param {string} value - A `value|object|array` to be decrypted.
   * @return {Promise<DataType|any>} `Promise<DataType|any>`
   * Returns `string`.
   * @example
   * await encryptStorage.decryptString('any_value'); // -> '{value: "decrypted value"}'
   */
  decryptValue<DataType = any>(value: string): Promise<DataType | any>;

  cookie: AsyncCookieInterface;
}
