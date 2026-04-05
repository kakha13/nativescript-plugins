/// Type declarations for Google Play Core In-App Updates (app-update:2.1.0)
/// Adapted for NativeScript's Java/Kotlin interop conventions.

declare namespace com {
  namespace google {
    namespace android {
      namespace play {
        namespace core {
          namespace appupdate {
            class AppUpdateManager {
              getAppUpdateInfo(): com.google.android.gms.tasks.Task<AppUpdateInfo>;
              startUpdateFlowForResult(appUpdateInfo: AppUpdateInfo, appUpdateType: number, activity: android.app.Activity, requestCode: number): boolean;
              startUpdateFlowForResult(appUpdateInfo: AppUpdateInfo, activity: android.app.Activity, options: AppUpdateOptions, requestCode: number): boolean;
              registerListener(listener: com.google.android.play.core.install.InstallStateUpdatedListener): void;
              unregisterListener(listener: com.google.android.play.core.install.InstallStateUpdatedListener): void;
              completeUpdate(): com.google.android.gms.tasks.Task<java.lang.Void>;
            }

            class AppUpdateManagerFactory {
              static create(context: android.content.Context): AppUpdateManager;
            }

            class AppUpdateInfo {
              availableVersionCode(): number;
              updateAvailability(): number;
              isUpdateTypeAllowed(updateType: number): boolean;
              updatePriority(): number;
              clientVersionStalenessDays(): java.lang.Integer;
              installStatus(): number;
              packageName(): string;
            }

            namespace testing {
              class FakeAppUpdateManager extends AppUpdateManager {
                constructor(context: android.content.Context);
                setUpdateAvailable(availableVersionCode: number): void;
                setUpdateAvailable(availableVersionCode: number, appUpdateType: number): void;
                setUpdateNotAvailable(): void;
                setUpdatePriority(updatePriority: number): void;
                setClientVersionStalenessDays(days: number): void;
                getUserConfirmation(): void;
                downloadStarts(): void;
                downloadCompletes(): void;
                installCompletes(): void;
                installFails(): void;
                isConfirmationDialogVisible(): boolean;
                isImmediateFlowVisible(): boolean;
                isInstallSplashScreenVisible(): boolean;
                getTypeForUpdateInProgress(): number;
                setBytesDownloaded(bytesDownloaded: number): void;
                setTotalBytesToDownload(totalBytesToDownload: number): void;
              }
            }

            class AppUpdateOptions {
              static defaultOptions(appUpdateType: number): AppUpdateOptions;
              static newBuilder(appUpdateType: number): AppUpdateOptions.Builder;
              appUpdateType(): number;
              allowAssetPackDeletion(): boolean;
            }

            namespace AppUpdateOptions {
              class Builder {
                setAppUpdateType(appUpdateType: number): Builder;
                setAllowAssetPackDeletion(allow: boolean): Builder;
                build(): AppUpdateOptions;
              }
            }
          }

          namespace install {
            class InstallStateUpdatedListener {
              constructor(implementation: { onStateUpdate(state: InstallState): void });
              onStateUpdate(state: InstallState): void;
            }

            class InstallState {
              installStatus(): number;
              bytesDownloaded(): number;
              totalBytesToDownload(): number;
              installErrorCode(): number;
              packageName(): string;
            }

            namespace model {
              class AppUpdateType {
                static FLEXIBLE: number; // 0
                static IMMEDIATE: number; // 1
              }

              class UpdateAvailability {
                static UNKNOWN: number; // 0
                static UPDATE_NOT_AVAILABLE: number; // 1
                static UPDATE_AVAILABLE: number; // 2
                static DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS: number; // 3
              }

              class InstallStatus {
                static UNKNOWN: number; // 0
                static PENDING: number; // 1
                static DOWNLOADING: number; // 2
                static DOWNLOADED: number; // 11
                static INSTALLING: number; // 3
                static INSTALLED: number; // 4
                static FAILED: number; // 5
                static CANCELED: number; // 6
                static REQUIRES_UI_INTENT: number; // 10
              }

              class InstallErrorCode {
                static NO_ERROR: number; // 0
                static NO_ERROR_PARTIALLY_ALLOWED: number; // 1
                static ERROR_UNKNOWN: number; // -2
                static ERROR_API_NOT_AVAILABLE: number; // -3
                static ERROR_INVALID_REQUEST: number; // -4
                static ERROR_INSTALL_UNAVAILABLE: number; // -5
                static ERROR_INSTALL_NOT_ALLOWED: number; // -6
                static ERROR_DOWNLOAD_NOT_PRESENT: number; // -7
                static ERROR_INTERNAL_ERROR: number; // -100
              }
            }
          }
        }
      }
    }
  }
}

declare namespace com {
  namespace google {
    namespace android {
      namespace gms {
        namespace tasks {
          class Task<T> {
            addOnSuccessListener(listener: OnSuccessListener<T>): Task<T>;
            addOnFailureListener(listener: OnFailureListener): Task<T>;
            addOnCompleteListener(listener: OnCompleteListener<T>): Task<T>;
            isSuccessful(): boolean;
            getResult(): T;
            getException(): java.lang.Exception;
          }

          class OnSuccessListener<T> {
            constructor(implementation: { onSuccess(result: T): void });
            onSuccess(result: T): void;
          }

          class OnFailureListener {
            constructor(implementation: { onFailure(e: java.lang.Exception): void });
            onFailure(e: java.lang.Exception): void;
          }

          class OnCompleteListener<T> {
            constructor(implementation: { onComplete(task: Task<T>): void });
            onComplete(task: Task<T>): void;
          }
        }
      }
    }
  }
}
