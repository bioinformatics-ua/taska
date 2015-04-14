import Reflux from 'reflux';
import React from 'react';

import {StateMachine} from './classes.jsx';
import StateMachineStore from './store.jsx';
import StateMachineActions from './actions.jsx';

import hotkey from 'react-hotkey';
hotkey.activate();

import cline from '../vendor/jquery.domline';

    // preventing backspace to trigger going back in the browser
    // got the idea from http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
    $(document).keydown(function(e) {
        var doPrevent;
        if (e.keyCode == 8) {
            var d = e.srcElement || e.target;
            if (d.tagName.toUpperCase() == 'INPUT' || d.tagName.toUpperCase() == 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else
                doPrevent = true;
        } else if(e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
            e.preventDefault();
        }
        else
            doPrevent = false;

        if (doPrevent)
            e.preventDefault();
    });

let StateMachineComponent = React.createClass({
    mixins: [Reflux.listenTo(StateMachineStore, 'update'), hotkey.Mixin('handleHotkey')],
    getState(){
        return {
            sm: StateMachineStore.getStateMachine(),
            selected: StateMachineStore.getSelected(),
            title: StateMachineStore.getTitle(),
            canUndo: StateMachineStore.canUndo(),
            canRedo: StateMachineStore.canRedo()
        }
    },
    getInitialState(){
        StateMachineActions.calibrate(this.props.initialSm);
        StateMachineActions.setTitle(this.props.title);

        return this.getState();
    },
    componentWillMount(){
        console.log('MOUNT');
    },
    getDefaultProps() {
        return {
            editable: true
        };
    },
    update(data){
        this.setState(this.getState());
    },
    handleHotkey(e) {
        if(this.props.editable){
            e.stopPropagation();
            e.preventDefault();
            // receives a React Keyboard Event
            // http://facebook.github.io/react/docs/events.html#keyboard-events
            if(    e.keyCode === 8
                && e.target === document.body
                && this.state.selected
            ){
                let selection = this.state.selected.split('-');
                if(selection.length == 2)
                    this.deleteConnection(Number.parseInt(selection[0]), Number.parseInt(selection[1]))
                else if(selection.length == 1){
                    this.deleteState(selection[0]);
                }
                // else theres something wrong...
            } else if(
                e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
            ){

            }
        }
    },
    __initUI(){
        let self = this;

        if(this.props.editable){

        $('.new-state').draggable(
            {
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

        $(this.refs.movable.getDOMNode()).find('.drop').droppable({
          accept: function(elem){
            let _elem = $(elem);

            if(_elem.hasClass('state-handler') || _elem.hasClass('new-state')){
                if(_elem.data('level') != $(this).data('level'))
                    return true;
            }
            return false;
          },
          activeClass: "ui-state-default",
          hoverClass: "ui-state-hover",
          drop: function( event, ui ) {
            let level = $(event.target).data('level');

            if(ui.draggable.hasClass('new-state'))
                StateMachineActions.addState(ui.draggable.data('type'), level);
            else
                StateMachineActions.moveState(ui.draggable.attr('id'), level);

          }
        });

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
    }
        this.renderLines();
        $( window ).resize(data => {
            $('.state_line').remove();
            this.renderLines();
        });
        var cdit = $('.clickedit').css('visibility', 'hidden');
        if(this.props.editable){
            cdit
            .focusout(self.setStateTitle)
            .keyup(function (e) {
                if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
                    self.setStateTitle(e);
                    return false;
                } else {
                    return true;
                }
            })
            .prev().dblclick(function (event) {
                event.stopPropagation();

                $(this).css('visibility', 'hidden');
                let the_input = $(this).next();
                let text = the_input.val();
                the_input.val('');
                the_input.css('visibility', 'visible').focus();
                the_input.val(text);
            });
        }
    },
    killUI(){
        $('.ui-draggable').draggable( "destroy" );
        $('.ui-droppable').droppable( "destroy" );
        $('.state_line').remove();

        $('.clickedit').off();
    },
    componentDidMount(){
        this.__initUI();
    },
    componentWillUnmount(){
        console.log('UNMOUNT');
        this.killUI();
    },
    componentWillUpdate(){
        this.killUI();
    },
    componentDidUpdate(){
        this.__initUI();
    },
    saveWorkflow(){
        console.log('SAVED WORKFLOW');
        if(this.props.save)
            this.props.save(this.getState());
    },
    deleteState(event){
        StateMachineActions.deleteState();
    },
    deleteConnection(dependant, dependency){
        StateMachineActions.deleteDependency(dependant, dependency);
    },
    addDependency(elem1, elem2){
        StateMachineActions.addDependency(elem1, elem2);
    },
    select(event){
        event.stopPropagation();

        StateMachineActions.select(event.currentTarget.id);
    },
    editLabel(event){
        event.stopPropagation();
        console.log(`Edit label for ${event.currentTarget.parentNode.id}`);
    },
    cancel(event){
        event.stopPropagation();
    },
    clearSelect(event){
        event.stopPropagation();
        console.log('CLEAR SELECT');
        StateMachineActions.clearSelect();
    },
    insertAbove(event){
        event.stopPropagation();
        let level = $(event.target).parent().data('level');
        StateMachineActions.insertAbove(Number.parseInt(level));
    },
    removeRow(event){
        event.stopPropagation();

        StateMachineActions.removeRow();
    },
    setStateTitle(e){
        let input = $(e.target),
            label = input && input.prev();

        let new_title = input.val() === '' ? defaultText : input.val();

        label.text(new_title);

        input.css('visibility', 'hidden');
        label.css('visibility', 'visible');
        StateMachineActions.setStateTitle(Number.parseInt(e.target.parentNode.id), new_title);
    },
    dataChange(state, field_dict, refresh=true){
        StateMachineActions.dataChange(state, field_dict, refresh);
    },
    getLevels(){
        let getLevel = (level => {
            return level.map(state => {
                let state_handler_class = "state-handler btn btn-default form-group";
                let state_class = "state";

                if (this.state.selected == state.getIdentificator()){
                    state_class = `${state_class} state-selected`;

                    state_handler_class = `${state_handler_class} state-handler-selected`;
                }

                let stateOptions = this.props.editable? (
                        <div className="state-options">
                            <button title="Click to delete this state"
                            onClick={this.deleteState} data-id={state.getIdentificator()}
                            className="btn btn-xs btn-danger destroy-state">
                                <i className="fa fa-1x fa-times"/>
                            </button>
                                <div data-id={state.getIdentificator()} title="Drag to create a dependency " className="connect-state">
                                <i className="fa fa-1x fa-circle"/>
                                </div>
                        </div>
                ):'';
              return <div key={`i${state.getIdentificator()}_v${state.getVersion()}`} className={state_class}>
                        <div style={state.stateStyle()} onClick={this.select} data-level={state.getLevel()} id={state.getIdentificator()} className={state_handler_class}>
                            <label onClick={this.cancel}>{state.label()}</label>
                            <input type="text" className="clickedit form-control" defaultValue={state.label()} ></input>
                            <div>
                                <div className="pull-right">
                                    <small>{state.type()}</small>
                                </div>
                            </div>
                        </div>
                        {stateOptions}
                    </div>;
        });

        });

        let list = [];
        let initial_state = (this.state.sm.getNextLevel() == 1)? 'initial_state': '';

        let drop = (prop, initial_state='') => {

            let state_list = this.state.sm.getStateClasses().map(
                (stclass) => {
                    return  <li key={stclass.id}>
                                <a onClick={(event) => StateMachineActions.addState(stclass.id, prop)}>
                                    {stclass.Class.typeIcon()} {stclass.Class.repr()}
                                </a>
                            </li>;
                }
            );

            return this.props.editable? (

                <div className="btn-group taskaddgroup">
                    <div title="Drop tasks to add/move them here." data-level={`${prop}`}
                    className={`btn btn-dotted drop dropdown-toggle ${initial_state}`} data-toggle="dropdown" aria-expanded="false">
                        <i className="fa fa-3x fa-plus"/>
                    </div>
                    <ul className="dropdown-menu" role="menu">
                        {state_list}
                    </ul>
                </div>
            ):'';
        };
        list.push(<div key="level0" onDoubleClick={this.clearSelect} className="well well-sm state-level no-select text-center">
                        <div title="Origin of study Workflow diagram" className="state-start">
                        <i className="fa fa-3x fa-circle"/>
                        </div>
                        {drop(0,initial_state)}
            </div>
        );
        let levels = this.state.sm.getLevels();

        let delete_row = (level => {

            return level.length == 0 ?<button onClick={this.removeRow} className="pull-right btn btn-xs btn-link">Delete row</button>:'';
        });

        let insertAbove = prop => {
            return this.props.editable ? (
                <div onClick={this.insertAbove} data-level={prop} className="level-separator-container">
                    <div className="level-separator"></div>
                    <small className="level-label">Click line to add row here.</small>
                </div>
            ):'';
        };

        for(var prop in levels){
            list.push(
                <div key={`level${prop}`} onDoubleClick={this.clearSelect} className="well well-sm state-level no-select text-center">

                    {insertAbove(prop)}

                    {getLevel(levels[prop])}

                    {drop(prop)}

                    {delete_row(levels[prop])}

                </div>
            );
        }
        if(this.state.sm.getNextLevel() > 1)
            list.push(
                <div key={`level${this.state.sm.getNextLevel()}`} onClick={this.clearSelect}  className="well well-sm state-level no-select text-center">

                    {drop(this.state.sm.getNextLevel())}
                </div>
            );
        return list;
    },
    __renderLine(elem1, elem2, variate=true){

        let offset1 = elem1.offset();
        let offset2 = elem2.offset();
        let width1 = elem1.outerWidth()/2;
        let width2 = elem2.outerWidth()/2;
        let height1 = elem1.outerHeight()/2;
        let height2 = elem2.outerHeight()/2;

        let maximum_referential = ($('#state_machine_chart').width()/2);
        //console.log(`Maximum Referential ${maximum_referential}`);
        let referential_zero = offset1.left+width1;
        //console.log(`Referential zero ${referential_zero}`);
        let relative_ref = Math.round((offset2.left+width2)-referential_zero);
        //console.log(`Relative referencial ${relative_ref}`);
        let horizontal_variation = width1+((relative_ref * (width1)) / maximum_referential);
        //console.log(`Horizontal_variation ${horizontal_variation}`);

        let conn = `${elem1.attr('id')}-${elem2.attr('id')}`;

        let selected = (this.state.selected == conn)? 'state_line_selected': '';

        // Altough we represent level 0 relations(in relation to start point), they dont actually exist, so can't be deleted
        let exists = elem2.attr('id') != undefined;

        $.line(
            {x:Math.round(offset1.left+horizontal_variation), y:offset1.top-4},
            {x:Math.round(offset2.left+width2), y:offset2.top+height2},
            {
                lineWidth: 5,
                className: `${conn} state_line ${selected}`,
                title: (exists)? `${elem1.attr('id')} depends upon ${elem2.attr('id')} `: undefined,
                id: (exists)? `${conn}`: undefined,
                extraHtml: (exists && this.props.editable)? `
                    <div class="line-options">
                        <button title="Click to delete this line" data-id="${conn}" class="btn btn-xs btn-danger destroy-connection">
                                <i class="fa fa-1x fa-times"></i>
                        </button>
                    </div>
                `: undefined
            });
    },
    __tempLine(pos, elem){
        let offset = elem.offset();
        let width = elem.outerWidth()/2;
        let height = elem.outerHeight()/2;

        $.line(
            {x:offset.left+width, y:offset.top+height},
            {x:pos.left, y:pos.top},
            {
                lineWidth: 5,
                className: 'temp_line'
            });
    },
    renderLines(){
        let self = this;

        for(let state of this.state.sm.getStates()){
            for(let dependency of state.__dependencies){
                this.__renderLine($(`#${state.getIdentificator()}`), $(`#${dependency.getIdentificator()}`));
            }
            if(state.getLevel() == 1)
                this.__renderLine($(`#${state.getIdentificator()}`), $('.state-start'))
        }

        $('.state_line').click(event =>{
            this.select(event);
        });

        $('.state_line .destroy-connection').click(function(event){
            event.stopPropagation();

            let conn = $(this).data('id').split('-');
            if(conn.length == 2)
                self.deleteConnection(Number.parseInt(conn[0]), Number.parseInt(conn[1]));
            else
                console.error('Invalid connection state');

        });
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
    undo(e){
        StateMachineActions.undo();
    },
    redo(e){
        StateMachineActions.redo();
    },
    render(){
        let chart = this.getRepresentation();

        let state_list = this.state.sm.getStateClasses().map(
            (stclass) => {
                return  <div key={stclass.id} data-type={stclass.id}
                className="task-type col-md-12 col-xs-4 btn btn-default btn-block new-state">
                            {stclass.Class.typeIcon()} {stclass.Class.repr()}
                        </div>;
            }
        );

        const state_detail = (editable) => {
            if(this.state.selected){
                let DRender = this.state.sm.detailRender(Number.parseInt(this.state.selected), editable);

                return <span><DRender
                deleteConnection={this.deleteConnection}
                addDependency={this.addDependency}
                dataChange={this.dataChange} {...this.props}/></span>;
            }

            return <center>Please select a state to see his data options.</center>;
        };

        return (
          <div className="react-statemachine row">
          <div className="col-md-12 no-select">
                <div style={{width: '100%'}} ref="statemachine" className="panel panel-default table-container">
                    <div className="panel-body table-row">
                        {this.props.editable ?
                        <div ref="taskbar" className="clearfix taskbar col-md-2 table-col">
                            <h3 className="task-type-title panel-title">Type of Tasks</h3>
                            <hr />
                            {state_list}

                        </div>
                        :''}
                        <div className={this.props.editable?"col-md-10 table-col no-select":"col-md-12 table-col no-select"}>
                                <div className="row">
                              <div className="col-md-12">
                                    <div className="form-group">
                                        <div className="input-group">
                                          <span className="input-group-addon" id="study-title"><strong>Study Title</strong></span>
                                          <input type="title" className="form-control"
                                            id="exampleInputEmail1" aria-describedby="study-title"
                                            placeholder="Enter the workflow title"
                                            onChange={this.setTitle} value={this.state.title}
                                            disabled={!this.props.editable} />
                                        </div>
                                    </div>
                                    {this.props.extra}
                                    <hr />
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-md-12">
                            {this.props.savebar?
                            <span>
                                <div className="pull-left btn-group" role="group">
                                    <button className="btn btn-default" onClick={this.undo} disabled={!this.state.canUndo}>
                                        <i title="Undo action" className="fa fa-undo"></i>
                                    </button>
                                    <button className="btn btn-default" onClick={this.redo} disabled={!this.state.canRedo}>
                                        <i title="Redo action" className="fa fa-repeat"></i>
                                    </button>
                                </div>

                                <button onClick={this.saveWorkflow} className="btn btn-primary savestate">
                                    {this.props.saveLabel}
                                </button>
                                </span>
                            :''}
                                    <div ref="chart" id="state_machine_chart">
                                        <div ref="movable">
                                            {chart}
                                        </div>
                                    </div>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-md-12">
                                    <div className="panel panel-default">
                                      <div className="panel-body">
                                        {state_detail(this.props.editable)}
                                      </div>
                                    </div>
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
