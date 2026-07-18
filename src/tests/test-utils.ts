import { fakerPT_BR as faker } from '@faker-js/faker';

import {
  EncryptStorage,
  EncryptStorageNoble,
  EncryptStorageWebApi,
} from '@/classes';

import type { EncryptStorageOptions, NotifyHandler } from '@/@types';

type MakeSutParams = Omit<EncryptStorageOptions, 'engine'> & {
  secretKey?: string;
  noOptions?: boolean;
  noNotifyHandler?: boolean;
};

type EncryptStorageType = EncryptStorageNoble | EncryptStorageWebApi;

type DefaultEncryptStorageType = EncryptStorageType | null;

type EngineType = 'crypto-js' | 'noble' | 'web-crypto';

export function makeSutFactory<
  DefaultType extends DefaultEncryptStorageType,
  ReturnType extends EncryptStorageType,
>(engine: EngineType, defaltClass: DefaultType, notifier?: NotifyHandler) {
  return (params: MakeSutParams = {} as MakeSutParams): ReturnType => {
    const {
      prefix,
      storageType,
      stateManagementUse,
      noOptions,
      encAlgorithm,
      validation,
      noNotifyHandler = false,
      doNotParseValues = false,
      notifyHandler = noNotifyHandler ? undefined : notifier,
      secretKey = faker.string.alphanumeric(10),
    } = params;
    const options = (
      noOptions
        ? { engine }
        : {
            prefix,
            storageType,
            encAlgorithm,
            notifyHandler,
            doNotParseValues,
            engine,
            stateManagementUse,
            validation,
          }
    ) as EncryptStorageOptions;

    const hasParams = !!Object.keys(params).length;

    if (!hasParams && defaltClass) {
      return defaltClass as unknown as ReturnType;
    }

    return EncryptStorage.create(
      secretKey,
      options as unknown as any,
    ) as unknown as ReturnType;
  };
}
