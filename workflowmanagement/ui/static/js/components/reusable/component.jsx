'use strict';

import Router from 'react-router';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import {LayeredComponentMixin} from '../../mixins/component.jsx';

import Toggle from 'react-toggle';

import Select from 'react-select';

import moment from 'moment';

import ProcessActions from '../../actions/ProcessActions.jsx';
import WorkflowActions from '../../actions/WorkflowActions.jsx';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';

const Loading = React.createClass({
  render: function(){
    return (
            <div className="loading">
              <center><i className="fa fa-3x fa-refresh fa-spin"></i></center>
            </div>
      );
  }
});

const DjangoCSRFToken = React.createClass({

  render: function() {

    var csrfToken = Django.csrf_token();

    return React.DOM.input(
      {type:"hidden", name:"csrfmiddlewaretoken", value:csrfToken}
      );
  }
});


/** Affix react component from: https://gist.github.com/julianocomg/296469e414db1202fc86
 * @author Juliano Castilho <julianocomg@gmail.com>
 */

import joinClasses from 'react/lib/joinClasses';

let Affix = React.createClass({
  /**
   * @type {Object}
   */
  propTypes: {
    offset: React.PropTypes.number
  },

  /**
   * @return {Object}
   */
  getDefaultProps() {
    return {
      offset: 0,
      clamp: '.widthreference',
      fill: true
    };
  },

  /**
   * @return {Object}
   */
  getInitialState() {
    return {
      affix: false
    };
  },

  /**
   * @return {void}
   */
  handleScroll() {
    var affix = this.state.affix;
    var offset = this.props.offset;
    var scrollTop = document.body.scrollTop;

    if (!affix && scrollTop >= offset) {
      this.setState({
        affix: true
      });
    }

    if (affix && scrollTop < offset) {
      this.setState({
        affix: false
      });
    }
  },

  /**
   * @return {void}
   */
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  },

  /**
   * @return {void}
   */
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  render() {
    var affix = this.state.affix ? 'affixed' : '';
    var offset = this.props.offset;
    var className = this.props.className;

    var clamp_str= isNaN(this.props.clamp);

    return (
      <span>
      {clamp_str ?
      <div data-clamp={this.props.clamp} className={joinClasses(className, affix)}>
        {this.props.children}
      </div>
        :
      <div style={{width: this.props.clamp+'px'}} className={joinClasses(className, affix)}>
        {this.props.children}
      </div>
      }

      {this.props.fill ?
        <div style={{height: offset}}>&nbsp;</div>
      :''}
      </span>
    );
  }

});

const Modal = React.createClass({
  getDefaultProps(){
    return {
      title: 'Undefined Title',
      message: 'Undefined Message',
      showConfirm: true,
      visible: true,
      overflow: 'auto',
      withReassigning: false
    }
  },
  newAssignee(){

  },
  setComment(e){
      this.props.onChange(e.target.value);
  },
  render(){
    if(this.props.visible)
      return <div className="modal modalback show">
                      <div className="modal-dialog">
                        <div className="modal-content">
                          <div className="modal-header">
                            <button type="button" onClick={this.props.close} className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">{this.props.title}</h4>
                          </div>
                          <div style={{overflow: this.props.overflow}} className="modal-body">
                            {this.props.message}
                              {this.props.showCommentArea ?<span> <br/><br/>
                              <textarea rows="4"
                                        placeholder="Leave a comment upon task rejection (optional)"
                                        className="form-control"
                                        onChange={this.setComment}
                                        defaultValue={this.props.comment} /></span>:''}
                          </div>
                          {this.props.showConfirm?
                          <div className="modal-footer">
                              {(this.props.withReassigning) ?
                              <div>
                                <button type="button" onClick={this.props.close} className="btn btn-default" data-dismiss="modal">Cancel</button>
                                <button type="button" onClick={this.props.success} className="btn btn-primary">This task</button>
                                <button type="button" onClick={this.props.allTasks} className="btn btn-primary">All tasks</button>
                              </div>
                                :
                              <div>
                                <button type="button" onClick={this.props.close} className="btn btn-default" data-dismiss="modal">Cancel</button>
                                <button type="button" onClick={this.props.success} className="btn btn-primary">Ok</button>
                              </div>}
                          </div>
                          :''}
                        </div>
                      </div>
                    </div>;
    return undefined;
  }
});

const Label = React.createClass({
            mixins: [Router.Navigation],
            contextTypes: {
                router: React.PropTypes.func.isRequired
            },
            displayName: route => {
                let params = route.context.router.getCurrentParams();

                let label = params['mode'] || 'Label';

                try{
                  if(params['object'] === 'add')
                    return 'Add';
                  // else
                  return params['mode'][0].toUpperCase() + params['mode'].slice(1);
                } catch(err){
                  return 'Add';
                }
            },
            render(){
                return <span>a</span>;
            }
    });

const DeleteButton = React.createClass({
  mixins: [LayeredComponentMixin],
    success(e){
      this.props.success(this.props.identificator);
    },
    getDefaultProps(){
      return {
        deleteLabel: <i className="fa fa-times"></i>,
        extraCss: ''
      };
    },
    render: function() {
        return <button className={`btn ${this.props.extraCss} btn-sm btn-danger`} onClick={this.handleClick}>{this.props.deleteLabel}</button>;
    },
    renderLayer: function() {
        if (this.state.clicked) {
            return <Modal title={this.props.title} message={this.props.message} success={this.success} close={this.handleClose} />
        } else {
            return <span />;
        }
    },
    // {{{
    handleClose: function() {
        this.setState({ clicked: false });
    },
  handleClick: function() {
    this.setState({ clicked: !this.state.clicked });
  },
  getInitialState: function() {
    return { clicked: false };
  }
  // }}}
});

const AcceptRejectButton = React.createClass({
    mixins: [LayeredComponentMixin],
    success(e){
        this.props.success(this.props.identificator);
    },
    getDefaultProps(){
        return {
            deleteLabel: <i className="fa fa-times"></i>,
            extraCss: ''
        };
    },
    render: function () {
        return <button style={this.props.extraStyle} className={`btn ${this.props.extraCss}`}
                       onClick={this.props.message != undefined ? this.handleClick: this.success}>{this.props.label}</button>;
    },
    renderLayer: function () {
        if (this.state.clicked && this.props.message != undefined)
            return <Modal title={this.props.title} message={this.props.message} success={this.success}
                          close={this.handleClose} showCommentArea={true} {...this.props}/>
        else
            return <span />;
    },
    handleClose: function () {
        this.setState({clicked: false});
    },
    handleClick: function () {
        this.setState({clicked: !this.state.clicked});
    },
    getInitialState: function () {
        return {
            clicked: false
        };
    }
});

const RunButton = React.createClass({
  mixins: [LayeredComponentMixin],
    success(e){
        this.props.success(this.props.identificator);
    },
    getDefaultProps(){
      return {
        runLabel: <i className="fa fa-times"></i>,
        extraCss: ''
      };
    },
    render: function() {
        return <button className={`btn ${this.props.extraCss} btn-sm btn-primary`} onClick={this.handleClick}>{this.props.runLabel}</button>;
    },
    renderLayer: function() {
        if (this.state.clicked)
        {
            if (this.state.validate)
            {
                this.success(true);
                return <span />;
            }
            else
                return <Modal title={this.props.title} message={this.props.message} success={this.success} close={this.handleClose} />
        } else {
            return <span />;
        }
    },
    // {{{
    handleClose: function() {
        this.setState({ clicked: false });
    },
  handleClick: function() {
    ProcessActions.validateAcceptions(this.props.hash);
    this.setState({
        clicked: !this.state.clicked,
        validate: this.props.getValidation()
    });
  },
  getInitialState: function() {
    ProcessActions.validateAcceptions(this.props.hash);
    return {
        clicked: false,
        validate: this.props.getValidation()
    };
  }
  // }}}
});

const ReassigningButton = React.createClass({
  mixins: [LayeredComponentMixin],
    success(){
      this.props.success();
    },
    allTasks(){
      this.props.allTasks();
    },
    getDefaultProps(){
      return {
        runLabel: <i className="fa fa-times"></i>,
        extraCss: ''
      };
    },
    render: function() {
        return (<button className="btn btn-success" onClick={this.handleClick}>{this.props.runLabel}</button>);
    },
    renderLayer: function() {
        if (this.state.clicked)
        {
            return <Modal title={this.props.title} message={this.props.message} allTasks={this.allTasks} success={this.success} close={this.handleClose}  withReassigning={true} />
        }
            return <span />;

    },
    // {{{
    handleClose: function() {
        this.setState({ clicked: false });
    },
  handleClick: function() {
    this.setState({ clicked: !this.state.clicked });
  },
  getInitialState: function() {
    return { clicked: false };
  }
  // }}}
});





const PermissionsBar = React.createClass({
    getDefaultProps() {
        return {
            editable: true,
            extra: undefined,
            object: undefined,
            setPublic: function(){},
            setSearchable: function(){},
            setForkable: function(){},
            showRun: true,
            showEdit: true,
        };
    },
    getInitialState(){
       return {
            public: this.props.public,
            searchable: this.props.searchable,
            forkable: this.props.forkable
        }
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    setPublic(e){
        this.setState({public: e.target.checked});
        this.props.setPublic(e);
    },
    setSearchable(e){
        this.setState({searchable: e.target.checked});
        this.props.setSearchable(e);
    },
    setForkable(e){
        this.setState({forkable: e.target.checked});
        this.props.setForkable(e);
    },
    setFork(e){
      console.log('FORK PERM')
      this.props.setFork();
    },
    renderPermissions(){
        return (<div className="form-group">
                  <div className="input-group">
                        <span className="input-group-addon" id="permissions">
                            <strong>Permissions</strong>
                        </span>
                        <div className="form-control">
                            <span className="selectBox">
                                <Toggle id="public"
                                    defaultChecked={this.props.public}
                                    onChange={this.setPublic} disabled={!this.props.editable} />
                                <span className="selectLabel">&nbsp;Public</span>
                            </span>
                          {/*
                          <span className="selectBox">
                              <Toggle id="searchable"
                                checked={this.props.searchable}
                                defaultChecked={this.props.searchable}
                                onChange={this.setSearchable} disabled={!this.props.editable} />
                              <span className="selectLabel">&nbsp;Searchable</span>
                          </span>
                          <span className="selectBox">
                              <Toggle id="public"
                                checked={this.props.forkable}
                                defaultChecked={this.props.forkable}
                                onChange={this.setForkable} disabled={!this.props.editable} />
                              <span className="selectLabel">&nbsp;Forkable</span>
                          </span>*/}
                        </div>

                </div>

                </div>);
    },
    delete(object){
      WorkflowActions.deleteWorkflow(object);

      this.context.router.transitionTo('home');
    },
    render(){
        let canedit = !this.props.editable && !this.props.runnable && !this.props.confirmable && this.props.showEdit;
        return (<span>
                {this.props.owner ?
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="study-title"><strong>Creator</strong></span>
                                <input type="text" className="form-control" defaultValue={this.props.owner} disabled={true} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        {this.renderPermissions()}
                    </div>
                </div>
                :
                this.renderPermissions()
                }

                    {!this.props.editable && !this.props.runnable && !this.props.confirmable && this.props.showEdit ?
                        <div style={{zIndex: 200, position: 'absolute', left: '15px', bottom: '-40px'}}>
                            <small><strong>Associated Processes: </strong> {this.props.listProcesses.length}</small>
                        </div>
                    :''}
                    <div  style={{width: '100%', textAlign: 'right', zIndex: 200, position: 'absolute', right: '15px', bottom: '-40px'}}>
                    <div className="btn btn-group">
                      {!this.props.runnable && !this.props.confirmable && !this.props.editable && this.props.showRun && this.props.forkable ?
                            <button style={{border: '1px solid #95a5a6'}} onClick={this.setFork} className="btn btn-sm btn-default">
                              <i className="fa fa-code-fork"></i> &nbsp;Duplicate
                            </button>
                      :''}
                      {!this.props.runnable && !this.props.confirmable && !this.props.editable && this.props.showRun?
                          <Link title="Configure study template as a study" className="btn btn-sm btn-primary" to={this.props.link}
                          params={{object: this.props.object, mode:'run'}}>
                          <i className="fa fa-play"></i>
                          </Link>
                      :''}
                      {canedit ?
                          <Link title="Edit this study template" className="btn btn-sm btn-warning" to={this.props.link}
                          params={{object: this.props.object, mode:'edit'}}>
                          <i className="fa fa-pencil"></i>
                          </Link>
                      :''}
                      {canedit ?
                          <DeleteButton title="Delete this study template"
                            success={this.delete}
                            identificator = {this.props.object}
                            deleteLabel={<span><i className="fa fa-times"></i></span>}
                            message={`Are you sure you want to delete '${this.props.title} ?'`}></DeleteButton>
                      :''}
                    </div>
                     &nbsp;{this.props.extra}
                    </div>
                </span>
        );
    }
});

const ProcessStatus = React.createClass({
  getDefaultProps(){
    label: false
  },
  translateStatus(status){
    let extra = 'circle';
    let label = '';
    switch(status){
      case 1:
        extra+=' circle-primary'; label='Running'; break;
      case 2:
        extra+=' circle-success'; label='Finished'; break;
      case 3:
        extra+=' circle-grey'; label='Canceled'; break;
      case 4:
        extra+=' circle-warning'; label='Overdue'; break;
      case 5:
        extra+=' circle-default'; label='Waiting'; break;
    }
    return <span><div className={extra}>&nbsp;</div> <label style={{verticalAlign: 'sub'}}>{this.props.label? ` ${label}`: ''}</label> </span>;
  },
  render: function(){
    const row = this.props.rowData;

    return <center>
            {this.translateStatus(row.status)}
           </center>;
  }
});

const ProcessLabel = React.createClass({
    render(){
        return <table className="process-label" align="right">
                    <tr>
                        <td><div className="circle circle-sm circle-default"></div></td>
                        <td><small>&nbsp;Waiting&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-primary"></div></td>
                        <td><small>&nbsp;Running&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-success"></div></td>
                        <td><small>&nbsp;Finished&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm circle-warning"></div></td>
                        <td><small>&nbsp;Overdue&nbsp;&nbsp;</small></td>
                        <td><div className="circle circle-sm"></div></td>
                        <td><small>&nbsp;Canceled&nbsp;&nbsp;</small></td>
                    </tr>
                    <div className="pull-right">
                        {this.props.links === undefined ? '' : this.props.links}
                    </div>
                </table>

    }
});

const ProcessDetailBar = React.createClass({
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
        console.log(this.props.numDaysAfter);
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

        return(<div>
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
                </div>
                {this.state.numDaysBefore != 0 || this.props.createProcess ?
                    <div className="row">
                        <div className="col-md-2"></div>
                        <div className="col-md-8">
                            <div className="form-group">
                                <div className="input-group">
                                    <span className="delay-notification input-group-addon"
                                          id="remainder-before"><strong>Remainder before deadline</strong></span>
                                    <Select placeholder="Nº of days"
                                            name="form-field-name"
                                            value={this.state.numDaysBefore}
                                            options={optionsBeforeDeadline}
                                            onChange={this.setNumDaysBefore}
                                            disabled={this.state.disabled}/>
                                </div>
                            </div>
                        </div>
                    </div> : ''}

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-group-addon" id="enddate"><strong>End Date</strong></span>
                                <input className="form-control" readOnly value={this.state.endDate}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4"></div>
                    {this.state.numDaysAfter == 0 ?
                        <div className="col-md-2">
                            <div className="form-group">
                                <div className="input-group">
                                    {!this.props.createProcess ?
                                        <ProcessStatus label="True" rowData={{status: this.state.status}}/> : ''}

                                </div>
                            </div>
                        </div> : ''}

                </div>

                {this.state.numDaysAfter != 0 || this.props.createProcess ?
                    <div>
                        <div className="row">
                            <div className="col-md-2"></div>
                            <div className="col-md-8">
                                <div className="form-group">
                                    <div className="input-group">
                                        <span className="delay-notification input-group-addon"
                                              id="remainder-after"><strong>Remainder after deadline every</strong></span>
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
                        </div>

                        <div className="row">
                            <div className="col-md-2"></div>
                            <div className="col-md-8">
                                <div className="form-group">
                                    <div className="input-group">
                                <span className="delay-notification input-group-addon"
                                      id="remainder-until"><strong>Repeat up to</strong></span>
                                        <DateTimePicker onChange={this.setNotificationsDeadline}
                                                        defaultValue={this.props.defaultDate}
                                                        format={"yyyy-MM-dd"}
                                                        time={false}
                                                        disabled={this.state.disabled}/>
                                    </div>
                                </div>
                            </div>
                            {!this.props.createProcess ?
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <ProcessStatus label="True" rowData={{status: this.state.status}}/>

                                        </div>
                                    </div>
                                </div> : ''}
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


export {Loading, Modal, DjangoCSRFToken, Label, DeleteButton, AcceptRejectButton, RunButton, ReassigningButton, PermissionsBar, ProcessStatus, Affix, ProcessLabel, ProcessDetailBar}


