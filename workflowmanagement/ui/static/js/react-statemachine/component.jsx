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
            selected: StateMachineStore.getSelected(),
            title: StateMachineStore.getTitle()
        }
    },
    getInitialState(){
        return this.getState();
    },
    update(data){
        this.setState(this.getState());
    },
    __initUI(){
        let self = this;

        $('.new-state').draggable(
            {
              containment: this.refs.chart.getDOMNode(),
              revert: "invalid",
              opacity: 0.7,
              helper: "clone"
            }
        );
        let states = $(this.refs.movable.getDOMNode()).find('.state-handler');

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

        let state_connectors = $(this.refs.movable.getDOMNode()).find('.connect-state');

        state_connectors.draggable(
            {
              containment: this.refs.statemachine.getDOMNode(),
              revert: "invalid",
              opacity: 0.01,
              helper: "clone",
              start: function(event) {

              },
              stop: function(event) {
                $('.temp_line').remove();
              },
              drag: function(event, ui) {
                $('.temp_line').remove();
                self.__tempLine(ui.offset, $(event.target));
              },
            }
        );


        $(this.refs.movable.getDOMNode()).find('.drop').droppable({
          accept: ".state-handler, .new-state",
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

        $(this.refs.movable.getDOMNode()).find('.state-handler').droppable({
          accept: ".connect-state",
          activeClass: "ui-state-default",
          hoverClass: "ui-state-hover",
          drop: function( event, ui ) {
            let elem1 = Number.parseInt(event.target.id);
            let elem2 = Number.parseInt($(ui.draggable).data('id'));

            self.addDependency(elem1, elem2);
          }
        });

        this.renderLines();
        $( window ).resize(data => {
            $('.state_line').remove();
            this.renderLines();
        });

        /*$(this.refs.statemachine.getDOMNode()).find('.destroy-state').click(
            function(){
                let ident = $(this).data('id');
                StateMachineActions.deleteState(ident);
            }
        );*/
    },
    componentWillMount(){
        StateMachineActions.setTitle(this.props.detail.Workflow.title);
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
        StateMachineActions.deleteState();
    },
    addDependency(elem1, elem2){
        StateMachineActions.addDependency(elem1, elem2);
    },
    select(event){
        StateMachineActions.select(event.currentTarget.id);
    },
    getLevels(){
        let getLevel = (level => {
            return level.map(state => {
                let state_handler_class = "state-handler btn btn-default";
                let state_class = "state";

                if (this.state.selected == state.getIdentificator()){
                    state_class = `${state_class} state-selected`;

                    state_handler_class = `${state_handler_class} state-handler-selected`;
                }

              return <div key={state.getIdentificator()} className={state_class}>
                        <div onClick={this.select} id={state.getIdentificator()} className={state_handler_class}>
                            {state.getIdentificator()}<br />
                            SimpleTask
                        </div>

                        <div className="state-options">
                            <button title="Click to delete this state" onClick={this.deleteState} data-id={state.getIdentificator()} className="btn btn-xs btn-danger destroy-state">
                                <i className="fa fa-1x fa-times"/>
                            </button>
                                <div data-id={state.getIdentificator()} title="Drag to create a dependency " className="connect-state">
                                <i className="fa fa-1x fa-circle"/>
                                </div>
                        </div>
                    </div>;
        });

        });

        let list = [];
        list.push(<div key="level0" className="well well-sm state-level text-center">
                        <div className="state-start">
                        <i className="fa fa-3x fa-circle"/>
                        </div>
                        <div data-level="0" className="btn btn-dotted drop">
                            <i className="fa fa-3x fa-plus"/>
                        </div>
                </div>
        );
        let levels = this.state.sm.getLevels();
        console.log(levels);
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
               console.log(this.state.sm.getNextLevel());
               list.push(
                <div key={`level${this.state.sm.getNextLevel()}`} className="well well-sm state-level text-center">
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
    __tempLine(pos, elem){
        let offset = elem.offset();
        let width = elem.width()/2;
        let height = elem.height()/2;

        $.line(
            {x:offset.left+width, y:offset.top+height},
            {x:pos.left, y:pos.top},
            {
                lineWidth: 5,
                className: 'temp_line'
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
    setTitle(event){
        StateMachineActions.setTitle(event.target.value);
    },
    render(){
        console.log('RENDER');
        let chart = this.getRepresentation();
        return (
          <div className="row">
          <div className="col-md-12">
                <div ref="statemachine" className="panel panel-default table-container">
                    <div className="panel-body table-row">
                        <div ref="taskbar" className="clearfix taskbar col-md-2 table-col">
                            <h3 className="task-type-title panel-title">Type of Tasks</h3>
                            <hr />
                            <div data-type="task.SimpleTask" className="task-type col-md-12 col-xs-4 btn btn-default new-state">
                            <i className="task-type-icon fa fa-2x fa-check"></i>&nbsp;
                             <span>Simple Task</span></div>
                        </div>
                        <div className="col-md-10 table-col">
                                <div className="row">
                              <div className="col-md-12">

                                    <div class="form-group">
                                        <input type="title" className="form-control"
                                        id="exampleInputEmail1" placeholder="Enter the workflow title" onChange={this.setTitle} value={this.state.title} />
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
