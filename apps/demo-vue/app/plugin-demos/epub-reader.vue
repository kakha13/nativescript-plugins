<template>
  <Page>
    <ActionBar>
      <Label text="epub-reader"/>
    </ActionBar>

    <GridLayout>
      <Button class="info" :text="message"/>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import { DemoSharedEpubReader } from '@demo/shared';
  import { } from '@kakha13/epub-reader';

  export default Vue.extend({
    computed: {
      message() {
        return "Test epub-reader";
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
