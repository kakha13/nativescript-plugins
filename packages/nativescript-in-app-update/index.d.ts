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
}

export interface InstallStateInfo {
  installStatus: number;
  bytesDownloaded: number;
  totalBytesToDownload: number;
  installErrorCode: number;
}

export interface InAppUpdateOptions {
  useFakeManager?: boolean;
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
   * Returns update info with availability, version code, priority, etc.
   */
  checkUpdate(): Promise<UpdateInfo>;

  /**
   * Start the update flow (immediate or flexible).
   * For IMMEDIATE: full-screen blocking UI managed by Google Play.
   * For FLEXIBLE: background download; listen to INSTALL_STATE_EVENT for progress.
   * Resolves when the user accepts the update flow, rejects if denied or error.
   */
  startUpdate(updateType: UpdateType): Promise<void>;

  /**
   * Complete a flexible update after it has been downloaded.
   * This will restart the app to install the update.
   * Only call this when installStatus === InstallStatus.DOWNLOADED.
   */
  completeUpdate(): Promise<void>;

  /**
   * Register install state listener for flexible update progress.
   * Events are emitted via the INSTALL_STATE_EVENT Observable event.
   */
  registerInstallStateListener(): void;

  /**
   * Unregister the install state listener.
   */
  unregisterInstallStateListener(): void;

  /**
   * Clean up resources. Call when done with updates.
   */
  dispose(): void;

  // --- Fake manager methods (only work when useFakeManager: true) ---

  /** Simulate an available update with the given version code. */
  fakeSetUpdateAvailable(versionCode: number): void;

  /** Simulate no update available. */
  fakeSetUpdateNotAvailable(): void;

  /** Set the update priority for the fake update. */
  fakeSetUpdatePriority(priority: number): void;

  /** Simulate the user accepting the update (call after startUpdate shows confirmation). */
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
