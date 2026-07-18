import { IsNotBrowserEnvironmentError } from '@/errors';

import type {
  CookieOptions,
  RemoveCookieOptions,
  SyncCookieInterface,
  SyncEncryptCookieOptions,
} from '@/@types';

export class SyncEncryptCookie implements SyncCookieInterface {
  readonly #doNotEncryptValues?: boolean;

  readonly #doNotParseValues?: boolean;

  readonly #getKey: SyncEncryptCookieOptions['getKey'];

  readonly #encryptValue: SyncEncryptCookieOptions['encryptValue'];

  readonly #decryptValue: SyncEncryptCookieOptions['decryptValue'];

  readonly #notifier: SyncEncryptCookieOptions['notifier'];

  constructor({
    decryptValue,
    encryptValue,
    getKey,
    notifier,
    doNotEncryptValues,
    doNotParseValues,
  }: SyncEncryptCookieOptions) {
    this.#decryptValue = decryptValue;
    this.#encryptValue = encryptValue;
    this.#getKey = getKey;
    this.#notifier = notifier;
    this.#doNotEncryptValues = doNotEncryptValues;
    this.#doNotParseValues = doNotParseValues;
  }

  #documentVerification() {
    if (
      typeof document === 'undefined' ||
      typeof document.cookie === 'undefined' ||
      typeof window === 'undefined'
    ) {
      throw new IsNotBrowserEnvironmentError();
    }
  }

  public set(key: string, value: any, options?: CookieOptions): void {
    this.#documentVerification();

    let interntValue = this.#doNotParseValues ? value : JSON.stringify(value);

    if (!this.#doNotEncryptValues) {
      interntValue = this.#encryptValue(interntValue);
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
  }

  public get<DataType = any>(key: string): DataType | null {
    this.#documentVerification();

    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(this.#getKey(key))}=([^;]*)`),
    );

    let internValue = match ? match[1] : null;

    if (!this.#doNotEncryptValues && internValue) {
      internValue = this.#decryptValue(decodeURIComponent(internValue));
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
  }

  public remove(key: string, options: RemoveCookieOptions = {}): void {
    this.#documentVerification();

    this.set(key, '', { ...options, expires: -1 });

    this.#notifier({
      type: 'remove:cookie',
      key,
      value: undefined,
    });
  }
}
