'use strict';
import React from 'react/addons';

import {SpecialWorkflowTable} from './specialworkflows.jsx';
import {ExternalUserTable} from './usergrid.jsx';
import UserStore from '../../stores/UserStore.jsx';

import {Authentication} from '../../mixins/component.jsx';

import {DetailHistoryTable} from '../reusable/history.jsx';

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
            message: "Write something there (Optional)",
            studyTemplate: undefined
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    getInitialState(){
        return this.__getState();
    },
    setMessage(){
        console.log("Define message!");
    },
    goToStudySetup(){
        console.log("Go to the study");
        console.log(this.state);
    },
    setStudyTemplate(e){
        this.setState({studyTemplate: e});
    },
    render: function () {
        let params = this.context.router.getCurrentQuery();

        return (<span>
          <div className="row flex-container">
              <div className="col-md-12 flex-container flex-row">
                Information about the questionaire TODO
                  <br/>
              </div>
          </div>

          <div className="row flex-container">
              <div className="col-md-6 flex-container flex-row">
                <ExternalUserTable hash={params.url}/>
              </div>
              <div className="col-md-6 flex-row">
                <div className="row">
                    <SpecialWorkflowTable user={this.state.user} setStudyTemplate={this.setStudyTemplate}/>
                </div>
                <br/>
                <div className="row">
                    <div className="col-md-12">
                    <textarea onChange={this.setMessage} rows="7"
                          className="form-control" defaultValue={this.state.message}/>
                        </div>
                </div>
                <br/>
                <div className="row">
                  <div className="col-md-8">

                  </div>
                  <div className="col-md-4">
                    <div className="btn-group" role="group">
                        <button type="button" onClick={this.goToStudySetup} className="btn btn-primary btn-default">
                                                <i style={{marginTop: '3px'}} className="pull-left fa fa-arrow-right"></i> Next Step</button>
                    </div>
                  </div>
              </div>
              </div>
          </div>
        </span>
        );
    }
});