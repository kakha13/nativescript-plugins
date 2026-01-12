import { EpubReaderCommon } from './common';

export declare class EpubReader extends EpubReaderCommon {
  constructor();
  get(): string | null;
  /**
   * Opens an epub file using the default FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   */
  open(filePath: string): void;
  /**
   * Opens an epub file with a custom FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   * @param config   optional FolioReaderConfig instance to override defaults
   * @param shouldRemoveEpub whether FolioReader should clean up the epub after closing
   * @param animated whether the presentation should be animated
   */
  openWithConfig(filePath: string, config?: any, shouldRemoveEpub?: boolean, animated?: boolean): void;
}
