import Reflux from 'reflux';
import React from 'react';
import {Link} from 'react-router';

import {SimpleState} from '../../../react-statemachine/classes.jsx';

import Select from 'react-select';

import StateActions from '../../../actions/StateActions.jsx';

import UserActions from '../../../actions/UserActions.jsx';

import ProcessActions from '../../../actions/ProcessActions.jsx';

import UserStore from '../../../stores/UserStore.jsx';

import moment from 'moment';

import checksum from 'json-checksum';

import Uploader from '../uploader.jsx';

import {stateColor, singleStateColor} from '../../../map.jsx';

import DateTimePicker from 'react-widgets/lib/DateTimePicker';

import Toggle from 'react-toggle';

const dummy = React.createClass({render(){return <span></span>; }});

class SimpleTask extends SimpleState {
    constructor(options){
        super(options);
    }
    static typeIcon(){
        return <i className="fa fa-cube"></i>;
    }
    static repr(){
        return 'Simple Task';
    }
    static title(){
        return "Do you know what is a simple tasks? It is a task that have inputs and outputs files, descriptions and comments.";
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
                console.log('SET DESCR');
                this.state.parent.setState({description: e.target.value});
                this.props.dataChange(self.getIdentificator(), {description: e.target.value}, false);
            },
            setEffort(e){
                console.log('SET EFFORT');
                this.state.parent.setState({effort: Number.parseFloat(e.target.value)});
                this.props.dataChange(self.getIdentificator(), {effort: Number.parseFloat(e.target.value)}, false);
            },
            setOutputResource(e){
                console.log(e.target.checked);
                this.state.parent.setState({'output_resources': e.target.checked});
                this.props.dataChange(self.getIdentificator(), {'output_resources': e.target.checked}, false);
            },
            setResources(related_resources){
                this.state.parent.setState({resources: related_resources});
                this.props.dataChange(self.getIdentificator(), {resources: related_resources}, false);
            },
            parent(){
                return this.state.parent.state;
            },


            __createMap(own){
                if(own){
                    let linkmap = {};

                    for(let link of own){
                        linkmap[link.filename] = 'api/resource/'+link.hash+'/download/';
                    }

                    return linkmap;
                }

                return {};

            },
            digestDescription(desc, map){
                if(desc){

                    let result = desc.replace(/#\((.*?)\)/g, function(a, b){
                        let hit = map[b];

                        if(hit)
                            return '<a target="_blank" href="'+map[b]+'">' + b + '</a>';
                        else
                            return b;

                    });

                    result = result.replace(/((http[s]?:\/\/[\w.\/_\-=?]+)|(mailto:[\w.\/@_\-=?]+))/g, function(a, b){
                        return '<a target="_blank" href="'+b+'">' + b + '</a>';

                    });

                    return result;
                }
                return undefined;
            },

            render(){

                let depmap = this.__createMap(this.parent().resources);

                let description = this.digestDescription(this.parent().description, depmap) || '';
                let getDesc = () => { return {__html: description} };

                return <span>
                    <div key="state-descr" className="form-group">
                        <label for="state-description">Task Description</label>
                            {editable ?
                            <textarea style={{resize: "vertical"}} id="state-description" rows="6" type="description" className="form-control"
                                            aria-describedby="state-description"
                                            placeholder="Enter the state description here"  disabled={!editable}
                                            onChange={this.setDescription} value={this.parent().description}>
                            </textarea>
                            :
                            <div style={{height: 'auto', minHeight:'80px', backgroundColor: '#ecf0f1', 'word-break': 'break-word'}} id="state-description" rows="6" className="form-control"
                                            aria-describedby="state-description">
                                <span dangerouslySetInnerHTML={getDesc()} />
                            </div>
                        }
                    </div>

                    <div key="state-effort" className="form-group">
                        <label for="state-effort">Required Effort (in hours)</label>
                            <input type="number" min="0" id="state-effort" className="form-control"
                                            aria-describedby="state-effort" disabled={!editable}
                                            onChange={this.setEffort} value={(this.parent().effort)?this.parent().effort:1} />
                    </div>

                    <span>
                            <label title="Choose if the answers for all tasks, when running inside a study context, should be passed down to this tasks dependants.">Forward Answers</label>
                            <div className="form-group">
                            <Toggle id="output_resources"
                                    defaultChecked={this.parent()['output_resources']}
                                    onChange={this.setOutputResource} disabled={!editable} />
                            </div>
                    </span>
                    <ChildComponent dataChange={this.props.dataChange} main={this.props.main} />


                        <span>
                        {(this.parent().resources && this.parent().resources.length > 0 || editable)?
                            <label>Attachments</label>
                        :''}
                        <Uploader editable={editable} uploads={this.parent().resources} done={this.setResources} />
                        </span>
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

        // We only generically consider file resources
        // Other files should be considered by each child class when
        // deserializing/serializing as we have no idea how to interpret the resource
        let resources = [];
        for(let resource of data.resources){
            if(resource.type === 'material.File')
                resources.push({
                    hash: resource.hash,
                    filename: resource.filename,
                    size: resource.size,
                    status: 'Finished',
                    progress: 100,
                    manage: ''
                });
        }
        return {
            name: data.title,
            description: data.description,
            effort: data.effort,
            hash: data.hash,
            type: data.type,
            resources: resources,
            'output_resources': data['output_resources']
        };
    }

    serialize(){
        let deps = [];
        for(let dep of this.getDependencies()){
            deps.push({
                dependency: dep.getIdentificator()
            });
        }
        let resources = [];
        let full = this.getData().resources || [];

        for(let resource of full){
            resources.push(resource.hash);
        }

        return {
            sid: this.__identificator,
            hash: this.getData().hash,
            title: this.getData().name,
            type: this.getData().type,
            sortid: this.getLevel(),
            description: this.getData().description || '',
            effort: this.getData().effort || 1,
            dependencies: deps,
            resourceswrite: resources,
            'output_resources': this.getData()['output_resources']
        }
    }
}

class SimpleTaskRun extends SimpleTask{
    constructor(options){
        super(options);
    }
    is_valid(){
        let data = this.getData();

        return (
            data.deadline
            && data.assignee
            && data.assignee.split(',').length > 0
        );

    }

    status(){
        if(this.is_valid()){
            return 'state-filled';
        }

        return '';
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
            name: this.getData().name,
            task: this.getData().hash
        }
    }
    stateStyle(user){
        if(this.getData().ptask)
            //This condition is because the state 7 and 8 is influenced by the state of ProcessTaskUser
            if (this.getData().ptask.status != 7 && this.getData().ptask.status != 8 )
                return stateColor(this.getData().ptask);
            else if(user != undefined)
                return singleStateColor(user.status);
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
                case 7:
                    return 'Waiting for answer';
                case 8:
                    return "Rejected";
                default:
                    console.log("Task status: ");
                    console.log(this.getData().ptask.status);
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
                this.props.dataChange(self.getIdentificator(), data, true);
            },
            setDeadline(e){
                let data = {deadline: moment(e).format('YYYY-MM-DDTHH:mm')};

                this.state.parent.setState(data);
                this.props.dataChange(self.getIdentificator(), data, true);
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
            refineAnswer(e){
                let answer_hash = $(e.target).data('answer');

                let action = this.state.parent.props.refineAnswer;
                if(action){
                    action(answer_hash);
                }
            },
            reasign(e){
                console.log("Reasign");
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
                let forAvailability =  desc === 'Waiting for answer' || desc === 'Rejected';

                let renderStatus = function(user){
                    if (forAvailability)
                        switch(user.status)
                        {
                            case 1:
                                desc = 'Waiting for answer';
                                break;
                            case 2:
                                desc = 'Accepted';
                                break;
                            case 3:
                                desc = 'Rejected';
                                break;
                        }

                    if(user.finished){
                        return (
                            <span>
                                <span style={{fontSize: '100%'}} className="label label-danger">
                                    Finished on {moment(user.result.date).format('YYYY-MM-DD HH:mm')}
                                </span>
                                 <div className="btn btn-group">

                                 <button data-answer={user.hash} onClick={me.refineAnswer} className="btn btn-xs btn-warning">Ask for refinement</button>
                                 <Link className="btn btn-xs btn-info" to={user.result.type}
                                 params={{object: user.result.hash}}>
                                 See result</Link>
                                 </div>
                            </span>
                        );
                    } else if(user.reassigned){
                        return (<span>
                            <span style={{fontSize: '100%'}} className="label label-warning">
                                Canceled on {moment(user.reassigned_date).format('YYYY-MM-DD HH:mm')}
                            </span>&nbsp;&nbsp;&nbsp;
                            {stillOn || forAvailability ?
                            <a data-assignee={user.user} data-cancel="false" onClick={me.cancelUser}>Uncancel ?</a> :''}
                            </span>
                        );
                    } else {
                        console.log("este");
                        console.log(user);
                        return (
                            <span>
                            <span className="label" style={self.stateStyle(user)}>
                                {desc}
                            </span> &nbsp;&nbsp;&nbsp;
                            {stillOn || forAvailability ?
                            (forAvailability ?
                            <span>
                                <a data-assignee={user.user} data-cancel="true" onClick={me.cancelUser}>Cancel  </a>
                                <a data-assignee={user.user} data-cancel="true" onClick={me.reasign}>Reasign</a>
                            </span>:
                            <a data-assignee={user.user} data-cancel="true" onClick={me.cancelUser}>Cancel ?</a> ):''}
                            </span>
                        );
                    }
                };
                if(users.length > 0){
                    return (<span>
                        <table style={{backgroundColor: 'white'}} className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th colSpan="2">
                                    <label style={{position: 'absolute'}}>Assignees Status</label>

                                    <div className="pull-right btn-group">
                                      <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                        <i className="fa fa-download"></i> <small>Download Results</small> <span className="caret"></span>
                                      </button>
                                      <ul className="dropdown-menu" role="menu">
                                        <li><a href={`api/process/processtask/${this.parent().ptask.hash}/export/csv`}>
                                            <i className="fa fa-file-text-o"></i> As CSV</a></li>
                                        <li><a href={`api/process/processtask/${this.parent().ptask.hash}/export/json`}>
                                            <i className="fa fa-file-code-o"></i> As JSON</a></li>
                                        <li><a href={`api/process/processtask/${this.parent().ptask.hash}/export/xlsx`}>
                                            <i className="fa fa-file-excel-o"></i> As XLSX</a></li>
                                        <li><a target="_blank" href={`api/process/processtask/${this.parent().ptask.hash}/export/pdf?as=html`}>
                                            <i className="fa fa-file-code-o"></i> As HTML</a>
                                        </li>
                                        <li><a target="_blank" href={`api/process/processtask/${this.parent().ptask.hash}/export/pdf`}>
                                            <i className="fa fa-file-pdf-o"></i> As PDF</a>
                                        </li>
                                      </ul>
                                    </div>
                                    </th>
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
                                                    <td><small>{user['user_repr']}</small></td>
                                                    <td><small>{renderStatus(user)}</small></td>
                                                </tr>
                                            );
                                    })
                                }
                            </tbody>
                        </table>
                        { stillOn ?<span className="clearfix">
                        <div className="row">

                            <div className="col-md-12">
                                <div className="input-group">
                                        <Select placeholder="Search for assignee" onChange={this.newAssignee}
                                            value={this.state.new_assignee} name="form-field-name"
                                            options={this.state.users.filter(user => (alreadyusers.indexOf(user.value) === -1))
                                        } />
                                  <span className="input-group-btn">
                                    <button onClick={me.addNew} className="btn btn-success"><i className="fa fa-plus"></i></button>
                                  </span>
                                </div>
                            </div>
                        </div><br />
                        </span>: ''}
                    </span>);
                }

                return false;
            },
            componentWillMount(){
                // For some reason i was getting a refresh loop, when getting the action result from the store...
                // so exceptionally, i decided to do it directly, the result is still cached anyway
                if(this.state.users.length == 0)
                    UserActions.loadSimpleListIfNecessary.triggerPromise().then(
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
                    this.setDeadline(moment().add(10, 'days').format('YYYY-MM-DDTHH:mm'));
            },
            extendDeadline(event){
                let new_deadline,
                    setNewDeadline = (date) => {
                    new_deadline = moment(date).format('YYYY-MM-DDTHH:mm');
                };

                StateActions.alert({
                    'title': `Change deadline for ${this.parent().name}`,
                    'message': <div style={{}}>
                            <p>Please specify the new deadline.</p>
                            <DateTimePicker id="newdeadline" onChange={setNewDeadline}
                                defaultValue={moment(this.parent().deadline).toDate()} format={"yyyy-MM-dd HH:mm"} />
                        </div>,
                    'onConfirm': (val)=>{
                        ProcessActions.changeDeadline(this.parent().ptask.hash, new_deadline);
                        //return false;
                    },
                    'overflow': 'visible'
                });
            },
            render(){
                let users;
                try{
                    users = this.parent().ptask.users;
                } catch(ex){
                    users = [];
                }

                return <span>
                    <div key="state-assignee" className="form-group">
                        <label for="state-assignee">Assignees <i title="This field is mandatory" className=" text-danger fa fa-asterisk" /></label>

                            {this.state.users.length > 0?
                            <Select onChange={this.setAssignee} placeholder="Search for assignees"
                            value={this.parent().assignee} name="form-field-name"
                            multi={true} options={this.state.users} disabled={this.parent().disabled} />
                            :''}
                    </div>
                    <div key="state-deadline" className="form-group">
                        <label for="state-deadline">Deadline <i title="This field is mandatory" className=" text-danger fa fa-asterisk" /></label>
                        {users.length > 0 ?
                            <button className="pull-right btn btn-xs btn-primary" onClick={this.extendDeadline}>
                                <i title="Change this task deadline" className="fa fa-plus" /> Change deadline
                            </button>
                        :''}

                        <DateTimePicker key={moment(this.parent().deadline).toDate()} onChange={this.setDeadline} disabled={this.parent().disabled}
                            defaultValue={moment(this.parent().deadline).toDate()} format={"yyyy-MM-dd HH:mm"} />

                    </div>

                    {this.results()}

                    <ChildComponent main={this} />
                </span>
            }
        });

        return super.detailRender(editable, SimpleRun);
    }
}

export default {SimpleTask, SimpleTaskRun, dummy};
