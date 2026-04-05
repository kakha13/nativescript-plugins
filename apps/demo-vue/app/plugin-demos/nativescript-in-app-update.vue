<template>
  <Page class="page">
    <ActionBar class="action-bar">
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <Label text="In-App Update" class="action-bar-title" />
    </ActionBar>

    <GridLayout rows="*, auto" columns="*">
      <!-- Main content -->
      <ScrollView row="0">
        <StackLayout class="page-wrapper card-list" verticalAlignment="top" horizontalAlignment="stretch">
          <!-- Status -->
          <StackLayout class="card" v-if="statusMessage">
            <Label text="Status" class="card-title" />
            <Label :text="statusMessage" class="card-subtitle" textWrap="true" />
          </StackLayout>

          <!-- Mode Toggle -->
          <StackLayout class="card">
            <Label text="Manager Mode" class="card-title" />
            <Label :text="useFake ? 'Using FakeAppUpdateManager (local testing)' : 'Using real AppUpdateManager (Play Store)'" class="card-subtitle" textWrap="true" />
            <Button :text="useFake ? 'Switch to Real Manager' : 'Switch to Fake Manager'" class="btn btn-primary card-button" @tap="toggleFakeManager" />
          </StackLayout>

          <!-- Fake Manager Controls -->
          <StackLayout class="card" v-if="useFake">
            <Label text="Fake Manager Controls" class="card-title" />
            <Label text="Set up fake state before testing." class="card-subtitle" textWrap="true" />
            <Button text="Set Update Available (v999)" class="btn btn-primary card-button" @tap="fakeSetAvailable" />
            <Button text="Set No Update Available" class="btn btn-primary card-button" @tap="fakeSetNotAvailable" />
          </StackLayout>

          <!-- Check Update -->
          <StackLayout class="card">
            <Label text="Check for Update" class="card-title" />
            <Label text="Query Google Play for available updates." class="card-subtitle" textWrap="true" />
            <Button text="Check Update" class="btn btn-primary card-button" @tap="checkUpdate" />
          </StackLayout>

          <!-- Update Actions -->
          <StackLayout class="card">
            <Label text="Start Update" class="card-title" />
            <Label text="Choose immediate (full-screen) or flexible (background) update." class="card-subtitle" textWrap="true" />
            <Button text="Immediate Update" class="btn btn-primary card-button" @tap="startImmediateUpdate" />
            <Button text="Flexible Update" class="btn btn-primary card-button" @tap="startFlexibleUpdate" />
          </StackLayout>

          <!-- Complete -->
          <StackLayout class="card">
            <Label text="Complete Update" class="card-title" />
            <Label text="Install a downloaded flexible update (restarts app)." class="card-subtitle" textWrap="true" />
            <Button text="Complete Update" class="btn btn-primary card-button" @tap="completeUpdate" />
          </StackLayout>
        </StackLayout>
      </ScrollView>

      <!-- Snackbar: "Downloaded, tap to reload" -->
      <GridLayout row="1" v-if="showSnackbar" columns="*, auto" class="snackbar" padding="14 16">
        <Label col="0" text="An update has been downloaded." class="snackbar-text" />
        <Label col="1" text="Reload" class="snackbar-action" @tap="onSnackbarReload" />
      </GridLayout>

      <!-- Fake Bottom Sheet Overlay -->
      <GridLayout row="0" rowSpan="2" v-if="showBottomSheet" rows="*, auto">
        <!-- Dim background -->
        <StackLayout row="0" rowSpan="2" backgroundColor="rgba(0,0,0,0.5)" @tap="dismissBottomSheet" />

        <!-- Bottom sheet -->
        <StackLayout row="1" class="bottom-sheet">
          <!-- Header -->
          <GridLayout columns="auto, *, auto" padding="16 16 8 16">
            <Label col="0" text="&#9654; Google Play" class="bs-google-play" />
            <Label col="2" text="&#10005;" class="bs-close" @tap="dismissBottomSheet" />
          </GridLayout>

          <!-- Title -->
          <Label text="Update available" class="bs-title" margin="0 16 4 16" />
          <Label text="To use this app, download the latest version." class="bs-subtitle" margin="0 16 12 16" />

          <!-- App info -->
          <GridLayout columns="48, *" rows="auto, auto" margin="0 16 8 16">
            <StackLayout col="0" rowSpan="2" class="bs-app-icon" verticalAlignment="center">
              <Label text="&#9881;" class="bs-app-icon-text" />
            </StackLayout>
            <Label col="1" row="0" :text="appName" class="bs-app-name" />
            <Label col="1" row="1" :text="'v' + fakeVersionCode + '  (FAKE SIMULATION)'" class="bs-app-meta" />
          </GridLayout>

          <!-- What's new -->
          <StackLayout margin="8 16 12 16">
            <Label text="What's new" class="bs-whats-new-title" />
            <Label text="Bug fixes and performance improvements." class="bs-whats-new-body" textWrap="true" />
          </StackLayout>

          <!-- Buttons -->
          <GridLayout columns="*, *" margin="8 16 20 16" class="bs-buttons">
            <Button col="0" text="More info" class="bs-btn-outline" @tap="dismissBottomSheet" />
            <Button col="1" text="Update" class="bs-btn-update" @tap="onBottomSheetUpdate" />
          </GridLayout>
        </StackLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, $navigateBack } from 'nativescript-vue';
import { Application } from '@nativescript/core';
import { NativescriptInAppUpdate, UpdateType, UpdateAvailability, InstallStatus } from '@kakha13/nativescript-in-app-update';

const statusMessage = ref('Ready');
const useFake = ref(false);
const showBottomSheet = ref(false);
const showSnackbar = ref(false);
const fakeVersionCode = ref(0);
const appName = ref('');
let updater: NativescriptInAppUpdate | null = null;

function createUpdater() {
  updater?.dispose();
  updater = new NativescriptInAppUpdate({ useFakeManager: useFake.value });
  showBottomSheet.value = false;
  showSnackbar.value = false;
  statusMessage.value = useFake.value ? 'Fake manager ready' : 'Real manager ready';
}

onMounted(() => {
  const ctx = Application.android.getNativeApplication();
  try {
    const pm = ctx.getPackageManager();
    const ai = pm.getApplicationInfo(ctx.getPackageName(), 0);
    appName.value = pm.getApplicationLabel(ai).toString();
  } catch (e) {
    appName.value = 'Demo App';
  }
  createUpdater();
});

onUnmounted(() => {
  updater?.dispose();
  updater = null;
});

function toggleFakeManager() {
  useFake.value = !useFake.value;
  createUpdater();
}

function fakeSetAvailable() {
  if (!updater) return;
  try {
    updater.fakeSetUpdateAvailable(999);
    statusMessage.value = 'Fake: update v999 set. Now tap "Check Update".';
  } catch (err: any) {
    statusMessage.value = `Error: ${err.message}`;
  }
}

function fakeSetNotAvailable() {
  if (!updater) return;
  try {
    updater.fakeSetUpdateNotAvailable();
    statusMessage.value = 'Fake: no update available.';
  } catch (err: any) {
    statusMessage.value = `Error: ${err.message}`;
  }
}

async function checkUpdate() {
  if (!updater) return;
  statusMessage.value = 'Checking for updates...';
  try {
    const info = await updater.checkUpdate();
    fakeVersionCode.value = info.availableVersionCode;
    if (info.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE) {
      statusMessage.value = `Update available! v${info.availableVersionCode}, priority: ${info.updatePriority}, flexible: ${info.isFlexibleUpdateAllowed}, immediate: ${info.isImmediateUpdateAllowed}`;
    } else if (info.updateAvailability === UpdateAvailability.UPDATE_NOT_AVAILABLE) {
      statusMessage.value = 'No update available';
    } else if (info.updateAvailability === UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
      statusMessage.value = 'Update already in progress';
    } else {
      statusMessage.value = `Update availability unknown (${info.updateAvailability})`;
    }
    console.log('UpdateInfo:', JSON.stringify(info));
  } catch (err: any) {
    statusMessage.value = `Error: ${err.message}`;
    console.error('checkUpdate error:', err);
  }
}

async function startImmediateUpdate() {
  if (!updater) return;
  statusMessage.value = 'Starting immediate update...';
  try {
    await updater.startUpdate(UpdateType.IMMEDIATE);
    statusMessage.value = 'Immediate update accepted';
  } catch (err: any) {
    statusMessage.value = `Error: ${err.message}`;
    console.error('startImmediateUpdate error:', err);
  }
}

function setupInstallStateListener() {
  if (!updater) return;
  updater.registerInstallStateListener();
  updater.on(NativescriptInAppUpdate.INSTALL_STATE_EVENT, (args: any) => {
    const state = args.data;
    if (state.installStatus === InstallStatus.DOWNLOADING) {
      const pct = state.totalBytesToDownload > 0 ? Math.round((state.bytesDownloaded / state.totalBytesToDownload) * 100) : 0;
      statusMessage.value = `Downloading: ${pct}%`;
    } else if (state.installStatus === InstallStatus.DOWNLOADED) {
      statusMessage.value = 'Update downloaded.';
      showSnackbar.value = true;
    } else if (state.installStatus === InstallStatus.INSTALLED) {
      statusMessage.value = 'Installed';
      showSnackbar.value = false;
    } else if (state.installStatus === InstallStatus.FAILED) {
      statusMessage.value = `Download failed (error: ${state.installErrorCode})`;
      showSnackbar.value = false;
    } else if (state.installStatus === InstallStatus.CANCELED) {
      statusMessage.value = 'Download cancelled';
      showSnackbar.value = false;
    } else {
      statusMessage.value = `Install status: ${state.installStatus}`;
    }
  });
}

async function startFlexibleUpdate() {
  if (!updater) return;
  statusMessage.value = 'Starting flexible update...';
  setupInstallStateListener();

  if (useFake.value) {
    // Show fake bottom sheet — FakeAppUpdateManager doesn't show real UI
    showBottomSheet.value = true;
    statusMessage.value = 'Waiting for user to accept update...';
  } else {
    try {
      await updater.startUpdate(UpdateType.FLEXIBLE);
      statusMessage.value = 'Flexible update accepted, downloading...';
    } catch (err: any) {
      statusMessage.value = `Error: ${err.message}`;
      console.error('startFlexibleUpdate error:', err);
    }
  }
}

function onBottomSheetUpdate() {
  showBottomSheet.value = false;
  if (!updater || !useFake.value) return;

  statusMessage.value = 'Update accepted. Downloading...';

  updater.startUpdate(UpdateType.FLEXIBLE).then(() => {
    updater!.fakeUserAcceptsUpdate();

    setTimeout(() => {
      updater!.fakeDownloadStarts();
      setTimeout(() => {
        updater!.fakeDownloadCompletes();
      }, 1500);
    }, 500);
  }).catch((err: any) => {
    statusMessage.value = `Error: ${err.message}`;
  });
}

function dismissBottomSheet() {
  showBottomSheet.value = false;
  statusMessage.value = 'Update cancelled by user.';
}

function onSnackbarReload() {
  showSnackbar.value = false;
  completeUpdate();
}

async function completeUpdate() {
  if (!updater) return;
  statusMessage.value = 'Completing update (app will restart)...';
  try {
    if (useFake.value) {
      updater.fakeInstallCompletes();
    }
    await updater.completeUpdate();
    statusMessage.value = 'Update installed!';
  } catch (err: any) {
    statusMessage.value = `Error: ${err.message}`;
    console.error('completeUpdate error:', err);
  }
}
</script>

<style scoped>
.snackbar {
  background-color: #323232;
  margin: 0;
}

.snackbar-text {
  color: #ffffff;
  font-size: 14;
  vertical-align: center;
}

.snackbar-action {
  color: #4CAF50;
  font-size: 14;
  font-weight: bold;
  padding: 8 12;
  vertical-align: center;
}

.bottom-sheet {
  background-color: #ffffff;
  border-top-left-radius: 16;
  border-top-right-radius: 16;
}

.bs-google-play {
  font-size: 13;
  color: #5f6368;
}

.bs-close {
  font-size: 18;
  color: #5f6368;
  padding: 4 8;
}

.bs-title {
  font-size: 20;
  font-weight: bold;
  color: #202124;
}

.bs-subtitle {
  font-size: 14;
  color: #5f6368;
}

.bs-app-icon {
  width: 40;
  height: 40;
  background-color: #e8eaed;
  border-radius: 8;
  horizontal-align: center;
  vertical-align: center;
}

.bs-app-icon-text {
  font-size: 20;
  text-align: center;
  color: #5f6368;
}

.bs-app-name {
  font-size: 15;
  font-weight: bold;
  color: #202124;
  margin-left: 12;
}

.bs-app-meta {
  font-size: 12;
  color: #e53935;
  margin-left: 12;
}

.bs-whats-new-title {
  font-size: 14;
  font-weight: bold;
  color: #202124;
}

.bs-whats-new-body {
  font-size: 13;
  color: #5f6368;
  margin-top: 2;
}

.bs-buttons {
  height: 48;
}

.bs-btn-outline {
  background-color: transparent;
  color: #1a73e8;
  border-color: #dadce0;
  border-width: 1;
  border-radius: 20;
  font-size: 14;
  font-weight: bold;
  margin-right: 8;
}

.bs-btn-update {
  background-color: #01875f;
  color: #ffffff;
  border-radius: 20;
  font-size: 14;
  font-weight: bold;
  margin-left: 8;
}
</style>
