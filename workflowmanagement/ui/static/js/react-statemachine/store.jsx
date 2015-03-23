import Reflux from 'reflux';

import StateMachineActions from './actions.jsx';
import {StateMachine} from './classes.jsx';

const StateMachineStore = Reflux.createStore({
    listenables: [StateMachineActions],
    init() {
        this.__sm = new StateMachine();
        this.__title = undefined;
        this.__selected = undefined;
        this.__actionstack = [];
        this.__initial = this.__sm.clone();
        this.__final = this.__sm.clone();
        this.__timemachine = -1;
    },
    addHistory(){

        this.__actionstack.splice(0, this.__timemachine+1, this.__sm.clone());

        if(this.__actionstack.length > 20){
            this.__actionstack.pop();
        }

        this.__timemachine = -1;
        this.__final = null;

    },
    onUndo(){
        if(this.canUndo()){
            if(this.__timemachine === -1)
                this.__final = this.__sm.clone();

            this.__timemachine++;

            this.setTime();
        }
    },
    onRedo(){
        if(this.canRedo()){
            this.__timemachine--;

            this.setTime();
        }
    },
    setTime(){
        console.log('SET TIME TO '+ this.__timemachine);
        if(this.__timemachine === this.__actionstack.length)
            this.__sm = this.__initial;

        else if(this.__timemachine === -1)
            this.__sm = this.__final;
        else
            this.__sm = this.__actionstack[this.__timemachine];

        this.trigger();
    },
    canUndo(){
        return this.__timemachine < this.__actionstack.length-1;
    },
    canRedo(){
        return this.__timemachine > -1;
    },
    onCalibrate(sm, title=""){
        let refresh = false;
            if(this.__sm)
                refresh=true;

        this.__sm = sm;
        this.__title = title;
        this.__selected = undefined;
        this.__actionstack = [];

        this.__initial = sm.clone();

        if(refresh){
            this.trigger();
        }
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
        let type = this.__sm.getStateClass(type).Class;

        let new_state = this.__sm.stateFactory(level, type);

        this.addHistory();

        this.__sm.addState(new_state);

        this.trigger();
    },
    onMoveState(identificator, level){
        console.log(`Drop ${identificator} into level ${level}`);

        let e = this.__sm.getState(Number.parseInt(identificator));

        // There must be a state with the correct identifier, and its meaningless to move it to the same level as it already is
        if(e != undefined && e.getLevel()!=level){

            this.addHistory();

            this.__sm.moveState(e, level);
        }

        this.trigger();
    },
    onDeleteState(){
        console.log(`Delete state ${this.__selected}`);

        this.addHistory();

        this.__sm.deleteState(Number.parseInt(this.__selected));

        this.__selected = undefined;

        this.trigger();
    },
    onSetStateTitle(elem, new_title){
        let elem_obj = this.__sm.getState(elem);
        elem_obj.label(new_title);

        this.__selected = elem;

        this.trigger();
    },
    onDataChange(elem, field_dict){

        this.addHistory();

        this.__sm.dataChange(elem, field_dict);

        this.trigger();
    },
    onDeleteDependency(dependant, dependency){
        console.log(`Delete ${dependency} from ${dependant}`);
        this.addHistory();

        this.__sm.deleteDependency(dependant, dependency);

        this.trigger();
    },
    onAddDependency(elem1, elem2){

        let e1 = this.__sm.getState(elem1);
        let e2 = this.__sm.getState(elem2);


        if(e1 != undefined && e2 != undefined){
            this.addHistory();

            if(e1.getLevel() > e2.getLevel())
                this.__sm.addDependency(e1, e2);
            else if(e2.getLevel() > e1.getLevel())
                this.__sm.addDependency(e2, e1);
        }

        this.__sm.debug();
        this.trigger();
    },
    onSelect(selected){
        this.__selected = selected;

        this.trigger();
    },
    onClearSelect(selected){
        this.__selected = undefined;
        this.trigger();
    },
    onSetTitle(title){
        this.__title=title;

        this.trigger();
    },
    onInsertAbove(level){
        console.log(`Insert above ${level}`);

        this.addHistory();

        this.__sm.insertAbove(level);

        this.trigger();
    },
    onRemoveRow(){

        this.addHistory();

        this.__sm.removeDiscontinuities();

        this.trigger();
    }
});

export default StateMachineStore;
