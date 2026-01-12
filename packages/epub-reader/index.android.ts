import { EpubReaderCommon } from './common';

export class EpubReader extends EpubReaderCommon {
  get() {
    throw new Error('EpubReader: Android implementation is not available yet.');
  }

  /**
   * Opens an epub file using the default FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   */
  open(_filePath: string) {
    throw new Error('EpubReader: Android implementation is not available yet.');
  }

  /**
   * Opens an epub file with a custom FolioReader configuration.
   * @param filePath relative path inside the app bundle (e.g. `books/sample.epub`) or absolute path (e.g. `/path/to/downloaded/book.epub`)
   */
  openWithConfig(_filePath: string) {
    throw new Error('EpubReader: Android implementation is not available yet.');
  }
}
