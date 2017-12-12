'use strict';

import React from 'react';
import {RouteHandler, Link, Router} from 'react-router';

export default React.createClass({
    getDefaultProps(){
        return {
            buttonsDisabled: false
        }
    }
    __getState(){
        return {}
    },
    getInitialState(){
        return this.__getState();
    },
    openGithub(){
        window.location.assign("https://github.com/bioinformatics-ua/taska");
    },
    render(){
        return (<div>

            <div >
                <h3>What is TASKA?</h3>
                <p style={{"textAlign":"justify"}}>
                    Taska is a <b>workflow management system</b> where users can create workflow templates which can be reused by distinct groups and for different purposes.
                </p>
                <p>
                    This system was developed in the context of EMIF (http://www.emif.eu), an European project that aims to create a common technical and governance framework to facilitate the reuse of health data.
                </p>
                <h3>What can you do?</h3>
                <br />


            <div className="homeStepByStep row homePageSection">

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

                        <Link disabled={this.props.buttonsDisabled} to="WorkflowEdit" params={{object: 'add', mode: 'edit'}} className=" btn btn-sm btn-info home-button"><i
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

                                <Link disabled={this.props.buttonsDisabled} to="StudyTemplates" className=" btn btn-sm btn-info home-button"><i className="fa fa-play"></i> Run </Link>
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

                                <Link disabled={this.props.buttonsDisabled} to="MyTasks" className=" btn btn-sm btn-info home-button"><i className="fa fa-tasks"></i> Show </Link>
                            </center>
                            <br />
                        </div>

                    </div>
                </div>

            </div>
            </div>

            <div>
                <hr/>
                <div className="homePageSection">
                    <h3>Quick demo</h3>
                    <iframe src="https://www.youtube.com/embed/j9xmd_SYztw" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen
                    style={{ width: "100%", height: "480", border: "none"}}></iframe>
                    <br/>
                </div>

                <div ref="taskbar" className="homePageSection clearfix home-taskbar">
                    <div className="repositorySection">
                    <h3>You can contribute to this project now</h3>
                        <button className="btn btn-lg btn-info" onClick={this.openGithub}>
                            <i className="fa fa-github" />&ensp;Go to github
                        </button>
                    </div>
                </div>

                <div className="homePageSection">
                    <h3>Endorsements</h3>
                    <div class="row">
                        <p>
                            This work has received support from the EU/EFPIA Innovative Medicines Initiative Joint Undertaking (EMIF grant n. 115372).
                        </p>

                        <p>
                            We are also grateful to the many EMIF colleagues that helped shape the current version of this software.
                        </p>
                    </div>
                    <div class="row">
                        <p>Core team: </p>
                        <ul class="list-check">
                            <li>João Rafael Almeida<sup>1</sup></li>
                            <li>Ricardo Ribeiro<sup>1</sup></li>
                            <li>Luís Bastião Silva<sup>1</sup></li>
                            <li>José Luís Oliveira<sup>1</sup></li>
                        </ul>
                        <sup>1. University of Aveiro, Dept. Electronics, Telecommunications and Informatics (DETI / IEETA)</sup>

                    </div>

                    <div class="row">
                        <p>Partners: </p>
                        <ul class="list-check">
                            <li>Rosa Gini<sup>2</sup></li>
                            <li>Giuseppe Roberto<sup>2</sup></li>
                            <li>Peter Rijnbeek<sup>3</sup></li>
                        </ul>
                        <sup>2. Agenzia Regionale di Sanità della Toscana, Florence, Italy</sup><br/>
                        <sup>3. Erasmus MC, Rotterdam, Netherlands</sup>
                    </div>
                </div>
            </div>
        </div>);}
});
