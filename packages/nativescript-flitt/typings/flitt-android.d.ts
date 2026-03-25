/// Type declarations for com.flitt.android SDK (flitt-android:1.2.0)
/// Adapted for NativeScript's Java/Kotlin interop conventions.

declare namespace com {
  namespace flitt {
    namespace android {
      class Card {
        static CREATOR: android.os.Parcelable.Creator<Card>;
        readonly cardNumber: string;
        readonly mm: number;
        readonly yy: number;
        readonly cvv: string;
        readonly source: number;
        isValidCard(): boolean;
        isValidCardNumber(): boolean;
        isValidCvv(): boolean;
        isValidExpireDate(): boolean;
        isValidExpireMonth(): boolean;
        isValidExpireYear(): boolean;
        getType(): Card.Type;
        setCvv(value: string): void;
        setExpireMonth(value: string): void;
        setExpireYear(value: string): void;
        setCardNumber(value: string): void;
      }

      namespace Card {
        class Type {
          static VISA: Type;
          static MASTERCARD: Type;
          static MAESTRO: Type;
          static UNKNOWN: Type;
          static valueOf(name: string): Type;
          name(): string;
        }
      }

      class Order {
        constructor(amount: number, currency: string, id: string, description: string, email: string | null);
        readonly amount: number;
        readonly currency: string;
        readonly id: string;
        readonly description: string;
        readonly email: string;
        setProductId(value: string): void;
        setPaymentSystems(value: string): void;
        setDefaultPaymentSystem(value: string): void;
        setLifetime(value: number): void;
        setMerchantData(value: string): void;
        setPreauth(enable: boolean): void;
        setRequiredRecToken(enable: boolean): void;
        setVerification(enable: boolean): void;
        setVerificationType(type: Order.Verification): void;
        setRecToken(value: string): void;
        setVersion(value: string): void;
        setLang(value: Order.Lang): void;
        setServerCallbackUrl(value: string): void;
        setReservationData(value: string): void;
        setDelayed(value: boolean): void;
        addArgument(name: string, value: string): void;
      }

      namespace Order {
        class Verification {
          static amount: Verification;
          static code: Verification;
          static valueOf(name: string): Verification;
          name(): string;
        }
        class Lang {
          static ru: Lang;
          static uk: Lang;
          static en: Lang;
          static lv: Lang;
          static fr: Lang;
          static valueOf(name: string): Lang;
          name(): string;
        }
      }

      class Currency {
        static AMD: Currency;
        static AZN: Currency;
        static EUR: Currency;
        static GEL: Currency;
        static KZT: Currency;
        static MDL: Currency;
        static USD: Currency;
        static UZS: Currency;
        static valueOf(name: string): Currency;
        name(): string;
      }

      class Receipt {
        readonly maskedCard: string;
        readonly cardBin: string;
        readonly amount: number;
        readonly paymentId: number;
        readonly currency: string;
        readonly status: Receipt.Status;
        readonly transationType: Receipt.TransationType;
        readonly senderCellPhone: string;
        readonly senderAccount: string;
        readonly cardType: Card.Type;
        readonly rrn: string;
        readonly approvalCode: string;
        readonly responseCode: string;
        readonly productId: string;
        readonly recToken: string;
        readonly recTokenLifeTime: java.util.Date;
        readonly reversalAmount: number;
        readonly settlementAmount: number;
        readonly settlementCurrency: string;
        readonly settlementDate: java.util.Date;
        readonly eci: number;
        readonly fee: number;
        readonly actualAmount: number;
        readonly actualCurrency: string;
        readonly paymentSystem: string;
        readonly verificationStatus: Receipt.VerificationStatus;
        readonly signature: string;
        readonly responseUrl: string;
      }

      namespace Receipt {
        class Status {
          static created: Status;
          static processing: Status;
          static declined: Status;
          static approved: Status;
          static expired: Status;
          static reversed: Status;
          static valueOf(name: string): Status;
          name(): string;
        }
        class TransationType {
          static purchase: TransationType;
          static reverse: TransationType;
          static verification: TransationType;
          static valueOf(name: string): TransationType;
          name(): string;
        }
        class VerificationStatus {
          static verified: VerificationStatus;
          static incorrect: VerificationStatus;
          static failed: VerificationStatus;
          static created: VerificationStatus;
          static valueOf(name: string): VerificationStatus;
          name(): string;
        }
      }

      class Cloudipsp {
        readonly merchantId: number;
        constructor(merchantId: number);
        constructor(merchantId: number, cloudipspView: any);
        pay(card: Card, order: Order, callback: Cloudipsp.PayCallback): void;
        payToken(card: Card, token: string, callback: Cloudipsp.PayCallback): void;
        static supportsGooglePay(context: android.content.Context): boolean;
        static setStrictUiBlocking(value: boolean): void;
        getToken(order: Order, card: Card): string;
        googlePayInitialize(token: string, activity: android.app.Activity, requestCode: number, callback: Cloudipsp.GooglePayCallback): void;
        googlePayInitialize(order: Order, activity: android.app.Activity, requestCode: number, callback: Cloudipsp.GooglePayCallback): void;
        googlePayComplete(resultCode: number, data: android.content.Intent, googlePayCall: GooglePayCall, callback: Cloudipsp.PayCallback): boolean;
      }

      namespace Cloudipsp {
        interface Callback {
          onPaidFailure(e: Cloudipsp.Exception): void;
        }

        class PayCallback {
          constructor(implementation: { onPaidProcessed(receipt: Receipt): void; onPaidFailure(e: Cloudipsp.Exception): void });
          onPaidProcessed(receipt: Receipt): void;
          onPaidFailure(e: Cloudipsp.Exception): void;
        }

        class GooglePayCallback {
          constructor(implementation: { onGooglePayInitialized(result: GooglePayCall): void; onPaidFailure(e: Cloudipsp.Exception): void });
          onGooglePayInitialized(result: GooglePayCall): void;
          onPaidFailure(e: Cloudipsp.Exception): void;
        }

        class Exception extends java.lang.Exception {
          getMessage(): string;
        }

        namespace Exception {
          class Failure extends Cloudipsp.Exception {
            readonly errorCode: number;
            readonly requestId: string;
          }
          class NetworkSecurity extends Cloudipsp.Exception {}
          class NetworkAccess extends Cloudipsp.Exception {}
          class ServerInternalError extends Cloudipsp.Exception {}
          class Unknown extends Cloudipsp.Exception {}
          class GooglePayUnsupported extends Cloudipsp.Exception {}
        }

        class GooglePayMerchantConfig {
          readonly paymentSystem: string;
          readonly data: org.json.JSONObject;
        }
      }

      class CloudipspWebView extends android.webkit.WebView {
        constructor(context: android.content.Context);
        constructor(context: android.content.Context, attrs: android.util.AttributeSet);
        waitingForConfirm(): boolean;
        skipConfirm(): void;
        confirm(confirmation: CloudipspView.PayConfirmation): void;
        getParent(): android.view.ViewGroup;
      }

      interface CloudipspView {
        confirm(confirmation: CloudipspView.PayConfirmation): void;
      }

      namespace CloudipspView {
        class PayConfirmation {
          readonly url: string;
          readonly htmlPageContent: string;
          readonly contentType: string;
          readonly callbackUrl: string;
          readonly host: string;
          readonly cookie: string;
        }
      }

      class GooglePayCall {
        static CREATOR: android.os.Parcelable.Creator<GooglePayCall>;
        readonly token: string;
        readonly order: Order;
        readonly callbackUrl: string;
        readonly paymentSystem: string;
      }

      class Bank {
        getBankId(): string;
        getName(): string;
        getCountry(): string;
        getBankLogo(): string;
        getAlias(): string;
        getCountryPriority(): number;
        getUserPriority(): number;
        isQuickMethod(): boolean;
        isUserPopular(): boolean;
      }

      class BankRedirectDetails {
        readonly action: string;
        readonly url: string;
        readonly target: string;
        readonly responseStatus: string;
      }
    }
  }
}
