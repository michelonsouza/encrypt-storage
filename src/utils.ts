import { AES, Rabbit, RC4, RC4Drop, enc, SHA256, MD5 } from 'crypto-js';

import { EncAlgorithm, Encryptation } from './types';

const algorithms = {
  AES,
  Rabbit,
  RC4,
  RC4Drop,
};

export function getEncryptation(
  encAlgorithm: EncAlgorithm,
  secretKey: string,
): Encryptation {
  return {
    encrypt: (value: string): string => {
      return algorithms[encAlgorithm].encrypt(value, secretKey).toString();
    },
    decrypt: (value: string): string => {
      return algorithms[encAlgorithm]
        .decrypt(value, secretKey)
        .toString(enc.Utf8);
    },
  };
}

export function hashSHA256(value: string, secret: string): string {
  const hashedValue = SHA256(value, {
    secret,
  });

  return hashedValue.toString();
}

export function hashMD5(value: string, secret: string): string {
  const hashedValue = MD5(value, {
    secret,
  });

  return hashedValue.toString();
}
