import { View } from '@nativescript/core';

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

/**
 * NativeScript View wrapping CloudipspWebView.
 * Use this only if you need manual control over the WebView placement.
 * For most cases, FlittPayment handles the WebView automatically.
 */
export class FlittWebView extends View {}

/**
 * Main payment class. Handles card and Google Pay payments via the Flitt SDK.
 * Creates a native WebView overlay for 3-D Secure authentication.
 *
 * Usage:
 *   const payment = new FlittPayment({ merchantId: 1549901 });
 *   const receipt = await payment.pay(card, order);          // card payment
 *   const receipt = await payment.payWithGooglePay(order);   // Google Pay
 *   payment.dispose(); // when done
 */
export class FlittPayment {
  constructor(config: FlittConfig);

  /** Pay with card details and order (SDK generates token internally). */
  pay(card: FlittCardParams, order: FlittOrderParams): Promise<FlittReceipt>;

  /** Pay with card details and a pre-generated backend token. */
  payToken(card: FlittCardParams, token: string): Promise<FlittReceipt>;

  /** Launch the Google Pay sheet for the given order. */
  payWithGooglePay(order: FlittOrderParams): Promise<FlittReceipt>;

  /** Launch the Google Pay sheet using a pre-generated backend token. */
  payWithGooglePayToken(token: string): Promise<FlittReceipt>;

  /** Remove the WebView overlay and clean up listeners. */
  dispose(): void;
}

export function createFlittCard(params: FlittCardParams): any;
export function createFlittOrder(params: FlittOrderParams): any;
export function isGooglePaySupported(): boolean;
