import { EpubReaderCommon } from './common';
import { Application, File, knownFolders, path } from '@nativescript/core';

declare const com: any;
declare const android: any;

export class EpubReader extends EpubReaderCommon {
  private _folioReader: any;
  private _config: any;

  constructor() {
    super();
    this._folioReader = com.folioreader.FolioReader.get();
    this._config = null;
  }

  /**
   * Returns the app's version name.
   */
  get(): string | null {
    try {
      const PackageManager = android.content.pm.PackageManager;
      const pkg = Application.android.context.getPackageManager().getPackageInfo(Application.android.context.getPackageName(), PackageManager.GET_META_DATA);
      return pkg.versionName || null;
    } catch (error) {
      console.error('EpubReader: Error getting app version', error);
      return null;
    }
  }

  /**
   * Opens an epub file using the default FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   */
  open(filePath: string): void {
    this.openWithConfig(filePath);
  }

  /**
   * Opens an epub file with a custom FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   * @param config optional FolioReader Config instance to override defaults
   * @param shouldRemoveEpub ignored on Android (Android handles cleanup automatically)
   * @param animated ignored on Android (Android activity transitions handle this)
   */
  openWithConfig(filePath: string, config?: any, shouldRemoveEpub?: boolean, animated?: boolean): void {
    const resolvedPath = this._resolveFilePath(filePath);

    // Only set config if provided (matching working example pattern)
    if (config) {
      this._config = config;
    }

    // Set config only if it exists (like the working example)
    if (this._config) {
      this._folioReader.setConfig(this._config, true);
    }

    // Open the book - pass path directly as the working example does
    this._folioReader.openBook(resolvedPath);
  }

  private _resolveFilePath(filePath: string): string {
    // Check if the path is absolute (starts with /) or already a URI
    const isAbsolutePath = filePath.startsWith('/');
    const isUri = filePath.startsWith('file://');

    // If it's already a URI (file:// or file:///android_asset/), use it as is
    if (isUri) {
      return filePath;
    }

    let bookPath: string;
    if (isAbsolutePath) {
      // Use the absolute path directly
      bookPath = filePath;
    } else {
      // Treat as relative path from app bundle
      const appPath = knownFolders.currentApp().path;
      bookPath = path.join(appPath, filePath);
    }

    // Check if file exists
    if (!File.exists(bookPath)) {
      throw new Error(`EpubReader: file not found at ${bookPath}`);
    }

    // Return absolute path directly (matching working example - no URI conversion)
    // The working example passes paths directly without file:// prefix
    return bookPath;
  }
}
