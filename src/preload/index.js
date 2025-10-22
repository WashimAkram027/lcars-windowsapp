import { contextBridge } from 'electron';

/**
 * Expose a minimal, future-proof API surface to the renderer.
 * No filesystem/system logic yet—just placeholders.
 */
contextBridge.exposeInMainWorld('api', {
  fs: {
    // later: list directories, open paths, etc.
    placeholder: () => 'fs api placeholder'
  },
  system: {
    // later: about/system info
    placeholder: () => 'system api placeholder'
  },
  net: {
    // later: ping / status
    placeholder: () => 'net api placeholder'
  }
});
