import { Application, View, Utils } from '@nativescript/core';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FlittConfig {
  merchantId: number;
  /** Apple Pay merchant identifier (e.g. "merchant.com.yourapp"). Configure in Xcode entitlements too. */
  applePayMerchantId?: string;
}

export interface FlittOrderParams {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  email?: string;
  lang?: 'ru' | 'uk' | 'en' | 'lv' | 'fr';
  preauth?: boolean;
  serverCallbackUrl?: string;
  lifetime?: number;
  productId?: string;
  merchantData?: string;
  requiredRecToken?: boolean;
  recToken?: string;
  verification?: boolean;
  verificationType?: 'amount' | 'code';
  delayed?: boolean;
  paymentSystems?: string;
  defaultPaymentSystem?: string;
  reservationData?: string;
  /** Arbitrary key-value pairs passed to the Flitt API */
  arguments?: Record<string, string>;
}

export interface FlittCardParams {
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvv: string;
}

export interface FlittReceipt {
  status: 'created' | 'processing' | 'declined' | 'approved' | 'expired' | 'reversed';
  maskedCard: string;
  cardBin: string;
  amount: number;
  paymentId: number;
  currency: string;
  transactionType: string;
  rrn: string;
  approvalCode: string;
  responseCode: string;
  fee: number;
  actualAmount: number;
  actualCurrency: string;
  paymentSystem: string;
  rawReceipt: any;
}

// ─── Lang / Verification maps ────────────────────────────────────────────────

const langMap: Record<string, PSLang> = {
  ru: PSLang.Ru,
  uk: PSLang.Uk,
  en: PSLang.En,
  lv: PSLang.Lv,
  fr: PSLang.Fr,
};

const verificationMap: Record<string, PSVerification> = {
  amount: PSVerification.Amount,
  code: PSVerification.Code,
};

// ─── Card creation ───────────────────────────────────────────────────────────
// PSCard's factory method is internal (not in public header), so NativeScript
// metadata doesn't include it. Use KVC to set the private-readwrite properties.

export function createFlittCard(params: FlittCardParams): PSCard {
  const card = PSCard.alloc().init();
  card.setValueForKey(params.cardNumber, 'cardNumber');
  card.setValueForKey(parseInt(params.expireMonth, 10), 'mm');
  card.setValueForKey(parseInt(params.expireYear, 10), 'yy');
  card.setValueForKey(params.cvv, 'cvv');
  return card;
}

// ─── Order creation ──────────────────────────────────────────────────────────

export function createFlittOrder(params: FlittOrderParams): PSOrder {
  const order = PSOrder.alloc().initOrderAStringCurrencyAIdentifierAAbout(params.amount, params.currency, params.orderId, params.description);

  if (params.email) {
    order.email = params.email;
  }
  if (params.lang && langMap[params.lang] !== undefined) {
    order.lang = langMap[params.lang];
  }
  if (params.preauth !== undefined) {
    order.preauth = params.preauth;
  }
  if (params.serverCallbackUrl) {
    order.serverCallbackUrl = params.serverCallbackUrl;
  }
  if (params.lifetime !== undefined) {
    order.lifetime = params.lifetime;
  }
  if (params.productId) {
    order.productId = params.productId;
  }
  if (params.merchantData) {
    order.merchantData = params.merchantData;
  }
  if (params.requiredRecToken !== undefined) {
    order.requiredRecToken = params.requiredRecToken;
  }
  if (params.recToken) {
    order.recToken = params.recToken;
  }
  if (params.verification !== undefined) {
    order.verification = params.verification;
  }
  if (params.verificationType && verificationMap[params.verificationType] !== undefined) {
    order.verificationType = verificationMap[params.verificationType];
  }
  if (params.delayed !== undefined) {
    order.delayed = params.delayed;
  }
  if (params.paymentSystems) {
    order.paymentSystems = params.paymentSystems;
  }
  if (params.defaultPaymentSystem) {
    order.defaultPaymentSystem = params.defaultPaymentSystem;
  }
  if (params.reservationData) {
    order.reservationData = params.reservationData;
  }

  return order;
}

// ─── Platform capability checks ──────────────────────────────────────────────

export function isGooglePaySupported(): boolean {
  return false;
}

export function isApplePaySupported(): boolean {
  return PSCloudipspApi.supportsApplePay();
}

// ─── Receipt mapper ──────────────────────────────────────────────────────────

const statusMap: Record<number, FlittReceipt['status']> = {
  [PSReceiptStatus.Created]: 'created',
  [PSReceiptStatus.Processing]: 'processing',
  [PSReceiptStatus.Declined]: 'declined',
  [PSReceiptStatus.Approved]: 'approved',
  [PSReceiptStatus.Expired]: 'expired',
  [PSReceiptStatus.Reversed]: 'reversed',
};

const transactionTypeMap: Record<number, string> = {
  [PSReceiptTransationType.Purchase]: 'purchase',
  [PSReceiptTransationType.Reverse]: 'reverse',
};

function mapReceipt(native: PSReceipt): FlittReceipt {
  return {
    status: statusMap[native.status] || 'created',
    maskedCard: native.maskedCard || '',
    cardBin: native.cardBin || '',
    amount: native.amount,
    paymentId: native.paymentId,
    currency: native.currency || '',
    transactionType: transactionTypeMap[native.transationType] || 'purchase',
    rrn: native.rrn || '',
    approvalCode: native.approvalCode || '',
    responseCode: native.responseCode || '',
    fee: native.fee,
    actualAmount: native.actualAmount,
    actualCurrency: native.actualCurrency || '',
    paymentSystem: native.paymentSystem || '',
    rawReceipt: native,
  };
}

// ─── Delegate: PSPayCallbackDelegate ─────────────────────────────────────────

@NativeClass()
class PayCallbackDelegateImpl extends NSObject implements PSPayCallbackDelegate {
  static ObjCProtocols = [PSPayCallbackDelegate];

  private _resolve: (receipt: FlittReceipt) => void;
  private _reject: (err: Error) => void;

  static initWithResolveReject(resolve: (receipt: FlittReceipt) => void, reject: (err: Error) => void): PayCallbackDelegateImpl {
    const delegate = <PayCallbackDelegateImpl>PayCallbackDelegateImpl.new();
    delegate._resolve = resolve;
    delegate._reject = reject;
    return delegate;
  }

  onPaidProcess(receipt: PSReceipt): void {
    this._resolve(mapReceipt(receipt));
  }

  onPaidFailure(error: NSError): void {
    this._reject(new Error(error.localizedDescription || 'Payment failed'));
  }

  onWaitConfirm(): void {
    // 3DS confirmation handled by WebView automatically
  }
}

// ─── Delegate: PSApplePayCallbackDelegate ────────────────────────────────────

@NativeClass()
class ApplePayCallbackDelegateImpl extends NSObject implements PSApplePayCallbackDelegate {
  static ObjCProtocols = [PSApplePayCallbackDelegate];

  private _resolve: (receipt: FlittReceipt) => void;
  private _reject: (err: Error) => void;

  static initWithResolveReject(resolve: (receipt: FlittReceipt) => void, reject: (err: Error) => void): ApplePayCallbackDelegateImpl {
    const delegate = <ApplePayCallbackDelegateImpl>ApplePayCallbackDelegateImpl.new();
    delegate._resolve = resolve;
    delegate._reject = reject;
    return delegate;
  }

  onPaidProcess(receipt: PSReceipt): void {
    this._resolve(mapReceipt(receipt));
  }

  onPaidFailure(error: NSError): void {
    this._reject(new Error(error.localizedDescription || 'Apple Pay failed'));
  }

  onWaitConfirm(): void {}

  onApplePayNavigate(viewController: UIViewController): void {
    const rootVC = getTopmostViewController();
    if (rootVC) {
      rootVC.presentViewControllerAnimatedCompletion(viewController, true, null);
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTopmostViewController(): UIViewController | null {
  let rootVC = Application.ios?.rootController;
  if (!rootVC) {
    rootVC = Application.ios?.window?.rootViewController;
  }
  if (!rootVC) return null;
  while (rootVC.presentedViewController) {
    rootVC = rootVC.presentedViewController;
  }
  return rootVC;
}

// ─── FlittWebView (optional NativeScript view wrapper) ───────────────────────

export class FlittWebView extends View {
  createNativeView(): PSCloudipspWKWebView {
    return PSCloudipspWKWebView.alloc().initWithFrame(CGRectZero);
  }

  disposeNativeView(): void {
    super.disposeNativeView();
  }
}

// ─── FlittPayment ────────────────────────────────────────────────────────────
// Main payment class. Creates a PSCloudipspWKWebView as a full-screen native
// overlay for 3-D Secure authentication. The SDK toggles the WebView's
// visibility automatically.

export class FlittPayment {
  private api: PSCloudipspApi;
  private webView: PSCloudipspWKWebView;
  private attached = false;
  private applePayMerchantId: string | undefined;

  // Retained delegate references to prevent GC (critical for iOS delegates)
  private currentDelegate: any = null;

  constructor(config: FlittConfig) {
    this.applePayMerchantId = config.applePayMerchantId;

    const rootVC = getTopmostViewController();
    const bounds = rootVC ? rootVC.view.bounds : UIScreen.mainScreen.bounds;

    this.webView = PSCloudipspWKWebView.alloc().initWithFrame(bounds);
    this.webView.hidden = true;

    if (rootVC) {
      rootVC.view.addSubview(this.webView);
      this.attached = true;
    }

    this.api = PSCloudipspApi.apiWithMerchantAndCloudipspView(config.merchantId, this.webView);
  }

  // ─── Card payment ──────────────────────────────────────────────────────────

  pay(cardParams: FlittCardParams, orderParams: FlittOrderParams): Promise<FlittReceipt> {
    const card = createFlittCard(cardParams);
    const order = createFlittOrder(orderParams);

    return new Promise<FlittReceipt>((resolve, reject) => {
      const delegate = PayCallbackDelegateImpl.initWithResolveReject(
        (receipt) => {
          this.currentDelegate = null;
          resolve(receipt);
        },
        (err) => {
          this.currentDelegate = null;
          reject(err);
        },
      );
      this.currentDelegate = delegate; // prevent GC
      this.api.payWithOrderAndDelegate(card, order, delegate);
    });
  }

  payToken(cardParams: FlittCardParams, token: string): Promise<FlittReceipt> {
    const card = createFlittCard(cardParams);

    return new Promise<FlittReceipt>((resolve, reject) => {
      const delegate = PayCallbackDelegateImpl.initWithResolveReject(
        (receipt) => {
          this.currentDelegate = null;
          resolve(receipt);
        },
        (err) => {
          this.currentDelegate = null;
          reject(err);
        },
      );
      this.currentDelegate = delegate;
      this.api.payWithTokenAndDelegate(card, token, delegate);
    });
  }

  // ─── Apple Pay ─────────────────────────────────────────────────────────────

  payWithApplePay(orderParams: FlittOrderParams): Promise<FlittReceipt> {
    const order = createFlittOrder(orderParams);
    if (this.applePayMerchantId) {
      order.applePayInfo = this.applePayMerchantId;
    }

    return new Promise<FlittReceipt>((resolve, reject) => {
      const delegate = ApplePayCallbackDelegateImpl.initWithResolveReject(
        (receipt) => {
          this.currentDelegate = null;
          resolve(receipt);
        },
        (err) => {
          this.currentDelegate = null;
          reject(err);
        },
      );
      this.currentDelegate = delegate;
      this.api.applePayAndDelegate(order, delegate);
    });
  }

  payWithApplePayToken(token: string): Promise<FlittReceipt> {
    return new Promise<FlittReceipt>((resolve, reject) => {
      const delegate = ApplePayCallbackDelegateImpl.initWithResolveReject(
        (receipt) => {
          this.currentDelegate = null;
          resolve(receipt);
        },
        (err) => {
          this.currentDelegate = null;
          reject(err);
        },
      );
      this.currentDelegate = delegate;
      this.api.applePayWithTokenAndDelegate(token, delegate);
    });
  }

  // ─── Google Pay stubs (not available on iOS) ───────────────────────────────

  payWithGooglePay(_orderParams: FlittOrderParams): Promise<FlittReceipt> {
    return Promise.reject(new Error('Google Pay is not supported on iOS. Use payWithApplePay instead.'));
  }

  payWithGooglePayToken(_token: string): Promise<FlittReceipt> {
    return Promise.reject(new Error('Google Pay is not supported on iOS. Use payWithApplePayToken instead.'));
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  dispose(): void {
    this.currentDelegate = null;
    if (this.attached && this.webView) {
      this.webView.removeFromSuperview();
      this.attached = false;
    }
  }
}
