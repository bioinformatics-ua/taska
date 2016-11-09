'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import RequestActions from '../../../actions/RequestActions.jsx';
import RequestStore from '../../../stores/RequestStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from '../../reusable/component.jsx'
import {TableComponentMixin} from '../../../mixins/component.jsx';

const RequestStatus = React.createClass({
  render: function(){
    const row = this.props.rowData;
  function translateStatus(type){
    switch(type){
      case 1:
        return <i className="fa fa-2x fa-exchange"></i>;
      case 2:
        return <i className="fa fa-2x fa-question-circle"></i>;
    }

  }
    return <center>
            {translateStatus(row.type)}
           </center>;
  }
});

const RequestLink = React.createClass({
  render: function(){
    const row = this.props.rowData;
    const object = {name: row.title, object: row.hash}
    return <small>
            <Link to="Request" params={object}>{row.title}</Link>

           </small>;
  }
});

const RequestUser = React.createClass({
  render: function(){
    const row = this.props.rowData;
    return <small>{row.processtaskuser.user_repr}</small>;
  }
});


const RequestDate = React.createClass({
  render: function(){
    return <small>{this.props.rowData.date}</small>
  }
});


export {RequestDate, RequestUser, RequestLink, RequestStatus}
