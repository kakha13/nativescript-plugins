import { Observable } from '@nativescript/core';

export enum UpdateType {
  FLEXIBLE = 0,
  IMMEDIATE = 1,
}

export interface UpdateInfo {
  updateAvailability: number;
  availableVersionCode: number;
  updatePriority: number;
  clientVersionStalenessDays: number | null;
  installStatus: number;
  isFlexibleUpdateAllowed: boolean;
  isImmediateUpdateAllowed: boolean;
  /** iOS only: the App Store version string (e.g. "2.1.0"). */
  appStoreVersion?: string;
  /** iOS only: release notes from the App Store listing. */
  releaseNotes?: string;
  /** iOS only: the App Store URL for the app. */
  trackViewUrl?: string;
}

export interface InstallStateInfo {
  installStatus: number;
  bytesDownloaded: number;
  totalBytesToDownload: number;
  installErrorCode: number;
}

export interface InAppUpdateOptions {
  /** Android only: use FakeAppUpdateManager for local testing. */
  useFakeManager?: boolean;
  /**
   * iOS only: ISO 3166-1 alpha-2 country code for the App Store lookup.
   * Required if your app is not available in the US App Store.
   * Defaults to the device locale's region on iOS.
   */
  countryCode?: string;
  /**
   * iOS only: your numeric Apple App Store ID (the "trackId").
   * If provided, skips the iTunes Lookup API call in startUpdate()
   * since the ID is already known.
   */
  appStoreId?: number;
}

export declare const UpdateAvailability: {
  UNKNOWN: number;
  UPDATE_NOT_AVAILABLE: number;
  UPDATE_AVAILABLE: number;
  DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS: number;
};

export declare const InstallStatus: {
  UNKNOWN: number;
  PENDING: number;
  DOWNLOADING: number;
  INSTALLING: number;
  INSTALLED: number;
  FAILED: number;
  CANCELED: number;
  REQUIRES_UI_INTENT: number;
  DOWNLOADED: number;
};

export declare class NativescriptInAppUpdate extends Observable {
  static UPDATE_RESULT_EVENT: string;
  static INSTALL_STATE_EVENT: string;

  constructor(options?: InAppUpdateOptions);

  /**
   * Check if an update is available.
   *
   * **Android:** Queries Google Play using the Play Core AppUpdateManager.
   *
   * **iOS:** Calls the iTunes Lookup API and compares the App Store version
   * against the installed CFBundleShortVersionString. Also checks that the
   * device OS version meets the update's minimumOsVersion requirement.
   */
  checkUpdate(): Promise<UpdateInfo>;

  /**
   * Start the update flow.
   *
   * **Android:**
   * - IMMEDIATE: full-screen blocking UI managed by Google Play.
   * - FLEXIBLE: background download; listen to INSTALL_STATE_EVENT for progress.
   *
   * **iOS:**
   * - IMMEDIATE: presents SKStoreProductViewController directly (App Store page in-app).
   * - FLEXIBLE: shows a UIAlertController with "Update" / "Later" options,
   *   then opens SKStoreProductViewController if the user taps "Update".
   *
   * Resolves when the user accepts/dismisses the flow.
   * Rejects if the user cancels (flexible) or an error occurs.
   */
  startUpdate(updateType: UpdateType): Promise<void>;

  /**
   * Complete a flexible update after download.
   *
   * **Android:** Restarts the app to install the downloaded update.
   * Only call when installStatus === InstallStatus.DOWNLOADED.
   *
   * **iOS:** No-op — the App Store handles installation.
   */
  completeUpdate(): Promise<void>;

  /**
   * Register install state listener for flexible update progress.
   * Events are emitted via the INSTALL_STATE_EVENT Observable event.
   *
   * **iOS:** No-op — the App Store manages download/install progress.
   */
  registerInstallStateListener(): void;

  /**
   * Unregister the install state listener.
   *
   * **iOS:** No-op.
   */
  unregisterInstallStateListener(): void;

  /**
   * Clean up resources. Call when done with updates.
   */
  dispose(): void;

  // --- Fake manager methods (Android only) ---
  // These throw on iOS.

  /** Simulate an available update with the given version code. */
  fakeSetUpdateAvailable(versionCode: number): void;

  /** Simulate no update available. */
  fakeSetUpdateNotAvailable(): void;

  /** Set the update priority for the fake update. */
  fakeSetUpdatePriority(priority: number): void;

  /** Simulate the user accepting the update. */
  fakeUserAcceptsUpdate(): void;

  /** Simulate download starting. */
  fakeDownloadStarts(): void;

  /** Simulate download completing (status becomes DOWNLOADED). */
  fakeDownloadCompletes(): void;

  /** Simulate install completing. */
  fakeInstallCompletes(): void;

  /** Simulate install failing. */
  fakeInstallFails(): void;

  /** Check if the fake confirmation dialog is currently visible. */
  fakeIsConfirmationDialogVisible(): boolean;
}
