'use strict';

import Reflux from 'reflux';

import React from 'react';
import {RouteHandler, Link} from 'react-router';
import Breadcrumbs from 'react-breadcrumbs';
import {Tab, UserDropdown} from './reusable/navigation.jsx';

import UserActions from '../actions/UserActions.jsx';
import UserStore from '../stores/UserStore.jsx';

import StateActions from '../actions/StateActions.jsx';
import StateStore from '../stores/StateStore.jsx';

import TransitionGroup from 'react/lib/ReactCSSTransitionGroup';

import {Modal, Affix} from './reusable/component.jsx';

const AlertQueue = React.createClass({
    mixins: [Reflux.listenTo(StateStore, 'update')],
    __getState(){
        return {
            alert: StateStore.getAlert()
        }
    },

    getInitialState() {
        return this.__getState();
    },
    update(status){
        this.setState(this.__getState());
    },
    handleClose(e){
        StateActions.dismissAlert();
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    askLoss(alert){

        let alert = this.state.alert;

        if(alert.onConfirm)
            alert.onConfirm(this.context.router);
    },
    render: function(){
        let alert = this.state.alert;
        if(!alert)
            return <span></span>

        if(alert.onConfirm){
            return <Modal overflow={alert.overflow} title={alert.title} message={alert.message}
                        close={this.handleClose} showConfirm={true} success={this.askLoss} />
        }

        return <Modal title={alert.title} message={alert.message} close={this.handleClose} showConfirm={false} />

    }
});

const LoadingBar = React.createClass({
    mixins: [Reflux.listenTo(StateStore, 'update'),
    Reflux.listenTo(StateStore, 'update')    ],
    __getState(){
      return {
        loading: StateStore.isLoading(),
        unsaved: StateStore.isUnsaved()
      }
    },
    getInitialState() {
      return this.__getState();
    },
    contextTypes: {
        router: React.PropTypes.func.isRequired
    },
    update(status){
      this.setState(this.__getState());
    },
    componentDidUpdate(){
      // react-breadcrumbs are automatic, so i have to force the url status as i see fit
      let ba = $('.breadcrumbs a.active');

      let self = this;
      let handler = function(e){
        e.preventDefault();
        let goFunc = ()=>{
            self.context.router.transitionTo(
                $(this).attr('href')
            );
        };

        if(StateStore.isUnsaved()){
            StateActions.alert(
            {
                'title':'Unsaved Data',
                'message': 'There is unsaved data. Are you sure you want to leave ? Unsaved data will be lost.',
                onConfirm: (context)=>{
                    // User confirmed he wants to lose data
                    StateActions.save(false);
                    StateActions.dismissAlert(false);

                    //window.location.replace(nextPath);
                    goFunc();
                }
            });
        } else {
            goFunc();
        }
      };

      ba.unbind('click');
      ba.bind('click', handler);
    },
    render(){
      return (
        <div className="col-md-2 pull-right loadingbar">
        {(this.state.loading)?<div className="pull-right">&nbsp;&nbsp;<i className="fa fa-2x fa-cog fa-spin"></i></div>:''}
        {(this.state.unsaved)?<div className="pull-right"><i className="fa fa-exclamation-triangle"></i> Not saved</div>:''}

        </div>
      );
    }
  });

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  displayName: "Home",
    mixins: [Reflux.listenTo(UserStore, 'update')],
    __getState: function(){
      return {
        user: UserStore.getDetail(),
        failed: UserStore.getDetailFailed()
      }
    },

    getInitialState() {
      return this.__getState();
    },
    clamp(){
        $('[data-clamp]').each(function () {
            var elem = $(this);
            var parentPanel = elem.data('clamp');

            var resizeFn = function () {
                var sideBarNavWidth = $(parentPanel).width() - parseInt(elem.css('paddingLeft')) - parseInt(elem.css('paddingRight')) - parseInt(elem.css('marginLeft')) - parseInt(elem.css('marginRight')) - parseInt(elem.css('borderLeftWidth')) - parseInt(elem.css('borderRightWidth'));
                elem.css('width', sideBarNavWidth);
            };

            resizeFn();
            $(window).resize(resizeFn);
        });
    },
    componentDidMount(){
      this.clamp();
    },
    componentDidUpdate(){
      this.clamp();
    },
    update(data){
        this.setState(this.__getState());
    },

    stringParams(){
      var qd = {};
      location.search.substr(1).split("&").forEach(function(item) {var k = item.split("=")[0], v = item.split("=")[1]; v = v && decodeURIComponent(v); (k in qd) ? qd[k].push(v) : qd[k] = [v]})
      return qd;
    },
    render(){
    var name = this.context.router.getCurrentPath();
    let headless = this.context.router.getCurrentParams().headless;
    return (
        <div>
          {headless == 'true' ?
          <header>
              <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container">
                    <div className="navbar-header">
                        <center className="navbar-brand" style={{color: 'white', fontSize: '12px'}}>Please fullfill the action, save and when you're satisfied just close this window.</center>
                    </div>
                </div>
              </nav>
          </header>
          :
          <header>
              <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container">
                  <!-- Brand and toggle get grouped for better mobile display -->
                  <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                      <span className="sr-only">Toggle navigation</span>
                      <span className="icon-bar"></span>
                      <span className="icon-bar"></span>
                      <span className="icon-bar"></span>
                    </button>
                    <Link className="navbar-brand boldit" to="home"><span className="navbar-prefix">Task</span><span className="navbar-suffix">a</span></Link>
                  </div>

                  <!-- Collect the nav links, forms, and other content for toggling -->
                  <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

                  {/*<form className="col-md-6 navbar-form navbar-left" role="search">
                              <div className="form-group">
                        <div className="input-group">
                          <input type="text" className="form-control" placeholder="Search for..."></input>
                          <span className="input-group-btn">
                            <button className="btn btn-default" type="button"><i className="fa fa-search"></i></button>
                          </span>
                        </div>
                      </div>

        </form>*/}
                    <UserDropdown url="api/account/me/" />

                  </div><!-- /.navbar-collapse -->
                </div><!-- /.container-fluid -->
              </nav>
          </header>
          }
    <div className="container">
            <AlertQueue />
            <Affix className={'breadbar'} >{/*offset={36} >*/}
              <div className="row" style={{position: 'absolute', left: '-9999px'}}>
                  <div className="col-md-10 pull-left">
                      <Breadcrumbs separator='' {...this.props} />
                  </div>
                  <LoadingBar />
              </div>
            </Affix>
            <RouteHandler key={name} headless={headless != undefined} {...this.props} />
          </div>
          <div className="container">
            <div className="row">
              <div className="widthreference col-md-12">
              </div>
            </div>
          </div>
          {headless == 'true' ? '':
          <footer style={{"position": "fixed;", "bottom": "0;", "z-index": "3000;"}}>
            <a href="http://www.ua.pt/">
            <img style={{"marginLeft":"20px"}} src="static/images/logo-ua2.png" />
            </a>
            <a href="http://emif.eu">
            <img style={{"marginLeft":"20px", "height": "30px"}} src="static/images/emif.png" />
            </a>
            <a href="http://www.efpia.eu">
            <img style={{"marginLeft":"20px"}} src="static/images/efpia-logo.png" />
            </a>
            <a href="http://europa.eu/">
            <img style={{"marginLeft":"20px"}}  src="static/images/eu-logo.png" />
            </a>
            <a href="http://www.imi.europa.eu/">
            <img style={{"marginLeft":"20px"}} src="static/images/imi-logo.png" />
            </a>

          </footer>
          }
        </div>
    );
  }
});
