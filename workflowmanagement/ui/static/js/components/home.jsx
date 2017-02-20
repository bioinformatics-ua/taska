'use strict';

import React from 'react/addons';

import UserStore from '../stores/UserStore.jsx';

import {Authentication} from '../mixins/component.jsx';
import {RouteHandler, Link, Router} from 'react-router';


/*
export default React.createClass({
  displayName: "",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome redirect={true}/>;
  }
});*/

const HomeWithRedirect = React.createClass({
  displayName: "",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome redirect={true}/>;
  }
});

const Home = React.createClass({
  displayName: "",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome />;
  }
});


const LoggedInHome = React.createClass({
  __getState(){
    return {
        user: UserStore.getUser()
    }
  },
  getInitialState(){
    return this.__getState();
  },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
  render: function(){
     if(this.state.user.have_tasks && this.props.redirect)
     {
         this.context.router.replaceWith('MyTasks');
         return <span></span>;
     }
    return (
          <div>

            <div className=" row">
                <h3>What is TASKA?</h3>
                <p style={{"text-align":"justify"}}>
                    Taska is a <b>workflow management system</b> where users can create workflow templates which can be reused by distinct groups and for different purposes.
                </p>
                <h3>What can you do?</h3>
                <br />
            </div>

            <div className="home-row-sbs row">

                <div ref="taskbar" className="clearfix home-taskbar col-md-3 table-col">
                  <center>
                    <div className="home-titles-sbs">
                        <h3>Create a study template</h3>
                    </div>

                    <div className="home-img">
                        <img src="static/images/workflow.png" />
                    </div>

                    <div className="home-text-sbs">
                        <p>A <b>study template</b> is a composition of inter-related tasks, structured in a sequenced way to accomplish specific goals.</p>
                        <p>The purpose of a study template is to define a schema that can be reused to create studies (workflows).</p>
                    </div>

                    <Link to="WorkflowEdit" params={{object: 'add', mode: 'edit'}} className=" btn btn-sm btn-info home-button"><i
                        className="fa fa-plus"></i> Create </Link>
                  </center>
                  <br />
                </div>

                <div className="col-md-9">
                  <div className="home-row-sbs row">
                    <div className="col-md-2">
                        <span className="home-helper"></span>
                        <img src="static/images/arrow.jpeg" className="home-arrow"/>
                    </div>

                    <div ref="taskbar" className="clearfix home-taskbar col-md-4 table-col">
                      <center>
                          <div className="home-titles-sbs">
                              <h3>Run a study</h3>
                          </div>

                        <div className="home-img">
                            <img src="static/images/runStudy.png"/>
                        </div>

                        <div className="home-text-sbs">
                            <p>A <b>study</b> is a running instance of one study template, in which users are assigned to tasks with specifc deadlines.</p>
                            <p>Each user that runs a study will assume the study manager role.</p>
                        </div>

                        <Link to="StudyTemplates" className=" btn btn-sm btn-info home-button"><i className="fa fa-play"></i> Run </Link>
                      </center>
                      <br />
                    </div>

                    <div className="col-md-2">
                        <span className="home-helper"></span>
                        <img src="static/images/arrow.jpeg" className="home-arrow"/>
                    </div>

                    <div ref="taskbar" className="clearfix home-taskbar col-md-4 table-col">
                      <center>
                          <div className="home-titles-sbs">
                                <h3>Complete tasks</h3>
                          </div>

                        <div className="home-img">
                            <img src="static/images/tasks.png" />
                        </div>

                        <div className="home-text-sbs">
                            <p>The <b>task</b> is the basic unit of the system. Everything is a composition of at least one or more tasks.</p>
                            <p>Each user can find in this area, all the assigned tasks (pending and completed).</p>
                        </div>

                        <Link to="MyTasks" className=" btn btn-sm btn-info home-button"><i className="fa fa-tasks"></i> Show </Link>
                      </center>
                      <br />
                    </div>

                </div>
              </div>
            </div>

          </div>);
  }
})

export default {Home, HomeWithRedirect};