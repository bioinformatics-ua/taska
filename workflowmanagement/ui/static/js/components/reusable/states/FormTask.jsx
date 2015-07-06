import Reflux from 'reflux';
import React from 'react';
import {Link} from 'react-router';

import {SimpleTask, dummy} from './SimpleTask.jsx';

import Select from 'react-select';

import FormActions from '../../../actions/FormActions.jsx';

import UserActions from '../../../actions/UserActions.jsx';
import UserStore from '../../../stores/UserStore.jsx';

import moment from 'moment';

import {stateColor} from '../../../map.jsx';

import DateTimePicker from 'react-widgets/lib/DateTimePicker';

class FormTask extends SimpleTask {
    constructor(options){
        super(options);
    }
    static typeIcon(){
        return <i className="fa fa-list-ul"></i>;
    }
    static repr(){
        return 'Form Task';
    }
    static title(){
        return "Do you know what is a form tasks? Basically you can do a questionnaire or survey for the users and know the answers. You will be able to export the answers to your statistic application. ";
    }

    detailRender(editable=true, ChildComponent=dummy){
        let self = this;
        const FormFields = React.createClass({
            getState(){
                return {
                    parent: this.props.main,
                    forms: [],
                };
            },
            getInitialState(){
                return this.getState();
            },
            parent(){
                return this.state.parent.state;
            },
            setform(val){
                let data = {form: val};

                this.state.parent.setState(data);
                this.props.dataChange(self.getIdentificator(), data, false);
            },
            openPopup(){
                let add_form = window.open("form/add/headless", "Add forms", "width=800;height=300;");

                add_form.onunload = () => {
                    let hash = add_form.formHash;

                    if(hash){
                        console.log(hash);
                        this.props.dataChange(self.getIdentificator(), {form: hash}, false);
                        this.refreshForm();
                    }
                };
            },
            refreshForm(){
                console.log('refreshing form');
                FormActions.loadSimpleList.triggerPromise(200).then(
                    (forms) => {
                        console.log('updated forms list');

                        let map = forms.results.map(
                                    entry => {
                                        return {
                                            value: ''+entry.hash,
                                            label: `${entry.title} (${entry.hash})`
                                        }
                                    }
                        );
                        if(this.isMounted()){
                            console.log('SETTING STATE');
                            this.setState(
                                {
                                    forms: map
                                }
                            );
                        }
                    }
                );
            },
            componentDidMount(){
                // For some reason i was getting a refresh loop, when getting the action result from the store...
                // so exceptionally, i decided to do it directly, the result is still cached anyway
                this.refreshForm();
            },
            render(){
                return (
                    <span>
                        <div key="state-form" className="form-group">
                            <label for="state-form">Form schema  <i title="This field is mandatory" className=" text-danger fa fa-asterisk" />
                            </label>
                                                            {editable ?
                                <button className="pull-right btn btn-xs btn-success" onClick={this.openPopup}>
                                    <i title="Add new form" className="fa fa-plus" /> Add new Form
                                </button>
                                :''}
                                {this.state.forms.length > 0?
                                <Select placeholder="Search for form" onChange={this.setform}
                                value={this.parent().form} name="form-field-name"
                                multi={false} options={this.state.forms} disabled={!editable} />
                                :<span><br/>There's no form yet, please add one first.</span>}
                        </div>
                    <ChildComponent dataChange={this.props.dataChange} main={this.props.main} />

                    </span>
                );
            }
        });

        return super.detailRender(editable, FormFields);
    }

    static deserializeOptions(data){
        if(data.form === undefined)
            throw `data object is missing 'form' property`;

        let tmp = super.deserializeOptions(data);

        tmp.form = data.form;

        return tmp;
    }

    serialize(){

        let tmp = super.serialize();

        tmp.form=this.getData().form;

        return tmp;
    }

    is_valid(){
        if(super.is_valid()){
            let data = this.getData();
            console.log(data);
            return data.form != undefined;
        }

        return false;
    }
}


class FormTaskRun extends FormTask{
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
            name: this.getData().name,
            task: this.getData().hash
        }
    }
    stateStyle(){
        if(this.getData().ptask)
            return stateColor(this.getData().ptask);

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
                let data = {deadline: moment(e).format('YYYY-MM-DDTHH:mm')};

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
            componentDidMount(){
                // For some reason i was getting a refresh loop, when getting the action result from the store...
                // so exceptionally, i decided to do it directly, the result is still cached anyway
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
            render(){
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
export default {FormTask, FormTaskRun};
