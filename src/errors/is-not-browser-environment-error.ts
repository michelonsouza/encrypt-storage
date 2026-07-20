export class IsNotBrowserEnvironmentError extends Error {
  constructor() {
    super(
      'The current environment is not a browser environment. Please use the EncryptStorageWebApi engine.',
    );
    this.name = 'IsNotBrowserEnvironmentError';
  }
}
