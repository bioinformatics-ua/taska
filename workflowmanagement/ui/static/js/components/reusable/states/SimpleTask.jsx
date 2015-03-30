import Reflux from 'reflux';
import React from 'react';

import {SimpleState} from '../../../react-statemachine/classes.jsx';

import Select from 'react-select';

import UserActions from '../../../actions/UserActions.jsx';
import UserStore from '../../../stores/UserStore.jsx';

import moment from 'moment';

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
                    return {};
                case 2:
                    return {
                          backgroundColor: '#337ab7',
                          border: 0,
                          color: 'white'
                    };
                case 3:
                    return {
                          backgroundColor: 'rgb(92, 184, 92)',
                          border: 0,
                          color: 'white'
                    };
                case 4:
                    return {
                        backgroundColor: 'grey',
                        border: 0,
                        color: 'white'
                    };
                case 5:
                    return {
                        backgroundColor: 'rgb(240, 173, 78)',
                        border: 0,
                        color: 'white'
                    };
            }


        return {};
    }

    detailRender(editable=true, ChildComponent=dummy){
        let self = this;
        const SimpleRun = React.createClass({
            getState(){
                return {
                    parent: this.props.main,
                    users: []
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
            componentWillMount(){
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
                        this.setState(
                            {
                                users: map
                            }
                        );
                    }
                );
                console.log(this.parent());

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
                                            value={this.parent().deadline} />
                        </div>
                    </div>
                    <ChildComponent main={this} />
                </span>
            }
        });

        return super.detailRender(editable, SimpleRun);
    }
}

export default {SimpleTask, SimpleTaskRun};
