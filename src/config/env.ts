/**
 * Single Central Configuration for the Mobile Application
 * Update your backend base URL in one place here.
 */
export const ENV = {
  /**
   * Primary WebSocket Server Base URL
   * - 'ws://localhost:5000'    : Works with USB / Wi-Fi ADB reverse (`adb reverse tcp:5000 tcp:5000`)
   * - 'ws://192.168.0.152:5000': Direct Wi-Fi connection without ADB
   * - 'ws://10.0.2.2:5000'     : Android QEMU Emulator
   */
  DEFAULT_SERVER_URL: 'ws://localhost:5000',

  // Fallback network options for quick selection
  SERVER_PRESETS: {
    LOCALHOST: 'ws://localhost:5000',
    WIFI: 'ws://192.168.0.152:5000',
    EMULATOR: 'ws://10.0.2.2:5000',
  },

  DEFAULT_SOURCE_LANGUAGE: 'en',
  DEFAULT_TARGET_LANGUAGE: 'hi',
};
