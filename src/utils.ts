import { AES, Rabbit, RC4, RC4Drop, enc } from 'crypto-js';

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
