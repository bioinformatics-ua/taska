import Reflux from 'reflux';
import React from 'react';
import {Link} from 'react-router';

import {SimpleState} from '../../../react-statemachine/classes.jsx';

import Select from 'react-select';

import UserActions from '../../../actions/UserActions.jsx';
import UserStore from '../../../stores/UserStore.jsx';

import moment from 'moment';

import checksum from 'json-checksum';

const dummy = React.createClass({render(){return <span></span>; }});

class SimpleTask extends SimpleState {
    constructor(options){
        super(options);
    }
    static typeIcon(){
        return <i className="fa fa-check"></i>;
    }
    static repr(){
        return 'Simple Task';
    }

    detailRender(editable=true, ChildComponent=dummy){
        let self = this;
        const SimpleFields = React.createClass({
            getState(){
                return {
                    parent: this.props.main
                };
            },
            getInitialState(){
                return this.getState();
            },
            setDescription(e){
                this.state.parent.setState({description: e.target.value});
                this.props.dataChange(self.getIdentificator(), {description: e.target.value}, false);
            },
            parent(){
                return this.state.parent.state;
            },
            render(){
                return <span>
                    <div key="state-descr" className="form-group">
                        <div className="input-group clearfix">
                            <span className="input-group-addon" id="state-description">
                                <strong>Task Description</strong>
                            </span>
                            <textarea rows="6" type="description" className="form-control"
                                            aria-describedby="state-description"
                                            placeholder="Enter the state description here"  disabled={!editable}
                                            onChange={this.setDescription} value={this.parent().description}>
                            </textarea>
                        </div>
                    </div>
                    <ChildComponent dataChange={this.props.dataChange} main={this.props.main} />
                </span>
            }
        });

        return super.detailRender(editable, SimpleFields);
    }

    static deserializeOptions(data){

        if(data.title === undefined)
            throw `data object is missing 'title' property`;

        if(data.description === undefined)
            throw `data object is missing 'description' property`;

        return {
            name: data.title,
            description: data.description,
            hash: data.hash,
            type: data.type
        };
    }

    serialize(){
        let deps = [];
        for(let dep of this.getDependencies()){
            deps.push({
                dependency: dep.getIdentificator()
            });
        }

        return {
            sid: this.__identificator,
            hash: this.getData().hash,
            title: this.getData().name,
            type: this.getData().type,
            sortid: this.getLevel(),
            description: this.getData().description || '',
            dependencies: deps
        }
    }
}

class SimpleTaskRun extends SimpleTask{
    constructor(options){
        super(options);
    }

    serialize(){
        let users = [];
        let assignee = this.getData().assignee || '';

        for(let user of assignee.split(','))
            if(user.length > 0)
                users.push({user: Number.parseInt(user)});

        return {
            users: users,
            deadline: this.getData().deadline,
            //name: this.getData().name,
            task: this.getData().hash
        }
    }
    stateStyle(){
        if(this.getData().ptask)
            switch(this.getData().ptask.status){
                case 1:
                    return {
                        border: '1px solid #ccc',
                        color: 'black',
                        backgroundColor: 'white',
                        fontSize: '100%'
                    };
                case 2:
                    let end = moment(this.getData().ptask.deadline);
                    let now = moment();

                    if(now.isBefore(end)){
                        return {
                              backgroundColor: '#337ab7',
                              border: 0,
                              color: 'white',
                              fontSize: '100%'
                        };
                    } else {
                        return {
                            backgroundColor: 'rgb(240, 173, 78)',
                            border: 0,
                            color: 'white',
                            fontSize: '100%'
                        };
                    }
                case 3:
                    return {
                          backgroundColor: 'rgb(92, 184, 92)',
                          border: 0,
                          color: 'white',
                          fontSize: '100%'
                    };
                case 4:
                    return {
                        backgroundColor: 'grey',
                        border: 0,
                        color: 'white',
                        fontSize: '100%'
                    };
                case 5:
                    return {
                        backgroundColor: 'rgb(240, 173, 78)',
                        border: 0,
                        color: 'white',
                        fontSize: '100%'
                    };
            }


        return {};
    }
    stateDesc(){
        if(this.getData().ptask)
            switch(this.getData().ptask.status){
                case 1:
                    return 'Waiting';
                case 2:
                    let end = moment(this.getData().ptask.deadline);
                    let now = moment();

                    if(now.isBefore(end)){
                        return 'Running';
                    } else {
                        return 'Overdue';
                    }
                case 3:
                    return 'Finished';
                case 4:
                    return 'Canceled';
                case 5:
                    return 'Overdue';
            }


        return 'Waiting';
    }

    detailRender(editable=true, ChildComponent=dummy){
        let self = this;
        const SimpleRun = React.createClass({
            getState(){
                return {
                    parent: this.props.main,
                    users: [],
                    new_assignee: undefined

                };
            },
            getInitialState(){
                return this.getState();
            },
            parent(){
                return this.state.parent.state;
            },
            setAssignee(val){
                let data = {assignee: val};

                this.state.parent.setState(data);
                this.props.dataChange(self.getIdentificator(), data, false);
            },
            setDeadline(e){
                let data = {deadline: e.target.value};

                this.state.parent.setState(data);
                this.props.dataChange(self.getIdentificator(), data, false);
            },
            cancelUser(e){
                let action = this.state.parent.props.cancelUser;
                if(action){
                    action(self.getData().ptask.hash,
                        Number.parseInt($(e.target).data('assignee')),
                        $(e.target).data('cancel'));
                }
            },
            addNew(e){
                let action = this.state.parent.props.addNew;
                if(action){
                    action(self.getData().ptask.hash, this.state.new_assignee);
                }
            },
            newAssignee(e){
                this.setState({
                    new_assignee: e
                })
            },
            results(){
                let me=this;

                let users;
                let status;
                if(!this.parent().assignee)
                    return;

                let alreadyusers = this.parent().assignee.split(',');

                try{
                    users = this.parent().ptask.users;
                    status = this.parent().status;
                } catch(ex){
                    users = [];
                }
                let desc = self.stateDesc();
                let stillOn = desc === 'Running' || desc === 'Waiting';

                let renderStatus = function(user){
                    if(user.finished){
                        return (
                            <span>
                                <span style={{fontSize: '100%'}} className="label label-danger">
                                    Finished on {moment(user.result.date).format('YYYY-MM-DD HH:mm')}
                                </span>
                                 &nbsp;&nbsp;&nbsp;
                                 <Link to={user.result.type}
                                 params={{object: user.result.hash}}>
                                 See result</Link>
                            </span>
                        );
                    } else if(user.reassigned){
                        return (<span>
                            <span style={{fontSize: '100%'}} className="label label-warning">
                                Canceled on {moment(user.reassigned_date).format('YYYY-MM-DD HH:mm')}
                            </span>&nbsp;&nbsp;&nbsp;
                            {stillOn ?
                            <a data-assignee={user.user} data-cancel="false" onClick={me.cancelUser}>Uncancel ?</a> :''}
                            </span>
                        );
                    } else {

                        return (
                            <span>
                            <span className="label" style={self.stateStyle()}>
                                {desc}
                            </span> &nbsp;&nbsp;&nbsp;
                            {stillOn ?
                           <a data-assignee={user.user} data-cancel="true" onClick={me.cancelUser}>Cancel ?</a> :''}
                            </span>
                        );
                    }
                };
                if(users.length > 0){
                    return (<span>
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th colSpan="2"><center><h4>Status of each assignee tasks</h4></center></th>
                                </tr>
                                <tr>
                                    <th style={{width: '40%'}}>User</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(
                                    (user, index) => {
                                            return (
                                                <tr key={`ustatus_${index}`}>
                                                    <td>{user['user_repr']}</td>
                                                    <td>{renderStatus(user)}</td>
                                                </tr>
                                            );
                                    })
                                }
                            </tbody>
                        </table>
                        { stillOn ?<span>
                        <button onClick={me.addNew} className="pull-right btn btn-success">Add new assignee</button>
                        <Select placeholder="Search for assignee" className="pull-right col-md-5" onChange={this.newAssignee}
                            value={this.state.new_assignee} name="form-field-name"
                         options={this.state.users.filter(user => (alreadyusers.indexOf(user.value) === -1))
                        } />
                        </span>: ''}
                    </span>);
                }

                return false;
            },
            componentDidMount(){
                // For some reason i was getting a refresh loop, when getting the action result from the store...
                // so exceptionally, i decided to do it directly, the result is still cached anyway
                UserActions.loadListIfNecessary.triggerPromise().then(
                    (users) => {
                        let map = users.results.map(
                                    entry => {
                                        return {
                                            value: ''+entry.id,
                                            label: entry.fullname
                                        }
                                    }
                        );
                        if(this.isMounted()){
                            this.setState(
                                {
                                    users: map
                                }
                            );
                        }
                    }
                );

                if(!this.parent().deadline)
                    this.setDeadline({
                        target: {
                            value: moment().add(10, 'days').format('YYYY-MM-DDTHH:mm')
                        }
                    });

            },
            render(){
                return <span>
                    <div key="state-assignee" className="form-group">
                        <div className="input-group">
                            <span className="input-group-addon" id="state-assignee">
                                <strong>Assignees</strong>
                            </span>
                            {this.state.users.length > 0?
                            <Select onChange={this.setAssignee}
                            value={this.parent().assignee} name="form-field-name"
                            multi={true} options={this.state.users} disabled={this.parent().disabled} />
                            :''}
                        </div>

                    </div>
                    <div key="state-deadline" className="form-group">
                        <div className="input-group clearfix">
                            <span className="input-group-addon" id="state-deadline">
                                <strong>Deadline</strong>
                            </span>

                            <input type="datetime-local" className="form-control"
                                            aria-describedby="state-deadline"
                                            placeholder="Deadline"
                                            onChange={this.setDeadline} disabled={this.parent().disabled}
                                            value={moment(this.parent().deadline).format('YYYY-MM-DDTHH:mm')} />
                        </div>
                    </div>

                    {this.results()}

                    <ChildComponent main={this} />
                </span>
            }
        });

        return super.detailRender(editable, SimpleRun);
    }
}

export default {SimpleTask, SimpleTaskRun};
