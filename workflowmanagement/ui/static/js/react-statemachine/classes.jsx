import React from 'react';

const dummy = React.createClass({render(){return <span></span>; }});

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
        this.__data = options.data || {};
        this.__dependencies = [];
        this.__level = Number.parseInt(options.level);
        this.__version = options.version || 0;
        this.__container = options.container;
    }

    clone(state_map, container){
        // we need a state map because dependencies have to point to the new copies
        // i presume data is a flat basic type structure so only shallow cloning
        // if the children of state are complex, a proper clone override must be implemented
        let sc= Object.assign({ __proto__: this.__proto__ }, this);
        /*let sc = Object.create(Object.getPrototypeOf(this)).constructor(
            {
                    identificator: this.__identificator,
                    level: this.__level,
                    version: this.__version,
                    container: this.__container,
                    data: $.extend(true, {}, this.__data)
            }
        );*/

        // trickiest are data and dependencies
        sc.__dependencies = [];
        for(let dep of this.__dependencies)
            sc.__dependencies.push(state_map[dep.getIdentificator()]);

        return sc;
    }

    label(new_label=undefined){

        if(new_label){
            this.__data['name'] = new_label;
            //this.__version++;
            return true;
        }
        // else is a reading
        let name = this.__data['name'] || this.__container.nextFreeName();

        return name;
    }

    type(){
        return (<span>{this.__proto__.constructor.typeIcon()} {this.__proto__.constructor.repr()}</span>);
    }

    stateStyle(){
        return {};
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
        return this.__data;
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

    getName(){
        return this.__data['name'] || 'Unnamed';
    }

    dataChange(field_dict){
        this.__data = $.extend(this.__data, field_dict);
    }

    detailRender(editable=true, ChildComponent=dummy){
        var self = this;

        return React.createClass({
            getInitialState() {
                return self.__data;
            },
            setTitle(e){
                this.setState({name: e.target.value});
                this.props.dataChange(self.getIdentificator(), {name: e.target.value}, false);
            },
            addDependency(e){
                this.props.addDependency(
                    self.getIdentificator(),
                    Number.parseInt($(e.target).data('id'))
                );
            },
            deleteConnection(e){
                this.props.deleteConnection(
                    self.getIdentificator(), Number.parseInt($(e.target).data('id'))
                );
            },
            componentWillMount(){
            },
            componentWillUnmount(){
                // keep safe in case something did not trigger datachange properly
                // cant do this because it messes data state from children (dont know why :( )
                //this.props.dataChange(self.getIdentificator(), this.state, false);
            },
            render(){
                let dependencies = self.getDependencies().map((dependency) => {
                    return <span key={dependency.getIdentificator()}
                    className="state-dep-label label state-dep-label label-default">
                        {dependency.label()}
                        &nbsp;&nbsp;
                        {editable?
                        <i data-id={dependency.getIdentificator()}
                        onClick={this.deleteConnection} className="fa fa-times"></i>
                        :''}
                        </span>
                });

                const possible_newdeps = [],
                      abovestates = self.__container.getStates(self.getLevel());

                for(let state of abovestates){
                    if(__getArrayPos(self.getDependencies(), state) === -1)
                        possible_newdeps.push(state);
                }
                if(editable){
                    const possibledropdown = possible_newdeps.map(
                            (state) => {
                                return <li key={state.getIdentificator()}>
                                    <a className="point" data-id={state.getIdentificator()} onClick={this.addDependency}>{state.label()}</a>
                                    </li>;
                            }
                    );

                    if(possibledropdown.length > 0)
                        dependencies.push(
                                <div className="btn-group dropup">
                                  <span type="button" className="point label state-dep-label label-success dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                    Add dependency <span className="caret"></span>
                                    <span className="sr-only">Toggle Dropdown</span>
                                  </span>

                                  <ul className="dropdown-menu dropdown-menu-right" role="menu">
                                    {possibledropdown}
                                  </ul>
                                </div>
                            );
                }

                return (
                <span id="detailview">
                    <div key="state-name" className="form-group">
                        <label for="state-title">Task Name <i title="This field is mandatory" className=" text-danger fa fa-asterisk" /></label>
                        <input type="title" className="form-control"
                                        aria-describedby="state-title"
                                        placeholder="Enter the state name"
                                        onChange={this.setTitle} value={this.state.name} disabled={!editable} />
                    </div>
                    <div key="state-deps" className="form-group">
                        <label for="state-dependencies">Dependencies</label>
                            <div id="state-dependencies" aria-describedby="study-deps">
                             {dependencies.length === 0?
                                "There are no possible dependencies for this task.": dependencies}
                            </div>
                    </div>
                    <ChildComponent dataChange={this.props.dataChange} main={this} />
                </span>
                );
            }
        });
    }

    detailProcess(data){
        return false;
    }

    static typeIcon(){
        return <i></i>;
    }
    static title(){
        return 'Title';
    }
    static repr(){
        return 'Task';
    }
    static deserializeOptions(data){
        if(data.name === undefined)
            throw `data object must have at least a name property to be possible to deserialize it,
                    if it does not, a custom deserialize override method should be implemented in a
                    class that inherits from State or SimpleState`;

        return {name: data.name};
    }

    serialize(){
        let deps = [];
        for(let dep of this.getDependencies()){
            deps.push({
                id: dep.getIdentificator()
            });
        }

        return {
            id: this.__identificator,
            name: this.getData().name,
            dependencies: deps
        }
    }
    is_valid(){
        let data = this.getData();
        return data.name != undefined;
    }
}

class SimpleState extends State {
    constructor(options){
        super(options);
    }
    static typeIcon(){
        return <i className="fa fa-plus"></i>;
    }
    static repr(){
        return 'Simple State';
    }
    static title(){
        return 'Simple unit';
    }
}

class StateMachine{
    constructor(){
        this.__internal_counter = 0;
        this.__states = [];
        this.__level = {};
        this.__nextLevel = 1;
        this.__stateclasses = [];
    }


    selectFirst(){
        console.log(this.__level);
        try {
            return this.__level[1][0];
        } catch(err){
            // noething
        }
        return undefined;

    }

    nextFreeName(){
        let base = name = 'Unnamed';
        let i=0;
        while(this.__nameExists(name)){
            i++;
            name = `${base} ${i}`;
        }

        return name;
    }
    __nameExists(name){
        for(let state of this.__states){
            if(state.label() === name){
                return state;
            }
        }

        return false;
    }
    clone(){
        let sm = new StateMachine();

        sm.__internal_counter = this.__internal_counter;
        sm.__nextLevel = this.__nextLevel;
        sm.__stateclasses = this.__stateclasses;

        // It's very very tricky to clone this, because states reference each other
        // So we also must change the dependencies...
        let tmp = [];
        let state_map = {};

        for(var i in this.__level){
            let l = [];
            for(let state of this.__level[i]){
                let sc = state.clone(state_map, sm);
                state_map[sc.getIdentificator()] = sc;

                l.push(sc);
                tmp.push(sc);
            }
            sm.__level[i] = l;
        }
        sm.__states = tmp;

        return sm;
    }

    addStateClass(options={}){
        this.__stateclasses.push(options);
    }
    getStateClass(id){
        for(let stclass of this.__stateclasses)
            if(stclass.id === id)
                return stclass;

        return undefined;
    }

    getStateClasses(){
        return this.__stateclasses;
    }

    stateFactory(level, Class, data){
        var self = this;

        this.__internal_counter++;

        return new Class({
            identificator: this.__internal_counter,
            level: level,
            data: data,
            container: this
        });
    }

    getLevels(){
        return this.__level;
    }
    getStates(threshold=undefined){
        if(threshold){
            let okay = [];
            for(let state of this.__states){
                if(state.getLevel() < threshold)
                    okay.push(state);
            }

            return okay;

        }

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

    dataChange(identificator, field_dict){
        let state = this.getState(identificator);

        if(state)
            return state.dataChange(field_dict);

        return false;
    }

    detailRender(identificator, editable){
        let i = __getArrayPos(this.__states, identificator);

        if(i != -1)
            return this.__states[i].detailRender(editable);

        return undefined;
    }

    detailProcess(identificator, data){
        let i = __getArrayPos(this.__states, identificator);

        if(i != -1)
            return this.__states[i].detailProcess(data);

        return false;
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
                    //console.log(`IS ${deps[i].getLevel()} < ${level} ? ${deps[i].getLevel()<level }`);
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
        this.removeDiscontinuities();

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
