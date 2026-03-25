# @kakha13/nativescript-flitt

NativeScript plugin for [Flitt](https://flitt.com) payment gateway. Supports card payments and Google Pay on Android. iOS support coming soon.

```bash
npm install @kakha13/nativescript-flitt
```

## Platform Support

| Platform | Min Version | Status |
|----------|-------------|--------|
| Android  | API 21      | Ready  |
| iOS      | -           | Coming soon |

## Setup

The plugin automatically configures:
- Gradle dependencies (`flitt-android:1.2.0`, Google Play Services Wallet)
- `AndroidManifest.xml` metadata for Google Pay

No additional setup needed beyond installing the package.

## Usage

### Card Payment

```ts
import { FlittPayment, type FlittReceipt } from '@kakha13/nativescript-flitt';

// Create payment instance with your merchant ID from the Flitt Merchant Portal
const payment = new FlittPayment({ merchantId: 1549901 });

try {
  const receipt: FlittReceipt = await payment.pay(
    {
      cardNumber: '4444555566667777',
      expireMonth: '01',
      expireYear: '39',
      cvv: '111',
    },
    {
      amount: 10000, // Amount in minor units (10000 = 100.00)
      currency: 'GEL',
      orderId: `order_${Date.now()}`,
      description: 'Test payment',
    }
  );

  if (receipt.status === 'approved') {
    console.log('Payment approved:', receipt.paymentId);
  }
} catch (err) {
  console.error('Payment failed:', err.message);
}

// Clean up when done
payment.dispose();
```

### Google Pay

```ts
import { FlittPayment, isGooglePaySupported } from '@kakha13/nativescript-flitt';

const payment = new FlittPayment({ merchantId: 1549901 });

if (isGooglePaySupported()) {
  const receipt = await payment.payWithGooglePay({
    amount: 10000,
    currency: 'GEL',
    orderId: `order_gp_${Date.now()}`,
    description: 'Google Pay payment',
    merchantData: JSON.stringify({ userId: '123', plan: 'premium' }),
    requiredRecToken: true,
  });
}
```

### Pay with Pre-generated Token

```ts
// Card payment with backend token
const receipt = await payment.payToken(cardParams, 'your-backend-token');

// Google Pay with backend token
const receipt = await payment.payWithGooglePayToken('your-backend-token');
```

## API

### `FlittPayment`

| Method | Description |
|--------|-------------|
| `constructor(config: FlittConfig)` | Create instance with `{ merchantId }` |
| `pay(card, order)` | Card payment, returns `Promise<FlittReceipt>` |
| `payToken(card, token)` | Card payment with pre-generated token |
| `payWithGooglePay(order)` | Launch Google Pay sheet |
| `payWithGooglePayToken(token)` | Google Pay with pre-generated token |
| `dispose()` | Remove WebView overlay and clean up listeners |

### `FlittOrderParams`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `amount` | `number` | Yes | Amount in minor units (cents) |
| `currency` | `string` | Yes | Currency code: `GEL`, `USD`, `EUR`, `AZN`, `KZT`, `MDL`, `UZS`, `AMD` |
| `orderId` | `string` | Yes | Unique order identifier |
| `description` | `string` | Yes | Payment description |
| `email` | `string` | No | Customer email |
| `lang` | `string` | No | UI language: `ru`, `uk`, `en`, `lv`, `fr` |
| `preauth` | `boolean` | No | Pre-authorization mode |
| `requiredRecToken` | `boolean` | No | Request recurring token |
| `recToken` | `string` | No | Recurring payment token |
| `merchantData` | `string` | No | Custom merchant data (JSON string) |
| `serverCallbackUrl` | `string` | No | Server callback URL |
| `verification` | `boolean` | No | Verification mode |
| `verificationType` | `string` | No | `'amount'` or `'code'` |
| `delayed` | `boolean` | No | Delayed payment |
| `arguments` | `Record<string, string>` | No | Arbitrary key-value pairs |

### `FlittReceipt`

| Property | Type | Description |
|----------|------|-------------|
| `status` | `string` | `'created'`, `'processing'`, `'declined'`, `'approved'`, `'expired'`, `'reversed'` |
| `maskedCard` | `string` | e.g. `****7777` |
| `cardBin` | `string` | Bank identification number |
| `amount` | `number` | Amount in minor units |
| `paymentId` | `number` | Unique payment ID |
| `currency` | `string` | Currency code |
| `transactionType` | `string` | `purchase`, `reverse`, `verification` |
| `paymentSystem` | `string` | `VISA`, `MASTERCARD`, etc. |
| `fee` | `number` | Transaction fee |
| `actualAmount` | `number` | Amount with fees |
| `rawReceipt` | `any` | Native SDK Receipt object |

### Helper Functions

| Function | Description |
|----------|-------------|
| `isGooglePaySupported()` | Returns `boolean` — whether the device supports Google Pay |
| `createFlittCard(params)` | Create a native Card object from `FlittCardParams` |
| `createFlittOrder(params)` | Create a native Order object from `FlittOrderParams` |

## How It Works

1. `FlittPayment` creates a `CloudipspWebView` overlay (hidden by default) for 3-D Secure authentication
2. For card payments, the SDK generates a token, processes the payment, and shows the 3DS challenge if required
3. For Google Pay, the SDK fetches merchant config from Flitt API, launches the Google Pay sheet, and completes checkout on user confirmation
4. The promise resolves with a `FlittReceipt` on success or rejects with an error

## Testing

Use these test credentials:

| Field | Value |
|-------|-------|
| Card Number | `4444555566667777` |
| Expiry | `01/39` |
| CVV | `111` |

## License

Apache License Version 2.0
