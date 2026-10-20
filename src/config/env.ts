/**
 * Mobile Application Environment Configuration
 * Configured for Production Live Translation Server
 */

export function normalizeWsUrl(rawUrl: string): string {
  if (!rawUrl) return 'wss://voice.aakashpatti.in';
  let url = rawUrl.trim();

  // Convert HTTP/HTTPS schemes to WS/WSS
  if (url.startsWith('https://')) {
    url = 'wss://' + url.slice(8);
  } else if (url.startsWith('http://')) {
    url = 'ws://' + url.slice(7);
  } else if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    url = 'wss://' + url;
  }

  // Remove trailing slashes
  return url.replace(/\/+$/, '');
}

export const ENV = {
  /**
   * Production WebSocket Server Base URL
   */
  DEFAULT_SERVER_URL: 'wss://voice.aakashpatti.in',

  DEFAULT_SOURCE_LANGUAGE: 'en',
  DEFAULT_TARGET_LANGUAGE: 'hi',
};
