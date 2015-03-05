import Reflux from 'reflux';

import StateMachineActions from './actions.jsx';
import {StateMachine, State} from './classes.jsx';

const StateMachineStore = Reflux.createStore({
    listenables: [StateMachineActions],
    init() {
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
        //this.__sm.addDependency(state4, state1);

        this.__selected = undefined;
    },

    // getters and setters
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
    onDeleteState(identificator){
        console.log(`Delete state ${identificator}`);

        this.__sm.deleteState(identificator);

        this.__sm.debug();

        this.trigger();
    },
    onDrawDependency(){

        this.trigger();
    },
    onSelect(selected){
        this.__selected = selected;

        this.trigger();
    }
});

export default StateMachineStore;
