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
  useFakeManager?: boolean;
}

export class NativescriptInAppUpdateCommon extends Observable {
  static UPDATE_RESULT_EVENT = 'updateResult';
  static INSTALL_STATE_EVENT = 'installState';
}
