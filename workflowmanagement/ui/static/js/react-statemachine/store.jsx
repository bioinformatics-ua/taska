import Reflux from 'reflux';

import StateMachineActions from './actions.jsx';
import {StateMachine, State} from './classes.jsx';

const StateMachineStore = Reflux.createStore({
    listenables: [StateMachineActions],
    init() {
        this.__title = undefined;
        this.__sm = new StateMachine();
        let state1 = this.__sm.stateFactory(1);
        let state2 = this.__sm.stateFactory(2);
        let state3 = this.__sm.stateFactory(2);
        let state4 = this.__sm.stateFactory(3);

        this.__sm.addState(state1);
        this.__sm.addState(state2);
        this.__sm.addState(state3);
        this.__sm.addState(state4);

        this.__sm.addDependency(state2, state1);
        this.__sm.addDependency(state3, state1);
        this.__sm.addDependency(state4, state2);
        this.__sm.addDependency(state4, state3);

        this.__selected = undefined;
    },

    // getters
    getTitle(){
        return this.__title;
    },
    getStateMachine(){
        return this.__sm;
    },

    getSelected(){
        return this.__selected;
    },
    // Action handlers
    onAddState(type, level){
        console.log(`Add new state of type ${type} into level ${level}`);

        let new_state = this.__sm.stateFactory(level);

        this.__sm.addState(new_state);

        this.trigger();
    },
    onMoveState(identificator, level){
        console.log(`Drop ${identificator} into level ${level}`);

        this.trigger();
    },
    onDeleteState(){
        //console.log(`Delete state ${this.__selected}`);

        this.__sm.deleteState(this.__selected);

        this.__sm.debug();

        this.__selected = undefined;

        this.trigger();
    },
    onDrawDependency(){

        this.trigger();
    },
    onSelect(selected){
        this.__selected = Number.parseInt(selected);

        this.trigger();
    },
    onSetTitle(title){
        this.__title=title;

        this.trigger();
    }
});

export default StateMachineStore;
