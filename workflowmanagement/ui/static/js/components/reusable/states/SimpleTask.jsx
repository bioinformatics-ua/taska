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
}

export default SimpleTask;
