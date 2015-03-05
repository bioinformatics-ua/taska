import React from 'react';

function __getArrayPos(array, object){
        let i = 0;
        for(let entry of array){
            if(entry.equals(object)){
                return i;
            }
            i++;
        }
        return -1;
}

class State{
    constructor(options){
        this.__identificator = options.identificator;
        this.__data = options.data;
        this.__dependencies = [];
        this.__level = options.level || 1;
    }
    equals(other){
        if(typeof other === 'number')
            return this.__identificator == other;

        return this.__identificator == other.__identificator;
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
    deleteState(){
        console.log(`Delete state ${this.__identificator}`)
    }

    removeDependency(identificator){
        let index = __getArrayPos(this.__dependencies, identificator);
        if(index != -1)
            this.__dependencies.splice(index, 1);
    }
}

class StateMachine{
    constructor(){
        this.__internal_counter = 0;
        this.__states = [];
        this.__level = {};
        this.__nextLevel = 0;
    }

    stateFactory(level, data=undefined){
        this.__internal_counter++;
        return new State({
            identificator: this.__internal_counter,
            level: level,
            data: data
        });
    }

    getLevels(){
        return this.__level;
    }
    getStates(){
        return this.__states;
    }
    getNextLevel(){
        return this.__nextLevel;
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

    deleteState(remove_identificator){
        let st_index = __getArrayPos(this.__states, remove_identificator);
        let removed_state = this.__states.splice(st_index,1);

        for(var level in this.__level){
            let this_level = this.__level[level];
            let lv_index = __getArrayPos(this_level, remove_identificator);

            if(lv_index != -1)
                this_level.splice(lv_index, 1);
        }

        for(let state of this.__states)
            state.removeDependency(remove_identificator);

        return false;
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

export default {State, StateMachine}
