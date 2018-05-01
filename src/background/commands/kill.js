/* @flow */

import type { StoreState } from 'types';

export default function kill(state: StoreState, params: Array<string>) {
    const silent = params.includes('-s');
    const newParams = params.filter(p => p !== '-s');
    for (let i = 0; i < newParams.length; i++) {
        const index = parseInt(newParams[i]);
        if (index < 0 || index >= this.workspace.windows.length) {
            this.output('Invalid parameter');
            return state;
        }
        const terminal = this.workspace.windows[index].terminal;
        if (terminal.running || terminal.isExtension) {
            terminal.running = false;
            terminal.isExtension = false;
            if (!silent) {
                this.output('Extension killed');
            }
        } else {
            this.output('Nothing running in window');
        }
    }
    return state;
}
