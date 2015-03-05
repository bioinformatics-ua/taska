import React from 'react';
import cline from '../../vendor/jquery.domline'
class State{
    constructor(options){
        this.__identificator = options.identificator;
        this.__data = options.data;
        this.__dependencies = [];
        this.__level = options.level || 1;
    }
    equals(other){
        return this.__identificator === other.__identificator;
    }
    toString(){
        return `<State: ${this.__identificator}>`;
    }
    addDependency(state){
        this.__dependencies.push(state);
    }
    getLevel(){
        return this.__level;
    }
    getIdentificator(){
        return this.__identificator;
    }
    getData(){
        return this.__getData;
    }
    getDependencies(){
        return this.__dependencies;
    }
}

class StateMachine{
    constructor(){
        this.__states = [];
        this.__level = {};
        this.__nextLevel = 0;
    }

    addDependency(dependant, dependency){
        for(let state of this.__states){
            if(state.equals(dependant)){
                state.addDependency(dependency);
            }
        }
    }
    addToLevel(state){
        if(this.__level[state.getLevel()] === undefined)
            this.__level[state.getLevel()] = [state];
        else
            this.__level[state.getLevel()].push(state);
    }

    addState(new_state){
        for(let state of this.__states){
            if(state.equals(new_state)){
                console.warn(`You tried to add a state (${new_state.toString()}) that already is on the state machine`);
                return false;
            }
        }
        if(this.__nextLevel <= new_state.getLevel()){
            this.__nextLevel = new_state.getLevel()+1;
        }
        this.addToLevel(new_state);
        this.__states.push(new_state);
        return true;
    }
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
    }

    renderLines(){
        for(let state of this.__states){
            for(let dependency of state.__dependencies){
                this.__renderLine($(`#${state.getIdentificator()}`), $(`#${dependency.getIdentificator()}`));
            }
            if(state.getLevel() == 1)
                this.__renderLine($(`#${state.getIdentificator()}`), $('.state-start'))
        }
    }

    getLevels(){
        let getLevel = function(level){
            return level.map(state => {
              return <div id={state.getIdentificator()} className="btn btn-default state">
                        <input type="text" placeholder={state.getIdentificator()} value=""/><br />
                        Simple Task
                    </div>;
        });

        };
        let list = [];
        list.push(<div className="well well-sm state-level text-center">
                        <div id="start" className="state-start">
                        <i className="fa fa-3x fa-circle"/>
                        </div>
                </div>
        );
        for(var prop in this.__level){
            list.push(
                <div className="well well-sm state-level text-center">
                    {getLevel(this.__level[prop])}
                    <div className="btn btn-dotted drop">
                        <i className="fa fa-3x fa-plus"/>
                    </div>
                </div>
            );
        }
               list.push(
                <div className="well well-sm state-level text-center">
                    <div className="btn btn-dotted drop">
                        <i className="fa fa-3x fa-plus"/>
                    </div>
                </div>
            );
        return list;
    }
    getRepresentation(){
        return (
            <div>
                {this.getLevels()}
            </div>
        );
    }

    debug(){
        console.log('STATES');
        console.log(this.__states);
        console.log('LEVEL HIERARQUY');
        console.log(this.__level);
        console.log('NEXT_LEVEL');
        console.log(this.__nextLevel);
    }
}

const StateMachineComponent = React.createClass({
    getInitialState(){
        let sm = new StateMachine();
        let state1 = new State({
            'identificator': 1,
            'level': 1
        });
        let state2 = new State({
            'identificator': 2,
            'level': 2
        });
        let state3 = new State({
            'identificator': 3,
            'level': 2
        });
        let state4 = new State({
            'identificator': 4,
            'level': 3
        })
        sm.addState(state1);
        sm.addState(state2);
        sm.addState(state3);
        sm.addState(state4);

        sm.addDependency(state2, state1);
        sm.addDependency(state3, state1);
        sm.addDependency(state4, state2);
        sm.addDependency(state4, state3);

        //sm.debug();
        this.setState({
            state: sm
        });

        return {
            sm: sm
        }
    },
    componentDidMount(){
        $('.new-state').draggable(
            {
              containment: this.refs.chart.getDOMNode(),
              revert: "invalid",
              opacity: 0.7,
              helper: "clone"
            }
        );
        $(this.refs.movable.getDOMNode()).find('.state').draggable(
            {
              containment: this.refs.chart.getDOMNode(),
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
            $( this )
              .addClass( "ui-state-highlight" )
              .find( "p" )
                .html( "Dropped!" );
          }
        });
        this.state.sm.renderLines();
        $( window ).resize(data => {
            $('.state_line').remove();
            this.state.sm.renderLines();
        });
    },
    render(){
        console.log(this.state.sm);
        let chart = this.state.sm.getRepresentation();
        return (
            <div ref="chart" id="state_machine_chart">
                <div ref="movable">
                    {chart}
                </div>
            </div>
        );
    }
});

export default {StateMachineComponent}
