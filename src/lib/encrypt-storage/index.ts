import { InvalidSecretKeyError } from '@/errors';
import {
  getEncryptation,
  hashSHA256,
  hashMD5,
  setCookie,
  getCookie,
  removeCookie,
  clearCookies,
  getCookieKey,
  getCookieLength,
  getCookieKeys,
} from '@/utils';

import { EncryptStorageInterface } from '@/@types/interfaces';
import {
  StorageType,
  Encryptation,
  NotifyHandler,
  CookieOptions,
  EncryptStorageOptions,
  GetFromPatternOptions,
  RemoveFromPatternOptions,
  RemoveMultipleCookiesParams,
} from '@/@types/types';

const secret = new WeakMap();

export class EncryptStorage implements EncryptStorageInterface {
  readonly #encryptation: Encryptation;

  public readonly storage: Storage | null;

  #clientKeys: string[] = [];

  #clientKeysToRemoveOptions: Record<string, CookieOptions> = {};

  readonly #storageType: StorageType;

  readonly #prefix: string;

  #multiple = false;

  readonly #stateManagementUse: boolean;

  readonly #doNotEncryptValues: boolean;

  readonly #doNotParseValues: boolean;

  readonly #notifyHandler: NotifyHandler | undefined;

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
      doNotEncryptValues = false,
      notifyHandler,
      doNotParseValues = false,
    } = options || {};

    secret.set(this, secretKey);

    this.#prefix = prefix;
    this.#notifyHandler = notifyHandler;
    this.#stateManagementUse = stateManagementUse;
    this.#doNotEncryptValues = doNotEncryptValues;
    this.#doNotParseValues = doNotParseValues;
    this.#encryptation = getEncryptation(encAlgorithm, secret.get(this));
    this.#storageType = storageType;
    this.storage =
      typeof window === 'object' && storageType !== 'cookies'
        ? window[storageType]
        : null;
  }

  #getKey(key: string): string {
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  public get length() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0;
    }
    const value =
      this.storage && this.#storageType !== 'cookies'
        ? this.storage.length
        : getCookieLength();
    const type = this.#storageType === 'cookies' ? 'length:cookie' : 'length';

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type,
        value,
      });
    }

    return value;
  }

  public clear(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const type = this.#storageType === 'cookies' ? 'clear:cookie' : 'clear';

    if (this.#storageType === 'cookies') {
      clearCookies(this.#clientKeys, this.#clientKeysToRemoveOptions);
    } else {
      this.storage?.clear();
    }

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type,
      });
    }
  }

  public key(index: number): string | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return null;
    }

    const type = this.#storageType === 'cookies' ? 'key:cookie' : 'key';
    let value: string | null = null;

    if (this.#storageType === 'cookies') {
      value = getCookieKey(index);
    } else {
      value = this.storage?.key(index) || null;
    }

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type,
        index,
        value,
      });
    }

    return value;
  }

  public setItem(
    key: string,
    value: any,
    cookieOptions: CookieOptions = {},
  ): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const { doNotEncrypt } = cookieOptions;
    const encryptValues = this.#doNotEncryptValues || doNotEncrypt;
    const storageKey = this.#getKey(key);

    this.#clientKeys = Array.from(new Set([...this.#clientKeys, storageKey]));
    this.#clientKeysToRemoveOptions[storageKey] = cookieOptions;

    let valueToString =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (this.#doNotParseValues) {
      valueToString = value;
    }

    const type = this.#storageType === 'cookies' ? 'set:cookie' : 'set';
    const encryptedValue = encryptValues
      ? valueToString
      : this.#encryptation.encrypt(valueToString);

    if (this.#storageType === 'cookies') {
      setCookie(storageKey, encryptedValue, cookieOptions);
    } else {
      this.storage?.setItem(storageKey, encryptedValue);
    }

    if (this.#notifyHandler && !this.#multiple) {
      this.#notifyHandler({
        type,
        key,
        value: valueToString,
      });
    }
  }

  public setMultipleItems(
    param: [string, any][],
    cookieOptions: CookieOptions = {},
  ): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    this.#multiple = true;
    param.forEach(([key, value]) => {
      this.setItem(key, value, cookieOptions);
    });

    if (this.#notifyHandler) {
      const type =
        this.#storageType === 'cookies' ? 'setMultiple:cookie' : 'setMultiple';
      const keys = param.map(([key]) => key);
      const values = param.map(([_, value]) =>
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      );
      this.#notifyHandler({
        type,
        key: keys,
        value: values,
      });

      this.#multiple = false;
    }
  }

  public getItem<DataType = any>(
    key: string,
    doNotDecrypt = false,
  ): DataType | null {
    const type = this.#storageType === 'cookies' ? 'get:cookie' : 'get';

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      if (this.#notifyHandler) {
        this.#notifyHandler({
          type,
          key,
          value: null,
        });
      }

      return null;
    }

    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const storageKey = this.#getKey(key);
    let item: string | null = null;

    if (this.#storageType === 'cookies') {
      item = getCookie(storageKey);
    } else {
      item = this.storage?.getItem(storageKey) || null;
    }

    if (item) {
      const decryptedValue = decryptValues
        ? item
        : this.#encryptation.decrypt(item);

      if (this.#stateManagementUse && !this.#multiple) {
        if (this.#notifyHandler) {
          this.#notifyHandler({
            type,
            key,
            value: decryptedValue,
          });
        }
        return decryptedValue as unknown as DataType;
      }

      try {
        const value = this.#doNotParseValues
          ? decryptedValue
          : JSON.parse(decryptedValue);

        if (this.#notifyHandler && !this.#multiple) {
          this.#notifyHandler({
            type,
            key,
            value,
          });
        }

        return value as DataType;
      } catch {
        if (this.#notifyHandler && !this.#multiple) {
          this.#notifyHandler({
            type,
            key,
            value: decryptedValue,
          });
        }

        return decryptedValue as unknown as DataType;
      }
    }

    if (this.#notifyHandler && !this.#multiple) {
      this.#notifyHandler({
        type,
        key,
        value: null,
      });
    }

    return null;
  }

  public getMultipleItems(
    keys: string[],
    doNotDecrypt?: boolean,
  ): Record<string, any> | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return null;
    }

    this.#multiple = true;

    let result: Record<string, any> | null = keys.reduce(
      (accumulator: Record<string, any>, key) => {
        accumulator[key] = this.getItem(key, doNotDecrypt);

        return accumulator;
      },
      {},
    );

    result = Object.values(result).filter(Boolean).length === 0 ? null : result;

    if (this.#notifyHandler) {
      const type =
        this.#storageType === 'cookies' ? 'getMultiple:cookie' : 'getMultiple';
      this.#notifyHandler({
        type,
        key: keys,
        value: result,
      });

      this.#multiple = false;
    }

    return result;
  }

  public getItemFromPattern(
    pattern: string,
    options: GetFromPatternOptions = {},
  ): Record<string, any> | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return null;
    }

    this.#multiple = true;
    const { multiple = true, exact = false, doNotDecrypt = false } = options;
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const allKeys =
      this.#storageType === 'cookies'
        ? getCookieKeys().map(key => decodeURIComponent(key))
        : /* c8 ignore next 1 */
          Object.keys(this.storage || {});
    const keys = allKeys.filter(key => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    const type =
      this.#storageType === 'cookies'
        ? 'getItemFromPattern:cookie'
        : 'getItemFromPattern';

    if (!keys.length) {
      if (this.#notifyHandler) {
        this.#notifyHandler({
          type,
          key: pattern,
          value: null,
        });
      }
      this.#multiple = false;

      return null;
    }

    if (!multiple) {
      const [key] = keys;

      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      const value = this.getItem(formattedKey, decryptValues);

      if (this.#notifyHandler) {
        this.#notifyHandler({
          type,
          key: formattedKey,
          value,
        });
      }

      this.#multiple = false;
      return value;
    }

    const value = keys.reduce((accumulator: Record<string, any>, key) => {
      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      accumulator[formattedKey] = this.getItem(formattedKey, decryptValues);

      return accumulator;
    }, {});

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type,
        key: keys,
        value,
      });
    }
    this.#multiple = false;
    return value;
  }

  public removeItem(key: string, cookieOptions?: CookieOptions): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const storageKey = this.#getKey(key);

    if (this.#storageType === 'cookies') {
      removeCookie(storageKey, cookieOptions);
    } else {
      this.storage?.removeItem(storageKey);
    }

    this.#clientKeys = this.#clientKeys.filter(
      clientKey => clientKey !== storageKey,
    );

    delete this.#clientKeysToRemoveOptions[storageKey];

    if (this.#notifyHandler && !this.#multiple) {
      const type = this.#storageType === 'cookies' ? 'remove:cookie' : 'remove';

      this.#notifyHandler({
        type,
        key,
      });
    }
  }

  public removeMultipleItems(
    items: (string | RemoveMultipleCookiesParams)[],
  ): void {
    this.#multiple = true;
    const keys: string[] = [];

    items.forEach(item => {
      /* c8 ignore next 1 */
      const [key, cookieOptions] = Array.isArray(item) ? item : [item];

      this.removeItem(key, cookieOptions);
      keys.push(key);
    });

    if (this.#notifyHandler) {
      const type =
        this.#storageType === 'cookies'
          ? 'removeMultiple:cookie'
          : 'removeMultiple';

      this.#notifyHandler({
        type,
        key: keys,
      });
    }

    this.#multiple = false;
  }

  public removeItemFromPattern(
    pattern: string,
    options: RemoveFromPatternOptions = {} as RemoveFromPatternOptions,
  ): void {
    this.#multiple = true;

    const { exact = false } = options;
    const allKeys =
      this.#storageType === 'cookies'
        ? getCookieKeys().map(key => decodeURIComponent(key))
        : Object.keys(this.storage || {});
    const filteredKeys = allKeys.filter(key => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    if (this.#notifyHandler) {
      const keys = filteredKeys.map(key =>
        this.#prefix ? key.split(`${this.#prefix}:`)[1] : key,
      );
      const type =
        this.#storageType === 'cookies'
          ? 'removeMultiple:cookie'
          : 'removeMultiple';
      this.#notifyHandler({
        type,
        key: keys,
      });
    }

    filteredKeys.forEach(key => {
      const parsedKey = this.#prefix ? key.split(`${this.#prefix}:`)[1] : key;
      this.removeItem(parsedKey);
    });

    this.#multiple = false;
  }

  public encryptString(str: string): string {
    const encryptedValue = this.#encryptation.encrypt(str);

    return encryptedValue;
  }

  public decryptString(str: string): string {
    const decryptedValue = this.#encryptation.decrypt(str);

    return decryptedValue;
  }

  public encryptValue(value: any): string {
    const parsedValue = this.#doNotParseValues ? value : JSON.stringify(value);
    const encryptedValue = this.#encryptation.encrypt(parsedValue);

    return encryptedValue;
  }

  public decryptValue<DataType = any>(value: string): DataType {
    const decryptedValue = this.#encryptation.decrypt(value);

    return (
      this.#doNotParseValues ? decryptedValue : JSON.parse(decryptedValue)
    ) as DataType;
  }

  public hash(value: string): string {
    return hashSHA256(value, secret.get(this));
  }

  public md5Hash(value: string): string {
    return hashMD5(value, secret.get(this));
  }
}

/* istanbul ignore next */
if (window) {
  /* istanbul ignore next */
  (window as any).EncryptStorage = EncryptStorage;
}

/* istanbul ignore next */
if (window && window?.globalThis) {
  /* istanbul ignore next */
  (window?.globalThis as any).EncryptStorage = EncryptStorage;
}
