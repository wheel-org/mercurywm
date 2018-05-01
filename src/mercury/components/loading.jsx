/* @flow */

import * as React from 'react';

const Loading = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <div>
      <p>Loading...</p>
    </div>
  </div>
);

module.exports = Loading;
