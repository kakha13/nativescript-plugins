# @kakha13/nativescript-in-app-update

In-App Updates for NativeScript. Supports both **Android** (Google Play In-App Updates) and **iOS** (App Store version checking with in-app App Store page).

## Platform Support

| Platform | Supported | Min SDK     | Update Mechanism                           |
| -------- | --------- | ----------- | ------------------------------------------ |
| Android  | Yes       | API 21      | Google Play In-App Updates (managed flow)  |
| iOS      | Yes       | iOS 6.0     | iTunes Lookup API + SKStoreProductViewController |

### Platform Differences

| Feature                    | Android                        | iOS                                    |
| -------------------------- | ------------------------------ | -------------------------------------- |
| Check for updates          | Google Play Core API           | iTunes Lookup API (App Store)          |
| Immediate update           | Full-screen blocking UI        | SKStoreProductViewController (modal)   |
| Flexible update            | Background download + install  | Alert prompt → App Store page          |
| Download progress tracking | Yes (InstallState events)      | No (App Store manages downloads)       |
| Complete/restart after download | Yes (`completeUpdate()`)   | No-op (App Store handles it)           |
| Update priority            | Yes (0-5, set in Play Console) | Not available                          |
| FakeManager for testing    | Yes                            | Not available                          |

## Installation

```bash
npm install @kakha13/nativescript-in-app-update
```

No additional setup required.

- **Android:** The Gradle dependency (`com.google.android.play:app-update:2.1.0`) is included automatically.
- **iOS:** Uses built-in StoreKit framework — no CocoaPods or additional dependencies needed.

## Usage

### Basic - Check for Update

```typescript
import {
  NativescriptInAppUpdate,
  UpdateAvailability,
} from '@kakha13/nativescript-in-app-update';

// Android: no options needed
// iOS: optionally provide countryCode or appStoreId
const updater = new NativescriptInAppUpdate({
  countryCode: 'us',  // iOS only: required if app is not on US App Store
});

const info = await updater.checkUpdate();

if (info.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE) {
  console.log('Update available!');

  // iOS extras:
  console.log('App Store version:', info.appStoreVersion);
  console.log('Release notes:', info.releaseNotes);
  console.log('Staleness days:', info.clientVersionStalenessDays);
}
```

### Immediate Update

An immediate update shows a blocking UI until the user updates.

- **Android:** Full-screen Google Play update UI.
- **iOS:** Presents the App Store product page in-app via `SKStoreProductViewController`.

```typescript
import {
  NativescriptInAppUpdate,
  UpdateType,
  UpdateAvailability,
} from '@kakha13/nativescript-in-app-update';

const updater = new NativescriptInAppUpdate();

const info = await updater.checkUpdate();

if (
  info.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE &&
  info.isImmediateUpdateAllowed
) {
  await updater.startUpdate(UpdateType.IMMEDIATE);
}
```

### Flexible Update (Background Download)

A flexible update downloads in the background while the user continues using the app.

- **Android:** Downloads via Google Play in the background. Monitor progress via `INSTALL_STATE_EVENT`. Call `completeUpdate()` when downloaded.
- **iOS:** Shows an alert with "Update" / "Later" options. If the user taps "Update", opens the App Store page. `completeUpdate()` is a no-op since the App Store handles installation.

```typescript
import {
  NativescriptInAppUpdate,
  UpdateType,
  UpdateAvailability,
  InstallStatus,
  isAndroid,
} from '@kakha13/nativescript-in-app-update';

const updater = new NativescriptInAppUpdate();

const info = await updater.checkUpdate();

if (
  info.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE &&
  info.isFlexibleUpdateAllowed
) {
  if (isAndroid) {
    // Android: listen for download progress
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
  }

  // Start flexible update
  await updater.startUpdate(UpdateType.FLEXIBLE);
}
```

### Cleanup

```typescript
// When done, clean up listeners and resources
updater.dispose();
```

## API Reference

### Constructor

```typescript
new NativescriptInAppUpdate(options?: InAppUpdateOptions)
```

### `InAppUpdateOptions`

| Property        | Type      | Platform | Description                                                                 |
| --------------- | --------- | -------- | --------------------------------------------------------------------------- |
| `useFakeManager`| `boolean` | Android  | Use FakeAppUpdateManager for local testing                                  |
| `countryCode`   | `string`  | iOS      | ISO country code for App Store lookup (defaults to device locale region)    |
| `appStoreId`    | `number`  | iOS      | Numeric Apple App Store ID — skips lookup if already known                  |

### Methods

| Method                          | Returns           | Description                                                  |
| ------------------------------- | ----------------- | ------------------------------------------------------------ |
| `checkUpdate()`                 | `Promise<UpdateInfo>` | Check if an update is available                          |
| `startUpdate(type)`             | `Promise<void>`   | Start immediate or flexible update flow                      |
| `completeUpdate()`              | `Promise<void>`   | Install a downloaded flexible update (Android) / no-op (iOS) |
| `registerInstallStateListener()`| `void`            | Start listening for install state changes (Android only)      |
| `unregisterInstallStateListener()` | `void`         | Stop listening for install state changes (Android only)       |
| `dispose()`                     | `void`            | Clean up all listeners and resources                         |

### `UpdateInfo`

| Property                     | Type              | Platform     | Description                                      |
| ---------------------------- | ----------------- | ------------ | ------------------------------------------------ |
| `updateAvailability`         | `number`          | Both         | One of `UpdateAvailability` constants             |
| `availableVersionCode`       | `number`          | Both         | Android: version code / iOS: App Store trackId    |
| `updatePriority`             | `number`          | Android      | Update priority (0-5) set in Play Console. Always 0 on iOS. |
| `clientVersionStalenessDays` | `number \| null`  | Both         | Days since the update became available            |
| `installStatus`              | `number`          | Android      | Current install status. Always UNKNOWN on iOS.    |
| `isFlexibleUpdateAllowed`    | `boolean`         | Both         | Whether flexible update is allowed                |
| `isImmediateUpdateAllowed`   | `boolean`         | Both         | Whether immediate update is allowed               |
| `appStoreVersion`            | `string`          | iOS          | App Store version string (e.g. "2.1.0")           |
| `releaseNotes`               | `string`          | iOS          | Release notes from App Store listing              |
| `trackViewUrl`               | `string`          | iOS          | Direct App Store URL for the app                  |

### `InstallStateInfo` (Android only)

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

## iOS Details

### How It Works

1. **`checkUpdate()`** calls the [iTunes Lookup API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/LookupExamples.html) with your app's bundle identifier and compares the returned version against the installed `CFBundleShortVersionString`. It also verifies that the device's iOS version meets the update's `minimumOsVersion` requirement.

2. **`startUpdate(IMMEDIATE)`** presents a `SKStoreProductViewController` — an in-app App Store page where the user can tap "Update" without leaving your app.

3. **`startUpdate(FLEXIBLE)`** first shows a `UIAlertController` with "Update" / "Later" options. If the user taps "Update", it then presents the `SKStoreProductViewController`. If "Later", the promise rejects with "Update cancelled by user".

4. **`completeUpdate()`** is a no-op on iOS since the App Store handles download and installation.

### Country Code

The iTunes Lookup API requires a country code to find your app. By default, the plugin uses the device's locale region. If your app is only available in specific regions, pass the `countryCode` option explicitly:

```typescript
const updater = new NativescriptInAppUpdate({
  countryCode: 'gb', // United Kingdom
});
```

### App Store ID

If you already know your App Store ID (the `trackId` from the iTunes API, or from your App Store URL `https://apps.apple.com/app/id<THIS_NUMBER>`), pass it to skip the lookup in `startUpdate()`:

```typescript
const updater = new NativescriptInAppUpdate({
  appStoreId: 123456789,
});
```

### Limitations

- **Propagation delay:** New versions can take up to 24 hours to appear in the iTunes Lookup API after going live on the App Store.
- **No download progress:** iOS does not expose download/install progress — the App Store handles everything.
- **No forced restart:** Unlike Android's immediate update, iOS cannot force the app to restart and install. The user must tap "Update" in the App Store UI.
- **No update priority:** There is no equivalent to Android's update priority (0-5). Use your own server-side configuration if needed.
- **No FakeManager:** Testing on iOS requires the app to be published on the App Store (or TestFlight). You can test the UI flow by temporarily hardcoding a higher version.

## Android Testing

In-app updates **cannot be tested on sideloaded/debug builds**. The Play Core library requires the app to be installed from Google Play.

### Requirements for testing

1. The app must be **published to a Google Play testing track** (internal, closed, or open)
2. The installed version must have a **lower version code** than the one available on the track
3. The app must be **signed with the same key** as the Play Store version
4. The app must be **installed via Google Play** (not via `ns run` or `adb install`)

### Common errors on debug builds

| Error Code | Meaning |
| ---------- | ------- |
| `-6` (`ERROR_INSTALL_NOT_ALLOWED`) | The app is not installed from Google Play, or device state doesn't allow updates |
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
