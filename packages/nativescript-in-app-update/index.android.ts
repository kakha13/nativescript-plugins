import { Application, AndroidApplication } from '@nativescript/core';
import { NativescriptInAppUpdateCommon, UpdateType } from './common';
import type { UpdateInfo, InstallStateInfo, InAppUpdateOptions } from './common';

export { UpdateType } from './common';
export type { UpdateInfo, InstallStateInfo, InAppUpdateOptions } from './common';
export { UpdateAvailability, InstallStatus } from './common';

const REQUEST_CODE_UPDATE = 53100;

export class NativescriptInAppUpdate extends NativescriptInAppUpdateCommon {
  private appUpdateManager: com.google.android.play.core.appupdate.AppUpdateManager;
  private fakeManager: com.google.android.play.core.appupdate.testing.FakeAppUpdateManager | null = null;
  private appUpdateInfo: com.google.android.play.core.appupdate.AppUpdateInfo | null = null;
  private installStateListener: com.google.android.play.core.install.InstallStateUpdatedListener | null = null;
  private activityResultHandler: ((args: any) => void) | null = null;
  private updateResolve: (() => void) | null = null;
  private updateReject: ((err: Error) => void) | null = null;

  constructor(options?: InAppUpdateOptions) {
    super();
    const ctx = Application.android.getNativeApplication() as android.app.Application;
    if (options?.useFakeManager) {
      this.fakeManager = new com.google.android.play.core.appupdate.testing.FakeAppUpdateManager(ctx);
      this.appUpdateManager = this.fakeManager as any;
    } else {
      this.appUpdateManager = com.google.android.play.core.appupdate.AppUpdateManagerFactory.create(ctx);
    }
  }

  /**
   * Fake manager methods — only work when useFakeManager is true.
   * Use these to simulate update scenarios for local testing.
   */

  fakeSetUpdateAvailable(versionCode: number): void {
    this.ensureFakeManager();
    this.fakeManager!.setUpdateAvailable(versionCode);
  }

  fakeSetUpdateNotAvailable(): void {
    this.ensureFakeManager();
    this.fakeManager!.setUpdateNotAvailable();
  }

  fakeSetUpdatePriority(priority: number): void {
    this.ensureFakeManager();
    this.fakeManager!.setUpdatePriority(priority);
  }

  fakeUserAcceptsUpdate(): void {
    this.ensureFakeManager();
    this.fakeManager!.getUserConfirmation();
  }

  fakeDownloadStarts(): void {
    this.ensureFakeManager();
    this.fakeManager!.downloadStarts();
  }

  fakeDownloadCompletes(): void {
    this.ensureFakeManager();
    this.fakeManager!.downloadCompletes();
  }

  fakeInstallCompletes(): void {
    this.ensureFakeManager();
    this.fakeManager!.installCompletes();
  }

  fakeInstallFails(): void {
    this.ensureFakeManager();
    this.fakeManager!.installFails();
  }

  fakeIsConfirmationDialogVisible(): boolean {
    this.ensureFakeManager();
    return this.fakeManager!.isConfirmationDialogVisible();
  }

  private ensureFakeManager(): void {
    if (!this.fakeManager) {
      throw new Error('FakeAppUpdateManager is not enabled. Pass { useFakeManager: true } to the constructor.');
    }
  }

  checkUpdate(): Promise<UpdateInfo> {
    return new Promise<UpdateInfo>((resolve, reject) => {
      const AppUpdateType = com.google.android.play.core.install.model.AppUpdateType;

      this.appUpdateManager
        .getAppUpdateInfo()
        .addOnSuccessListener(
          new com.google.android.gms.tasks.OnSuccessListener({
            onSuccess: (info: com.google.android.play.core.appupdate.AppUpdateInfo) => {
              this.appUpdateInfo = info;
              const stalenessDays = info.clientVersionStalenessDays();
              resolve({
                updateAvailability: info.updateAvailability(),
                availableVersionCode: info.availableVersionCode(),
                updatePriority: info.updatePriority(),
                clientVersionStalenessDays: stalenessDays !== null ? stalenessDays.intValue() : null,
                installStatus: info.installStatus(),
                isFlexibleUpdateAllowed: info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE),
                isImmediateUpdateAllowed: info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE),
              });
            },
          }),
        )
        .addOnFailureListener(
          new com.google.android.gms.tasks.OnFailureListener({
            onFailure: (e: java.lang.Exception) => {
              reject(new Error(e.getMessage() || 'Failed to check for updates'));
            },
          }),
        );
    });
  }

  startUpdate(updateType: UpdateType): Promise<void> {
    const appUpdateType = updateType === UpdateType.IMMEDIATE ? com.google.android.play.core.install.model.AppUpdateType.IMMEDIATE : com.google.android.play.core.install.model.AppUpdateType.FLEXIBLE;

    return new Promise<void>((resolve, reject) => {
      // Always fetch fresh AppUpdateInfo — a previously used one is consumed and won't show UI
      this.appUpdateManager
        .getAppUpdateInfo()
        .addOnSuccessListener(
          new com.google.android.gms.tasks.OnSuccessListener({
            onSuccess: (freshInfo: com.google.android.play.core.appupdate.AppUpdateInfo) => {
              // Get activity fresh inside the callback — the outer reference may be stale
              const activity = Application.android.foregroundActivity || Application.android.startActivity;
              if (!activity) {
                reject(new Error('No Android activity available'));
                return;
              }

              console.log('startUpdate: updateType=' + appUpdateType + ', updateAvailability=' + freshInfo.updateAvailability() + ', isAllowed=' + freshInfo.isUpdateTypeAllowed(appUpdateType));
              console.log('startUpdate: activity=' + activity + ', class=' + activity.getClass().getName());

              this.appUpdateInfo = freshInfo;
              this.updateResolve = resolve;
              this.updateReject = reject;

              this.registerActivityResultHandler();

              try {
                const started = this.appUpdateManager.startUpdateFlowForResult(freshInfo, appUpdateType, activity, REQUEST_CODE_UPDATE);
                console.log('startUpdateFlowForResult returned:', started);
              } catch (e) {
                console.error('startUpdateFlowForResult error:', e);
                this.cleanupActivityResult();
                reject(new Error(e.message || 'Failed to start update flow'));
              }
            },
          }),
        )
        .addOnFailureListener(
          new com.google.android.gms.tasks.OnFailureListener({
            onFailure: (e: java.lang.Exception) => {
              reject(new Error(e.getMessage() || 'Failed to get update info'));
            },
          }),
        );
    });
  }

  completeUpdate(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.appUpdateManager
        .completeUpdate()
        .addOnSuccessListener(
          new com.google.android.gms.tasks.OnSuccessListener({
            onSuccess: () => {
              resolve();
            },
          }),
        )
        .addOnFailureListener(
          new com.google.android.gms.tasks.OnFailureListener({
            onFailure: (e: java.lang.Exception) => {
              reject(new Error(e.getMessage() || 'Failed to complete update'));
            },
          }),
        );
    });
  }

  registerInstallStateListener(): void {
    if (this.installStateListener) {
      return;
    }

    this.installStateListener = new com.google.android.play.core.install.InstallStateUpdatedListener({
      onStateUpdate: (state: com.google.android.play.core.install.InstallState) => {
        const info: InstallStateInfo = {
          installStatus: state.installStatus(),
          bytesDownloaded: state.bytesDownloaded(),
          totalBytesToDownload: state.totalBytesToDownload(),
          installErrorCode: state.installErrorCode(),
        };
        this.notify({
          eventName: NativescriptInAppUpdate.INSTALL_STATE_EVENT,
          object: this,
          data: info,
        });
      },
    });

    this.appUpdateManager.registerListener(this.installStateListener);
  }

  unregisterInstallStateListener(): void {
    if (this.installStateListener) {
      this.appUpdateManager.unregisterListener(this.installStateListener);
      this.installStateListener = null;
    }
  }

  private registerActivityResultHandler(): void {
    this.cleanupActivityResult();

    this.activityResultHandler = (args: any) => {
      if (args.requestCode !== REQUEST_CODE_UPDATE) {
        return;
      }

      const resultCode: number = args.resultCode;

      if (resultCode === android.app.Activity.RESULT_OK) {
        this.updateResolve?.();
      } else if (resultCode === android.app.Activity.RESULT_CANCELED) {
        this.updateReject?.(new Error('Update cancelled by user'));
      } else {
        this.updateReject?.(new Error('Update flow failed with result code: ' + resultCode));
      }

      this.cleanupActivityResult();
    };

    Application.android.on(AndroidApplication.activityResultEvent, this.activityResultHandler);
  }

  private cleanupActivityResult(): void {
    if (this.activityResultHandler) {
      Application.android.off(AndroidApplication.activityResultEvent, this.activityResultHandler);
      this.activityResultHandler = null;
    }
    this.updateResolve = null;
    this.updateReject = null;
  }

  dispose(): void {
    this.unregisterInstallStateListener();
    this.cleanupActivityResult();
    this.appUpdateInfo = null;
  }
}
