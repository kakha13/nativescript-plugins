<template>
  <Frame>
    <Page class="page">
      <ActionBar class="action-bar">
        <Label text="KAKHA13 NativeScript Plugins" class="action-bar-title" />
      </ActionBar>

      <GridLayout rows="auto, *" class="page-wrapper">
        <StackLayout row="0" class="hero" horizontalAlignment="center">
          <Label text="Welcome 👋" class="hero-title" textWrap="true" />
        </StackLayout>

        <StackLayout
          row="1"
          class="card-list"
          verticalAlignment="top"
          horizontalAlignment="stretch"
        >
          <StackLayout class="card" @tap="$navigateTo(PiniaPersistedstate)">
            <Label text="Pinia Persisted State" class="card-title" />
            <Label
              text="State management with automatic persistence."
              class="card-subtitle"
              textWrap="true"
            />
            <Button text="View demo" class="btn btn-primary card-button" @tap="$navigateTo(PiniaPersistedstate)" />
          </StackLayout>

          <StackLayout class="card" @tap="$navigateTo(NativescriptFlitt)">
            <Label text="Flitt Payments" class="card-title" />
            <Label
              text="Card and Google Pay payments via Flitt SDK."
              class="card-subtitle"
              textWrap="true"
            />
            <Button text="View demo" class="btn btn-primary card-button" @tap="$navigateTo(NativescriptFlitt)" />
          </StackLayout>

          <StackLayout class="card" @tap="$navigateTo(EpubReader)">
            <Label text="EPUB Reader" class="card-title" />
            <Label
              text="Beautiful reader experience for EPUB files."
              class="card-subtitle"
              textWrap="true"
            />
            <Button text="View demo" class="btn btn-primary card-button" @tap="$navigateTo(EpubReader)" />
          </StackLayout>

          <StackLayout class="card" @tap="$navigateTo(InAppUpdate)">
            <Label text="In-App Update" class="card-title" />
            <Label
              text="Google Play in-app updates (immediate and flexible)."
              class="card-subtitle"
              textWrap="true"
            />
            <Button text="View demo" class="btn btn-primary card-button" @tap="$navigateTo(InAppUpdate)" />
          </StackLayout>
        </StackLayout>
      </GridLayout>
    </Page>
  </Frame>
</template>

<script setup>
import { $navigateTo } from 'nativescript-vue';

import EpubReader from '../plugin-demos/epub-reader.vue';
import NativescriptFlitt from '../plugin-demos/nativescript-flitt.vue';
import InAppUpdate from '../plugin-demos/nativescript-in-app-update.vue';
import PiniaPersistedstate from '../plugin-demos/pinia-persistedstate.vue';
</script>