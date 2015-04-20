'use strict';

import React from 'react';

export default React.createClass({
    displayName: "Failed connection",
  render() {
    return (
      <div className="text-center">
        <h1>Failed connection</h1>
        <p>The connection does not seem to be working.</p>
        <p>It is possible there is no Internet connection, or the web page is currently offline.</p>
        <p>If you believe this page being shown is caused by a system error, please contact the administrator.</p>
      </div>
    );
  }
});
