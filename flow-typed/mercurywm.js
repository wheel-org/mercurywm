// @flow
// This contains type information for any global variables
// added through webpack.

// To add another constant, make sure to add the value in `src/constants.js`.
// If it is a static variable, add its value to this type. Otherwise, add the
// type of the variable instead (number, string, etc.)

declare var Constants: {|
  NAME: 'Mercury WM',
  VERSION: string,
  STATE_KEY: 'state',
  DIR_TYPE: 'dir',
  FILE_TYPE: 'file',
  EXE_TYPE: 'exe',
  MERCURYWM_URL: string,
  MERCURYWM_ORIGIN: string,
  MERCURYWM_CONTENT_URL: string,

  // KEY CODES
  KEY_LEFT_ARROW: 37,
  KEY_UP_ARROW: 38,
  KEY_RIGHT_ARROW: 39,
  KEY_DOWN_ARROW: 40,
  KEY_ENTER: 13,
  KEY_BACKSPACE: 8,
  KEY_DELETE: 46,
  KEY_TAB: 9,
  KEY_HOME: 36,
  KEY_END: 35,
|};

declare var PRODUCTION: boolean;

// Updeep
declare module 'updeep' {
  declare module.exports: <T>(update: Object, object: T) => T;
}

// lz-string string compression
declare module 'lz-string' {
  declare module.exports: {
    // TODO: technically, decompress can return null if given empty string
    compressToBase64(uncompressed: string): string,
    decompressFromBase64(compressed: string): string
  };
}
