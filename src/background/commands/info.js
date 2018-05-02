/* @flow */

import type { StoreState } from 'types';
import Constants from 'constants.js';

export default function info(state: StoreState, params: Array<string>) {
    this.output(Constants.NAME + ' ' + Constants.VERSION);
    this.output('Base Scripts URL: ' + Constants.MERCURYWM_URL);
    return state;
}
