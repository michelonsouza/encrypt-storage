import { InvalidSecretKeyError } from '@/errors';
import {
  getAsyncEncryptation,
  hashAsyncSHA256,
  SECRET_KEY_MIN_LENGTH,
} from '@/utils';

import type {
  NotifyHandler,
  CookieOptions,
  AsyncEncryptation,
  RemoveCookieOptions,
  AsyncCookieInterface,
  GetFromPatternOptions,
  WebApiEncryptAlgorithms,
  RemoveFromPatternOptions,
  AsyncEncryptStorageOptions,
  EncryptStorageCryptoWebApiInterface,
} from '@/@types';

const secret = new globalThis.WeakMap();

export class EncryptStorageWebApi implements EncryptStorageCryptoWebApiInterface {
  // @ts-expect-error
  #encryptation: AsyncEncryptation;

  readonly #encAlgorithm: WebApiEncryptAlgorithms;

  readonly #stateManagementUse: boolean;

  readonly #doNotEncryptValues: boolean;

  readonly #doNotParseValues: boolean;

  readonly #notifyHandler: NotifyHandler | undefined;

  readonly #prefix: string;

  #multiple = false;

  public readonly storage: globalThis.Storage | null;

  public readonly api = 'crypto-js' as const;

  /**
   * EncryptStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
   *
   * @param {string} secretKey - A secret to encrypt data must be contain min of 10 characters
   * @param {EncrytStorageOptions} options - A optional settings to set encryptData or select `sessionStorage` to browser storage
   */
  constructor(secretKey: string, options: AsyncEncryptStorageOptions) {
    if (secretKey.length < SECRET_KEY_MIN_LENGTH) {
      throw new InvalidSecretKeyError();
    }

    const {
      storageType = 'localStorage',
      prefix = '',
      stateManagementUse = false,
      encAlgorithm = 'AES-GCM',
      doNotEncryptValues = false,
      notifyHandler,
      doNotParseValues = false,
    } = options;

    secret.set(this, secretKey);

    this.#prefix = prefix;
    this.#notifyHandler = notifyHandler;
    this.#stateManagementUse = stateManagementUse;
    this.#doNotEncryptValues = doNotEncryptValues;
    this.#doNotParseValues = doNotParseValues;
    this.#encAlgorithm = encAlgorithm;
    this.#init(encAlgorithm);
    this.storage =
      typeof window !== 'undefined' && typeof window === 'object'
        ? window[storageType]
        : null;
  }

  async #init(encAlgorithm: WebApiEncryptAlgorithms) {
    this.#encryptation = await getAsyncEncryptation(
      encAlgorithm,
      secret.get(this),
    );
  }

  #getKey(key: string): string {
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  async #verifyEncryptation() {
    if (!this.#encryptation) {
      await this.#init(this.#encAlgorithm);
    }
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

  public async setItem(
    key: string,
    value: any,
    doNotEncrypt = false,
  ): Promise<void> {
    await this.#verifyEncryptation();
    const encryptValues = this.#doNotEncryptValues || doNotEncrypt;
    const storageKey = this.#getKey(key);
    let valueToString =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (this.#doNotParseValues) {
      valueToString = value;
    }

    const encryptedValue = encryptValues
      ? valueToString
      : await this.#encryptation.encrypt(valueToString);

    this.storage?.setItem(storageKey, encryptedValue);

    if (this.#notifyHandler && !this.#multiple) {
      this.#notifyHandler({
        type: 'set',
        key,
        value: valueToString,
      });
    }
  }

  public async setMultipleItems(
    param: [string, any][],
    doNotEncrypt?: boolean,
  ): Promise<void> {
    await this.#verifyEncryptation();
    this.#multiple = true;
    await Promise.all(
      param.map(([key, value]) => this.setItem(key, value, doNotEncrypt)),
    );

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

  public async getItem<DataType = any>(
    key: string,
    doNotDecrypt = false,
  ): Promise<DataType | undefined> {
    await this.#verifyEncryptation();
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const storageKey = this.#getKey(key);
    const item = this.storage?.getItem(storageKey);

    if (item) {
      const decryptedValue = decryptValues
        ? item
        : await this.#encryptation.decrypt(item);

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

  public async getMultipleItems(
    keys: string[],
    doNotDecrypt?: boolean,
  ): Promise<Record<string, any>> {
    await this.#verifyEncryptation();
    this.#multiple = true;
    const values = await Promise.all(
      keys.map((key) => this.getItem(key, doNotDecrypt)),
    );
    const result = keys.reduce(
      (accumulator: Record<string, any>, key, index) => {
        accumulator[key] = values[index];

        return accumulator;
      },
      {},
    );

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
    keys.forEach((key) => {
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
    const filteredKeys = storageKeys.filter((key) => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    if (this.#notifyHandler) {
      const keys = filteredKeys.map((key) =>
        this.#prefix ? key.split(`${this.#prefix}:`)[1] : key,
      );
      this.#notifyHandler({
        type: 'remove',
        key: keys,
      });
    }

    filteredKeys.forEach((key) => {
      /* istanbul ignore next */
      this.storage?.removeItem(key);
    });
  }

  public async getItemFromPattern(
    pattern: string,
    options: GetFromPatternOptions = {} as GetFromPatternOptions,
  ): Promise<Record<string, any> | undefined> {
    await this.#verifyEncryptation();
    const { multiple = true, exact = false, doNotDecrypt = false } = options;
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const keys = Object.keys(this.storage || {}).filter((key) => {
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

      return await this.getItem(formattedKey, decryptValues);
    }

    const parsedKeys = keys.map((key) => {
      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      return formattedKey;
    });

    const values = await Promise.all(
      parsedKeys.map((key) => this.getItem(key, decryptValues)),
    );

    const value = parsedKeys.reduce(
      (accumulator: Record<string, any>, key, index) => {
        accumulator[key] = values[index];

        return accumulator;
      },
      {},
    );

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

  public async encryptValue(value: any): Promise<string> {
    await this.#verifyEncryptation();
    const parsedValue = this.#doNotParseValues ? value : JSON.stringify(value);
    const encryptedValue = await this.#encryptation.encrypt(parsedValue);

    return encryptedValue;
  }

  public async decryptValue<DataType = any>(
    value: string,
  ): Promise<DataType | null> {
    await this.#verifyEncryptation();
    const decryptedValue = await this.#encryptation.decrypt(value);

    try {
      return (
        this.#doNotParseValues ? decryptedValue : JSON.parse(decryptedValue)
      ) as DataType;
    } catch {
      /* istanbul ignore next */
      return null;
    }
  }

  public async hash(value: string): Promise<string> {
    return hashAsyncSHA256(value);
  }

  public cookie: AsyncCookieInterface = {
    set: async (
      key: string,
      value: any,
      options?: CookieOptions,
    ): Promise<void> => {
      if (
        typeof document === 'undefined' ||
        typeof document.cookie === 'undefined' ||
        typeof window === 'undefined'
      ) {
        return;
      }

      await this.#verifyEncryptation();
      let interntValue = this.#doNotParseValues ? value : JSON.stringify(value);

      if (!this.#doNotEncryptValues) {
        interntValue = await this.encryptValue(interntValue);
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
    get: async <DataType = any>(key: string): Promise<DataType | null> => {
      if (
        typeof document === 'undefined' ||
        typeof document.cookie === 'undefined' ||
        typeof window === 'undefined'
      ) {
        return null;
      }

      await this.#verifyEncryptation();
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${encodeURIComponent(this.#getKey(key))}=([^;]*)`),
      );

      let internValue = match ? match[1] : null;

      if (!this.#doNotEncryptValues && internValue) {
        internValue = await this.decryptValue(decodeURIComponent(internValue));
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

      this.cookie.set(key, '', { ...options, expires: -1 });

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
