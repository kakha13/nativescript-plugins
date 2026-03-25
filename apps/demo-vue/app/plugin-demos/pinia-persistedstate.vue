<template>
  <Page class="page">
    <ActionBar class="action-bar">
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <Label text="Pinia Persisted State" class="action-bar-title" />
    </ActionBar>

    <ScrollView>
      <StackLayout
        class="page-wrapper card-list"
        verticalAlignment="top"
        horizontalAlignment="stretch"
      >
        <StackLayout class="card">
          <Label text="Current State" class="card-title" />
          <Label
            :text="fromStore"
            class="card-subtitle"
            textWrap="true"
          />
        </StackLayout>

        <StackLayout class="card">
          <Label text="Actions" class="card-title" />
          <Label
            text="Save the current state to persist it across app restarts."
            class="card-subtitle"
            textWrap="true"
          />
          <Button text="Save to persist state" class="btn btn-primary card-button" @tap="save()" />
        </StackLayout>

        <StackLayout class="card" v-if="message">
          <Label text="Status" class="card-title" />
          <Label
            :text="message"
            class="card-subtitle"
            textWrap="true"
          />
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup>
import { useMainStore } from '../store/mainStore';
import { computed, ref, $navigateBack } from 'nativescript-vue';
import { } from '@kakha13/pinia-persistedstate';

const message = ref('');
const store = useMainStore();
const fromStore = computed(() => store.isSaved);

const save = () => {
  store.setSave();
  message.value = 'Restart to test saved persist state';
};
</script>

