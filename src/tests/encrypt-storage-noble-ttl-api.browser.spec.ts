import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageNoble } from '@/classes';

import { makeSutFactory } from './test-utils';

let defaultMockedSut: EncryptStorageNoble | null = null;

let makeSut = makeSutFactory<EncryptStorageNoble | null, EncryptStorageNoble>(
  'noble',
  defaultMockedSut,
);

describe('EncryptStorageNoble TTL API 🕐', () => {
  beforeAll(() => {
    defaultMockedSut = makeSut();
    makeSut = makeSutFactory('noble', defaultMockedSut);
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterAll(() => {
    defaultMockedSut = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('setTTL', () => {
    it('should store a value with TTL in seconds', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = { name: faker.person.firstName() };

      sut.setTTL({ key, value, ttl: 3600 });

      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should store a value with TTL as a Date', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();
      const futureDate = new Date(Date.now() + 60_000);

      sut.setTTL({ key, value, ttl: futureDate });

      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should store a value without encryption when doNotEncrypt is true', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 3600, doNotEncrypt: true });

      const stored = sut.getItem(key, true);

      expect(stored).toHaveProperty('value', value);
      expect(stored).toHaveProperty('expiresAt');
    });

    it('should store a value with prefix', () => {
      const prefix = '@test';
      const sut = makeSut({ prefix });
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 3600 });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        `${prefix}:${key}`,
        expect.any(String),
      );
    });
  });

  describe('getTTL', () => {
    it('should return the stored value when TTL has not expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = { id: faker.string.uuid(), name: faker.person.firstName() };

      sut.setTTL({ key, value, ttl: 3600 });

      const result = sut.getTTL<typeof value>(key);

      expect(result).toEqual(value);
    });

    it('should return a string value when TTL has not expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.string.uuid();

      sut.setTTL({ key, value, ttl: 3600 });

      const result = sut.getTTL<string>(key);

      expect(result).toBe(value);
    });

    it('should return null when TTL has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 10 });

      vi.advanceTimersByTime(11_000);

      const result = sut.getTTL<string>(key);

      expect(result).toBeNull();
    });

    it('should remove the item from storage when TTL has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 5 });

      vi.advanceTimersByTime(6_000);

      sut.getTTL(key);

      expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it('should return null when key does not exist', () => {
      const sut = makeSut();
      const result = sut.getTTL('non_existent_key');

      expect(result).toBeNull();
    });

    it('should return the value when TTL is set with a future Date', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();
      const futureDate = new Date(Date.now() + 60_000);

      sut.setTTL({ key, value, ttl: futureDate });

      const result = sut.getTTL<string>(key);

      expect(result).toBe(value);
    });

    it('should return null when Date-based TTL has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();
      const pastDate = new Date(Date.now() + 5_000);

      sut.setTTL({ key, value, ttl: pastDate });

      vi.advanceTimersByTime(6_000);

      const result = sut.getTTL<string>(key);

      expect(result).toBeNull();
    });
  });

  describe('hasTTL', () => {
    it('should return true when the key exists and has not expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 3600 });

      expect(sut.hasTTL(key)).toBe(true);
    });

    it('should return false when the key does not exist', () => {
      const sut = makeSut();

      expect(sut.hasTTL('non_existent_key')).toBe(false);
    });

    it('should return false when the key has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 5 });

      vi.advanceTimersByTime(6_000);

      expect(sut.hasTTL(key)).toBe(false);
    });
  });

  describe('hasExpired', () => {
    it('should return false when the item has not expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 3600 });

      expect(sut.hasExpired(key)).toBe(false);
    });

    it('should return true when the item has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 5 });

      vi.advanceTimersByTime(6_000);

      expect(sut.hasExpired(key)).toBe(true);
    });

    it('should return true when the key does not exist', () => {
      const sut = makeSut();

      expect(sut.hasExpired('non_existent_key')).toBe(true);
    });
  });

  describe('getTTLMetadata', () => {
    it('should return metadata with correct expiresAt date', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const ttlInSeconds = 3600;

      sut.setTTL({ key, value: faker.word.sample(), ttl: ttlInSeconds });

      const metadata = sut.getTTLMetadata(key);

      expect(metadata).not.toBeNull();
      expect(metadata!.expiresAt).toBeInstanceOf(Date);
      expect(metadata!.expiresAt.getTime()).toBe(
        Date.now() + ttlInSeconds * 1000,
      );
    });

    it('should return metadata with remaining time in seconds', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const ttlInSeconds = 3600;

      sut.setTTL({ key, value: faker.word.sample(), ttl: ttlInSeconds });

      const metadata = sut.getTTLMetadata(key);

      expect(metadata).not.toBeNull();
      expect(metadata!.remaining).toBeGreaterThan(0);
      expect(metadata!.remaining).toBeLessThanOrEqual(ttlInSeconds);
    });

    it('should return metadata with expired as false when not expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 3600 });

      const metadata = sut.getTTLMetadata(key);

      expect(metadata).not.toBeNull();
      expect(metadata!.expired).toBe(false);
    });

    it('should return null when the key does not exist', () => {
      const sut = makeSut();

      const metadata = sut.getTTLMetadata('non_existent_key');

      expect(metadata).toBeNull();
    });

    it('should return null when the item has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 5 });

      vi.advanceTimersByTime(6_000);

      const metadata = sut.getTTLMetadata(key);

      expect(metadata).toBeNull();
    });
  });

  describe('getRemainingTTL', () => {
    it('should return remaining time in seconds', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const ttlInSeconds = 3600;

      sut.setTTL({ key, value: faker.word.sample(), ttl: ttlInSeconds });

      const remaining = sut.getRemainingTTL(key);

      expect(remaining).not.toBeNull();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(ttlInSeconds);
    });

    it('should return a decreased value after time advances', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const ttlInSeconds = 3600;

      sut.setTTL({ key, value: faker.word.sample(), ttl: ttlInSeconds });

      vi.advanceTimersByTime(1000);

      const remaining = sut.getRemainingTTL(key);

      expect(remaining).not.toBeNull();
      expect(remaining!).toBeLessThan(ttlInSeconds);
    });

    it('should return null when the key does not exist', () => {
      const sut = makeSut();

      const remaining = sut.getRemainingTTL('non_existent_key');

      expect(remaining).toBeNull();
    });

    it('should return null when the item has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 5 });

      vi.advanceTimersByTime(6_000);

      const remaining = sut.getRemainingTTL(key);

      expect(remaining).toBeNull();
    });

    it('should return 0 when remaining time is zero or negative', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const now = Date.now();

      sut.setTTL({ key, value: faker.word.sample(), ttl: 10 });

      // Advance time to just before expiration so #getTTLRecord passes
      // then mock Date.now to return a value past expiresAt for the remaining calculation
      vi.advanceTimersByTime(9_999);

      const dateNowSpy = vi.spyOn(Date, 'now');
      let callCount = 0;
      dateNowSpy.mockImplementation(() => {
        callCount += 1;
        // First call is inside #getTTLRecord (item still valid)
        if (callCount <= 1) {
          return now + 9_999;
        }
        // Second call is for the remaining calculation (past expiresAt)
        return now + 11_000;
      });

      const remaining = sut.getRemainingTTL(key);

      expect(remaining).toBe(0);

      dateNowSpy.mockRestore();
    });
  });

  describe('refreshTTL', () => {
    it('should update the TTL of an existing item with seconds', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 100 });

      vi.advanceTimersByTime(50_000);

      const result = sut.refreshTTL({ key, ttl: 200 });

      expect(result).toBe(true);

      const retrieved = sut.getTTL<string>(key);

      expect(retrieved).toBe(value);
      expect(sut.getRemainingTTL(key)).toBeGreaterThan(190);
    });

    it('should update the TTL of an existing item with a Date', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 100 });

      const newExpiration = new Date(Date.now() + 120_000);
      const result = sut.refreshTTL({ key, ttl: newExpiration });

      expect(result).toBe(true);
    });

    it('should return false when the key does not exist', () => {
      const sut = makeSut();

      const result = sut.refreshTTL({ key: 'non_existent_key', ttl: 3600 });

      expect(result).toBe(false);
    });

    it('should return false when the item has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 5 });

      vi.advanceTimersByTime(6_000);

      const result = sut.refreshTTL({ key, ttl: 3600 });

      expect(result).toBe(false);
    });

    it('should preserve the original value after refreshing TTL', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = { id: faker.string.uuid(), name: faker.person.firstName() };

      sut.setTTL({ key, value, ttl: 100 });

      sut.refreshTTL({ key, ttl: 500 });

      const retrieved = sut.getTTL<typeof value>(key);

      expect(retrieved).toEqual(value);
    });
  });

  describe('removeTTL', () => {
    it('should remove the TTL and keep the value as permanent', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 10 });

      const result = sut.removeTTL(key);

      expect(result).toBe(true);

      vi.advanceTimersByTime(11_000);

      const stored = sut.getItem<string>(key);

      expect(stored).toBe(value);
    });

    it('should return false when the key does not exist', () => {
      const sut = makeSut();

      const result = sut.removeTTL('non_existent_key');

      expect(result).toBe(false);
    });

    it('should return false when the item has expired', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setTTL({ key, value: faker.word.sample(), ttl: 5 });

      vi.advanceTimersByTime(6_000);

      const result = sut.removeTTL(key);

      expect(result).toBe(false);
    });
  });

  describe('TTL with sessionStorage', () => {
    it('should work with sessionStorage', () => {
      const sut = makeSut({ storageType: 'sessionStorage' });
      const key = faker.string.alphanumeric(5);
      const value = faker.word.sample();

      sut.setTTL({ key, value, ttl: 3600 });

      expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);

      const result = sut.getTTL<string>(key);

      expect(result).toBe(value);
    });
  });

  describe('TTL with prefix', () => {
    it('should correctly store and retrieve TTL items with prefix', () => {
      const prefix = '@app';
      const sut = makeSut({ prefix });
      const key = faker.string.alphanumeric(5);
      const value = { id: faker.string.uuid() };

      sut.setTTL({ key, value, ttl: 3600 });

      const result = sut.getTTL<typeof value>(key);

      expect(result).toEqual(value);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `${prefix}:${key}`,
        expect.any(String),
      );
    });
  });

  describe('TTL with invalid storage format', () => {
    it('should return null from getTTL when stored item is not a valid TTL record', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      // Store a plain value (not a TTLStorageValue shape)
      sut.setItem(key, { name: 'not-a-ttl-record' });

      const result = sut.getTTL(key);

      expect(result).toBeNull();
    });

    it('should return null from getTTL when stored item has no expiresAt field', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      // Store an object with value but without a numeric expiresAt
      sut.setItem(key, { value: 'some-value', expiresAt: 'not-a-number' });

      const result = sut.getTTL(key);

      expect(result).toBeNull();
    });

    it('should return false from hasTTL when stored item is not a valid TTL record', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setItem(key, 'just-a-string');

      expect(sut.hasTTL(key)).toBe(false);
    });

    it('should return null from getTTLMetadata when stored item is not a valid TTL record', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setItem(key, { value: 'test' });

      expect(sut.getTTLMetadata(key)).toBeNull();
    });

    it('should return null from getRemainingTTL when stored item is not a valid TTL record', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setItem(key, [1, 2, 3]);

      expect(sut.getRemainingTTL(key)).toBeNull();
    });

    it('should return true from hasExpired when stored item is not a valid TTL record', () => {
      const sut = makeSut();
      const key = faker.string.alphanumeric(5);

      sut.setItem(key, { foo: 'bar' });

      expect(sut.hasExpired(key)).toBe(true);
    });
  });
});
