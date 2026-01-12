import { EpubReaderCommon } from './common';
import { Frame, knownFolders, path } from '@nativescript/core';

declare const FolioReaderConfig: { new (): any };
declare const FolioReader: { new (): any };
declare const NSBundle: any;
declare const NSFileManager: any;

export class EpubReader extends EpubReaderCommon {
  private _config: any;
  private _folioReader: any;

  constructor() {
    super();
    this._config = new FolioReaderConfig();
    this._folioReader = new FolioReader();
  }

  /**
   * Returns the app's short version string.
   */
  get() {
    return NSBundle.mainBundle.objectForInfoDictionaryKey('CFBundleShortVersionString') as string | null;
  }

  /**
   * Opens an epub file using the default FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   */
  open(filePath: string) {
    const { bookPath, parentVC } = this._resolveLaunchContext(filePath);
    this._folioReader.openReaderWithPathAndParentViewController(bookPath, parentVC);
  }

  /**
   * Opens an epub file with a custom FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   * @param config   optional FolioReaderConfig instance to override defaults
   * @param shouldRemoveEpub whether FolioReader should clean up the epub after closing
   * @param animated whether the presentation should be animated
   */
  openWithConfig(filePath: string, config?: any, shouldRemoveEpub = false, animated = true) {
    const { bookPath, parentVC } = this._resolveLaunchContext(filePath);
    const resolvedConfig = config ?? this._config;

    this._folioReader.presentReaderWithParentViewControllerWithEpubPathAndConfigShouldRemoveEpubAnimated(parentVC, bookPath, resolvedConfig, shouldRemoveEpub, animated);
  }

  private _resolveLaunchContext(filePath: string) {
    // Check if the path is absolute (starts with /)
    const isAbsolutePath = filePath.startsWith('/');
    let bookPath: string;

    if (isAbsolutePath) {
      // Use the absolute path directly
      bookPath = filePath;
    } else {
      // Treat as relative path from app bundle
      const appPath = knownFolders.currentApp().path;
      bookPath = path.join(appPath, filePath);
    }

    if (!NSFileManager.defaultManager.fileExistsAtPath(bookPath)) {
      throw new Error(`EpubReader: file not found at ${bookPath}`);
    }

    const parentVC = Frame.topmost()?.currentPage?.ios;
    if (!parentVC) {
      throw new Error('EpubReader: unable to find a parent view controller to present the reader.');
    }

    return { bookPath, parentVC };
  }
}
