<template>
  <Frame>
    <Page>
      <ActionBar>
        <Label text="Home" />
      </ActionBar>

      <StackLayout verticalAlignment="center" horizontalAlignment="center">
        <Label class="text-center" :text="fromStore" />
        <Button text="Save to persist state" class="btn btn-primary" @tap="save()"></Button>
        <Label class="text-center" :text="message" />

        <Button text="epub-reader" @tap="$navigateTo(EpubReader)"  " class="btn btn-primary rounded view-demo" />
      </StackLayout>
    </Page>
  </Frame>
</template>

<script setup>
import { $navigateTo, computed, ref } from 'nativescript-vue';
import { useMainStore } from '../store/mainStore';
import EpubReader from '../plugin-demos/epub-reader.vue';

const message = ref();

const store = useMainStore();
const fromStore = computed(() => store.isSaved);

const save = () => {
  store.setSave();
  message.value = 'Restart to test saved persist state';
};
</script>
