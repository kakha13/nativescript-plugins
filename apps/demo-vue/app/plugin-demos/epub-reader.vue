<template>
  <Page>
    <ActionBar>
      <Label text="EPUB Reader"/>
    </ActionBar>

    <GridLayout rows="auto, *" class="page">
      <StackLayout row="0" class="info">
        <Label text="Open EPUB from app bundle or downloaded files" textWrap="true" />
        <Label text="iOS only. Android coming soon." textWrap="true" class="note" />
      </StackLayout>

      <StackLayout row="1" class="actions" verticalAlignment="middle" spacing="12">
        <Button class="btn btn-primary card-button" text="Open from app bundle" @tap="openEpubFromBundle" />
        <Button class="btn btn-primary card-button" text="Download and open" @tap="downloadAndOpenEpub" />
      </StackLayout>
    </GridLayout>
  </Page>
</template>

<script setup lang="ts">
import { EpubReader } from '@kakha13/epub-reader';
import { alert, File, Http, knownFolders, path } from '@nativescript/core';

const reader = new EpubReader();
const samplePath = 'books/sample.epub';

const openEpubFromBundle = async () => {
  const appPath = knownFolders.currentApp().path;
  const bookPath = path.join(appPath, samplePath);
  console.log('bookPath', bookPath);
  console.log('appPath', appPath);

  if (!File.exists(bookPath)) {
    await alert({
      title: 'Missing EPUB',
      message: `Add an epub file at app/${samplePath} to launch the reader.`,
      okButtonText: 'OK',
    });
    return;
  }

  try {
    // Using relative path (from app bundle)
    reader.open(samplePath);
  } catch (error) {
    console.error(error);
    await alert({
      title: 'Unable to open EPUB',
      message: (error as Error)?.message ?? `${error}`,
      okButtonText: 'OK',
    });
  }
};

const downloadAndOpenEpub = async () => {
 
  let tempFolder = knownFolders.temp().getFolder('books.temp/');
  let url = 'https://github.com/IDPF/epub3-samples/releases/download/20230704/epub30-spec.epub';
  let name = url.split('/').pop();

  Http
    .getFile(url, `${tempFolder.path}/${name}`)
    .then(file => {
      reader.open(file.path);
    }).catch(error => {
      console.error(error);
    });

};
</script>

<style scoped lang="scss">

  .page {
    padding: 16;
  }

  .info {
    spacing: 4;
  }

  .note {
    color: #666;
    font-size: 14;
  }

  .actions {
    horizontal-align: center;
  }
</style>
