'use strict';
import Router from 'react-router';
import React from 'react';
import Toggle from 'react-toggle';


export default  React.createClass({
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
                          params={{object: this.props.object, mode:'prerun'}}>
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