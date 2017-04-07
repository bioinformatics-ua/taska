'use strict';
import React from 'react/addons';

import {SpecialWorkflowTable} from './specialworkflows.jsx';
import {ExternalUserTable} from './usergrid.jsx';
import UserStore from '../../stores/UserStore.jsx';
import StateActions from '../../actions/StateActions.jsx';

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
            message: "",
            users: [],
            studyTemplate: ""
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    componentWillMount(){
    },
    getInitialState(){
        return this.__getState();
    },
    setMessage(e){
        this.setState({message: e.target.value});
    },
    goToStudySetup(){
        //Do validations
        if (this.state.studyTemplate == "") {
            StateActions.alert({
                'title': "No study template selected",
                'message': "Select a study template before heading to next step."
            });
        }
        else if (this.state.users.length == 0) {
            StateActions.alert({
                'title': "No users selected",
                'message': "Add some users to participate in the study before heading to next step."
            });
        }
        else {
            this.context.router.transitionTo('WorkflowEdit', {object: this.state.studyTemplate, mode:'run'});
        }
    },
    setStudyTemplate(e){
        this.setState({studyTemplate: e});
    },
    setUsers(list){
        this.setState({users: []});
        this.setState({users: list});
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
                <ExternalUserTable hash={params.url} setUsers={this.setUsers}/>
              </div>
              <div className="col-md-6 flex-row">
                <div className="row">
                    <SpecialWorkflowTable user={this.state.user} setStudyTemplate={this.setStudyTemplate}/>
                </div>
                <br/>
                <div className="row">
                    <div className="col-md-12">
                    <textarea onChange={this.setMessage} rows="7"
                              className="form-control" value={this.state.message}
                              placeholder="Write something there (Optional)"/>
                        </div>
                </div>
                <br/>
                <div className="row">
                  <div className="col-md-8">

                  </div>
                  <div className="col-md-4">
                    <div className="btn-group" role="group">
                        <button type="button" onClick={this.goToStudySetup} className="btn btn-primary btn-default">
                                                <i style={{marginTop: '3px'}}
                                                   className="pull-left fa fa-arrow-right"></i> Next Step</button>
                    </div>
                  </div>
              </div>
              </div>
          </div>
        </span>
        );
    }
});