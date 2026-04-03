<template>
  <Page>
    <ActionBar>
      <Label text="nativescript-in-appp-update"/>
    </ActionBar>

    <GridLayout>
      <Button class="info" :text="message"/>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import { DemoSharedNativescriptInApppUpdate } from '@demo/shared';
  import { } from '@kakha13/nativescript-in-appp-update';

  export default Vue.extend({
    computed: {
      message() {
        return "Test nativescript-in-appp-update";
      }
    }
  });
</script>

<style scoped lang="scss">

  .info {
    font-size: 20;
    horizontal-align: center;
    vertical-align: center;
  }
</style>
