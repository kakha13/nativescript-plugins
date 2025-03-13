# @kakha13/pinia-persistedstate

```javascript
npm install @kakha13/pinia-persistedstate
```

## Usage

### Basic Setup

First, install and set up the plugin in your NativeScript + Vue/Pinia application:

```typescript
// main.ts or app.ts
import { createApp } from 'nativescript-vue';
import { createPinia } from 'pinia';
import { createPersistedState } from '@kakha13/pinia-persistedstate';

const pinia = createPinia();
pinia.use(createPersistedState());

const app = createApp(App);
app.use(pinia);
```

### Advanced Configuration

Pass stores ids as array to only persist specific stores
```typescript
pinia.use(createPersistedState(['main', 'user']));
```

## License

Apache License Version 2.0
