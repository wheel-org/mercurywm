/* @flow */

import type { Script } from 'types';

export default function async(
  script: Script,
  params: Array<string>,
  resolve: Function
) {
  script.output('boo');
  setTimeout(() => {
    script.output('woah');
  }, 1000);
  setTimeout(() => {
    resolve('done');
  }, 2000);
  return true;
}
