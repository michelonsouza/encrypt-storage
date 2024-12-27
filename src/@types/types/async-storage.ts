import { EncryptStorageOptions } from './common';

export type AsyncStorageOptions = Omit<EncryptStorageOptions, 'storageType'> & {
  storageType?: 'localStorage' | 'sessionStorage';
};
