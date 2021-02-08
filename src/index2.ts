import { AES, enc } from 'crypto-js';

interface EncrytStorageOptions {
  prefix?: string;
  storageType?: 'localStorage' | 'sessionStorage';
}

export interface EncryptStorage extends Storage {
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
   * `getItem` - Is the faction to be get `safeItem` in `localStorage`
   * @param {string} key - Is the key of `data` in `localStorage`.
   * @return {string | any | undefined} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @usage
   * 		getItem('any_key') -> `{key: 'value', another_key: 2}`
   * 		getItem('any_key') -> `'any value'`
   */
  getItem(key: string): string | any | undefined;

  /**
   * `removeItem` - Is the faction to be remove `safeItem` in `localStorage`
   * @param {string} key - Is the key of `data` in `localStorage`.
   * @return {void}
   * Returns `void`.
   * @usage
   * 		removeItem('any_key')
   */
  removeItem(key: string): void;

  /**
   * `clear` - Clear all selectedStorage
   */
  clear(): void;

  /**
   * `key` - Return a `key` in selectedStorage index or `null`
   * @param {number} index - Index of `key` in `selectedStorage`
   */
  key(index: number): string | null;
}

/**
 * EncritStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
 *
 * @param {string} secretKey - A secret to encrypt data
 * @param {EncrytStorageOptions} options - A optional settings to set encryptData or select `sessionStorage` to browser storage
 */
export default function EncritStorage(
  secretKey: string,
  { prefix = '', storageType = 'localStorage' }: EncrytStorageOptions,
): EncryptStorage {
  const storage: Storage = window[storageType];

  return {
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

        try {
          return JSON.parse(decryptedValue);
        } catch (error) {
          return decryptedValue;
        }
      }

      return undefined;
    },
    removeItem(key: string): void {
      storage.removeItem(key);
    },
    clear(): void {
      this.storage.clear();
    },
    key(index: number): string | null {
      return this.storage.key(index);
    },
    length: storage.length,
  };

  /**
   * `key` - Return a `key` in selectedStorage index or `null`
   * @param {number} index - Index of `key` in `selectedStorage`
   */
}
