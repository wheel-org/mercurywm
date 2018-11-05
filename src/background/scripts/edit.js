/* @flow strict */

import type { Script } from 'types';

export default function edit(
  script: Script,
  params: Array<string>,
  resolve: Function
) {
  if (params.length === 1) {
    const path = script.currentPath + '/' + params[0];
    const file = script.getFile(path);
    const text = file ? file.data : '';

    const result = window.prompt('Editing' + path + ':', text);
    if (result !== null) {
      script.writeFile(path, result);
    }
  } else {
    script.output('Incorrect number of parameters');
  }
}
