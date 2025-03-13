import { defineStore, acceptHMRUpdate } from 'pinia';

export const useMainStore = defineStore('main', {
  persist: true,
  state: () => ({
    saved: false,
  }),

  getters: {
    isSaved: (state) => state.saved,
  },

  actions: {
    setSave() {
      this.saved = 'From persiststate';
    },
  },
});

// @ts-ignore
if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useUtilsStore, import.meta.hot));
}
