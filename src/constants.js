const packageData = require('../package.json');

const MERCURY_BASE_URL = 'https://wheel-org.github.io/';

/* Constants */
const Constants = {
    NAME: 'Mercury WM',
    VERSION: packageData.version,
    STATE_KEY: 'state',
    DIR_TYPE: 'dir',
    FILE_TYPE: 'file',
    EXE_TYPE: 'exe',
    MERCURYWM_URL: MERCURY_BASE_URL + 'mercurywm-scripts/',
    MERCURYWM_ORIGIN: MERCURY_BASE_URL,
    MERCURYWM_CONTENT_URL: MERCURY_BASE_URL + 'mercurywm-scripts/extensions/',

    // KEY CODES
    KEY_LEFT_ARROW: 37,
    KEY_UP_ARROW: 38,
    KEY_RIGHT_ARROW: 39,
    KEY_DOWN_ARROW: 40,
    KEY_ENTER: 13,
    KEY_BACKSPACE: 8,
    KEY_DELETE: 46,
    KEY_TAB: 9
};

module.exports = Constants;