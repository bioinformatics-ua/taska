'use strict';

import Router from 'react-router';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import {LayeredComponentMixin} from '../../mixins/component.jsx';

import Toggle from 'react-toggle';

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
      visible: true
    }
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
                          <div className="modal-body">
                            {this.props.message}
                          </div>
                          {this.props.showConfirm?
                          <div className="modal-footer">
                              <button type="button" onClick={this.props.close} className="btn btn-default" data-dismiss="modal">Cancel</button>
                              <button type="button" onClick={this.props.success} className="btn btn-primary">Ok</button>
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
                                    checked={this.props.public}
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
    render(){
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

                    {!this.props.editable && !this.props.runnable && this.props.showEdit ?
                        <div style={{zIndex: 200, position: 'absolute', left: '15px', bottom: '-40px'}}>
                            <small><strong>Associated Processes: </strong> {this.props.listProcesses.length}</small>
                        </div>
                    :''}
                    <div  style={{width: '100%', textAlign: 'right', zIndex: 200, position: 'absolute', right: '15px', bottom: '-40px'}}>
                    {!this.props.editable && !this.props.runnable && this.props.showEdit ?
                      <span>

                        {this.props.forkable ?
                          <button style={{marginRight: '7px'}} onClick={this.setFork} className="btn btn-default">
                            <i className="fa fa-code-fork"></i> &nbsp;Duplicate
                          </button>
                        :''}
                        <Link className="btn btn-warning" to={this.props.link}
                        params={{object: this.props.object, mode:'edit'}}>
                        <i className="fa fa-pencil"></i> &nbsp;Edit
                        </Link>
                        </span>
                    :''}
                     &nbsp;{this.props.extra}

                    &nbsp;{!this.props.runnable && !this.props.editable && this.props.showRun?
                        <Link className="btn btn-primary" to={this.props.link}
                        params={{object: this.props.object, mode:'run'}}>
                        <i className="fa fa-play"></i> &nbsp;Run
                        </Link>
                    :''}
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

export {Loading, Modal, DjangoCSRFToken, Label, DeleteButton, PermissionsBar, ProcessStatus, Affix}


