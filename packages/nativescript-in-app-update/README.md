# @kakha13/nativescript-in-app-update

Google Play In-App Updates for NativeScript. Supports both **immediate** (full-screen blocking) and **flexible** (background download) update flows.

## Platform Support

| Platform | Supported | Min SDK |
| -------- | --------- | ------- |
| Android  | Yes       | API 21  |
| iOS      | No        | -       |

## Installation

```bash
npm install @kakha13/nativescript-in-app-update
```

No additional setup required. The Gradle dependency (`com.google.android.play:app-update:2.1.0`) is included automatically.

## Usage

### Basic - Immediate Update

An immediate update shows a full-screen UI that blocks the app until the user accepts and the update installs.

```typescript
import {
  NativescriptInAppUpdate,
  UpdateType,
  UpdateAvailability,
} from '@kakha13/nativescript-in-app-update';

const updater = new NativescriptInAppUpdate();

// 1. Check for available update
const info = await updater.checkUpdate();

if (
  info.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE &&
  info.isImmediateUpdateAllowed
) {
  // 2. Start immediate update flow
  await updater.startUpdate(UpdateType.IMMEDIATE);
}
```

### Flexible Update (Background Download)

A flexible update downloads in the background. You monitor progress and prompt the user to install when ready.

```typescript
import {
  NativescriptInAppUpdate,
  UpdateType,
  UpdateAvailability,
  InstallStatus,
} from '@kakha13/nativescript-in-app-update';

const updater = new NativescriptInAppUpdate();

const info = await updater.checkUpdate();

if (
  info.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE &&
  info.isFlexibleUpdateAllowed
) {
  // Listen for download progress
  updater.registerInstallStateListener();
  updater.on(NativescriptInAppUpdate.INSTALL_STATE_EVENT, (args) => {
    const state = args.data;
    console.log(`Status: ${state.installStatus}`);
    console.log(`Progress: ${state.bytesDownloaded} / ${state.totalBytesToDownload}`);

    if (state.installStatus === InstallStatus.DOWNLOADED) {
      // Download complete - install the update (restarts the app)
      updater.completeUpdate();
    }
  });

  // Start flexible update
  await updater.startUpdate(UpdateType.FLEXIBLE);
}
```

### Cleanup

```typescript
// When done, clean up listeners
updater.dispose();
```

## API Reference

### `NativescriptInAppUpdate`

| Method                          | Returns           | Description                                                  |
| ------------------------------- | ----------------- | ------------------------------------------------------------ |
| `checkUpdate()`                 | `Promise<UpdateInfo>` | Check if an update is available                          |
| `startUpdate(type)`             | `Promise<void>`   | Start immediate or flexible update flow                      |
| `completeUpdate()`              | `Promise<void>`   | Install a downloaded flexible update (restarts app)          |
| `registerInstallStateListener()`| `void`            | Start listening for install state changes                    |
| `unregisterInstallStateListener()` | `void`         | Stop listening for install state changes                     |
| `dispose()`                     | `void`            | Clean up all listeners and resources                         |

### `UpdateInfo`

| Property                     | Type              | Description                                      |
| ---------------------------- | ----------------- | ------------------------------------------------ |
| `updateAvailability`         | `number`          | One of `UpdateAvailability` constants             |
| `availableVersionCode`       | `number`          | Version code of the available update              |
| `updatePriority`             | `number`          | Update priority (0-5) set in Play Console         |
| `clientVersionStalenessDays` | `number \| null`  | Days since the update became available             |
| `installStatus`              | `number`          | Current install status                            |
| `isFlexibleUpdateAllowed`    | `boolean`         | Whether flexible update is allowed                |
| `isImmediateUpdateAllowed`   | `boolean`         | Whether immediate update is allowed               |

### `InstallStateInfo`

| Property              | Type     | Description                         |
| --------------------- | -------- | ----------------------------------- |
| `installStatus`       | `number` | One of `InstallStatus` constants    |
| `bytesDownloaded`     | `number` | Bytes downloaded so far             |
| `totalBytesToDownload`| `number` | Total bytes to download             |
| `installErrorCode`    | `number` | Error code if failed                |

### Constants

**`UpdateAvailability`**: `UNKNOWN`, `UPDATE_NOT_AVAILABLE`, `UPDATE_AVAILABLE`, `DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS`

**`InstallStatus`**: `UNKNOWN`, `PENDING`, `DOWNLOADING`, `DOWNLOADED`, `INSTALLING`, `INSTALLED`, `FAILED`, `CANCELED`

**`UpdateType`**: `FLEXIBLE` (0), `IMMEDIATE` (1)

## Testing

In-app updates **cannot be tested on sideloaded/debug builds**. The Play Core library requires the app to be installed from Google Play.

### Requirements for testing

1. The app must be **published to a Google Play testing track** (internal, closed, or open)
2. The installed version must have a **lower version code** than the one available on the track
3. The app must be **signed with the same key** as the Play Store version
4. The app must be **installed via Google Play** (not via `ns run` or `adb install`)

### Common errors on debug builds

| Error Code | Meaning |
| ---------- | ------- |
| `-6` (`ERROR_INSTALL_NOT_ALLOWED`) | The app is not installed from Google Play, or device state doesn't allow updates (low battery, low disk space) |
| `-3` (`ERROR_API_NOT_AVAILABLE`) | Play Store not available or too old on the device/emulator |

### How to test

1. Upload version code **1** to Google Play internal testing
2. Install it on a test device from the Play Store
3. Upload version code **2** to the same track
4. Open the app and call `checkUpdate()` — it should return `UPDATE_AVAILABLE`
5. The immediate/flexible update flow will work as expected

See [Google's testing guide](https://developer.android.com/guide/playcore/in-app-updates/test) for more details.

## License

Apache License Version 2.0
