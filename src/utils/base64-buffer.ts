interface SplitResult {
  iv: Uint8Array;
  cipher: Uint8Array<ArrayBuffer>;
}

/**
 * @description Convert Uint8Array to base64
 * @param {Uint8Array} bytes
 * @returns {string} `string`
 */
export function encodeBase64(bytes: Uint8Array): string {
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

/**
 * @description Convert base64 to Uint8Array
 * @param {string} base64
 * @returns {Uint8Array} `Uint8Array`
 */
export function decodeBase64(base64: string): Uint8Array {
  /* v8 ignore start -- @preserve */
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }

  const binary = globalThis.atob(base64);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  /* v8 ignore stop -- @preserve */
}

/**
 * @description Convert ArrayBuffer to base64
 * @param {ArrayBuffer} buffer
 * @returns `string`
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return encodeBase64(new Uint8Array(buffer));
}

/**
 * @description Convert base64 to ArrayBuffer
 * @param {string} base64
 * @returns {ArrayBuffer} `ArrayBuffer`
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  return decodeBase64(base64).buffer as ArrayBuffer;
}

/**
 * @description Concat iv and cipher
 * @param {Uint8Array} iv
 * @param {ArrayBuffer} encrypted
 * @returns {ArrayBuffer} `ArrayBuffer`
 */
export function concat(
  iv: Uint8Array,
  encrypted:
    | ArrayBuffer
    | Uint8Array<ArrayBuffer>
    | Uint8Array<ArrayBufferLike>
    | (Uint8Array<ArrayBufferLike> & Uint8Array<ArrayBuffer>),
): ArrayBuffer {
  const cipher = new Uint8Array(encrypted);

  const result = new Uint8Array(iv.length + cipher.length);

  result.set(iv);
  result.set(cipher, iv.length);

  return result.buffer;
}

/**
 * @description Split iv and cipher
 * @param {ArrayBuffer} buffer
 * @param {number} ivLength
 * @returns {SplitResult} `SplitResult`
 */
export function split(buffer: ArrayBuffer, ivLength: number): SplitResult {
  const bytes = new Uint8Array(buffer);

  return {
    iv: bytes.slice(0, ivLength),
    cipher: bytes.slice(ivLength),
  };
}

/**
 * @description Convert ArrayBuffer to hex
 * @param {ArrayBuffer} buffer
 * @returns {string} `string`
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  let hex = '';

  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }

  return hex;
}
