'use strict';
import Reflux from 'reflux';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import HistoryActions from '../../actions/HistoryActions.jsx';
import DetailHistoryActions from '../../actions/DetailHistoryActions.jsx';

import HistoryStore from '../../stores/HistoryStore.jsx';

import DetailHistoryStore from '../../stores/DetailHistoryStore.jsx';

import Griddle from 'griddle-react';

import {Loading} from './component.jsx'

import {TableComponentMixin} from '../../mixins/component.jsx';

import moment from 'moment';

var HistoryItem = React.createClass({
  render: function(){
    function translateAction(entry){
      const ty = entry.object_type;
      let link;

      if(ty === 'ProcessTask'){
        let dts = entry.object.split('/');
        let ptlink = <Link to={dts[0]} params={{object: dts[1]}}>{entry.object_repr}</Link>;
        var text;
        switch(entry.event){
          case 'Add':
            text = `${entry.actor_repr} has assigned`;
            return <span>{text} {ptlink}</span>;
          default: return event;
        }
      }

      if(ty === 'User'){
        var text;
        switch(entry.event){
          case 'Add':
            text = `${entry.actor_repr} has registered.`;
            return <span>{text}</span>;
          case 'Edit':
            text = `${entry.actor_repr} has updated his preferences.`;
            return <span>{text}</span>;
          case 'Approve':
            text = `${entry.actor_repr} has approved ${entry.object_repr}.`;
            return <span>{text}</span>;
          default: return event;
        }
      }

      if(ty === 'NoneType')
        link = <span>{entry.object_repr}</span>;
      else
        link = <Link to={entry.object_type} params={entry}>{entry.object_repr}</Link>;

      var text;
      switch(entry.event){
        case 'Access':
          text = `${entry.actor_repr} has accessed`;
          return <span>{text} {link}</span>;
        case 'Add':
          text = `${entry.actor_repr} has added`;
          return <span>{text} {link}</span>;
        case 'Edit':
          text = `${entry.actor_repr} has made changes to`;
          return <span>{text} {link}</span>;
        case 'Delete':
          text = `${entry.actor_repr} has removed`;
          return <span>{text} <strong>{entry.object_repr}</strong></span>;
        case 'Cancel':
          text = `${entry.actor_repr} has canceled`;
          return <span>{text} <strong>{entry.object_repr}</strong></span>;
        case 'Done':
          text = `${entry.actor_repr} has finished`;
          return <span>{text} {link}</span>;

        case 'Recover':
          text = `${entry.actor_repr} has tried to recover his password.`;
          return <span>{text}</span>;

        case 'Comment':
          text = `${entry.actor_repr} has made comments on`;
          return <span>{text} {entry.object_repr}</span>;

        case 'Late':
          text = `${entry.actor_repr} is late on`;
          return <span>{text} {entry.object_repr}</span>;        

        default: return entry.event;
      }
    }
    return (
            <span>
              {translateAction(this.props.rowData)}
              <br />
              <small>On {moment(this.props.rowData.date).fromNow()}</small>
            </span>
      );
  }
});

var EventIcon = React.createClass({
  render: function(){
    function translateEvent(event){
      switch(event){
        case 'Access': return <i className="fa fa-folder-open thumb"></i>;
        case 'Add': return <i className="fa fa-plus thumb"></i>;
        case 'Edit': return <i className="fa fa-pencil thumb"></i>;
        case 'Delete': return <i className="fa fa-trash-o thumb"></i>;
        case 'Approve': return <i className="fa fa-thumbs-o-up thumb"></i>;
        case 'Done': return <i className="fa fa-cube thumb"></i>;
        case 'Comment': return <i className="fa fa-comment thumb"></i>;
        case 'Recover': return <i className="fa fa-medkit thumb"></i>;
        case 'Late': return <i className="fa fa-clock-o thumb"></i>;

        default: return event;
      }
    }
    return <span>
              {translateEvent(this.props.rowData.event)}
            </span>;
  }
});

const HistoryTable = React.createClass({
    getDefaultProps(){
        return {
            columns: [
                {
                "columnName": "object",
                "order": 1,
                "locked": false,
                "visible": true,
                "customComponent": HistoryItem
                },
                {
                "columnName": "event",
                "order": 2,
                "locked": false,
                "visible": true,
                "customComponent": EventIcon,
                "cssClassName": "event-td"
                }
            ],
            enableInfiniteScroll: true
        }
    },
    render(){
      return  <span><Griddle
                  noDataMessage={<center>No history to show.</center>}

                 {...this.props.commonTableSettings} enableInfiniteScroll={this.props.enableInfiniteScroll}
                showTableHeading={false} columns={["object", "event"]}
                columnMetadata={this.props.columns} />
              </span>;
    }
});


const GeneralHistoryTable = React.createClass({
    // This is requires by the mixin, to know where to throw the action on events, i realize
    // the best case scenario for a mixin is be independently detachable, but I couldnt find a way to guess
    // the action destiny without explicitly identifying it
    tableAction: HistoryActions.load,
    tableStore: HistoryStore,
    mixins: [Reflux.listenTo(HistoryStore, 'update'), TableComponentMixin],

    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
    render: function () {
      return  <div className="panel panel-default panel-overflow">
                <div className="panel-heading">
                  <center>
                    <i className="fa fa-history pull-left"></i>
                    <h3 className="panel-title"> History</h3>
                  </center>
                </div>
                <HistoryTable commonTableSettings={this.commonTableSettings()} />
              </div>;
  }
});

const DetailHistoryTable = React.createClass({
    // This is requires by the mixin, to know where to throw the action on events, i realize
    // the best case scenario for a mixin is be independently detachable, but I couldnt find a way to guess
    // the action destiny without explicitly identifying it
    tableAction: DetailHistoryActions.load,
    tableStore: DetailHistoryStore,
    mixins: [Reflux.listenTo(DetailHistoryStore, 'update'), TableComponentMixin],
    componentWillMount(){
        DetailHistoryActions.calibrate();
    },
    getInitialState: function() {
        return {};
    },
    update: function(data){
        this.setState(this.getState());
    },
    render: function () {
      return  <div>
                <HistoryTable commonTableSettings={this.commonTableSettings()} enableInfiniteScroll={false} />
              </div>;
  }
});

export default {HistoryTable, GeneralHistoryTable, DetailHistoryTable};
