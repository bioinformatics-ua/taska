'use strict';

import Reflux from 'reflux';

import React from 'react';
import Router from 'react-router';
import {Link} from 'react-router';

import {Authentication} from '../mixins/component.jsx';

import {Modal, PermissionsBar} from './reusable/component.jsx';

import WorkflowActions from '../actions/WorkflowActions.jsx';
import StateActions from '../actions/StateActions.jsx';

import WorkflowStore from '../stores/WorkflowStore.jsx';

import UserStore from '../stores/UserStore.jsx';
import StateStore from '../stores/StateStore.jsx';

import {StateMachineComponent} from '../react-statemachine/component.jsx';

import {StateMachine, SimpleState} from '../react-statemachine/classes.jsx';

import {SimpleTask, SimpleTaskRun} from './reusable/states/SimpleTask.jsx';

import {FormTask, FormTaskRun} from './reusable/states/FormTask.jsx';

const RunLabel = React.createClass({
    render(){
        return <span>

                <table className="process-label">
                    <tr>
                        <td><div className="circle circle-sm circle-canceled"></div></td>
                        <td><small>&nbsp;Waiting Configuration&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-default"></div></td>
                        <td><small>&nbsp;Ready to Run&nbsp;&nbsp;</small></td>
                    </tr>
                </table>
                </span>
    }
});

export default React.createClass({
    mixins: [   Router.Navigation,
                Authentication,
                Reflux.listenTo(WorkflowStore, 'update')],
    helpMapBlueprint: {
        view: {
        },
        edit: {
            detail: ': Drag and drop tasks from buttons below, and put them on the "plus" areas on the right. Another way to add a task to your study template, is to click in the "plus” areas on the right and add the tasks that you want.',
            global: 'You can drag-and-drop existing tasks to move them between levels. Only drag the tasks to the "plus" area of other level.'
        },
        run: {
            detail: 'Please fulfill assignee and deadlines before running the study template as a study.',
            global: 'Click tasks to add assignees and deadlines, ready tasks will change color'
        }
    },
    helpMap(mode){
        let result;
        try{
            result = this.helpMapBlueprint[mode];
        }
        catch(err){
            // nothing
        }
        if(result === undefined)
            return {};

        return result;
    },
    statics: {
        fetch(params) {
            if(params.object == 'add'){

                return new Promise(function (fulfill, reject){
                    WorkflowStore.resetDetail();
                    fulfill({});
                });
            }
            return WorkflowActions.loadDetailIfNecessary.triggerPromise(params.object).then(
                (workflow) => {
                    return workflow;
                }
            );
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    displayName: route => {
        try{
            let detail = Object.keys(route.props.detail)[0];
            return `Study Template - ${route.props.detail[detail].title}`;
        } catch(ex){
            return 'Study Template Not Found';
        }
    },
    getWorkflow(){
        let detail = Object.keys(this.props.detail)[0];
        return this.props.detail[detail];
    },
    __getState(){
        return {
            addedProcess: WorkflowStore.getProcessAddFinished(),
            addedWorkflow: WorkflowStore.getWorkflowAddFinished(),
            ***REMOVED*** WorkflowStore.getWorkflow(),
            missing: WorkflowStore.getMissing(),
            user: UserStore.getUser()
        }
    },
    getInitialState(){
        return this.__getState();
    },
    componentWillMount(){
        WorkflowActions.calibrate();
    },
    componentDidUpdate(){
        if(this.state.addedProcess){
            this.context.router.transitionTo('Process', {object: this.state.addedProcess.hash});
        }
        if(this.state.addedWorkflow){
            let mode = this.context.router.getCurrentParams().mode;
            if(mode)
                this.context.router.transitionTo('WorkflowEdit', {object: this.state.addedWorkflow.hash, mode: mode});
            else
                this.context.router.transitionTo('Workflow', {object: this.state.addedWorkflow.hash});

        }
        // hotfix to breadcrumbs on add
        $('a[href$="/workflow/add"]').hide();
    },
    update(status){
        if(status == WorkflowStore.DETAIL){
            this.setState(this.__getState());
        }
    },
    load(run){
        const wf = this.state.workflow;
        const sm = new StateMachine();

        if(run){
            sm.addStateClass({
                id: 'tasks.SimpleTask',
                Class: SimpleTaskRun
            });
            sm.addStateClass({
                id: 'form.FormTask',
                Class: FormTaskRun
            });
        }
        else{
            sm.addStateClass({
                id: 'tasks.SimpleTask',
                Class: SimpleTask
            });
            sm.addStateClass({
                id: 'form.FormTask',
                Class: FormTask
            });
        }


        // I dont know if they come ordered, so i add all tasks first, an dependencies only after
        let map = {};

        // first states
        if(wf.tasks){
            for(let task of wf.tasks){
                let type = sm.getStateClass(task.type).Class;
                let state = sm.stateFactory(task.sortid, type, type.deserializeOptions(task));

                map[task.hash] = state;

                sm.addState(state);
            }

            // then dependencies
            for(let task of wf.tasks)
                for(let dep of task.dependencies)
                    sm.addDependency(map[task.hash], map[dep.dependency]);
        }

        return sm;
    },
    save(data){
        WorkflowActions.setWorkflow(data);
    },
    setPublic(e){
        WorkflowActions.setPublic(e.target.checked);
    },
    setSearchable(e){
        WorkflowActions.setSearchable(e.target.checked);
    },
    setForkable(e){
        // sets fork preferences
        WorkflowActions.setForkable(e.target.checked);
    },
    fork(e){
        // Effectively duplicates the workflow creating a fork
        WorkflowActions.fork();
    },
    runProcess(data){
        WorkflowActions.runProcess(data);
    },
    closePopup(){
        WorkflowActions.calibrate();
    },
    unsaved(){
        let params = this.context.router.getCurrentParams();

        if(params.mode === 'edit')
            StateActions.waitSave();
    },
    didWrite(){
        if(!this.state.workflow.owner)
            return true;

        if(this.state.user.id === this.state.workflow.owner)
            return true;

        return false;
    },
    render() {
        if(this.props.failed){
            let Failed = this.props.failed;
            return <Failed />;
        }

        let params = this.context.router.getCurrentParams();

        if(params.mode && !(params.mode === 'edit' || params.mode === 'view' || params.mode === 'run'))
            this.context.router.replaceWith('/404');

        let sm = this.load(params.mode === 'run');

        return (
            <span>
                {this.state.missing.length > 0?
                    <Modal title="Missing information"
                        message={<span>You have to specify deadlines and assignee's for all tasks. This can be specified by clicking on the tasks and changing the values on the bottom of their detail view.<br />
                            <br />
                            The following tasks don't have deadlines or assignee's:
                            <ul>
                                {this.state.missing.map((state) => {
                                    let name = state.name || 'Unnamed';
                                        return <li key={state.hash}>{name}</li>;
                                })}
                            </ul>

                            </span>}
                        success={this.closePopup} close={this.closePopup}
                    />
                :''}
                <StateMachineComponent key={'workflow'+params.mode}
                    extra={
                            <span>
                            <PermissionsBar
                                link="WorkflowEdit"
                                owner={this.state.workflow['owner_repr']}
                                forkable={params.mode === 'forkable'}
                                editable={params.mode === 'edit'}
                                runnable={params.mode === 'run'}
                                showEdit={this.didWrite()}
                                setFork={this.fork}
                                setPublic={this.setPublic}
                                setSearchable={this.setSearchable}
                                setForkable={this.setForkable}
                                object={params.object}
                                title={this.getWorkflow().title}
                                runProcess={this.runProcess}
                                listProcesses={this.state.workflow['assoc_processes']}
                                {...this.state.workflow.permissions} />
                            {params.mode === 'run' ?
                                    <RunLabel />:''}
                            </span>
                    }
                    title={this.getWorkflow().title}
                    editable={params.mode === 'edit'}
                    editTitle={params.mode === 'run'}
                    blockSchema={this.state.workflow['assoc_processes'] && this.state.workflow['assoc_processes'].length > 0}
                    save={params.mode === 'run'? this.runProcess:this.save}
                    onUpdate={this.unsaved}
                    saveLabel={params.mode !== 'run'?
                    <span><i className="fa fa-floppy-o"></i> &nbsp;Save Study</span>
                    : <span><i className="fa fa-play"></i> Run</span>}
                    initialSm={sm}
                    detailMode={this.state.user.profile['detail_mode']}
                    detailHelp={this.helpMap(params.mode).detail}
                    globalHelp={this.helpMap(params.mode).global}

                    validate = {params.mode === 'run'}
                    identifier={`workflow_${params.mode}page`}

                    endDetail={undefined}
                    savebar={!params.mode || params.mode === 'view'? false: true}

                    selectFirst={!params.mode || params.mode === 'view' || params.mode === 'run'? true: false}


                    {...this.props}/>
            </span>
        );
    }
});

