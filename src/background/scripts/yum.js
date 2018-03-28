/* @flow */

import type { Script } from 'types';

export default function yum(
  script: Script,
  params: Array<string>,
  resolve: Function
) {
  if (params.length === 0) {
    script.output('spaghetti sauce');
  } else if (params.length === 2) {
    // Pull URL
    const path = script.currentPath + '/' + params[1];
    script.output('Downloading ' + params[0] + '...');

    fetch(params[0])
      .then(response => {
        if (!response.ok) throw response.status;
        return response.text();
      })
      .then(text => {
        script.output('Download success');
        script.output('Data written to file ' + path);
        script.writeFile(path, text);
      })
      .catch(error => {
        script.output('Download failed: status ' + error);
      })
      // $FlowFixMe: Promise.finally isn't implemented in flow
      .finally(() => resolve());

    return true;
  } else {
    script.output('Incorrect number of parameters');
  }
}
