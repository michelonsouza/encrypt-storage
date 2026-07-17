import { InvalidSecretKeyError, IsNotBrowserEnvironmentError } from '@/errors';
import {
  hashSyncSHA256,
  getSyncEncryptation,
  SECRET_KEY_MIN_LENGTH,
} from '@/utils';

import type {
  TTLMetadata,
  NotifyHandler,
  CookieOptions,
  TTLStorageValue,
  SyncEncryptation,
  SetTTLItemParams,
  RefreshTTLParams,
  RemoveCookieOptions,
  NotifyHandlerParams,
  SyncCookieInterface,
  GetFromPatternOptions,
  RemoveFromPatternOptions,
  SyncEncryptStorageOptions,
  SyncEncryptStorageTTLInterface,
  EncryptStorageCryptoJsApiInterface,
} from '@/@types';

const secret = new globalThis.WeakMap();

export class EncryptStorageCryptoJs
  implements EncryptStorageCryptoJsApiInterface, SyncEncryptStorageTTLInterface
{
  readonly #keys: Set<string> = new Set();

  readonly #encryptation: SyncEncryptation;

  readonly #stateManagementUse: boolean;

  readonly #doNotEncryptValues: boolean;

  readonly #doNotParseValues: boolean;

  readonly #notifyHandler: NotifyHandler | undefined;

  readonly #prefix: string;

  #multiple = false;

  public readonly storage: globalThis.Storage;

  public readonly api = 'crypto-js' as const;

  /**
   * EncryptStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
   *
   * @param {string} secretKey - A secret to encrypt data must be contain min of 10 characters
   * @param {EncrytStorageOptions} options - A optional settings to set encryptData or select `sessionStorage` to browser storage
   */
  constructor(secretKey: string, options: SyncEncryptStorageOptions) {
    if (secretKey.length < SECRET_KEY_MIN_LENGTH) {
      throw new InvalidSecretKeyError();
    }

    if (typeof window === 'undefined' || typeof window !== 'object') {
      throw new IsNotBrowserEnvironmentError();
    }

    const {
      storageType = 'localStorage',
      prefix = '',
      stateManagementUse = false,
      encAlgorithm = 'AES',
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
    this.#encryptation = getSyncEncryptation(encAlgorithm, secret.get(this));
    this.storage = window[storageType];
  }

  #getKey(key: string): string {
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  #notifier(params: NotifyHandlerParams, callback?: VoidFunction) {
    if (this.#notifyHandler) {
      this.#notifyHandler(params);
      callback?.();
    }
  }

  public get length() {
    const value = this.storage.length || 0;

    this.#notifier({
      type: 'length',
      value,
    });

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

    this.storage.setItem(storageKey, encryptedValue);

    if (!this.#multiple) {
      this.#notifier({
        type: 'set',
        key,
        value: valueToString,
      });
    }

    this.#keys.add(key);
  }

  public setMultipleItems(
    param: [string, any][],
    doNotEncrypt?: boolean,
  ): void {
    this.#multiple = true;
    param.forEach(([key, value]) => {
      this.setItem(key, value, doNotEncrypt);
    });

    const keys = param.map(([key]) => key);
    const values = param.map(([_, value]) =>
      typeof value === 'object' ? JSON.stringify(value) : String(value),
    );

    this.#notifier({
      type: 'setMultiple',
      key: keys,
      value: values,
    });

    this.#multiple = false;
  }

  public getItem<DataType = any>(
    key: string,
    doNotDecrypt = false,
  ): DataType | undefined {
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const storageKey = this.#getKey(key);
    const item = this.storage.getItem(storageKey);

    if (item) {
      const decryptedValue = decryptValues
        ? item
        : this.#encryptation.decrypt(item);

      if (this.#stateManagementUse && !this.#multiple) {
        this.#notifier({
          type: 'get',
          key,
          value: decryptedValue,
        });

        return decryptedValue as unknown as DataType;
      }

      try {
        const value = this.#doNotParseValues
          ? decryptedValue
          : JSON.parse(decryptedValue);

        if (!this.#multiple) {
          this.#notifier({
            type: 'get',
            key,
            value,
          });
        }

        return value as DataType;
      } catch {
        if (!this.#multiple) {
          this.#notifier({
            type: 'get',
            key,
            value: decryptedValue,
          });
        }
        return decryptedValue as unknown as DataType;
      }
    }

    if (!this.#multiple) {
      this.#notifier({
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

    this.#notifier({
      type: 'getMultiple',
      key: keys,
      value: result,
    });

    this.#multiple = false;

    return result;
  }

  public removeItem(key: string): void {
    const storageKey = this.#getKey(key);
    this.storage.removeItem(storageKey);

    if (!this.#multiple) {
      this.#notifier({
        type: 'remove',
        key,
      });
    }

    this.#keys.delete(key);
  }

  public removeMultipleItems(keys: string[]): void {
    this.#multiple = true;
    keys.forEach((key) => {
      this.removeItem(key);
    });

    this.#notifier({
      type: 'removeMultiple',
      key: keys,
    });

    this.#multiple = false;
  }

  public removeItemFromPattern(
    pattern: string,
    options: RemoveFromPatternOptions = {} as RemoveFromPatternOptions,
  ): void {
    const { exact = false } = options;
    const storageKeys = Object.keys(this.storage);
    const filteredKeys = storageKeys.filter((key) => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    const keys = filteredKeys.map((key) =>
      this.#prefix ? key.split(`${this.#prefix}:`)[1] : key,
    );
    this.#notifier({
      type: 'remove',
      key: keys,
    });

    filteredKeys.forEach((key) => {
      this.storage.removeItem(key);
    });
  }

  public getItemFromPattern(
    pattern: string,
    options: GetFromPatternOptions = {} as GetFromPatternOptions,
  ): Record<string, any> | undefined {
    const { multiple = true, exact = false, doNotDecrypt = false } = options;
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const keys = Object.keys(this.storage).filter((key) => {
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

      this.#notifier({
        type: 'remove',
        key: formattedKey,
      });

      return this.getItem(formattedKey, decryptValues);
    }

    const value = keys.reduce((accumulator: Record<string, any>, key) => {
      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      accumulator[formattedKey] = this.getItem(formattedKey);

      return accumulator;
    }, {});

    this.#notifier({
      type: 'get',
      key: keys,
      value,
    });

    return value;
  }

  public clear(): void {
    this.storage.clear();

    this.#notifier({
      type: 'clear',
    });
  }

  public key(index: number): string | null {
    const value = this.storage.key(index) || null;

    this.#notifier({
      type: 'key',
      index,
      value,
    });

    return value;
  }

  public encryptValue(value: any): string {
    const parsedValue = this.#doNotParseValues ? value : JSON.stringify(value);
    const encryptedValue = this.#encryptation.encrypt(parsedValue);

    return encryptedValue;
  }

  public decryptValue<DataType = any>(value: string): DataType | null {
    const decryptedValue = this.#encryptation.decrypt(value);

    try {
      return (
        this.#doNotParseValues ? decryptedValue : JSON.parse(decryptedValue)
      ) as DataType;
    } catch {
      /* istanbul ignore next */
      return null;
    }
  }

  public hash(value: string): string {
    return hashSyncSHA256(value, secret.get(this));
  }

  public cookie: SyncCookieInterface = {
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

      this.#notifier({
        type: 'set:cookie',
        key,
        value: undefined,
      });
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

      this.#notifier({
        type: 'get:cookie',
        key,
        value: undefined,
      });

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

      this.#notifier({
        type: 'remove:cookie',
        key,
        value: undefined,
      });
    },
  };

  /**
   * TTL API
   */

  /**
   * Returns a valid TTL record.
   *
   * If the key does not exist, is invalid or has expired,
   * `undefined` is returned.
   *
   * Expired items are automatically removed from storage.
   *
   * @template T
   * @param {string} key Storage key.
   *
   * @returns {TTLStorageValue<T> | undefined}
   *
   * @private
   */
  #getTTLRecord<T = unknown>(
    key: string,
    doNotDecrypt = false,
  ): TTLStorageValue<T> | null {
    const item = this.getItem<TTLStorageValue<T>>(key, doNotDecrypt);

    if (!item) {
      return null;
    }

    if (
      item == null ||
      typeof item !== 'object' ||
      typeof item.expiresAt !== 'number'
    ) {
      return null;
    }

    if (Date.now() >= item.expiresAt) {
      this.removeItem(key);

      return null;
    }

    return item;
  }

  public setTTL<T>({
    key,
    value,
    ttl,
    doNotEncrypt = false,
  }: SetTTLItemParams<T>): void {
    const expiresAt =
      ttl instanceof Date ? ttl.getTime() : Date.now() + ttl * 1000;

    const item: TTLStorageValue<T> = {
      value,
      expiresAt,
    };

    this.setItem(key, item, doNotEncrypt);
  }

  public getTTL<T = unknown>(key: string, doNotDecrypt = false): T | null {
    return this.#getTTLRecord<T>(key, doNotDecrypt)?.value ?? null;
  }

  public hasTTL(key: string): boolean {
    return this.#getTTLRecord(key) !== null;
  }

  public getTTLMetadata(key: string): TTLMetadata | null {
    const item = this.#getTTLRecord(key);

    if (!item) {
      return null;
    }

    return {
      expiresAt: new Date(item.expiresAt),
      remaining: item.expiresAt - Date.now(),
      expired: Date.now() >= item.expiresAt,
    };
  }

  public getRemainingTTL(key: string): number | null {
    const item = this.#getTTLRecord(key);

    if (!item) {
      return null;
    }

    const remaining = (item.expiresAt - Date.now()) / 1000;

    return remaining > 0 ? remaining : 0;
  }

  public refreshTTL({ key, ttl }: RefreshTTLParams): boolean {
    const item = this.#getTTLRecord(key);

    if (!item) {
      return false;
    }

    const expiresAt = ttl instanceof Date ? ttl.getTime() : Date.now() + ttl;

    item.expiresAt = expiresAt;

    this.setItem(key, item);

    return true;
  }

  public removeTTL(key: string): boolean {
    const item = this.#getTTLRecord(key);

    if (!item) {
      return false;
    }

    this.removeItem(key);
    this.setItem(key, item.value);

    return true;
  }

  public hasExpired(key: string): boolean {
    return this.#getTTLRecord(key) === null;
  }
}

/* v8 ignore start -- @preserve */
if (typeof window !== 'undefined') {
  (window as any).EncryptStorageCryptoJs = EncryptStorageCryptoJs;
}

if (typeof window !== 'undefined' && window?.globalThis) {
  // oxlint-disable-next-line no-unsafe-optional-chaining
  (window?.globalThis as any).EncryptStorageCryptoJs = EncryptStorageCryptoJs;
}
/* v8 ignore end -- @preserve */
