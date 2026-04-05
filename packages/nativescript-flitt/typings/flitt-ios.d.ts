/// Type declarations for Flitt iOS SDK (Flitt pod ~1.2.2)
/// Adapted for NativeScript's Objective-C interop conventions.

// ─── Enums ──────────────────────────────────────────────────────────────────

declare const enum PSCardType {
  Unknown = 0,
  Visa = 1,
  Mastercard = 2,
  Maestro = 3,
}

declare const enum PSLang {
  Unknown = 0,
  Ru = 1,
  Uk = 2,
  En = 3,
  Lv = 4,
  Fr = 5,
}

declare const enum PSVerification {
  Unknown = 0,
  Amount = 1,
  Code = 2,
}

declare const enum PSReceiptStatus {
  Unknown = 0,
  Created = 1,
  Processing = 2,
  Declined = 3,
  Approved = 4,
  Expired = 5,
  Reversed = 6,
}

declare const enum PSReceiptTransationType {
  Unknown = 0,
  Purchase = 1,
  Reverse = 2,
}

declare const enum PSReceiptVerificationStatus {
  Unknown = 0,
  Verified = 1,
  Incorrect = 2,
  Failed = 3,
  Created = 4,
}

declare const enum PSPayErrorCode {
  Failure = 0,
  IllegalServerResponse = 1,
  NetworkSecurity = 2,
  NetworkAccess = 3,
  ApplePayUnsupported = 4,
  Unknown = 5,
}

// ─── PSCard ─────────────────────────────────────────────────────────────────

declare class PSCard extends NSObject {
  static alloc(): PSCard;
  init(): PSCard;

  // The factory +cardWith:expireMm:expireYy:cvv:email: is internal (not in public header).
  // Use KVC (setValueForKey) to set cardNumber, mm, yy, cvv after alloc/init.

  readonly mm: number;
  readonly yy: number;
  readonly cvv: string;
  readonly type: PSCardType;
  readonly email: string;

  isValidCard(): boolean;
  isValidCardNumber(): boolean;
  isValidCvv(): boolean;
  isValidExpireDate(): boolean;
  isValidExpireMonth(): boolean;
  isValidExpireYear(): boolean;

  static getCardTypeName(type: PSCardType): string;
  static getCardType(name: string): PSCardType;
}

// ─── PSCurrency ─────────────────────────────────────────────────────────────

declare class PSCurrency extends NSObject {
  static AMD: PSCurrency;
  static AZN: PSCurrency;
  static EUR: PSCurrency;
  static GEL: PSCurrency;
  static KZT: PSCurrency;
  static MDL: PSCurrency;
  static USD: PSCurrency;
  static UZS: PSCurrency;
}

// ─── PSOrder ────────────────────────────────────────────────────────────────

declare class PSOrder extends NSObject {
  static alloc(): PSOrder;

  // -initOrder:aStringCurrency:aIdentifier:aAbout:
  initOrderAStringCurrencyAIdentifierAAbout(amount: number, currency: string, identifier: string, about: string): PSOrder;

  readonly amount: number;
  readonly currency: string;
  readonly identifier: string;
  readonly about: string;
  readonly arguments: NSDictionary<string, string>;

  email: string;
  productId: string;
  paymentSystems: string;
  defaultPaymentSystem: string;
  merchantData: string;
  recToken: string;
  version: string;
  serverCallbackUrl: string;
  reservationData: string;
  applePayInfo: string;
  lifetime: number;
  preauth: boolean;
  requiredRecToken: boolean;
  verification: boolean;
  delayed: boolean;
  verificationType: PSVerification;
  lang: PSLang;
}

// ─── PSReceipt ──────────────────────────────────────────────────────────────

declare class PSReceipt extends NSObject {
  readonly maskedCard: string;
  readonly cardBin: string;
  readonly amount: number;
  readonly paymentId: number;
  readonly currency: string;
  readonly status: PSReceiptStatus;
  readonly transationType: PSReceiptTransationType;
  readonly senderCellPhone: string;
  readonly senderAccount: string;
  readonly cardType: PSCardType;
  readonly rrn: string;
  readonly approvalCode: string;
  readonly responseCode: string;
  readonly productId: string;
  readonly recToken: string;
  readonly recTokenLifeTime: NSDate;
  readonly reversalAmount: number;
  readonly settlementAmount: number;
  readonly settlementCurrency: string;
  readonly settlementDate: NSDate;
  readonly eci: number;
  readonly fee: number;
  readonly actualAmount: number;
  readonly actualCurrency: string;
  readonly paymentSystem: string;
  readonly verificationStatus: PSReceiptVerificationStatus;
  readonly signature: string;

  static getStatusName(status: PSReceiptStatus): string;
  static getStatusSign(status: PSReceiptStatus): string;
  static getTransationTypeName(type: PSReceiptTransationType): string;
  static getTransationTypeSign(type: PSReceiptTransationType): string;
  static getVerificationStatusName(status: PSReceiptVerificationStatus): string;
  static getVerificationStatusSign(status: PSReceiptVerificationStatus): string;
}

// ─── PSCloudipspWKWebView ───────────────────────────────────────────────────

declare class PSCloudipspWKWebView extends WKWebView {
  static alloc(): PSCloudipspWKWebView;
  initWithFrame(frame: CGRect): PSCloudipspWKWebView;
}

// ─── Delegate protocols ─────────────────────────────────────────────────────

interface PSPayCallbackDelegate extends NSObjectProtocol {
  onPaidProcess(receipt: PSReceipt): void;
  onPaidFailure(error: NSError): void;
  onWaitConfirm(): void;
}
declare var PSPayCallbackDelegate: {
  prototype: PSPayCallbackDelegate;
};

interface PSApplePayCallbackDelegate extends PSPayCallbackDelegate {
  onApplePayNavigate(viewController: UIViewController): void;
}
declare var PSApplePayCallbackDelegate: {
  prototype: PSApplePayCallbackDelegate;
};

// ─── PSCloudipspApi ─────────────────────────────────────────────────────────

declare class PSCloudipspApi extends NSObject {
  // +supportsApplePay
  static supportsApplePay(): boolean;

  // +apiWithMerchant:andCloudipspView:
  static apiWithMerchantAndCloudipspView(merchant: number, webView: PSCloudipspWKWebView): PSCloudipspApi;

  // Card payment: -pay:withOrder:andDelegate:
  payWithOrderAndDelegate(card: PSCard, order: PSOrder, delegate: PSPayCallbackDelegate): void;

  // Card + token: -pay:withToken:andDelegate:
  payWithTokenAndDelegate(card: PSCard, token: string, delegate: PSPayCallbackDelegate): void;

  // Apple Pay: -applePay:andDelegate:
  applePayAndDelegate(order: PSOrder, delegate: PSApplePayCallbackDelegate): void;

  // Apple Pay + token: -applePayWithToken:andDelegate:
  applePayWithTokenAndDelegate(token: string, delegate: PSApplePayCallbackDelegate): void;
}
