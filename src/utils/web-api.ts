import type { AsyncEncryptation, WebApiEncryptAlgorithms } from '@/@types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const cryptoKeys = new Map<string, CryptoKey>();

const algorithms = {
  'AES-GCM': {
    ivLength: 12,

    createAlgorithm(iv: Uint8Array): AesGcmParams {
      return {
        name: 'AES-GCM',
        // @ts-expect-error
        iv,
      };
    },
  },

  'AES-CBC': {
    ivLength: 16,

    createAlgorithm(iv: Uint8Array): AesCbcParams {
      return {
        name: 'AES-CBC',
        // @ts-expect-error
        iv,
      };
    },
  },

  'AES-CTR': {
    ivLength: 16,

    createAlgorithm(counter: Uint8Array): AesCtrParams {
      return {
        name: 'AES-CTR',
        // @ts-expect-error
        counter,
        length: 64,
      };
    },
  },
} satisfies Record<
  WebApiEncryptAlgorithms,
  {
    ivLength: number;
    createAlgorithm(iv: Uint8Array): AesGcmParams | AesCbcParams | AesCtrParams;
  }
>;

function encodeBase64(bytes: Uint8Array): string {
  /* v8 ignore start -- @preserve */
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return globalThis.btoa(binary);
  /* v8 ignore stop -- @preserve */
}

function decodeBase64(base64: string): Uint8Array {
  /* v8 ignore start -- @preserve */
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }

  const binary = globalThis.atob(base64);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  /* v8 ignore stop -- @preserve */
}

async function deriveSecretKey(
  secret: string,
  algorithm: WebApiEncryptAlgorithms,
): Promise<CryptoKey> {
  const cacheKey = `${algorithm}:${secret}`;

  const cached = cryptoKeys.get(cacheKey);

  /* v8 ignore start -- @preserve */
  if (cached) {
    return cached;
  }
  /* v8 ignore stop -- @preserve */

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode('encrypt-storage'),
      iterations: 100000,
    },
    keyMaterial,
    {
      name: algorithm,
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );

  cryptoKeys.set(cacheKey, cryptoKey);

  return cryptoKey;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return encodeBase64(new Uint8Array(buffer));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  return decodeBase64(base64).buffer as ArrayBuffer;
}

function concat(iv: Uint8Array, encrypted: ArrayBuffer): ArrayBuffer {
  const cipher = new Uint8Array(encrypted);

  const result = new Uint8Array(iv.length + cipher.length);

  result.set(iv);
  result.set(cipher, iv.length);

  return result.buffer;
}

function split(buffer: ArrayBuffer, ivLength: number) {
  const bytes = new Uint8Array(buffer);

  return {
    iv: bytes.slice(0, ivLength),
    cipher: bytes.slice(ivLength),
  };
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  let hex = '';

  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }

  return hex;
}

export async function getAsyncEncryptation(
  encryptationAlgorithm: WebApiEncryptAlgorithms,
  secretKey: string,
): Promise<AsyncEncryptation> {
  const key = await deriveSecretKey(secretKey, encryptationAlgorithm);

  const algorithm = algorithms[encryptationAlgorithm];

  return {
    async encrypt(value: string): Promise<string> {
      const iv = crypto.getRandomValues(new Uint8Array(algorithm.ivLength));

      const encrypted = await crypto.subtle.encrypt(
        algorithm.createAlgorithm(iv),
        key,
        encoder.encode(value),
      );

      return arrayBufferToBase64(concat(iv, encrypted));
    },

    async decrypt(value: string): Promise<string> {
      const payload = base64ToArrayBuffer(value);

      const { iv, cipher } = split(payload, algorithm.ivLength);

      const decrypted = await crypto.subtle.decrypt(
        algorithm.createAlgorithm(iv),
        key,
        cipher,
      );

      return decoder.decode(decrypted);
    },
  };
}

export async function hashAsyncSHA256(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(value));

  return bufferToHex(buffer);
}
