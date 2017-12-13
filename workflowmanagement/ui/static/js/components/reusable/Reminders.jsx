'use strict';
import React from 'react';
import Select from 'react-select';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import moment from 'moment';

export default React.createClass({
    getDefaultProps(){
        return {
            defaultDate: null,
            disabled: false,
            reminders: {
                before: 0,
                after: 0,
                repeatUpTo: null
            }
        }
    },
    getState(){
        return {
            numDaysBefore: this.props.reminders.before != 0 ? this.props.reminders.before.toString() : this.props.reminders.before,
            numDaysAfter: this.props.reminders.after != 0 ? this.props.reminders.after.toString() : this.props.reminders.after,
            sendNotificationUntil: this.props.reminders.repeatUpTo,
            disabled: this.props.disabled,
        }
    },
    getInitialState(){
       return  this.getState();
    },
    setNumDaysBefore(e){
        if(e.length==0)
            e=0;
        this.setState({ numDaysBefore: e });
        this.props.setReminders(this.setReminderState(e, this.state.numDaysAfter, this.state.sendNotificationUntil));
    },
    setNumDaysAfter(e){
        if(e.length==0)
            e=0;
        this.setState({ numDaysAfter: e });
        this.props.setReminders(this.setReminderState(this.state.numDaysBefore, e, this.state.sendNotificationUntil));
    },
    setNotificationsDeadline(e){
        this.setState({ sendNotificationUntil: e==null ? null : moment(e).format('YYYY-MM-DDTHH:mm') });
        this.props.setReminders(this.setReminderState(this.state.numDaysBefore, this.state.numDaysAfter, e==null ? null : moment(e).format('YYYY-MM-DDTHH:mm')));
    },
    setReminderState(numDaysBefore, numDaysAfter, sendNotificationUntil){
        return {
                before: numDaysBefore,
                after: numDaysAfter,
                repeatUpTo: sendNotificationUntil
        }
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

        return <div lassName="col-md-12">
            <div className="row">
                <div>
                    <p>Please choose how many days before the task's deadline, the users should be reminded to finish the task. (Optional)</p>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <span className="delay-notification input-group-addon"
                              id="remainder-before"><strong>Reminder before deadline</strong></span>
                        <Select placeholder="Nº of days"
                                name="form-field-name"
                                value={this.state.numDaysBefore}
                                options={optionsBeforeDeadline}
                                onChange={this.setNumDaysBefore}
                                disabled={this.state.disabled}/>
                    </div>
                </div>
            </div>
            <br/>
            <div className="row">
                <div>
                    <p>Please configure the reminder frequency for users with overdue tasks and set a date when the system should stop sending reminders to these users. (Optional)</p>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <span className="delay-notification input-group-addon"
                              id="remainder-after"><strong>Reminder after deadline every</strong></span>
                        <Select placeholder="Nº of days"
                                name="form-field-name"
                                value={this.state.numDaysAfter}
                                options={optionsAfterDeadline}
                                onChange={this.setNumDaysAfter}
                                disabled={this.state.disabled}
                                selectValue={this.state.numDaysAfter}/>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="form-group">
                    <div className="input-group">
                        <span className="delay-notification input-group-addon"
                              id="remainder-until"><strong>Repeat up to</strong></span>
                                <DateTimePicker onChange={this.setNotificationsDeadline}
                                                defaultValue={this.state.sendNotificationUntil}
                                                format={"yyyy-MM-dd"}
                                                time={false}
                                                disabled={this.state.disabled}/>
                    </div>
                </div>
            </div>
        </div>;
    }
});
