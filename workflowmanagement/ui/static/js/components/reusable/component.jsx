'use strict';

import React from 'react';
import {RouteHandler, Link} from 'react-router';

const Loading = React.createClass({
  render: function(){
    return (
            <div className="loading">
              <center><i className="fa fa-3x fa-refresh fa-spin"></i></center>
            </div>
      );
  }
});

export {Loading}
