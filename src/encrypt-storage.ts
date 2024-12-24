import { InvalidSecretKeyError } from './errors';
import {
  Encryptation,
  NotifyHandler,
  GetFromPatternOptions,
  EncryptStorageOptions,
  EncryptStorageInterface,
  RemoveFromPatternOptions,
  CookieInterface,
  CookieOptions,
  RemoveCookieOptions,
} from './types';
import { getEncryptation, hashSHA256, hashMD5 } from './utils';

const secret = new WeakMap();
export class EncryptStorage implements EncryptStorageInterface {
  readonly #encryptation: Encryptation;

  public readonly storage: Storage | null;

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
    this.storage = typeof window === 'object' ? window[storageType] : null;
  }

  #getKey(key: string): string {
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  public get length() {
    const value = this.storage?.length || 0;

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type: 'length',
        value,
      });
    }

    return value;
  }

  public setItem(key: string, value: any, doNotEncrypt = false): void {
    const encryptValues = this.#doNotEncryptValues || doNotEncrypt;
    const storageKey = this.#getKey(key);
    let valueToString =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (this.#doNotParseValues) {
      valueToString = value;
    }

    const encryptedValue = encryptValues
      ? valueToString
      : this.#encryptation.encrypt(valueToString);

    this.storage?.setItem(storageKey, encryptedValue);

    if (this.#notifyHandler && !this.#multiple) {
      this.#notifyHandler({
        type: 'set',
        key,
        value: valueToString,
      });
    }
  }

  public setMultipleItems(
    param: [string, any][],
    doNotEncrypt?: boolean,
  ): void {
    this.#multiple = true;
    param.forEach(([key, value]) => {
      this.setItem(key, value, doNotEncrypt);
    });

    if (this.#notifyHandler) {
      const keys = param.map(([key]) => key);
      const values = param.map(([_, value]) =>
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      );
      this.#notifyHandler({
        type: 'setMultiple',
        key: keys,
        value: values,
      });

      this.#multiple = false;
    }
  }

  public getItem<DataType = any>(
    key: string,
    doNotDecrypt = false,
  ): DataType | undefined {
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const storageKey = this.#getKey(key);
    const item = this.storage?.getItem(storageKey);

    if (item) {
      const decryptedValue = decryptValues
        ? item
        : this.#encryptation.decrypt(item);

      if (this.#stateManagementUse && !this.#multiple) {
        if (this.#notifyHandler) {
          this.#notifyHandler({
            type: 'get',
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
            type: 'get',
            key,
            value,
          });
        }

        return value as DataType;
      } catch {
        if (this.#notifyHandler && !this.#multiple) {
          this.#notifyHandler({
            type: 'get',
            key,
            value: decryptedValue,
          });
        }
        return decryptedValue as unknown as DataType;
      }
    }

    if (this.#notifyHandler && !this.#multiple) {
      this.#notifyHandler({
        type: 'get',
        key,
        value: undefined,
      });
    }

    return undefined;
  }

  public getMultipleItems(
    keys: string[],
    doNotDecrypt?: boolean,
  ): Record<string, any> {
    this.#multiple = true;
    const result = keys.reduce((accumulator: Record<string, any>, key) => {
      accumulator[key] = this.getItem(key, doNotDecrypt);

      return accumulator;
    }, {});

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type: 'getMultiple',
        key: keys,
        value: result,
      });

      this.#multiple = false;
    }

    return result;
  }

  public removeItem(key: string): void {
    const storageKey = this.#getKey(key);
    this.storage?.removeItem(storageKey);

    if (this.#notifyHandler && !this.#multiple) {
      this.#notifyHandler({
        type: 'remove',
        key,
      });
    }
  }

  public removeMultipleItems(keys: string[]): void {
    this.#multiple = true;
    keys.forEach(key => {
      this.removeItem(key);
    });

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type: 'removeMultiple',
        key: keys,
      });
    }

    this.#multiple = false;
  }

  public removeItemFromPattern(
    pattern: string,
    options: RemoveFromPatternOptions = {} as RemoveFromPatternOptions,
  ): void {
    const { exact = false } = options;
    const storageKeys = Object.keys(this.storage || {});
    const filteredKeys = storageKeys.filter(key => {
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
      this.#notifyHandler({
        type: 'remove',
        key: keys,
      });
    }

    filteredKeys.forEach(key => {
      /* istanbul ignore next */
      this.storage?.removeItem(key);
    });
  }

  public getItemFromPattern(
    pattern: string,
    options: GetFromPatternOptions = {} as GetFromPatternOptions,
  ): Record<string, any> | undefined {
    const { multiple = true, exact = false, doNotDecrypt = false } = options;
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const keys = Object.keys(this.storage || {}).filter(key => {
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

      if (this.#notifyHandler) {
        this.#notifyHandler({
          type: 'remove',
          key: formattedKey,
        });
      }

      return this.getItem(formattedKey, decryptValues);
    }

    const value = keys.reduce((accumulator: Record<string, any>, key) => {
      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      accumulator[formattedKey] = this.getItem(formattedKey);

      return accumulator;
    }, {});

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type: 'get',
        key: keys,
        value,
      });
    }

    return value;
  }

  public clear(): void {
    this.storage?.clear();

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type: 'clear',
      });
    }
  }

  public key(index: number): string | null {
    const value = this.storage?.key(index) || null;

    if (this.#notifyHandler) {
      this.#notifyHandler({
        type: 'key',
        index,
        value,
      });
    }

    return value;
  }

  /**
   * @deprecated This function will be `deprecated` in ^3.x versions in favor of the encryptValue function and will be removed in the future.
   */
  public encryptString(str: string): string {
    const encryptedValue = this.#encryptation.encrypt(str);

    return encryptedValue;
  }

  /**
   * @deprecated This function will be `deprecated` in ^3.x versions in favor of the decryptValue function and will be removed in the future.
   */
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

  public cookie: CookieInterface = {
    set: (key: string, value: any, options?: CookieOptions): void => {
      if (
        typeof document === 'undefined' ||
        typeof document.cookie === 'undefined' ||
        typeof window === 'undefined'
      ) {
        return;
      }
      let interntValue = this.#doNotParseValues ? value : JSON.stringify(value);

      if (!this.#doNotEncryptValues) {
        interntValue = this.encryptValue(interntValue);
      }

      let cookieString = `${encodeURIComponent(this.#getKey(key))}=${encodeURIComponent(interntValue)}`;

      if (options?.expires) {
        const expires =
          options.expires instanceof Date
            ? options.expires.toUTCString()
            : new Date(Date.now() + options.expires * 1000).toUTCString();
        cookieString += `; expires=${expires}`;
      }

      if (options?.path) {
        cookieString += `; path=${options.path}`;
      }

      if (options?.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      if (options?.secure) {
        cookieString += `; secure`;
      }
      if (options?.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      }

      document.cookie = cookieString;

      if (this.#notifyHandler) {
        this.#notifyHandler({
          type: 'set:cookie',
          key,
          value: undefined,
        });
      }
    },
    get: <DataType = any>(key: string): DataType | null => {
      if (
        typeof document === 'undefined' ||
        typeof document.cookie === 'undefined' ||
        typeof window === 'undefined'
      ) {
        return null;
      }

      const match = document.cookie.match(
        new RegExp(`(?:^|; )${encodeURIComponent(this.#getKey(key))}=([^;]*)`),
      );

      let internValue = match ? match[1] : null;

      if (!this.#doNotEncryptValues && internValue) {
        internValue = this.decryptValue(decodeURIComponent(internValue));
      }

      if (this.#doNotParseValues) {
        return internValue as unknown as DataType;
      }

      if (this.#notifyHandler) {
        this.#notifyHandler({
          type: 'get:cookie',
          key,
          value: undefined,
        });
      }

      return internValue ? (JSON.parse(internValue) as DataType) : null;
    },
    remove: (key: string, options: RemoveCookieOptions = {}): void => {
      if (
        typeof document === 'undefined' ||
        typeof document.cookie === 'undefined' ||
        typeof window === 'undefined'
      ) {
        return;
      }

      this.cookie.set(this.#getKey(key), '', { ...options, expires: -1 });

      if (this.#notifyHandler) {
        this.#notifyHandler({
          type: 'remove:cookie',
          key,
          value: undefined,
        });
      }
    },
  };
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

export default EncryptStorage;
