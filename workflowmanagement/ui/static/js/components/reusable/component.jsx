'use strict';

import Router from 'react-router';
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

const DjangoCSRFToken = React.createClass({

  render: function() {

    var csrfToken = Django.csrf_token();

    return React.DOM.input(
      {type:"hidden", name:"csrfmiddlewaretoken", value:csrfToken}
      );
  }
});

const Modal = React.createClass({
  render(){
    return <div className="modal modalback show">
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <button type="button" onClick={this.props.close} className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                          <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body">
                          {this.props.message}
                        </div>
                        <div className="modal-footer">
                          <button type="button" onClick={this.props.close} className="btn btn-default" data-dismiss="modal">Cancel</button>
                          <button type="button" onClick={this.props.success} className="btn btn-primary">Ok</button>
                        </div>
                      </div>
                    </div>
                  </div>;
  }
});

const Label = React.createClass({
            mixins: [Router.Navigation],
            contextTypes: {
                router: React.PropTypes.func.isRequired
            },
            displayName: route => {
                let params = route.context.router.getCurrentParams();
                let label = params.mode || 'Label';
                return params.mode[0].toUpperCase() + params.mode.slice(1);;
            },
            render(){
                return <span>a</span>;
            }
    });

export {Loading, Modal, DjangoCSRFToken, Label}
