export class WindowIsNotDefinedError extends Error {
  constructor() {
    super(
      'Window is not defined. This error is probably caused by running the code in out of browser environment. Please make sure to run the code in a browser environment.',
    );
    this.name = 'WindowIsNotDefined';
  }
}
