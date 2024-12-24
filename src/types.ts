export type EncAlgorithm = 'AES' | 'Rabbit' | 'RC4' | 'RC4Drop';

type StorageType = 'localStorage' | 'sessionStorage';

type ChangeType =
  | 'set'
  | 'set:cookie'
  | 'get'
  | 'get:cookie'
  | 'getMultiple'
  | 'setMultiple'
  | 'remove'
  | 'remove:cookie'
  | 'removeMultiple'
  | 'clear'
  | 'length'
  | 'key';

export interface NotifyHandlerParams {
  type: ChangeType;
  key?: string | string[];
  value?: any;
  index?: number;
}

export type NotifyHandler = (params: NotifyHandlerParams) => void;

export interface Encryptation {
  encrypt(value: string): string;
  decrypt(value: string): string;
}

export interface EncryptStorageOptions {
  prefix?: string;
  stateManagementUse?: boolean;
  storageType?: StorageType;
  encAlgorithm?: EncAlgorithm;
  doNotEncryptValues?: boolean;
  doNotParseValues?: boolean;
  notifyHandler?: NotifyHandler;
}

export interface RemoveFromPatternOptions {
  exact?: boolean;
}

export interface GetFromPatternOptions extends RemoveFromPatternOptions {
  multiple?: boolean;
  doNotDecrypt?: boolean;
}

export interface SetItemWithTTLParams {
  key: string;
  value: any;
  doNotEncrypt?: boolean;
  /**
   * in seconds
   */
  ttl: number | Date;
}

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface RemoveCookieOptions {
  path?: string;
  domain?: string;
}
export interface CookieInterface {
  set(key: string, value: any, options?: CookieOptions): void;
  get<DataType = any>(key: string): DataType | null;
  remove(key: string, options?: RemoveCookieOptions): void;
}

export interface EncryptStorageInterface extends Storage {
  /**
   * `setItem` - Is the function to be set `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
   * @return {void} `void`
   * @example
   * encryptStorage.setItem('any_key', {key: 'value', another_key: 2});
   * encryptStorage.setItem('any_key', 'any value');
   */
  setItem(key: string, value: any, doNotEncrypt?: boolean): void;
  /**
   * `setItemWithTTL` - Is the function to set an `safeItem` with `ttl` in `selected storage`
   * @param {SetItemWithTTLParams} params - Is de `params` of function.
   * @return {void} `void`
   * @example
   * encryptStorage.setItemWithTTL({
   *    key: 'any_key',
   *    value: { key: 'value', another_key: 2 },
   *    ttl: 60, // in seconds or Date
   * });
   */
  setItemWithTTL?: (params: SetItemWithTTLParams) => void;

  /**
   * `setMultipeItems` - Is the function to be set `safeItem` in `selected storage`
   * @param {[string, any][]} param - .
   * @param {any} value - It's an `array` of `tuples` to be set at once...
   * @return {void} `void`
   * @example
   * encryptStorage.setItem(['any_key', {key: 'value', another_key: 2}])
   * encryptStorage.setItem(['any_key', 'any value'])
   */
  setMultipleItems(param: [string, any][], doNotEncrypt?: boolean): void;

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
   * @return {string | any | undefined} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @example
   * encryptStorage.getItem('any_key') -> `{key: 'value', another_key: 2}`
   * encryptStorage.getItem('any_key') -> `'any value'`
   */
  getItem(key: string, doNotDecrypt?: boolean): string | any | undefined;

  /**
   * `getMulpleItems` - Is the function to be get `safeItems` in `selected storage`
   * @param {string[]} keys - Is the keys of `data` in `selected storage`.
   * @return {Record<string, any> | undefined} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @example
   * encryptStorage.getMultipleItems(['any_key']) -> `{any_key: {key: 'value', another_key: 2}}`
   * encryptStorage.getMultipleItems(['any_key']) -> `{any_key: 'any value'}`
   */
  getMultipleItems(keys: string[], doNotDecrypt?: boolean): Record<string, any>;

  /**
   * `removeItem` - Is the function to be remove `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {void}
   * Returns `void`.
   * @example
   * encryptStorage.removeItem('any_key')
   */
  removeItem(key: string): void;

  /**
   * `removeMultipleItems` - Is the function to be remove `safeItems` in `selected storage`
   * @param {string[]} keys - Is the keys of `data` in `selected storage`.
   * @return {void}
   * Returns `void`.
   * @example
   * encryptStorage.removeMultipleItems(['any_key_1'm 'any_key_2'])
   */
  removeMultipleItems(keys: string[]): void;

  /**
   * `getItemFromPattern` - Is the function to be get `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @return {any | Record<string, any> | undefined}
   * Returns `void`.
   * @example
   * // itemKey = '12345678:user'
   * // another itemKey = '12345678:item'
   * encryptStorage.getItemFromPattern('12345678'); // -> {'12345678:user': 'value', '12345678:item': 'otherValue'}
   */
  getItemFromPattern(
    pattern: string,
    options?: GetFromPatternOptions,
  ): Record<string, any> | any | undefined;

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
   * @example
   * encryptStorage.clear();
   */
  clear(): void;

  /**
   * `key` - Return a `key` in selected storage index or `null`
   * @param {number} index - Index of `key` in `selected storage`
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
   * `decryptString` - Is the function to be `decrypt` any value encrypted by `encryptValue` and return decrypted value
   * @param {string} value - A `value|object|array` to be decrypted.
   * @return {T|any} result
   * Returns `string`.
   * @example
   * encryptStorage.decryptString('any_value'); // -> '{value: "decrypted value"}'
   */
  decryptValue<DataType = any>(key: string): DataType;

  cookie: CookieInterface;
}
