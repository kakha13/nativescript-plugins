import { ApplicationSettings } from '@nativescript/core';

export function createPersistedState(persist: string[] = []) {
  return ({ store }) => {
    const storageKey = `${store.$id}`;

    // Only proceed if persist array is empty or includes this store's ID
    const shouldPersistStore = persist.length === 0 || persist.includes(store.$id);

    if (!shouldPersistStore) {
      return; // Skip persistence for this store
    }

    // Restore state from storage
    const fromStorage = ApplicationSettings.getString(storageKey);
    if (fromStorage) {
      try {
        store.$patch(JSON.parse(fromStorage));
      } catch (error) {
        console.error(`Failed to parse stored state for ${storageKey}:`, error);
      }
    }

    // Subscribe to changes and update storage
    store.$subscribe((_mutation, state) => {
      try {
        ApplicationSettings.setString(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error(`Failed to persist state for ${storageKey}:`, error);
      }
    });
  };
}
