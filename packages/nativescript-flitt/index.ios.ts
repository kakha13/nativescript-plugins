// iOS implementation will be added later.
// For now, export stubs so the module resolves on iOS without crashing.

export { FlittConfig, FlittOrderParams, FlittCardParams, FlittReceipt } from './index';

export function createFlittCard(_params: any): any {
  throw new Error('nativescript-flitt: iOS is not yet supported');
}

export function createFlittOrder(_params: any): any {
  throw new Error('nativescript-flitt: iOS is not yet supported');
}

export function isGooglePaySupported(): boolean {
  return false;
}

export class FlittWebView {
  constructor() {
    throw new Error('nativescript-flitt: iOS is not yet supported');
  }
}

export class FlittPayment {
  constructor(_config: any) {
    throw new Error('nativescript-flitt: iOS is not yet supported');
  }
  pay(_card: any, _order: any): Promise<any> {
    return Promise.reject(new Error('nativescript-flitt: iOS is not yet supported'));
  }
  payToken(_card: any, _token: string): Promise<any> {
    return Promise.reject(new Error('nativescript-flitt: iOS is not yet supported'));
  }
  payWithGooglePay(_order: any): Promise<any> {
    return Promise.reject(new Error('nativescript-flitt: iOS is not yet supported'));
  }
  payWithGooglePayToken(_token: string): Promise<any> {
    return Promise.reject(new Error('nativescript-flitt: iOS is not yet supported'));
  }
  dispose(): void {}
}
