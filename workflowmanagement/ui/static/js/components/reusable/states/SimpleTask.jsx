import React from 'react';

import {SimpleState} from '../../../react-statemachine/classes.jsx'

class SimpleTask extends SimpleState {
    constructor(options){
        super(options);
    }
    static typeIcon(){
        return <i className="fa fa-check"></i>;
    }
    static repr(){
        return 'Simple Task';
    }

    detailRender(){
        let self = this;
        const SimpleFields = React.createClass({
            getInitialState(){
                return {
                    parent: this.props.main
                }
            },
            setDescription(e){
                this.state.parent.setState({description: e.target.value});
            },
            parent(){
                return this.state.parent.state;
            },
            render(){
                return <span>
                    <div className="form-group">
                        <div className="input-group clearfix">
                            <span className="input-group-addon" id="state-description">
                                <strong>Task Description</strong>
                            </span>
                            <textarea rows="6" type="description" className="form-control"
                                            aria-describedby="state-description"
                                            placeholder="Enter the state description here"
                                            onChange={this.setDescription} value={this.parent().description}>
                            </textarea>
                        </div>
                    </div>
                </span>
            }
        });

        return super.detailRender(SimpleFields);
    }

    static deserializeOptions(data){
        if(data.title === undefined)
            throw `data object is missing 'title' property`;

        if(data.description === undefined)
            throw `data object is missing 'description' property`;

        return {
            name: data.title,
            description: data.description,
            hash: data.hash,
            type: data.type
        };
    }

    serialize(){
        let deps = [];
        for(let dep of this.getDependencies()){
            deps.push({
                dependency: dep.getIdentificator()
            });
        }

        return {
            sid: this.__identificator,
            hash: this.getData().hash,
            title: this.getData().name,
            type: this.getData().type,
            sortid: this.getLevel(),
            description: this.getData().description || '',
            dependencies: deps
        }
    }
}

export default SimpleTask;
