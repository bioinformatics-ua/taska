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
        this.__detailVisible = false;
        this.__detailExtended = false;
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
        if(this.__timemachine === this.__actionstack.length)
            this.__sm = this.__initial;

        else if(this.__timemachine === -1)
            this.__sm = this.__final;
        else
            this.__sm = this.__actionstack[this.__timemachine];

        this.trigger(true);
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
    getDetailVisible(){
        return this.__detailVisible;
    },
    getDetailExtended(){
        return this.__detailExtended;
    },
    hasNext(){
        if(this.__selected){
            let selected = Number.parseInt(this.__selected);

            if(selected && !isNaN(selected)){
                let state = this.__sm.getState(selected);

                return this.__sm.getNext(state) != undefined;
            }

        }
    },
    hasPrevious(){
        if(this.__selected){
            let selected = Number.parseInt(this.__selected);

            if(selected && !isNaN(selected)){
                let state = this.__sm.getState(selected);
                return this.__sm.getPrevious(state) != undefined;
            }

        }
    },
    getNext(){
        if(this.__selected){
            let selected = Number.parseInt(this.__selected);

            if(selected && !isNaN(selected)){
                let state = this.__sm.getState(selected);

                this.__selected=''+this.__sm.getNext(state).getIdentificator();

                this.trigger();
            }

        }
    },
    getPrevious(){
        if(this.__selected){
            let selected = Number.parseInt(this.__selected);
            console.log(selected);
            if(selected && !isNaN(selected)){
                let state = this.__sm.getState(selected);

                this.__selected=''+this.__sm.getPrevious(state).getIdentificator();
                this.trigger();
            }

        }
    },
    // Action handlers
    onAddState(type, level){
        console.log(`Add new state of type ${type} into level ${level}`);
        let type = this.__sm.getStateClass(type);

        let new_state = this.__sm.stateFactory(level, type.Class, {type: type.id, name: this.__sm.nextFreeName()});

        this.addHistory();

        this.__sm.addState(new_state);

        this.trigger(true);
    },
    onMoveState(identificator, level){
        console.log(`Drop ${identificator} into level ${level}`);

        let e = this.__sm.getState(Number.parseInt(identificator));

        // There must be a state with the correct identifier, and its meaningless to move it to the same level as it already is
        if(e != undefined && e.getLevel()!=level){

            this.addHistory();

            this.__sm.moveState(e, level);
        }

        this.trigger(true);
    },
    onDeleteState(){
        console.log(`Delete state ${this.__selected}`);

        this.addHistory();

        this.__sm.deleteState(Number.parseInt(this.__selected));

        this.__selected = undefined;

        this.trigger(true);
    },
    onDuplicateState(){
        console.log(`Duplicate state ${this.__selected}`);
        let e = this.__sm.getState(Number.parseInt(this.__selected));

        let type = this.__sm.getStateClass(e.getData().type);

        let new_state = this.__sm.stateFactory(e.getLevel(), type.Class, $.extend({}, e.getData()));
        new_state.getData().name= new_state.getData().name+' (Copy)';
        try {
            delete new_state.getData().hash;
        } catch(ex){};

        this.addHistory();

        this.__sm.addState(new_state);

        this.trigger(true);
    },
    onSetStateTitle(elem, new_title){
        let elem_obj = this.__sm.getState(elem);
        elem_obj.label(new_title);

        this.__selected = elem;

        this.trigger(true);
    },
    onSetDetailVisible(visible, selected=this.__selected){
        this.__detailVisible = visible;
        this.__selected = selected;

        this.trigger();
    },
    onSetDetailExtended(extended){
        this.__detailExtended = extended;

        this.trigger();
    },
    onDataChange(elem, field_dict, refresh=true){

        this.addHistory();

        this.__sm.dataChange(elem, field_dict);

        if(refresh)
            this.trigger(true);
    },
    onDeleteDependency(dependant, dependency){
        console.log(`Delete ${dependency} from ${dependant}`);
        this.addHistory();

        this.__sm.deleteDependency(dependant, dependency);

        this.trigger(true);
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
        this.trigger(true);
    },
    onSelect(selected){
        this.__selected = selected;

        this.trigger();
    },
    onSelectFirst(){
        let first = this.__sm.selectFirst();
        if(first)
            this.__selected = first.getIdentificator();

        this.trigger();
    },
    onClearSelect(selected){
        this.__selected = undefined;
        this.trigger();
    },
    onSetTitle(title){
        this.__title=title;

        this.trigger(true);
    },
    onInsertAbove(level){

        this.addHistory();

        this.__sm.insertAbove(level);

        this.trigger(true);
    },
    onRemoveRow(){

        this.addHistory();

        this.__sm.removeDiscontinuities();

        this.trigger(true);
    },
    onForceUpdate(){
        this.trigger();
    }
});

export default StateMachineStore;
