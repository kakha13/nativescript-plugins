<template>
  <Page>
    <ActionBar>
      <Label text="pinia-persistedstate" />
    </ActionBar>

    <GridLayout>
      <Button class="info" :text="message" />
    </GridLayout>
  </Page>
</template>

<script setup>
import { computed } from 'nativescript-vue';
import { DemoSharedPiniaPersistedstate } from '@demo/shared';
import { } from '@kakha13/pinia-persistedstate';
const message = computed(() => 'Hello, Vue 3 + NativeScript-Vue 3!');
</script>


<style scoped lang="scss">
.info {
  font-size: 20;
  horizontal-align: center;
  vertical-align: center;
}
</style>
