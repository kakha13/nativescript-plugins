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

<script setup>
  import { } from '@kakha13/epub-reader';
  import { ref } from 'nativescript-vue';

  const message = ref('Open epub file');

</script>

<style scoped lang="scss">

  .info {
    font-size: 20;
    horizontal-align: center;
    vertical-align: center;
  }
</style>
