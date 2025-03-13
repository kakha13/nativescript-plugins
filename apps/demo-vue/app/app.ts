import { createApp } from 'nativescript-vue';
import Home from './components/Home.vue';

import { createPinia } from 'pinia';
import { createPersistedState } from '@kakha13/pinia-persistedstate';

const pinia = createPinia();

pinia.use(createPersistedState());

const app = createApp(Home);

app.use(pinia);

app.start();
