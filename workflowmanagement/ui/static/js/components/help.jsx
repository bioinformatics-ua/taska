'use strict';

import React from 'react';

import {Authentication} from '../mixins/component.jsx';

export default React.createClass({
    displayName: "Help",
    mixins: [Authentication],
    render() {
        return (
            <div>
                <div className=" row">
                    <h1>Getting Started</h1>
                    <p>
                        TASKA is an extensible task manager with structured workflow-oriented features. This page
                        contains
                        a brief explanation of the main concepts of the system and how they are interconnected.
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
                                <img src="static/images/workflow.png"/>
                            </div>

                            <div className="home-text-sbs">
                                <p>A <b>study template</b> is a composition of inter-related tasks, structured in a
                                    sequenced way to accomplish specific goals.</p>
                                <p>The purpose of a study template is to define a schema that can be reused to create
                                    studies (workflows).</p>
                            </div>
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
                                        <p>A <b>study</b> is a running instance of one study template, in which users
                                            are assigned to tasks with specifc deadlines.</p>
                                        <p>Each user that runs a study will assume the study manager role.</p>
                                    </div>
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
                                        <img src="static/images/tasks.png"/>
                                    </div>

                                    <div className="home-text-sbs">
                                        <p>The <b>task</b> is the basic unit of the system. Everything is a composition
                                            of at least one or more tasks.</p>
                                        <p>Each user can find in this area, all the assigned tasks (pending and
                                            completed).</p>
                                    </div>

                                </center>
                                <br />
                            </div>

                        </div>
                    </div>
                </div>

                <div className=" row">

                    <h3>Study template</h3>
                    <p>A study template is a workflow composed by tasks, in a structured and orderly way, that allows
                        the user to have a better perception of an assignment that has to be completed.</p>
                    <p>The main aim of a study template is to provide a base to create studies and that can be reused in
                        other studies.</p>
                    <p>There are two types of study templates: public study templates, that all registered users can use
                        for their own studies, and private study templates, that only their creator can use for running
                        studies.</p>

                    <h3>Study</h3>
                    <p>A study is a running instance of a study template. To run a study, the manager needs to assign to
                        each task an user or a group of users that will have to complete the given task or tasks..</p>
                    <p>The main concept behind separating a study template from an instance is to easily allow
                        repeatability of tasks across time and participants.</p>

                    <h3>Task</h3>
                    <p>The task is the basic unit on TASKA, everything is a composition of or related to a Task. In
                        other words, tasks are unitary blocks used to construct workflow templates.</p>
                    <p>A Task is characterised by an input and an output. Tasks can be of two types: Simple Tasks or
                        Form Tasks.</p>

                    <h3>Form</h3>
                    <p>Forms are questionnaires with several types of questions such as: select dropdowns, multiple
                        choice or checkboxes.</p>
                    <p>Forms are created to be used on form tasks, so that study overseers can collect information in an
                        uniformed template.</p>
                    <p>Forms are separated from the tasks so as to allow the reusability of the same form in different
                        tasks.</p>

                    <h3>Request</h3>
                    <p>A request is a communication vehicle that allows the user who is completing a task to interact
                        with a study overseer. </p>
                    <p>Asking for reassignment, clarification or any other type of feedback can be made through
                        requests.</p>

                    <h3>Usage Profiles</h3>

                    <p>This system has two types of user roles: </p>
                    <ul>
                        <li>Study overseer - supervises study flows, analyses outcomes and performs all related study
                            management tasks
                        </li>
                        <li>Study responder - in charge of completing a task</li>
                    </ul>
                </div>

                <hr />

            </div>
        );
      }
});
