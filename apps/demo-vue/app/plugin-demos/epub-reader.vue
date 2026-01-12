<template>
  <Page class="page">
    <ActionBar class="action-bar">
      <Label text="EPUB Reader" class="action-bar-title" />
    </ActionBar>

    <GridLayout rows="auto, *" class="page-wrapper">
      <StackLayout row="0" class="hero" horizontalAlignment="center">
        <Label text="EPUB Reader 📚" class="hero-title" textWrap="true" />
      </StackLayout>

      <StackLayout
        row="1"
        class="card-list"
        verticalAlignment="top"
        horizontalAlignment="stretch"
      >
        <StackLayout>
          <Label text="Open EPUB from app bundle or downloaded files" class="card-subtitle" textWrap="true" />
        </StackLayout>

        <StackLayout class="card">
          <Label text="Open from App Bundle" class="card-title" />
          <Label
            text="Load an EPUB file from the app's bundle directory."
            class="card-subtitle"
            textWrap="true"
          />
          <Button text="Open from app bundle" class="btn btn-primary card-button" @tap="openEpubFromBundle" />
        </StackLayout>

        <StackLayout class="card">
          <Label text="Download and Open" class="card-title" />
          <Label
            text="Download an EPUB file from the internet and open it."
            class="card-subtitle"
            textWrap="true"
          />
          <Button text="Download and open" class="btn btn-primary card-button" @tap="downloadAndOpenEpub" />
        </StackLayout>
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