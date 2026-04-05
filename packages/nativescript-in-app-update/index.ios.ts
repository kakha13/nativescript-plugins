import { NativescriptInAppUpdateCommon, UpdateType } from './common';
import type { UpdateInfo, InAppUpdateOptions } from './common';

export { UpdateType } from './common';
export type { UpdateInfo, InstallStateInfo, InAppUpdateOptions } from './common';
export { UpdateAvailability, InstallStatus } from './common';

export class NativescriptInAppUpdate extends NativescriptInAppUpdateCommon {
  constructor(_options?: InAppUpdateOptions) {
    super();
  }

  checkUpdate(): Promise<UpdateInfo> {
    return Promise.reject(new Error('In-app updates are not supported on iOS'));
  }

  startUpdate(_updateType: UpdateType): Promise<void> {
    return Promise.reject(new Error('In-app updates are not supported on iOS'));
  }

  completeUpdate(): Promise<void> {
    return Promise.reject(new Error('In-app updates are not supported on iOS'));
  }

  registerInstallStateListener(): void {
    // no-op on iOS
  }

  unregisterInstallStateListener(): void {
    // no-op on iOS
  }

  dispose(): void {
    // no-op on iOS
  }
}
