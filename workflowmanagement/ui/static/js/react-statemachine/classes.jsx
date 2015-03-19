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
        this.__level = options.level;
        this.__version = 0;
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
        let i = __getArrayPos(this.__dependencies, state);

        if(i == -1)
            this.__dependencies.push(state);
    }
    deleteDependency(dependency){
        let i = __getArrayPos(this.__dependencies, dependency);

        if(i != -1)
            this.__dependencies.splice(i, 1);
    }
    getLevel(){
        return this.__level;
    }
    setLevel(level){
        this.__level = level;
    }
    levelUp(){
        this.__version++;

        this.__level++;
    }
    levelDown(){
        this.__version++;

        this.__level--;
    }
    getVersion(){
        return this.__version;
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
    setDependencies(deps){
        this.__dependencies = deps;
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

class SimpleState extends State {
}

class StateMachine{
    constructor(){
        this.__internal_counter = 0;
        this.__states = [];
        this.__level = {};
        this.__nextLevel = 0;
    }

    stateFactory(level, state, data=undefined){
        this.__internal_counter++;

        console.log(state);

        return new state({
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
    deleteDependency(dependant, dependency){
        let i = __getArrayPos(this.__states, dependant);

        if(i != -1)
            this.__states[i].deleteDependency(dependency);

    }
    getState(identificator){
        let i = __getArrayPos(this.__states, identificator);

        if(i != -1)
            return this.__states[i];

        return undefined;

    }
    addToLevel(state){
        if(this.__level[state.getLevel()] === undefined)
            this.__level[state.getLevel()] = [state];
        else
            this.__level[state.getLevel()].push(state);
    }

    addState(new_state){
        let i = __getArrayPos(this.__states, new_state);
        if(i != -1){
            console.warn(`You tried to add a state (${new_state.toString()}) that already is on the state machine`);
            return false;
        }

        if(new_state.getLevel() == 0){
            this.levelUp();
            new_state.levelUp();
        }
        else if(this.__nextLevel <= new_state.getLevel()){
            this.__nextLevel = new_state.getLevel()+1;
        }
        this.addToLevel(new_state);
        this.__states.push(new_state);
        return true;
    }
    /* When we move a state from a level to another, besides changing the state level,
       we also have to change the dependencies, since a state can only depend upon
       states higher in the hierarchy then himself (this way we ensure its loop free)
    */
    moveState(moved_state, level){
        if(level == 0){
            this.levelUp();
            level++;
        }

        this.__level = {}
        for(let state of this.__states){
            if(state.equals(moved_state)){
                state.setLevel(level);

                let deps = state.getDependencies();
                let valid_deps = [];
                for(let i=0;i<deps.length;i++){
                    console.log(`IS ${deps[i].getLevel()} < ${level} ? ${deps[i].getLevel()<level }`);
                    if(deps[i].getLevel()<level)
                        valid_deps.push(deps[i]);
                }
                state.setDependencies(valid_deps);
            }
            else if(state.getLevel()<=level){
                let deps = state.getDependencies();

                for(let i=0;i<deps.length;i++){
                    if(deps[i].equals(moved_state)){
                        deps.splice(i,1);
                        continue;
                    }
                }

            }

            this.addToLevel(state);
        }

        if(level == this.getNextLevel())
            this.__nextLevel++;

        this.removeDiscontinuities();
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

        this.removeDiscontinuities();

        return false;
    }

    // This increases every single state one level on the hierarqy (useful if we want to prepend states to the state-machine)
    levelUp(start_level=0){
        this.__level =  {};
        for(let state of this.__states){
            if(state.getLevel() >= start_level)
                state.levelUp();
            this.addToLevel(state);
        }
        this.__nextLevel++;
    }

    // This decreases every single state one level on the hierarchy, starting at the level defined on start_level
    levelDown(start_level=0){
        this.__level =  {};
        for(let state of this.__states){

            if(state.getLevel() > start_level)
                state.levelDown();

            this.addToLevel(state);
        }
        this.__nextLevel--;
    }

    insertAbove(level){
        this.levelUp(level);

        this.__level[level] = [];
    }

    // when moving or deleting states, we could be creating a discontinuity in the level structure, when that happens we need to remove
    // this blank levels(because they have no semantic meaning)
    removeDiscontinuities(){
        console.log('REMOVE discontinuity cicle');
        let i = 1;
        let failed = false;

        // continuosly do passes while we catch discontinuities.
        // Teorically, we should never get more than one discontinuity, but tecnically they are possible
        for(var level in this.__level){
            if(level != i){
                this.levelDown(i);
                return this.removeDiscontinuities();
            }
            let this_level = this.__level[level];

            if(this_level.length == 0){
                this.levelDown(i);
                return this.removeDiscontinuities();
            }
            i++;
        }
    }

    debug(){
        console.log('STATES');
        console.log(this.__states);
        console.log('LEVEL HIERARQY');
        console.log(this.__level);
        console.log('NEXT_LEVEL');
        console.log(this.__nextLevel);
    }
}

export default {State, SimpleState, StateMachine}
