import { createPersistedState as createPersistedStateCommon } from './common';

export function createPersistedState(persist: string[] = []) {
  return createPersistedStateCommon(persist);
}
