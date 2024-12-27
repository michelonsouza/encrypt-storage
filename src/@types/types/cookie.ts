export interface CookieOptions {
  /**
   * number in milliseconds or Date
   */
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  doNotEncrypt?: boolean;
}

export type RemoveCookieOptions = Omit<CookieOptions, 'expires'>;

export type RemoveMultipleCookiesParams = [string, RemoveCookieOptions?];
