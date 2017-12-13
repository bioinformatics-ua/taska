'use strict';

import Router from 'react-router';
import React from 'react';
import Select from 'react-select';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import moment from 'moment';

import {ProcessStatus} from '../reusable/component.jsx'
import ReminderButton from '../reusable/buttons/ReminderButton.jsx'

export default React.createClass({
    getDefaultProps() {
        return {
            disabled: false,
            toggleDisabled: false,
            setNotifiable: function(){},
            numDaysBefore: 0,
            numDaysAfter: 0,
            sendNotificationUntil: null,
            defaultDate: null,
            createProcess: false,
        };
    },
    getState(){
        return {
            numDaysBefore: this.props.numDaysBefore != 0 ? this.props.numDaysBefore.toString() : this.props.numDaysBefore,
            numDaysAfter: this.props.numDaysAfter != 0 ? this.props.numDaysAfter.toString() : this.props.numDaysAfter,
            sendNotificationUntil: this.props.sendNotificationUntil,
            disabled: this.props.disabled,

            startDate: this.props.startDate,
            endDate: this.props.endDate,
            status: this.props.status,
            progress: this.props.progress
        }
    },
    getInitialState(){
       return  this.getState();
    },
    setNumDaysBefore(e){
        if(e.length==0)
            e=0;
        this.setState({ numDaysBefore: e });
        this.props.setNotification(e, this.state.numDaysAfter, this.state.sendNotificationUntil);
    },
    setNumDaysAfter(e){
        if(e.length==0)
            e=0;
        this.setState({ numDaysAfter: e });
        this.props.setNotification(this.state.numDaysBefore, e, this.state.sendNotificationUntil);
    },
    setNotificationsDeadline(e){
        this.setState({ sendNotificationUntil: e==null ? null : moment(e).format('YYYY-MM-DDTHH:mm') });
        this.props.setNotification(this.state.numDaysBefore, this.state.numDaysAfter, e==null ? null : moment(e).format('YYYY-MM-DDTHH:mm'));
    },
    openReminders(){
        console.log(this.state);
    },
    render(){
        var optionsBeforeDeadline = [
            { value: "1", label: '1 day' },
            { value: "2", label: '2 days' },
            { value: "3", label: '3 days' },
            { value: "4", label: '4 days' },
            { value: "5", label: '5 days' },
            { value: "6", label: '6 days' },
            { value: "7", label: '7 days' }
        ];
        //I did it that way because in the future I can change the options more easily
        var optionsAfterDeadline = optionsBeforeDeadline;
        console.log(this.state);
        var processReminderConfigs = {
            before: this.state.numDaysBefore,
            after: this.state.numDaysAfter,
            repeatUpTo: this.state.sendNotificationUntil
        };
        return(<div>
                <div className="row">
                    <div className="col-md-12">
                        {/* MESSAGE THERE */}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="startdate">
                                    <strong>Start Date</strong>
                                </span>
                                <input className="form-control" readOnly value={this.state.startDate}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="enddate">
                                    <strong>End Date</strong>
                                </span>
                                <input className="form-control" readOnly value={this.state.endDate}/>
                            </div>
                        </div>
                    </div>
                </div>
                { !this.props.createProcess ?
                <div className="row">
                    <div className="col-md-3">
                        <ReminderButton existentReminders={processReminderConfigs}
                                        text={"Reminders"}
                                        icon={"fa fa-sticky-note-o"}
                                        extraCss={"pull-left btn-md btn-default"} />
                    </div>
                    <div className="col-md-7">
                    </div>
                    <div className="col-md-2">
                        <div className="form-group">
                            <div className="input-group">
                                 <ProcessStatus label="True" rowData={{status: this.state.status}}/>
                            </div>
                        </div>
                    </div>
                </div> : ''}

                {!this.props.createProcess ?
                    <div style={{backgroundColor: '#CFCFCF', width: '100%', height: '10px'}}>
                        <div title={`${this.state.progress}% completed`}
                             style={{backgroundColor: '#19AB27', width: `${this.state.progress}%`, height: '10px'}}></div>
                        &nbsp;</div> : ''}
            </div>
        )
    }
});