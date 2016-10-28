'use strict';

import React from 'react';

export default React.createClass({
    displayName: "Page not found",
  render() {
    return (
      <div className="text-center">
        <h1>500 - Service Error</h1>
        <p>Oops, we appear to be having problems. Please contact the administrator.</p>
      </div>
    );
  }
});
