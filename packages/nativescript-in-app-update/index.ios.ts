import { Http, Utils } from '@nativescript/core';
import { NativescriptInAppUpdateCommon, UpdateType, UpdateAvailability, InstallStatus, compareVersions } from './common';
import type { UpdateInfo, InAppUpdateOptions } from './common';

export { UpdateType } from './common';
export type { UpdateInfo, InstallStateInfo, InAppUpdateOptions } from './common';
export { UpdateAvailability, InstallStatus } from './common';

/**
 * iTunes Lookup API response shape (fields we use).
 */
interface ITunesLookupResult {
  trackId: number;
  version: string;
  minimumOsVersion: string;
  currentVersionReleaseDate: string;
  releaseNotes?: string;
  trackViewUrl: string;
}

interface ITunesLookupResponse {
  resultCount: number;
  results: ITunesLookupResult[];
}

@NativeClass()
class SKStoreProductViewControllerDelegateImpl extends NSObject implements SKStoreProductViewControllerDelegate {
  static ObjCProtocols = [SKStoreProductViewControllerDelegate];

  private _onDismiss: (() => void) | null = null;

  static initWithCallback(onDismiss: () => void): SKStoreProductViewControllerDelegateImpl {
    const delegate = <SKStoreProductViewControllerDelegateImpl>SKStoreProductViewControllerDelegateImpl.new();
    delegate._onDismiss = onDismiss;
    return delegate;
  }

  productViewControllerDidFinish(viewController: SKStoreProductViewController): void {
    viewController.dismissViewControllerAnimatedCompletion(true, null);
    this._onDismiss?.();
  }
}

export class NativescriptInAppUpdate extends NativescriptInAppUpdateCommon {
  private countryCode: string | null;
  private appStoreId: number | null;
  private lastLookupResult: ITunesLookupResult | null = null;
  private _delegate: SKStoreProductViewControllerDelegateImpl | null = null;

  constructor(options?: InAppUpdateOptions) {
    super();
    this.appStoreId = options?.appStoreId ?? null;
    this.countryCode = options?.countryCode ?? null;
  }

  checkUpdate(): Promise<UpdateInfo> {
    return new Promise<UpdateInfo>((resolve, reject) => {
      const bundleId = NSBundle.mainBundle.bundleIdentifier;
      if (!bundleId) {
        reject(new Error('Could not determine bundle identifier'));
        return;
      }

      let url = `https://itunes.apple.com/lookup?bundleId=${bundleId}`;

      const country = this.countryCode || this.getDeviceCountryCode();
      if (country) {
        url += `&country=${country}`;
      }

      Http.getJSON<ITunesLookupResponse>(url).then(
        (response) => {
          if (!response || response.resultCount === 0 || !response.results || response.results.length === 0) {
            resolve({
              updateAvailability: UpdateAvailability.UPDATE_NOT_AVAILABLE,
              availableVersionCode: 0,
              updatePriority: 0,
              clientVersionStalenessDays: null,
              installStatus: InstallStatus.UNKNOWN,
              isFlexibleUpdateAllowed: false,
              isImmediateUpdateAllowed: false,
            });
            return;
          }

          const result = response.results[0];
          this.lastLookupResult = result;

          // Store the appStoreId for later use in startUpdate
          if (!this.appStoreId) {
            this.appStoreId = result.trackId;
          }

          const installedVersion = NSBundle.mainBundle.objectForInfoDictionaryKey('CFBundleShortVersionString') as string;
          const storeVersion = result.version;

          // Check if device can run the update
          const deviceOsVersion = UIDevice.currentDevice.systemVersion;
          const canRunUpdate = compareVersions(deviceOsVersion, result.minimumOsVersion) >= 0;

          const hasUpdate = canRunUpdate && compareVersions(installedVersion, storeVersion) < 0;

          // Calculate staleness days from release date
          let stalenessDays: number | null = null;
          if (result.currentVersionReleaseDate) {
            const formatter = NSDateFormatter.new();
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ";
            formatter.locale = NSLocale.localeWithLocaleIdentifier('en_US_POSIX');
            const releaseDate = formatter.dateFromString(result.currentVersionReleaseDate);
            if (releaseDate) {
              const now = NSDate.date();
              const seconds = now.timeIntervalSinceDate(releaseDate);
              stalenessDays = Math.floor(seconds / 86400);
            }
          }

          resolve({
            updateAvailability: hasUpdate ? UpdateAvailability.UPDATE_AVAILABLE : UpdateAvailability.UPDATE_NOT_AVAILABLE,
            availableVersionCode: result.trackId,
            updatePriority: 0, // Not available on iOS
            clientVersionStalenessDays: stalenessDays,
            installStatus: InstallStatus.UNKNOWN,
            isFlexibleUpdateAllowed: hasUpdate,
            isImmediateUpdateAllowed: hasUpdate,
            appStoreVersion: storeVersion,
            releaseNotes: result.releaseNotes,
            trackViewUrl: result.trackViewUrl,
          });
        },
        (error) => {
          reject(new Error(error.message || 'Failed to check App Store for updates'));
        },
      );
    });
  }

  startUpdate(updateType: UpdateType): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (updateType === UpdateType.IMMEDIATE) {
        this.presentAppStorePage(resolve, reject);
      } else {
        // Flexible: show an alert first, then present App Store page on "Update"
        this.showUpdateAlert(resolve, reject);
      }
    });
  }

  completeUpdate(): Promise<void> {
    // On iOS the App Store handles installation — nothing to do here.
    return Promise.resolve();
  }

  registerInstallStateListener(): void {
    // No-op on iOS — the App Store manages download/install progress.
  }

  unregisterInstallStateListener(): void {
    // No-op on iOS.
  }

  dispose(): void {
    this._delegate = null;
    this.lastLookupResult = null;
  }

  // ---- Fake manager stubs (Android only, no-op on iOS) ----

  fakeSetUpdateAvailable(_versionCode: number): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeSetUpdateNotAvailable(): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeSetUpdatePriority(_priority: number): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeUserAcceptsUpdate(): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeDownloadStarts(): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeDownloadCompletes(): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeInstallCompletes(): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeInstallFails(): void {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  fakeIsConfirmationDialogVisible(): boolean {
    throw new Error('FakeAppUpdateManager is only available on Android.');
  }

  // ---- Private helpers ----

  private getDeviceCountryCode(): string | null {
    const locale = NSLocale.currentLocale;
    const code = locale.countryCode;
    return code ? code : null;
  }

  private presentAppStorePage(resolve: () => void, reject: (err: Error) => void): void {
    const trackId = this.appStoreId || this.lastLookupResult?.trackId;

    if (!trackId) {
      // Fallback: open App Store URL if we have it
      if (this.lastLookupResult?.trackViewUrl) {
        this.openAppStoreUrl(this.lastLookupResult.trackViewUrl);
        resolve();
        return;
      }
      reject(new Error('No App Store ID available. Call checkUpdate() first or provide appStoreId in options.'));
      return;
    }

    const rootVC = this.getRootViewController();
    if (!rootVC) {
      // Fallback: open via URL scheme
      const url = NSURL.URLWithString(`itms-apps://itunes.apple.com/app/id${trackId}`);
      if (url && UIApplication.sharedApplication.canOpenURL(url)) {
        UIApplication.sharedApplication.openURLOptionsCompletionHandler(url, null, (success) => {
          success ? resolve() : reject(new Error('Failed to open App Store'));
        });
      } else {
        reject(new Error('Cannot open App Store'));
      }
      return;
    }

    const storeVC = SKStoreProductViewController.new();

    this._delegate = SKStoreProductViewControllerDelegateImpl.initWithCallback(() => {
      resolve();
    });
    storeVC.delegate = this._delegate;

    const params = NSDictionary.dictionaryWithObjectForKey(NSNumber.numberWithInt(trackId), SKStoreProductParameterITunesItemIdentifier);

    storeVC.loadProductWithParametersCompletionBlock(params, (loaded, error) => {
      if (loaded) {
        rootVC.presentViewControllerAnimatedCompletion(storeVC, true, null);
      } else {
        // Fallback: open via URL if in-app page fails
        const url = `itms-apps://itunes.apple.com/app/id${trackId}`;
        this.openAppStoreUrl(url);
        resolve();
      }
    });
  }

  private showUpdateAlert(resolve: () => void, reject: (err: Error) => void): void {
    const rootVC = this.getRootViewController();
    if (!rootVC) {
      // No view controller — fall through to direct App Store open
      this.presentAppStorePage(resolve, reject);
      return;
    }

    const releaseNotes = this.lastLookupResult?.releaseNotes;
    const version = this.lastLookupResult?.version;

    const title = 'Update Available';
    let message = 'A new version of this app is available.';
    if (version) {
      message = `Version ${version} is available.`;
    }
    if (releaseNotes) {
      message += `\n\n${releaseNotes}`;
    }

    const alert = UIAlertController.alertControllerWithTitleMessagePreferredStyle(title, message, UIAlertControllerStyle.Alert);

    alert.addAction(
      UIAlertAction.actionWithTitleStyleHandler('Update', UIAlertActionStyle.Default, () => {
        this.presentAppStorePage(resolve, reject);
      }),
    );

    alert.addAction(
      UIAlertAction.actionWithTitleStyleHandler('Later', UIAlertActionStyle.Cancel, () => {
        reject(new Error('Update cancelled by user'));
      }),
    );

    rootVC.presentViewControllerAnimatedCompletion(alert, true, null);
  }

  private getRootViewController(): UIViewController | null {
    const rootVC = Utils.ios.getRootViewController();
    return rootVC || null;
  }

  private openAppStoreUrl(url: string): void {
    const nsUrl = NSURL.URLWithString(url);
    if (nsUrl && UIApplication.sharedApplication.canOpenURL(nsUrl)) {
      UIApplication.sharedApplication.openURLOptionsCompletionHandler(nsUrl, null, null);
    }
  }
}
