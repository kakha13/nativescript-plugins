# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Nx monorepo for NativeScript plugins published under the `@kakha13` npm scope. Built with `@nativescript/plugin-tools`.

## Common Commands

```bash
# Install dependencies
npm install

# Interactive command menu (build, run demos, focus, etc.)
npm start

# Build a single plugin
nx run epub-reader:build.all
nx run pinia-persistedstate:build.all

# Build all plugins
nx run-many --target=build.all --all

# Lint a plugin
nx run epub-reader:lint

# Run demo apps
nx run demo:ios
nx run demo:android
nx run demo-angular:ios
nx run demo-vue:android

# Focus on a single plugin (filters VS Code explorer to relevant files)
nx run epub-reader:focus
nx g @nativescript/plugin-tools:focus-packages   # reset focus

# Add a new plugin package
npm run add

# Sync plugin changes into demo apps
npm run sync-packages-with-demos

# Format
nx format:write
```

Build output goes to `dist/packages/<name>`.

## Architecture

```
packages/           # Plugin source (each published as @kakha13/<name>)
apps/               # Demo apps: demo (vanilla), demo-angular, demo-vue
tools/
  demo/             # Shared demo code, aliased as @demo/shared
  scripts/          # build-finish.ts (post-build: copies assets, cleans package.json)
  assets/           # Shared App_Resources across demos
```

### Plugin Structure

Each plugin in `packages/<name>/` follows the NativeScript platform-split pattern:

- `common.ts` — shared base class extending `Observable`
- `index.ios.ts` — iOS implementation
- `index.android.ts` — Android implementation
- `index.d.ts` — public TypeScript API (this is the build entry point in project.json)
- `platforms/ios/Podfile` — CocoaPods dependencies
- `platforms/android/include.gradle` — Gradle dependencies

The `@nx/js:tsc` executor compiles TypeScript; `build.all` then runs `build-finish.ts` to copy native platform files and README into dist.

### Path Aliases (tsconfig.base.json)

- `@kakha13/*` → `packages/*`
- `@demo/shared` → `tools/demo/index.ts`

### Current Plugins

- **epub-reader** — EPUB file reader (iOS: FolioReaderKit, Android: FolioReader-Android)
- **pinia-persistedstate** — Pinia state persistence via NativeScript ApplicationSettings
- **nativescript-flitt** — Flitt integration

## Code Style

- Prettier: single quotes, 2-space indent, print width 800
- ESLint with `@nx/enforce-module-boundaries`
- Pre-commit hook (husky + lint-staged) auto-formats staged files

## NativeScript Framework Reference

See `NATIVESCRIPT.md` for comprehensive NativeScript guidance including:

### Core Imports

Always import from `@nativescript/core`:

```typescript
import {
  Application, Observable, Frame, Page, Color, Utils,
  Device, Screen, isAndroid, isIOS, File, Folder,
  knownFolders, Http, ImageSource, ObservableArray,
} from '@nativescript/core'
```

### Platform Conditionals

```typescript
import { isAndroid, isIOS, isVisionOS } from '@nativescript/core'

// Runtime checks
if (isAndroid) { /* ... */ }
if (isIOS) { /* ... */ }

// Build-time macros (tree-shaken for other platforms)
if (__ANDROID__) { /* ... */ }
if (__IOS__) { /* ... */ }
if (__APPLE__) { /* iOS + visionOS */ }
if (__DEV__) { /* dev only */ }
```

### Platform-Specific Files

Use platform suffixes for separate implementations:
- `my-component.android.ts` — Android only
- `my-component.ios.ts` — iOS only

### Key Best Practices

1. **View bindings** — use direct property binding (`{{ myText }}`), not method calls (`{{ getMyText() }}`)
2. **ListView** — use `itemTemplateSelector` for conditional row layouts, never `v-if`/`ngIf` inside items
3. **Visibility** — prefer `hidden`/`visibility: 'collapse'` over `v-if`/`ngIf` during scroll
4. **iOS delegates** — always retain delegate references to prevent GC issues
5. **Timers** — always `clearInterval`/`clearTimeout` in cleanup lifecycle
6. **Layout nesting** — minimize depth; prefer `GridLayout` for complex layouts

### Extending Native Classes

Use `@NativeClass()` decorator. Android constructors must `return global.__native(this)`. iOS classes use `static ObjCProtocols` for protocol conformance.

### Custom View Elements

Must implement `createNativeView()` (required), optionally `initNativeView()` and `disposeNativeView()`. Use `Property` class for bindable properties with `register()`.

### Framework Registration

- **Angular**: `registerElement('Name', () => Class)` from `@nativescript/angular`
- **Vue**: `registerElement('Name', () => Class)` from `nativescript-vue`
- **Svelte**: `registerNativeViewElement('name', () => Class)` from `@nativescript-community/svelte-native/dom`
- **React**: `registerElement('name', () => Class)` from `react-nativescript`
- **Solid**: `registerElement('name', Class)` from `dominative`

### NativeScript CLI

```bash
ns run android          # Run on Android
ns run ios              # Run on iOS
ns debug android        # Debug Android
ns debug ios --no-hmr   # Debug iOS without HMR
ns build android --release
ns clean                # Clean (run after App_Resources changes)
ns native add swift MyClass
ns native add kotlin com.example.MyClass
```
