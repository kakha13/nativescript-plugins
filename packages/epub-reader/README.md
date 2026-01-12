# @kakha13/epub-reader

iOS-only NativeScript plugin wrapping FolioReaderKit for reading EPUB files.

```bash
npm install @kakha13/epub-reader
```

## Screenshots iOS

<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="../../tools/assets/screenshots/epub-reader/Simulator Screenshot - iPhone 17 Pro Max - 2026-01-12 at 16.50.27.png" alt="EPUB Reader Demo" width="300" />
  <img src="../../tools/assets/screenshots/epub-reader/Simulator Screenshot - iPhone 17 Pro Max - 2026-01-12 at 16.50.36.png" alt="EPUB Reader in Action" width="300" />
</div>

## Usage

You can open EPUB files from either the app bundle (relative path) or from anywhere on the device (absolute path):

### Opening from App Bundle

```ts
import { EpubReader } from '@kakha13/epub-reader';

const reader = new EpubReader();

// Open from app bundle (relative path)
reader.open('books/sample.epub');
```

### Downloading and Opening EPUB Files

```ts
import { EpubReader } from '@kakha13/epub-reader';
import { Http, knownFolders } from '@nativescript/core';

const reader = new EpubReader();

// Download and store EPUB file
const tempFolder = knownFolders.temp().getFolder('books.temp/');
const url = 'https://example.com/book.epub';
const fileName = url.split('/').pop();

Http.getFile(url, `${tempFolder.path}/${fileName}`)
  .then(file => {
    // Open using absolute path
    reader.open(file.path);
  })
  .catch(error => {
    console.error('Download failed:', error);
  });
```

## Notes

- Currently supports **iOS only**; Android implementation will be added later.
- The plugin declares a CocoaPods dependency on `FolioReaderKit` from `https://github.com/kakha13/FolioReaderKitEpub.git` (branch `master`); it is bundled automatically via the plugin Podfile. If you maintain a custom App_Resources Podfile, ensure this pod remains included.
- Methods throw if the epub file cannot be found or there is no active page to present from, to make integration failures visible.

## License

Apache License Version 2.0
