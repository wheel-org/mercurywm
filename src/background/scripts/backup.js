/* @flow strict */

import LZString from 'lz-string';

import type { Script, StoreState } from 'types';

/*
Backups are stored in chrome.storage.sync, and are organized in storage as such:

- backupDate: time the backup was saved
- backupSize: number of blocks that the backup is split into
- block + "i": i'th block of the backup (0 indexed)
*/

function isError(script: Script, message: string): boolean {
  const error = chrome.runtime.lastError;
  if (error != null) {
    script.output(message);
    if (error.message != null) {
      script.output('Error: ' + error.message);
    }

    return true;
  }
  return false;
}

function compressState(state: StoreState): string[] {
  const comp = LZString.compressToBase64(JSON.stringify(state));

  const len = 2000;
  const size = Math.ceil(comp.length / len),
    blocks = new Array(size);

  for (let i = 0; i < size; i++) {
    blocks[i] = comp.substr(i * len, len);
  }

  return blocks;
}

function saveBackup(script: Script, resolve: Function): void {
  const blocks = compressState(script.getState());

  script.output('Saving backup to your Google account...');

  const backup = blocks.reduce(
    (obj, block, i) => {
      return {
        ...obj,
        ['block' + i]: block
      };
    },
    { backupSize: blocks.length, backupDate: Date.now() }
  );

  chrome.storage.sync.set(backup, () => {
    if (!isError(script, 'Backup failed!')) {
      script.output('Backup successful!');
    }

    resolve();
  });
}

function restoreBackup(script: Script, resolve: Function): void {
  chrome.storage.sync.get(['backupDate', 'backupSize'], data => {
    if (isError(script, 'Backup restore failed!')) {
      resolve();
      return;
    }

    const backupDate: number = data.backupDate;
    if (backupDate == null) {
      script.output("No backup saved");
      resolve();
      return;
    }

    const backupSize: number = data.backupSize;
    if (backupSize == null) {
      script.output("Missing backup data");
      resolve();
      return;
    }

    const keys = [...Array(backupSize).keys()].map(i => 'block' + i);
    chrome.storage.sync.get(keys, items => {
      if (isError(script, 'Backup restore failed!')) {
        resolve();
        return;
      }

      const data = keys.reduce((acc, key) => {
        return acc + items[key];
      }, '');
      const decomp = LZString.decompressFromBase64(data);

      try {
        const state = JSON.parse(decomp);
        script.updateStore(state);
      } catch (e) {
        script.output('Backup restore failed!');
        script.output('Error parsing backup');
      }

      resolve();
    });
  });
}

export default function backup(
  script: Script,
  params: Array<string>,
  resolve: Function
) {
  if (params.length === 0) {
    chrome.storage.sync.get('backupDate', data => {
      if (!isError(script, 'Backup list failed!')) {
        const date: number = data.backupDate;
        if (date == null) {
          script.output('No backup saved');
        } else {
          script.output('Last backup saved ' + new Date(date).toString());
        }
      }

      resolve();
    });
    return true;
  } else if (params.length === 1) {
    if (params[0] === 'save') {
      saveBackup(script, resolve);
      return true;
    } else if (params[0] === 'restore') {
      restoreBackup(script, resolve);
      return true;
    } else {
      script.output('Unknown parameter: ' + params[0]);
    }
  } else {
    script.output('Invalid number of parameters');
  }
}
