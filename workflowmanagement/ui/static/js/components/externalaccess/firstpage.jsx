'use strict';
import React from 'react/addons';

import {SpecialWorkflowTable} from './specialworkflows.jsx';
import {ExternalUserTable} from './usergrid.jsx';
import UserStore from '../../stores/UserStore.jsx';

import {Authentication} from '../../mixins/component.jsx';

export default React.createClass({
    displayName: "Studies",
    mixins: [Authentication],
    render: function () {
        return <LoggedInHome />;
    }
});

const LoggedInHome = React.createClass({
    __getState(){
        return {
            user: UserStore.getUser(),
            message: "Write something there (Optional)"
        }
    },
    getInitialState(){
        return this.__getState();
    },
    setMessage(){

    },
    goToStudySetup(){

    },
    render: function () {
        return (<span>
            <div className="row flex-container">
              <div className="col-md-6 flex-container flex-row">
                <ExternalUserTable />
              </div>
              <div className="col-md-6 flex-container flex-row">
                <SpecialWorkflowTable user={this.state.user}/>
              </div>
          </div>
          <div className="row flex-container">
              <div className="col-md-12 flex-container flex-row">
                <textarea onChange={this.setMessage} rows="7"
                          className="form-control" defaultValue={this.state.message}/>
              </div>
          </div>
          <br/>
          <div className="row">
              <div className="col-md-10">

              </div>
              <div className="col-md-2">
                <div className="btn-group" role="group">
                    <button type="button" onClick={this.goToStudySetup} className="btn btn-primary btn-default">
                                            <i style={{marginTop: '3px'}} className="pull-left fa fa-arrow-right"></i> Next Step</button>
                </div>
              </div>
          </div>
          <br/>
        </span>
        );
    }
});