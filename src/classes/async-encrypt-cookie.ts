import { IsNotBrowserEnvironmentError } from '@/errors';

import type {
  AsyncCookieInterface,
  CookieOptions,
  RemoveCookieOptions,
  AsyncEncryptCookieOptions,
} from '@/@types';

export class AsyncEncryptCookie implements AsyncCookieInterface {
  readonly #doNotEncryptValues?: boolean;

  readonly #doNotParseValues?: boolean;

  readonly #getKey: AsyncEncryptCookieOptions['getKey'];

  readonly #encryptValue: AsyncEncryptCookieOptions['encryptValue'];

  readonly #decryptValue: AsyncEncryptCookieOptions['decryptValue'];

  readonly #notifier: AsyncEncryptCookieOptions['notifier'];

  constructor({
    decryptValue,
    encryptValue,
    getKey,
    notifier,
    doNotEncryptValues,
    doNotParseValues,
  }: AsyncEncryptCookieOptions) {
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

  public async set(
    key: string,
    value: any,
    options?: CookieOptions,
  ): Promise<void> {
    this.#documentVerification();

    let interntValue = this.#doNotParseValues ? value : JSON.stringify(value);

    if (!this.#doNotEncryptValues) {
      interntValue = await this.#encryptValue(interntValue);
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

  public async get<DataType = any>(key: string): Promise<DataType | null> {
    this.#documentVerification();

    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(this.#getKey(key))}=([^;]*)`),
    );

    let internValue = match ? match[1] : null;

    if (!this.#doNotEncryptValues && internValue) {
      internValue = await this.#decryptValue(decodeURIComponent(internValue));
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

  public async remove(
    key: string,
    options: RemoveCookieOptions = {},
  ): Promise<void> {
    this.#documentVerification();

    await this.set(key, '', { ...options, expires: -1 });

    this.#notifier({
      type: 'remove:cookie',
      key,
      value: undefined,
    });
  }
}
