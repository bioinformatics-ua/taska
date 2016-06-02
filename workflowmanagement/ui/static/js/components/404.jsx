'use strict';

import React from 'react';

export default React.createClass({
    displayName: "Page not found",
  render() {
    return (
      <div className="text-center">
        <h1>404 - Page not found</h1>
        <p>The page does not seem exist, if you think this is a mistake, please contact the administrator.</p>
      </div>
    );
  }
});
