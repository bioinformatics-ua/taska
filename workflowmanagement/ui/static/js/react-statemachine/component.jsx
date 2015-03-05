import Reflux from 'reflux';
import React from 'react';

import {StateMachine} from './classes.jsx';
import StateMachineStore from './store.jsx';
import StateMachineActions from './actions.jsx';

import cline from '../vendor/jquery.domline';

const StateMachineComponent = React.createClass({
    mixins: [Reflux.listenTo(StateMachineStore, 'update')],
    getState(){
        return {
            sm: StateMachineStore.getStateMachine(),
            selected: StateMachineStore.getSelected()
        }
    },
    getInitialState(){
        return this.getState();
    },
    update(data){
        this.setState(this.getState());
    },
    __initUI(){

        $('.new-state').draggable(
            {
              containment: this.refs.chart.getDOMNode(),
              revert: "invalid",
              opacity: 0.7,
              helper: "clone"
            }
        );
        let states = $(this.refs.movable.getDOMNode()).find('.state');

        states.draggable(
            {
              containment: this.refs.statemachine.getDOMNode(),
              revert: "invalid",
              start: function(event) {
                let id = event.target.id;
                $(`[class^="${id}-"]`).hide();
                $('[class$="-'+id+' state_line"]').toggle();
              },
              stop: function(event) {
                let id = event.target.id;

                $(`[class^="${id}-"]`).toggle();
                $('[class$="-'+id+' state_line"]').toggle();

              }
            }
        );


        $(this.refs.movable.getDOMNode()).find('.drop').droppable({
          activeClass: "ui-state-default",
          hoverClass: "ui-state-hover",
          drop: function( event, ui ) {
            let level = $(event.target).data('level');
            console.log(ui.draggable.hasClass('new-state'));
            if(ui.draggable.hasClass('new-state')){
                StateMachineActions.addState(ui.draggable.data('type'), level);
            }
            StateMachineActions.moveState(ui.draggable.attr('id'), level)
          }
        });
        this.renderLines();
        $( window ).resize(data => {
            $('.state_line').remove();
            this.renderLines();
        });

        $(this.refs.statemachine.getDOMNode()).find('.destroy-state').click(
            function(){
                let ident = $(this).data('id');
                StateMachineActions.deleteState(ident);
            }
        );
    },
    componentDidMount(){
        this.__initUI();
    },
    componentWillUnmount(){
        $('.state_line').remove();
    },
    componentWillUpdate(){
        $('.state_line').remove();
    },
    componentDidUpdate(){
        this.__initUI();
    },
    saveWorkflow(){
        console.log('SAVED WORKFLOW');
    },
    deleteState(event){
        console.log('Delete state');
        console.log(event);
    },
    select(event){
        console.log('SELECT EVENT');
        StateMachineActions.select(event.currentTarget.id);
    },
    getLevels(){
        let getLevel = (level => {
            return level.map(state => {
                let state_class = "btn btn-default state";

                if (this.state.selected == state.getIdentificator())
                    state_class = `${state_class} state-selected`;

              return <div key={state.getIdentificator()} onClick={this.select} id={state.getIdentificator()} className={state_class}>
                        {state.getIdentificator()}<br />
                        SimpleTask

                        <div className="state-options">
                            <button title="Click to delete this state" data-id={state.getIdentificator()} className="btn btn-xs btn-danger destroy-state">
                                <i className="fa fa-1x fa-times"/>
                            </button>
                                <span title="Drag to create a dependency " className="connect-state"><i className="fa fa-1x fa-circle"/></span>
                        </div>
                    </div>;
        });

        });

        let list = [];
        list.push(<div key="level0" className="well well-sm state-level text-center">
                        <div id="start" className="state-start">
                        <i className="fa fa-3x fa-circle"/>
                        </div>
                </div>
        );
        let levels = this.state.sm.getLevels();
        for(var prop in levels){
            list.push(
                <div key={`level${prop}`} className="well well-sm state-level text-center">
                    {getLevel(levels[prop])}
                    <div data-level={`${prop}`} className="btn btn-dotted drop">
                        <i className="fa fa-3x fa-plus"/>
                    </div>
                </div>
            );
        }
               list.push(
                <div key="levelend" className="well well-sm state-level text-center">
                    <div data-level={this.state.sm.getNextLevel()} className="btn btn-dotted drop">
                        <i className="fa fa-3x fa-plus"/>
                    </div>
                </div>
            );
        return list;
    },
    __renderLine(elem1, elem2){
        let offset1 = elem1.offset();
        let offset2 = elem2.offset();
        let width1 = elem1.width()/2;
        let width2 = elem2.width()/2;
        let height1 = elem1.height()/2;
        let height2 = elem2.height()/2;

        $.line(
            {x:offset1.left+width1, y:offset1.top+height1},
            {x:offset2.left+width2, y:offset2.top+height2},
            {
                lineWidth: 5,
                className: `${elem1.attr('id')}-${elem2.attr('id')} state_line`
            });
    },

    renderLines(){
        for(let state of this.state.sm.getStates()){
            for(let dependency of state.__dependencies){
                this.__renderLine($(`#${state.getIdentificator()}`), $(`#${dependency.getIdentificator()}`));
            }
            if(state.getLevel() == 1)
                this.__renderLine($(`#${state.getIdentificator()}`), $('.state-start'))
        }
    },
    getRepresentation(){
        return (
            <div>
                {this.getLevels()}
            </div>
        );
    },
    render(){
        console.log('RENDER');
        let initial = this.props.detail.Workflow;
        let chart = this.getRepresentation();
        return (
          <div className="row">
          <div className="col-md-12">
                <div ref="statemachine" className="panel panel-default table-container">
                    <div className="panel-body table-row">
                        <div ref="taskbar" className="clearfix taskbar col-md-3 table-col">
                            <h3 className="task-type-title panel-title">Type of Tasks</h3>
                            <hr />
                            <div data-type="task.SimpleTask" className="task-type col-md-12 col-xs-4 btn btn-default new-state">
                            <i className="task-type-icon fa fa-2x fa-check"></i>&nbsp;
                             <span>Simple Task</span></div>
                        </div>
                        <div className="col-md-9 table-col">
                                <div className="row">
                              <div className="col-md-12">

                                    <div class="form-group">
                                        <input type="title" className="form-control"
                                        id="exampleInputEmail1" placeholder="Enter the workflow title" value={initial.title} />
                                      </div>
                                    <hr />
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-md-12">
                                    <div ref="chart" id="state_machine_chart">
                                        <div ref="movable">
                                            {chart}
                                        </div>
                                    </div>
                                </div>
                              </div>
                              <div className="row">
                              <div className="col-md-12">
                              <button onClick={this.saveWorkflow} className="btn btn-primary pull-right">Save Workflow</button>
                              </div>
                              </div>

                        </div>
                    </div>
                </div>
          </div>
          </div>
        );
    }
});

export default {StateMachineComponent}
