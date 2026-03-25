<template>
  <Page>
    <ActionBar>
      <Label text="nativescript-flitt"/>
    </ActionBar>

    <GridLayout>
      <Button class="info" :text="message"/>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import { DemoSharedNativescriptFlitt } from '@demo/shared';
  import { } from '@kakha13/nativescript-flitt';

  export default Vue.extend({
    computed: {
      message() {
        return "Test nativescript-flitt";
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
