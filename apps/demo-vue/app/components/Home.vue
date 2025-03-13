<template>
  <Page>
    <ActionBar>
      <Label text="Home" />
    </ActionBar>

    <StackLayout verticalAlignment="center" horizontalAlignment="center">
      <Label class="text-center" :text="fromStore" />
      <Button text="Save to persist state" class="btn btn-primary" @tap="save()"></Button>
      <Label class="text-center" :text="message" />
    </StackLayout>
  </Page>
</template>

<script setup>
import { computed, ref } from 'nativescript-vue';
import { useMainStore } from '../store/mainStore';

const message = ref();

const store = useMainStore();
const fromStore = computed(() => store.isSaved);

const save = () => {
  store.setSave();
  message.value = 'Restart to test saved persist state';
};
</script>
