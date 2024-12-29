export class InvalidSecretKeyError extends Error {
  constructor() {
    super(
      'The secretKey parameter must bne contains min 10 characters. Please provide a valid secretKey',
    );
    this.name = 'InvalidSecretKeyError';
  }
}
