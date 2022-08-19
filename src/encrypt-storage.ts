import { InvalidSecretKeyError } from './errors';
import {
  Encryptation,
  GetFromPatternOptions,
  EncryptStorageOptions,
  EncryptStorageInterface,
  RemoveFromPatternOptions,
} from './types';
import { getEncriptation } from './utils';

const secret = new WeakMap();
export class EncryptStorage implements EncryptStorageInterface {
  readonly #encriptation: Encryptation;

  private readonly storage: Storage;

  readonly #prefix: string;

  readonly #stateManagementUse: boolean;

  /**
   * EncryptStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
   *
   * @param {string} secretKey - A secret to encrypt data must be contain min of 10 characters
   * @param {EncrytStorageOptions} options - A optional settings to set encryptData or select `sessionStorage` to browser storage
   */
  constructor(secretKey: string, options?: EncryptStorageOptions) {
    if (secretKey.length < 10) {
      throw new InvalidSecretKeyError();
    }

    const {
      storageType = 'localStorage',
      prefix = '',
      stateManagementUse = false,
      encAlgorithm = 'AES',
    } = options || {};

    secret.set(this, secretKey);

    this.storage = window[storageType];
    this.#prefix = prefix;
    this.#stateManagementUse = stateManagementUse;
    this.#encriptation = getEncriptation(encAlgorithm, secret.get(this));
  }

  #getKey(key: string): string {
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  public get length() {
    return this.storage.length || 0;
  }

  public setItem(key: string, value: any, doNotEncrypt?: boolean): void {
    const storageKey = this.#getKey(key);
    const valueToString =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
    const encryptedValue = doNotEncrypt
      ? valueToString
      : this.#encriptation.encrypt(valueToString);

    this.storage.setItem(storageKey, encryptedValue);
  }

  public getItem<T = any>(key: string, doNotDecrypt?: boolean): T | undefined {
    const storageKey = this.#getKey(key);
    const item = this.storage.getItem(storageKey);

    if (item) {
      const decryptedValue = doNotDecrypt
        ? item
        : this.#encriptation.decrypt(item);

      if (this.#stateManagementUse) {
        return decryptedValue as unknown as T;
      }

      try {
        return JSON.parse(decryptedValue) as T;
      } catch (error) {
        return decryptedValue as unknown as T;
      }
    }

    return undefined;
  }

  public removeItem(key: string): void {
    const storageKey = this.#getKey(key);
    this.storage.removeItem(storageKey);
  }

  public removeItemFromPattern(
    pattern: string,
    options: RemoveFromPatternOptions = {} as RemoveFromPatternOptions,
  ): void {
    const { exact = false } = options;
    const storageKeys = Object.keys(this.storage);
    const filteredKeys = storageKeys.filter(key => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    filteredKeys.forEach(key => {
      this.storage.removeItem(key);
    });
  }

  public getItemFromPattern(
    pattern: string,
    options: GetFromPatternOptions = {} as GetFromPatternOptions,
  ): Record<string, any> | undefined {
    const { multiple = true, exact = false } = options;
    const keys = Object.keys(this.storage).filter(key => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    if (!keys.length) {
      return undefined;
    }

    if (!multiple) {
      const [key] = keys;

      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      return this.getItem(formattedKey);
    }

    const value = keys.reduce((accumulator: Record<string, any>, key) => {
      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      accumulator[formattedKey] = this.getItem(formattedKey);

      return accumulator;
    }, {});

    return value;
  }

  public clear(): void {
    this.storage.clear();
  }

  public key(index: number): string | null {
    return this.storage.key(index) || null;
  }

  public encryptString(str: string): string {
    const encryptedValue = this.#encriptation.encrypt(str);

    return encryptedValue;
  }

  public decryptString(str: string): string {
    const decryptedValue = this.#encriptation.decrypt(str);

    return decryptedValue;
  }
}

export default EncryptStorage;
