import { DemoSharedBase } from '../utils';
import { NativescriptInAppUpdate, UpdateType, UpdateAvailability, InstallStatus } from '@kakha13/nativescript-in-app-update';

export class DemoSharedNativescriptInAppUpdate extends DemoSharedBase {
  private updater: NativescriptInAppUpdate;
  status = 'Ready';

  constructor() {
    super();
    this.updater = new NativescriptInAppUpdate();
  }

  async checkUpdate() {
    try {
      this.set('status', 'Checking for updates...');
      const info = await this.updater.checkUpdate();
      if (info.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE) {
        this.set('status', `Update available! v${info.availableVersionCode}, priority: ${info.updatePriority}, flexible: ${info.isFlexibleUpdateAllowed}, immediate: ${info.isImmediateUpdateAllowed}`);
      } else if (info.updateAvailability === UpdateAvailability.UPDATE_NOT_AVAILABLE) {
        this.set('status', 'No update available');
      } else if (info.updateAvailability === UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
        this.set('status', 'Update already in progress');
      } else {
        this.set('status', `Update availability unknown (${info.updateAvailability})`);
      }
      console.log('UpdateInfo:', JSON.stringify(info));
    } catch (err) {
      this.set('status', `Error: ${err.message}`);
      console.error('checkUpdate error:', err);
    }
  }

  async startImmediateUpdate() {
    try {
      this.set('status', 'Starting immediate update...');
      await this.updater.startUpdate(UpdateType.IMMEDIATE);
      this.set('status', 'Immediate update accepted');
    } catch (err) {
      this.set('status', `Error: ${err.message}`);
      console.error('startImmediateUpdate error:', err);
    }
  }

  async startFlexibleUpdate() {
    try {
      this.set('status', 'Starting flexible update...');

      this.updater.registerInstallStateListener();
      this.updater.on(NativescriptInAppUpdate.INSTALL_STATE_EVENT, (args: any) => {
        const state = args.data;
        if (state.installStatus === InstallStatus.DOWNLOADING) {
          const pct = state.totalBytesToDownload > 0 ? Math.round((state.bytesDownloaded / state.totalBytesToDownload) * 100) : 0;
          this.set('status', `Downloading: ${pct}%`);
        } else if (state.installStatus === InstallStatus.DOWNLOADED) {
          this.set('status', 'Downloaded! Tap "Complete Update" to install.');
        } else if (state.installStatus === InstallStatus.INSTALLED) {
          this.set('status', 'Installed');
        } else if (state.installStatus === InstallStatus.FAILED) {
          this.set('status', `Download failed (error: ${state.installErrorCode})`);
        } else if (state.installStatus === InstallStatus.CANCELED) {
          this.set('status', 'Download cancelled');
        } else {
          this.set('status', `Install status: ${state.installStatus}`);
        }
      });

      await this.updater.startUpdate(UpdateType.FLEXIBLE);
      this.set('status', 'Flexible update accepted, downloading...');
    } catch (err) {
      this.set('status', `Error: ${err.message}`);
      console.error('startFlexibleUpdate error:', err);
    }
  }

  async completeUpdate() {
    try {
      this.set('status', 'Completing update (app will restart)...');
      await this.updater.completeUpdate();
    } catch (err) {
      this.set('status', `Error: ${err.message}`);
      console.error('completeUpdate error:', err);
    }
  }

  cleanup() {
    this.updater.dispose();
    this.set('status', 'Disposed');
  }
}
