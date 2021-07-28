import { AES, enc } from 'crypto-js';

import { InvalidSecretKeyError } from './errors';

export interface EncryptStorageOptions {
  prefix?: string;
  stateManagementUse?: boolean;
  storageType?: 'localStorage' | 'sessionStorage';
}

export interface EncryptStorageTypes extends Storage {
  /**
   * `setItem` - Is the function to be set `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
   * @return {void} `void`
   * @usage
   * 		setItem('any_key', {key: 'value', another_key: 2})
   * 		setItem('any_key', 'any value')
   */
  setItem(key: string, value: any): void;

  /**
   * `getItem` - Is the faction to be get `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @return {string | any | undefined} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @usage
   * 		getItem('any_key') -> `{key: 'value', another_key: 2}`
   * 		getItem('any_key') -> `'any value'`
   */
  getItem(key: string): string | any | undefined;

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
   * `removeItemFromPattern` - Is the faction to be remove `safeItem` in `selected storage` from `pattern` based
   * @param {string} pattern - Is the pattern existent in keys of `selected storage`.
   * @return {void}
   * Returns `void`.
   * @usage
   *    // itemKey = '12345678:user'
   *    // another itemKey = '12345678:item'
   * 		removeItem('12345678') -> item removed from `selected storage`
   */
  removeItemFromPattern(pattern: string): void;

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

/**
 * EncryptStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
 *
 * @param {string} secretKey - A secret to encrypt data must be contain min of 10 characters
 * @param {EncrytStorageOptions} options - A optional settings to set encryptData or select `sessionStorage` to browser storage
 */
export function EncryptStorage(
  secretKey: string,
  options: EncryptStorageOptions = {},
): EncryptStorageTypes {
  if (secretKey.length < 10) {
    throw new InvalidSecretKeyError();
  }

  const storage: Storage = window[options.storageType || 'localStorage'];
  const prefix = options.prefix || '';
  const stateManagementUse = options.stateManagementUse || false;

  return {
    length: storage.length,
    setItem(key: string, value: any): void {
      const storageKey = prefix ? `${prefix}:${key}` : key;
      const valueToString =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
      const encryptedValue = AES.encrypt(valueToString, secretKey).toString();

      storage.setItem(storageKey, encryptedValue);
    },
    getItem(key: string): string | any | undefined {
      const storageKey = prefix ? `${prefix}:${key}` : key;
      const item = storage.getItem(storageKey);

      if (item) {
        const decryptedValue = AES.decrypt(item, secretKey).toString(enc.Utf8);

        if (stateManagementUse) {
          return decryptedValue;
        }

        try {
          return JSON.parse(decryptedValue);
        } catch (error) {
          return decryptedValue;
        }
      }

      return undefined;
    },
    removeItem(key: string): void {
      const storageKey = prefix ? `${prefix}:${key}` : key;
      storage.removeItem(storageKey);
    },

    removeItemFromPattern(pattern: string): void {
      const storageKeys = Object.keys(storage);
      const filteredKeys = storageKeys.filter(key => key.includes(pattern));

      filteredKeys.forEach(key => {
        storage.removeItem(key);
      });
    },
    clear(): void {
      storage.clear();
    },
    key(index: number): string | null {
      return storage.key(index);
    },
    encryptString(str: string): string {
      const encryptedValue = AES.encrypt(str, secretKey).toString();

      return encryptedValue;
    },
    decryptString(str: string): string {
      const decryptedValue = AES.decrypt(str, secretKey).toString(enc.Utf8);

      return decryptedValue;
    },
  };
}

export default EncryptStorage;
