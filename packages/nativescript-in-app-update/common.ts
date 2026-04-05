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

export const UpdateAvailability = {
  UNKNOWN: 0,
  UPDATE_NOT_AVAILABLE: 1,
  UPDATE_AVAILABLE: 2,
  DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS: 3,
};

export const InstallStatus = {
  UNKNOWN: 0,
  PENDING: 1,
  DOWNLOADING: 2,
  INSTALLING: 3,
  INSTALLED: 4,
  FAILED: 5,
  CANCELED: 6,
  REQUIRES_UI_INTENT: 10,
  DOWNLOADED: 11,
};

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
   * since the ID is already known. You can find this in App Store Connect
   * or from the app URL: https://apps.apple.com/app/id<THIS_NUMBER>
   */
  appStoreId?: number;
}

/**
 * Compare two semantic version strings.
 * Returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2.
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a < b) return -1;
    if (a > b) return 1;
  }
  return 0;
}

export class NativescriptInAppUpdateCommon extends Observable {
  static UPDATE_RESULT_EVENT = 'updateResult';
  static INSTALL_STATE_EVENT = 'installState';
}
