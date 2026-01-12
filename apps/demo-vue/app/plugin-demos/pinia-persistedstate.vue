<template>
  <Page>
    <ActionBar>
      <Label text="pinia-persistedstate" />
    </ActionBar>

    <StackLayout verticalAlignment="center" horizontalAlignment="center">
      <Label class="text-center" :text="fromStore" />
      <Button text="Save to persist state" class="btn btn-primary" @tap="save()"></Button>
      <Label class="text-center" :text="message" />
    </StackLayout>
  </Page>
</template>

<script setup>
import { useMainStore } from '../store/mainStore';
import { computed, ref } from 'nativescript-vue';
import { } from '@kakha13/pinia-persistedstate';

const message = ref('');
const store = useMainStore();
const fromStore = computed(() => store.isSaved);

const save = () => {
  store.setSave();
  message.value = 'Restart to test saved persist state';
};
</script>

<style scoped lang="scss">
.info {
  font-size: 20;
  horizontal-align: center;
  vertical-align: center;
}
</style>
