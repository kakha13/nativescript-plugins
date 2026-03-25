<template>
  <Page class="page">
    <ActionBar class="action-bar">
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <Label text="Flitt Payments" class="action-bar-title" />
    </ActionBar>

    <ScrollView>
      <StackLayout class="page-wrapper card-list" verticalAlignment="top" horizontalAlignment="stretch">
        <!-- Amount & Currency -->
        <StackLayout class="card">
          <Label text="Order Details" class="card-title" />
          <Label text="Amount (in minor units, e.g. 100 = 1.00)" class="card-subtitle" textWrap="true" />
          <TextField v-model="amount" hint="10000" keyboardType="number" class="input" />
          <Label text="Description" class="card-subtitle" />
          <TextField v-model="description" hint="Payment" class="input" />
          <Button :text="'Currency: ' + currency" class="btn btn-primary card-button" @tap="cycleCurrency" />
        </StackLayout>


        <!-- Status -->
        <StackLayout class="card" v-if="statusMessage">
          <Label text="Status" class="card-title" />
          <Label :text="statusMessage" class="card-subtitle" textWrap="true" />
        </StackLayout>

        <!-- Card Details -->
        <StackLayout class="card">
          <Label text="Card Details" class="card-title" />
          <Label text="Test card: 4444555566667777 | 01/39 | 111" class="card-subtitle" textWrap="true" />
          <TextField v-model="cardNumber" hint="Card Number" keyboardType="number" maxLength="19" class="input" />
          <GridLayout columns="*, *, *">
            <TextField col="0" v-model="expireMonth" hint="MM" keyboardType="number" maxLength="2" class="input" />
            <TextField col="1" v-model="expireYear" hint="YY" keyboardType="number" maxLength="2" class="input" />
            <TextField col="2" v-model="cvv" hint="CVV" keyboardType="number" maxLength="4" secure="true"
              class="input" />
          </GridLayout>
          <Button text="Pay with Card" class="btn btn-primary card-button" :isEnabled="!isProcessing"
            @tap="processPayment" />
        </StackLayout>

        <!-- Google Pay -->
        <StackLayout class="card" v-if="googlePayAvailable">
          <Label text="Google Pay" class="card-title" />
          <Label text="Pay using Google Pay with the amount and currency above." class="card-subtitle"
            textWrap="true" />
          <Button text="Pay with Google Pay" class="btn btn-primary card-button" :isEnabled="!isProcessing"
            @tap="processGooglePay" />
        </StackLayout>

      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, $navigateBack } from 'nativescript-vue';
import { Dialogs } from '@nativescript/core';
import { FlittPayment, isGooglePaySupported, type FlittReceipt } from '@kakha13/nativescript-flitt';

const MERCHANT_ID = 1549901;

const cardNumber = ref('');
const expireMonth = ref('');
const expireYear = ref('');
const cvv = ref('');
const amount = ref('');
const currency = ref('GEL');
const description = ref('Payment');
const isProcessing = ref(false);
const statusMessage = ref('');
const googlePayAvailable = ref(false);

let flittPayment: FlittPayment | null = null;

onMounted(() => {
  flittPayment = new FlittPayment({ merchantId: MERCHANT_ID });
  googlePayAvailable.value = isGooglePaySupported();
});

onUnmounted(() => {
  flittPayment?.dispose();
  flittPayment = null;
});

async function processPayment() {
  if (!flittPayment) {
    statusMessage.value = 'Payment system not ready';
    return;
  }
  if (!cardNumber.value || !expireMonth.value || !expireYear.value || !cvv.value || !amount.value) {
    statusMessage.value = 'Please fill all fields';
    return;
  }

  isProcessing.value = true;
  statusMessage.value = 'Processing payment...';

  try {
    const orderId = `order_${Date.now()}`;
    const amountInCents = parseInt(amount.value, 10);

    const receipt: FlittReceipt = await flittPayment.pay(
      {
        cardNumber: cardNumber.value.replace(/\s/g, ''),
        expireMonth: expireMonth.value.padStart(2, '0'),
        expireYear: expireYear.value,
        cvv: cvv.value,
      },
      {
        amount: amountInCents,
        currency: currency.value,
        orderId,
        description: description.value,
      }
    );

    if (receipt.status === 'approved') {
      statusMessage.value = `Approved! Card: ${receipt.maskedCard} | ID: ${receipt.paymentId}`;
      await Dialogs.alert({
        title: 'Payment Successful',
        message: `Amount: ${receipt.amount / 100} ${receipt.currency}\nCard: ${receipt.maskedCard}\nPayment ID: ${receipt.paymentId}`,
        okButtonText: 'OK',
      });
    } else {
      statusMessage.value = `Payment ${receipt.status}`;
    }
  } catch (err: any) {
    console.error('Payment error:', err);
    statusMessage.value = err.message || 'Payment failed';
  } finally {
    isProcessing.value = false;
  }
}

async function processGooglePay() {
  if (!flittPayment) {
    statusMessage.value = 'Payment system not ready';
    return;
  }
  if (!amount.value) {
    statusMessage.value = 'Please enter an amount';
    return;
  }

  isProcessing.value = true;
  statusMessage.value = 'Opening Google Pay...';

  try {
    const orderId = `order_gp_${Date.now()}`;
    const amountInCents = parseInt(amount.value, 10);

    const receipt: FlittReceipt = await flittPayment.payWithGooglePay({
      amount: amountInCents,
      currency: currency.value,
      orderId,
      description: description.value,
    });

    if (receipt.status === 'approved') {
      statusMessage.value = `Approved! Card: ${receipt.maskedCard} | ID: ${receipt.paymentId}`;
      await Dialogs.alert({
        title: 'Payment Successful',
        message: `Amount: ${receipt.amount / 100} ${receipt.currency}\nCard: ${receipt.maskedCard}\nPayment ID: ${receipt.paymentId}`,
        okButtonText: 'OK',
      });
    } else {
      statusMessage.value = `Payment ${receipt.status}`;
    }
  } catch (err: any) {
    console.error('Google Pay error:', err);
    statusMessage.value = err.message || 'Google Pay failed';
  } finally {
    isProcessing.value = false;
  }
}

const currencies = ['GEL', 'USD', 'EUR'];
let currencyIndex = 0;

function cycleCurrency() {
  currencyIndex = (currencyIndex + 1) % currencies.length;
  currency.value = currencies[currencyIndex];
}
</script>
