import { CookieOptions, RemoveCookieOptions } from '@/@types/types';

export function setCookie(
  key: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const { domain, expires, path, sameSite, secure } = options;

  let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

  if (expires !== undefined) {
    const expiresTime =
      expires instanceof Date
        ? expires.toUTCString()
        : new Date(Date.now() + expires * 1000).toUTCString();
    cookieString += `; expires=${expiresTime}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += `; secure`;
  }
  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  document.cookie = cookieString;
}

export function getCookie(key: string): string | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`),
  );

  const internValue = match ? decodeURIComponent(match[1]) : null;

  return internValue;
}

export function removeCookie(
  key: string,
  options: RemoveCookieOptions = {},
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  setCookie(key, '', { ...options, expires: -1000 });
}

export function getCookieKeys(): string[] {
  const cookies = document?.cookie;
  const excludedKeys = ['expires', 'path', 'domain', 'secure', 'samesite'];
  return (
    cookies
      ?.split('; ')
      .map(cookie => cookie.split('=')[0])
      .filter(key => !excludedKeys.includes(key)) || []
  );
}

export function getCookieLength() {
  return getCookieKeys().length;
}

export function clearCookies(
  clientKeys: string[] = [],
  clientKeysToRemoveOptions: Record<string, CookieOptions> | CookieOptions = {},
): void {
  const cookies = getCookieKeys() || [];

  for (const name of cookies) {
    if (clientKeys?.includes(decodeURIComponent(name))) {
      let cookieString = `${name}=; expires=${new Date(Date.now() - 1000)}`;

      if (clientKeysToRemoveOptions || clientKeysToRemoveOptions[name]) {
        const { path, domain, secure } =
          clientKeysToRemoveOptions || clientKeysToRemoveOptions[name];

        cookieString += `; path=${path || '/'}`;

        if (domain) {
          cookieString += `; domain=${domain}`;
        }

        if (secure) {
          cookieString += `; secure`;
        }
      }

      document.cookie = cookieString;
    } else {
      removeCookie(name);
    }
  }
}

export function getCookieKey(index: number): string | null {
  const keys = getCookieKeys();

  return keys[index] || null;
}
