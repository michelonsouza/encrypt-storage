import {
  CookieOptions,
  RemoveCookieOptions,
  RemoveMultipleCookiesParams,
  RemoveFromPatternOptions,
  GetFromPatternOptions,
} from '@/@types/types';

export interface EncryptStorageInterface extends Storage {
  /**
   * `setItem` - Is the function to be set `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
   * @param {CookieOptions} cookieOptions - Pass the `cookieOptions` when `storageType` is`cookie`.
   * @return {void} `void`
   * @example
   * encryptStorage.setItem('any_key', {key: 'value', another_key: 2});
   * encryptStorage.setItem('any_key', 'any value');
   */
  setItem(key: string, value: any, cookieOptions?: CookieOptions): void;

  /**
   * `setItemWithTTL` - Is the function to set an `safeItem` with `ttl` in `selected storage`
   * @param {SetItemWithTTLParams} params - Is de `params` of function. Params extends `CookieOptions` and use when `storageType` is`cookie`.
   * @return {void} `void`
   * @example
   * encryptStorage.setItemWithTTL({
   *    key: 'any_key',
   *    value: { key: 'value', another_key: 2 },
   *    ttl: 60, // in milliseconds or Date,
   * });
   */
  // TODO: Implement this function in the future
  // setItemWithTTL(params: SetItemWithTTLParams): void;

  /**
   * `setMultipeItems` - Is the function to be set `safeItem` in `selected storage`
   * @param {[string, any][]} param - It's an `array` of `tuples` to be set at once.
   * @param {CookieOptions} cookieOptions - It's an `array` of `tuples` to be set at once...
   * @return {void} `void`
   * @example
   * encryptStorage.setMultipleItems([['any_key', 'any value']])
   */
  setMultipleItems(param: [string, any][], cookieOptions?: CookieOptions): void;

  /**
   * `hash` - Is the function to be `hash` value width SHA256 encryptation
   * @param {any} value - Value to be `hashed`, the same being a `string`.
   * @return {string} `hashed string`
   * @example
   * encryptStorage.hash('any_string')
   */
  hash(value: string): string;

  /**
   * `md5Hash` - Is the function to be `hash` value width MD5 encryptation
   * @param {any} value - Value to be `hashed`, the same being a `string`.
   * @return {string} `hashed string`
   * @example
   * md5Hash('any_string')
   */
  md5Hash(value: string): string;
  /**
   * `getItem` - Is the function to be get `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {DataType | null} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @example
   * encryptStorage.getItem('any_key') -> `{key: 'value', another_key: 2}`
   * encryptStorage.getItem('any_key') -> `'any value'`
   * encryptStorage.getItem('any_key') -> `null`
   */
  getItem<DataType = string>(
    key: string,
    doNotDecrypt?: boolean,
  ): DataType | null;

  /**
   * `getMulpleItems` - Is the function to be get `safeItems` in `selected storage`
   * @param {string[]} keys - Is the keys of `data` in `selected storage`.
   * @return {Record<string, any> | null} - Returns a formatted value when the same is an object or string when not.
   * Returns `null` when value not exists.
   * @example
   * encryptStorage.getMultipleItems(['any_key']) -> `{any_key: {key: 'value', another_key: 2}}`
   * encryptStorage.getMultipleItems(['any_key']) -> `{any_key: 'any value'}`
   * encryptStorage.getMultipleItems(['any_key']) -> `null`
   */
  getMultipleItems(
    keys: string[],
    doNotDecrypt?: boolean,
  ): Record<string, any> | null;

  /**
   * `getItemFromPattern` - Is the function to be get `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * * @param {GetFromPatternOptions} options - Options extends `CookieOptions` and add `exact` and `multiple` properties.
   * @return {any | Record<string, any> | null}
   * Returns `Record<string, any> | any | null`.
   * @example
   * // itemKey = '12345678:user'
   * // another itemKey = '12345678:item'
   * encryptStorage.getItemFromPattern('12345678'); // -> {'12345678:user': 'value', '12345678:item': 'otherValue'}
   */
  getItemFromPattern(
    pattern: string,
    options?: GetFromPatternOptions,
  ): Record<string, any> | any | null;

  /**
   * `removeItem` - Is the function to be remove `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {RemoveCookieOptions} cookieOptions - use when `storageType` is`cookie`.
   * @return {void}
   * Returns `void`.
   * @example
   * encryptStorage.removeItem('any_key')
   */
  removeItem(key: string, cookieOptions?: RemoveCookieOptions): void;

  /**
   * `removeMultipleItems` - Is the function to be remove `safeItems` in `selected storage`
   * @param {(string | RemoveMultipleCookiesParams)[]} keys - Is the keys of `data` in `selected storage`. When use `cookie storageType`, pass `[string, options?]`.
   * @return {void}
   * Returns `void`.
   * @example
   * encryptStorage.removeMultipleItems(['any_key_1'm 'any_key_2'])
   */
  removeMultipleItems(keys: (string | RemoveMultipleCookiesParams)[]): void;

  /**
   * `removeItemFromPattern` - Is the function to be remove `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @param {RemoveCookieOptions} options - Options extends `CookieOptions` and add `exact` property.
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
   * `clear` - Clear all `selected storageType`.
   * @example
   * encryptStorage.clear();
   */
  clear(cookieKeys?: string[], cookieOptions?: CookieOptions): void;

  /**
   * `key` - Return a `key` in selected storage index or `null`
   * @param {number} index - Index of `key` in `selected storageType`.
   * @example
   * encryptStorage.key(0); // -> 'any_key'
   */
  key(index: number): string | null;

  /**
   *
   * `encryptString` - Is the function to be `encrypt` any string and return encrypted value
   * @param {string} str - A `string` to be encrypted.
   * @return {string} result
   * Returns `string`.
   * @example
   * encryptStorage.encryptString('any_string'); // -> 'encrypted value'
   */
  encryptString(str: string): string;

  /**
   *
   * `decryptString` - Is the function to be `decrypt` any string encrypted by `encryptString` and return decrypted value
   * @param {string} str - A `string` to be decrypted.
   * @return {string} result
   * @example
   * encryptStorage.decryptString('any_string'); // -> 'decrypted value'
   */
  decryptString(str: string): string;

  /**
   * `encryptValue` - Is the function to be `encrypt` any value and return encrypted value
   * @param {string} value - A `value|object|array` to be encrypted.
   * @return {string} result
   * Returns `string`.
   * @example
   * encryptStorage.encryptString('any_string'); // -> 'encrypted value'
   */
  encryptValue(value: any): string;

  /**
   * `decryptValue` - Is the function to be `decrypt` any value encrypted by `encryptValue` and return decrypted value
   * @param {string} value - A `string` to be decrypted.
   * @return {DataType|any} result
   * Returns `string`.
   * @example
   * encryptStorage.decryptValue('any_value'); // -> '{value: "decrypted value"}'
   */
  decryptValue<DataType = any>(value: string): DataType;
}
