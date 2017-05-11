'use strict';
import React from 'react';

const Modal = React.createClass({
    getDefaultProps(){
        return {
            title: 'Undefined Title',
            visible: true,
            overflow: 'auto',
            modalbody: '',
            modalfooter: undefined
        }
    },
    render(){
        if (this.props.visible)
            return <div className="modal modalback show">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" onClick={this.props.close} className="close" data-dismiss="modal"
                                    aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>

                        <div style={{overflow: this.props.overflow}} className="modal-body">
                            <span>
                                <br/>
                                {this.props.modalbody}
                            </span>
                        </div>

                        {this.props.modalfooter != undefined ?
                            <div className="modal-footer">
                                {this.props.modalfooter}
                            </div> : ''}
                    </div>
                </div>
            </div>;
        return undefined;
    }
});

export default Modal;