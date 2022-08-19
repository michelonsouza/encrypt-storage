export type EncAlgorithm = 'AES' | 'Rabbit' | 'RC4' | 'RC4Drop';

type StorageType = 'localStorage' | 'sessionStorage';

export interface Encryptation {
  encrypt(value: string): string;
  decrypt(value: string): string;
}

export interface EncryptStorageOptions {
  prefix?: string;
  stateManagementUse?: boolean;
  storageType?: StorageType;
  encAlgorithm?: EncAlgorithm;
}

export interface RemoveFromPatternOptions {
  exact?: boolean;
}

export interface GetFromPatternOptions extends RemoveFromPatternOptions {
  multiple?: boolean;
}

export interface EncryptStorageInterface extends Storage {
  /**
   * `setItem` - Is the function to be set `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
   * @return {void} `void`
   * @usage
   * 		setItem('any_key', {key: 'value', another_key: 2})
   * 		setItem('any_key', 'any value')
   */
  setItem(key: string, value: any, doNotEncrypt?: boolean): void;

  /**
   * `getItem` - Is the faction to be get `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {string | any | undefined} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @usage
   * 		getItem('any_key') -> `{key: 'value', another_key: 2}`
   * 		getItem('any_key') -> `'any value'`
   */
  getItem(key: string, doNotDecrypt?: boolean): string | any | undefined;

  /**
   * `removeItem` - Is the faction to be remove `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {void}
   * Returns `void`.
   * @usage
   * 		removeItem('any_key')
   */
  removeItem(key: string): void;

  /**
   * `getItemFromPattern` - Is the function to be get `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @return {any | Record<string, any> | undefined}
   * Returns `void`.
   * @usage
   *    // itemKey = '12345678:user'
   *    // another itemKey = '12345678:item'
   * 		getItemFromPattern('12345678') -> {'12345678:user': 'value', '12345678:item': 'otherValue'}
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
   * @usage
   *    // itemKey = '12345678:user'
   *    // another itemKey = '12345678:item'
   * 		removeItem('12345678') -> item removed from `selected storage`
   */
  removeItemFromPattern(
    pattern: string,
    options?: RemoveFromPatternOptions,
  ): void;

  /**
   * `clear` - Clear all selected storage
   */
  clear(): void;

  /**
   * `key` - Return a `key` in selected storage index or `null`
   * @param {number} index - Index of `key` in `selected storage`
   */
  key(index: number): string | null;

  /**
   * `encryptString` - Is the faction to be `encrypt` any string and return encrypted value
   * @param {string} str - A `string` to be encrypted.
   * @return {string} result
   * Returns `string`.
   * @usage
   * 		encryptString('any_string') -> 'encrypted value'
   */
  encryptString(key: string): string;

  /**
   * `decryptString` - Is the faction to be `decrypt` any string encrypted by `encryptString` and return decrypted value
   * @param {string} str - A `string` to be decrypted.
   * @return {string} result
   * Returns `string`.
   * @usage
   * 		decryptString('any_string') -> 'decrypted value'
   */
  decryptString(key: string): string;
}
