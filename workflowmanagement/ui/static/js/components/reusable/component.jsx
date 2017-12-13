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
                                <button type="button" onClick={this.props.close} className="btn btn-default" data-dismiss="modal">{this.props.cancelButtonMessage ? this.props.cancelButtonMessage : 'Cancel'}</button>
                                <button type="button" onClick={this.props.success} className="btn btn-primary">{this.props.successButtonMessage ? this.props.successButtonMessage : 'Ok'}</button>
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

const LinkToCancelAssignees= React.createClass({
    mixins: [LayeredComponentMixin],
    success(e){
        this.props.success(this.props.user, this.props.dataCancel, true);
    },
    getDefaultProps(){
        return {};
    },
    render: function () {
        return <button className="btn btn-xs btn-link" data-assignee={this.props.user} data-cancel={this.props.dataCancel}
                  onClick={this.handleClick}>{this.props.label}</button>;
    },
    renderLayer: function () {
        let verification;
        try{
            verification = this.props.verificationFunc();
        }catch(err){
            verification = false;
        }
        if (this.state.clicked && verification) {
            return <Modal title={this.props.title} message={this.props.message} success={this.success}
                          close={this.handleClose} successButtonMessage={"Yes"} cancelButtonMessage={"No"}/>
        } else {
            if(this.state.clicked && !verification)
                this.props.success(this.props.user,this.props.dataCancel, false);
            return <span />;
        }
    },
    handleClose: function () {
        this.setState({clicked: false});
        this.props.success(this.props.user,this.props.dataCancel, false);
    },
    handleClick: function () {
        this.setState({clicked: !this.state.clicked});
    },
    getInitialState: function () {
        return {clicked: false};
    }
});

const CancelAssigneesButton = React.createClass({
    mixins: [LayeredComponentMixin],
    success(e){
        this.props.success();
    },
    getDefaultProps(){
        return {};
    },
    render: function () {
        return <button type="button" className="pull-right btn  btn-xs btn-success" onClick={this.handleClick}>
            <i className="fa fa-check"></i>
            <small> Finish Task</small>
        </button>;
    },
    renderLayer: function () {

        if (this.state.clicked) {
            return <Modal title={this.props.title} message={this.props.message} success={this.success}
                          close={this.handleClose} successButtonMessage={"Yes"} cancelButtonMessage={"No"}/>
        } else {
            return <span />;
        }
    },
    handleClose: function () {
        this.setState({clicked: false});
    },
    handleClick: function () {
        this.setState({clicked: !this.state.clicked});
    },
    getInitialState: function () {
        return {clicked: false};
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
    return <span><div className={extra}>&nbsp;</div> <label style={{verticalAlign: 'sub'}}>{this.props.label? ` ${label}`: ''}</label>  </span>;
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


export {Loading, Modal, DjangoCSRFToken, Label, DeleteButton, AcceptRejectButton, RunButton, ReassigningButton, ProcessStatus, Affix, ProcessLabel, LinkToCancelAssignees, CancelAssigneesButton}


