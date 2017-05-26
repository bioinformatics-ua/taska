'use strict';
import React from 'react';
import {LayeredComponentMixin} from '../../mixins/component.jsx';
import Modal from '../reusable/modal.jsx';


const MessageLink = React.createClass({
    render(){
        const row = this.props.rowData;
        return <small>
                   <LinkToOpenMessageModal extraCss={"btn-xs btn-link"} message={row.message} text={row.title} />
               </small>;
    }
});

/*
* refactor this class
* */
const LinkToOpenMessageModal = React.createClass({
    mixins: [LayeredComponentMixin],
    getDefaultProps(){
        return {
            text: 'Unamed button',
            extraCss: ''
        };
    },
    handleClose() {
        this.setState({clicked: false});
    },
    handleClick() {
        this.setState({clicked: !this.state.clicked});
    },
    getInitialState() {
        return {
            clicked: false,
            users: []
        };
    },
    getModalBody(){
        return <span>{this.props.message}</span>;
    },
    getModalFooter(){
        return <span>
                    <button type="button" onClick={this.handleClose} className="btn btn-default" data-dismiss="modal">{'Close'}</button>
                </span>;
    },
    renderLayer() {
        if (this.state.clicked) {
            return <Modal title={this.props.text}
                      modalbody={this.getModalBody()}
                      modalfooter={this.getModalFooter()}
                      close={this.handleClose} />;
        } else {
            return <span />;
        }
    },
    render() {
        return <button className={`btn ${this.props.extraCss}`} onClick={this.handleClick}>
            <i className={this.props.icon} />&nbsp;{this.props.text}</button>;
    }
});

export default {MessageLink};