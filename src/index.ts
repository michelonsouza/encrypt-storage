import { AES, enc } from 'crypto-js';

/**
 * SafeStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
 */
export default class SafeStorage {
  private storage: Storage;

  private privateProps = new WeakMap();

  /**
   * Constructor
   * @param {string} secretKey - Encryptation key. Required
   * @param {string} prefix - Prefix used in storageKey. Defaults `undefined` EX: `@prefix:key`
   * @param {string} storageType - Storage type you prefer save your data. Only in `localStorage` and `sessionStorage`. Defaults `localStorage`
   */
  constructor(
    secretKey: string,
    private readonly prefix: string = '',
    storageType: 'localStorage' | 'sessionStorage' = 'localStorage',
  ) {
    this.storage = window[storageType];
    this.privateProps.set(this, { secretKey });
  }

  /**
   * `setItem` - Is the function to be set `safeItem` in `selected storage`
   * @param {string} key - Is the key of `data` in `selected storage`.
   * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
   * @return {void} `void`
   * @usage
   * 		setItem('any_key', {key: 'value', another_key: 2})
   * 		setItem('any_key', 'any value')
   */
  setItem(key: string, value: any): void {
    const storageKey = this.prefix ? `${this.prefix}:${key}` : key;
    const valueToString =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
    const encryptedValue = AES.encrypt(
      valueToString,
      this.privateProps.get(this).secretKey,
    ).toString();

    this.storage.setItem(storageKey, encryptedValue);
  }

  /**
   * `getItem` - Is the faction to be get `safeItem` in `localStorage`
   * @param {string} key - Is the key of `data` in `localStorage`.
   * @return {string | any | undefined} - Returns a formatted value when the same is an object or string when not.
   * Returns `undefined` when value not exists.
   * @usage
   * 		getItem('any_key') -> `{key: 'value', another_key: 2}`
   * 		getItem('any_key') -> `'any value'`
   */
  getItem(key: string): string | any | undefined {
    const item = this.storage.getItem(key);

    if (item) {
      const decryptedValue = AES.decrypt(
        item,
        this.privateProps.get(this).secretKey,
      ).toString(enc.Utf8);

      try {
        return JSON.parse(decryptedValue);
      } catch (error) {
        return decryptedValue;
      }
    }

    return undefined;
  }

  /**
   * `removeItem` - Is the faction to be remove `safeItem` in `localStorage`
   * @param {string} key - Is the key of `data` in `localStorage`.
   * @return {void}
   * Returns `void`.
   * @usage
   * 		removeItem('any_key')
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * `clear` - Clear all selectedStorage
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * `key` - Return a `key` in selectedStorage index or `null`
   * @param {number} index - Index of `key` in `selectedStorage`
   */
  key(index: number): string | null {
    return this.storage.key(index);
  }
}
