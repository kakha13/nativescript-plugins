import { Application, AndroidApplication, View } from '@nativescript/core';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FlittConfig {
  merchantId: number;
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

// ─── Card creation via Parcelable ────────────────────────────────────────────
// The Card constructor is package-private in the SDK, so we use the
// public Parcelable CREATOR to construct instances from a Parcel.

export function createFlittCard(params: FlittCardParams): com.flitt.android.Card {
  const parcel = android.os.Parcel.obtain();
  try {
    parcel.writeString(params.cardNumber);
    parcel.writeInt(parseInt(params.expireMonth, 10));
    parcel.writeInt(parseInt(params.expireYear, 10));
    parcel.writeString(params.cvv);
    parcel.writeInt(0); // Card.SOURCE_FORM = 0
    parcel.setDataPosition(0);
    return com.flitt.android.Card.CREATOR.createFromParcel(parcel);
  } finally {
    parcel.recycle();
  }
}

// ─── Order creation ──────────────────────────────────────────────────────────

export function createFlittOrder(params: FlittOrderParams): com.flitt.android.Order {
  const order = new com.flitt.android.Order(params.amount, params.currency, params.orderId, params.description, params.email || null);
  if (params.lang) {
    order.setLang(com.flitt.android.Order.Lang.valueOf(params.lang));
  }
  if (params.preauth !== undefined) {
    order.setPreauth(params.preauth);
  }
  if (params.serverCallbackUrl) {
    order.setServerCallbackUrl(params.serverCallbackUrl);
  }
  if (params.lifetime !== undefined) {
    order.setLifetime(params.lifetime);
  }
  if (params.productId) {
    order.setProductId(params.productId);
  }
  if (params.merchantData) {
    order.setMerchantData(params.merchantData);
  }
  if (params.requiredRecToken !== undefined) {
    order.setRequiredRecToken(params.requiredRecToken);
  }
  if (params.recToken) {
    order.setRecToken(params.recToken);
  }
  if (params.verification !== undefined) {
    order.setVerification(params.verification);
  }
  if (params.verificationType) {
    order.setVerificationType(com.flitt.android.Order.Verification.valueOf(params.verificationType));
  }
  if (params.delayed !== undefined) {
    order.setDelayed(params.delayed);
  }
  if (params.paymentSystems) {
    order.setPaymentSystems(params.paymentSystems);
  }
  if (params.defaultPaymentSystem) {
    order.setDefaultPaymentSystem(params.defaultPaymentSystem);
  }
  if (params.reservationData) {
    order.setReservationData(params.reservationData);
  }
  if (params.arguments) {
    for (const [key, value] of Object.entries(params.arguments)) {
      order.addArgument(key, value);
    }
  }
  return order;
}

// ─── Google Pay check ────────────────────────────────────────────────────────

export function isGooglePaySupported(): boolean {
  const ctx = (Application.android.getNativeApplication() as android.app.Application).getApplicationContext();
  return com.flitt.android.Cloudipsp.supportsGooglePay(ctx);
}

export function isApplePaySupported(): boolean {
  return false;
}

// ─── Receipt mapper ──────────────────────────────────────────────────────────

function mapReceipt(native: com.flitt.android.Receipt): FlittReceipt {
  return {
    status: native.status.name() as FlittReceipt['status'],
    maskedCard: native.maskedCard,
    cardBin: native.cardBin,
    amount: native.amount,
    paymentId: native.paymentId,
    currency: native.currency,
    transactionType: native.transationType.name(),
    rrn: native.rrn,
    approvalCode: native.approvalCode,
    responseCode: native.responseCode,
    fee: native.fee,
    actualAmount: native.actualAmount,
    actualCurrency: native.actualCurrency,
    paymentSystem: native.paymentSystem,
    rawReceipt: native,
  };
}

// ─── FlittWebView (optional NativeScript view wrapper) ───────────────────────

export class FlittWebView extends View {
  createNativeView(): com.flitt.android.CloudipspWebView {
    return new com.flitt.android.CloudipspWebView(this._context);
  }

  disposeNativeView(): void {
    super.disposeNativeView();
  }
}

// ─── FlittPayment ────────────────────────────────────────────────────────────
// Main payment class. Creates a CloudipspWebView as a full-screen native overlay
// for 3-D Secure authentication. The SDK toggles the WebView's visibility
// automatically (GONE when idle, VISIBLE during 3DS).

export class FlittPayment {
  private static readonly RC_GOOGLE_PAY = 100500;

  private cloudipsp: com.flitt.android.Cloudipsp;
  private webView: com.flitt.android.CloudipspWebView;
  private attached = false;

  // Google Pay state
  private googlePayCall: com.flitt.android.GooglePayCall | null = null;
  private googlePayResolve: ((receipt: FlittReceipt) => void) | null = null;
  private googlePayReject: ((err: Error) => void) | null = null;
  private activityResultHandler: ((args: any) => void) | null = null;

  constructor(config: FlittConfig) {
    const activity = Application.android.foregroundActivity || Application.android.startActivity;
    this.webView = new com.flitt.android.CloudipspWebView(activity);
    this.cloudipsp = new com.flitt.android.Cloudipsp(config.merchantId, this.webView);

    // Add the WebView as a full-screen overlay to the activity's content view.
    // The SDK initializes it as GONE so nothing is visible until 3DS triggers.
    const rootView = activity.findViewById(android.R.id.content) as android.view.ViewGroup;
    const params = new android.widget.FrameLayout.LayoutParams(android.widget.FrameLayout.LayoutParams.MATCH_PARENT, android.widget.FrameLayout.LayoutParams.MATCH_PARENT);
    rootView.addView(this.webView as any, params);
    this.attached = true;
  }

  // ─── Card payment ──────────────────────────────────────────────────────────

  pay(cardParams: FlittCardParams, orderParams: FlittOrderParams): Promise<FlittReceipt> {
    const card = createFlittCard(cardParams);
    const order = createFlittOrder(orderParams);
    const cloudipsp = this.cloudipsp;

    return new Promise<FlittReceipt>((resolve, reject) => {
      cloudipsp.pay(
        card,
        order,
        new com.flitt.android.Cloudipsp.PayCallback({
          onPaidProcessed(receipt: com.flitt.android.Receipt) {
            resolve(mapReceipt(receipt));
          },
          onPaidFailure(e: com.flitt.android.Cloudipsp.Exception) {
            reject(new Error(e.getMessage() || 'Payment failed'));
          },
        }),
      );
    });
  }

  payToken(cardParams: FlittCardParams, token: string): Promise<FlittReceipt> {
    const card = createFlittCard(cardParams);
    const cloudipsp = this.cloudipsp;

    return new Promise<FlittReceipt>((resolve, reject) => {
      cloudipsp.payToken(
        card,
        token,
        new com.flitt.android.Cloudipsp.PayCallback({
          onPaidProcessed(receipt: com.flitt.android.Receipt) {
            resolve(mapReceipt(receipt));
          },
          onPaidFailure(e: com.flitt.android.Cloudipsp.Exception) {
            reject(new Error(e.getMessage() || 'Payment failed'));
          },
        }),
      );
    });
  }

  // ─── Google Pay ────────────────────────────────────────────────────────────

  payWithGooglePay(orderParams: FlittOrderParams): Promise<FlittReceipt> {
    const order = createFlittOrder(orderParams);
    const activity = Application.android.foregroundActivity;
    const cloudipsp = this.cloudipsp;

    return new Promise<FlittReceipt>((resolve, reject) => {
      this.googlePayResolve = resolve;
      this.googlePayReject = reject;

      this.registerActivityResultHandler();

      cloudipsp.googlePayInitialize(
        order,
        activity,
        FlittPayment.RC_GOOGLE_PAY,
        new com.flitt.android.Cloudipsp.GooglePayCallback({
          onGooglePayInitialized: (result: com.flitt.android.GooglePayCall) => {
            this.googlePayCall = result;
          },
          onPaidFailure: (e: com.flitt.android.Cloudipsp.Exception) => {
            this.cleanupGooglePay();
            reject(new Error(e.getMessage() || 'Google Pay initialization failed'));
          },
        }),
      );
    });
  }

  payWithGooglePayToken(token: string): Promise<FlittReceipt> {
    const activity = Application.android.foregroundActivity;
    const cloudipsp = this.cloudipsp;

    return new Promise<FlittReceipt>((resolve, reject) => {
      this.googlePayResolve = resolve;
      this.googlePayReject = reject;

      this.registerActivityResultHandler();

      cloudipsp.googlePayInitialize(
        token,
        activity,
        FlittPayment.RC_GOOGLE_PAY,
        new com.flitt.android.Cloudipsp.GooglePayCallback({
          onGooglePayInitialized: (result: com.flitt.android.GooglePayCall) => {
            this.googlePayCall = result;
          },
          onPaidFailure: (e: com.flitt.android.Cloudipsp.Exception) => {
            this.cleanupGooglePay();
            reject(new Error(e.getMessage() || 'Google Pay initialization failed'));
          },
        }),
      );
    });
  }

  private registerActivityResultHandler(): void {
    this.unregisterActivityResultHandler();

    this.activityResultHandler = (args: any) => {
      if (args.requestCode !== FlittPayment.RC_GOOGLE_PAY) {
        return;
      }

      const resultCode: number = args.resultCode;
      const data: android.content.Intent = args.intent;

      if (resultCode === android.app.Activity.RESULT_CANCELED) {
        this.cleanupGooglePay();
        this.googlePayReject?.(new Error('Google Pay cancelled by user'));
        return;
      }

      if (!this.googlePayCall) {
        this.cleanupGooglePay();
        this.googlePayReject?.(new Error('Google Pay call state lost'));
        return;
      }

      const resolve = this.googlePayResolve;
      const reject = this.googlePayReject;

      this.cloudipsp.googlePayComplete(
        resultCode,
        data,
        this.googlePayCall,
        new com.flitt.android.Cloudipsp.PayCallback({
          onPaidProcessed(receipt: com.flitt.android.Receipt) {
            resolve?.(mapReceipt(receipt));
          },
          onPaidFailure(e: com.flitt.android.Cloudipsp.Exception) {
            reject?.(new Error(e.getMessage() || 'Google Pay payment failed'));
          },
        }),
      );

      this.cleanupGooglePay();
    };

    Application.android.on(AndroidApplication.activityResultEvent, this.activityResultHandler);
  }

  private unregisterActivityResultHandler(): void {
    if (this.activityResultHandler) {
      Application.android.off(AndroidApplication.activityResultEvent, this.activityResultHandler);
      this.activityResultHandler = null;
    }
  }

  private cleanupGooglePay(): void {
    this.unregisterActivityResultHandler();
    this.googlePayCall = null;
    this.googlePayResolve = null;
    this.googlePayReject = null;
  }

  // ─── Apple Pay stubs (not available on Android) ─────────────────────────────

  payWithApplePay(_orderParams: FlittOrderParams): Promise<FlittReceipt> {
    return Promise.reject(new Error('Apple Pay is not supported on Android. Use payWithGooglePay instead.'));
  }

  payWithApplePayToken(_token: string): Promise<FlittReceipt> {
    return Promise.reject(new Error('Apple Pay is not supported on Android. Use payWithGooglePayToken instead.'));
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  dispose(): void {
    this.cleanupGooglePay();
    if (this.attached) {
      const parent = this.webView.getParent() as android.view.ViewGroup;
      if (parent) {
        parent.removeView(this.webView as any);
      }
      this.attached = false;
    }
  }
}
