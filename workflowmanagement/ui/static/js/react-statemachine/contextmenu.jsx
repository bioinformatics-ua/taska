
import React from 'react';

const ContextMenu = React.createClass({
    getInitialState(){
        return {
            selected: undefined
        }
    },
    getDefaultProps(){
        return {
            target: '.react-contextmenu-target',

            identificator: 'react-contextmenu-drop',
            items: []
        }
    },
    __setEvents(){
        let self = this;
        let cm = $('.'+this.props.identificator);
        let bg = $('.context-menu-background');
        $("body").on("contextmenu", this.props.target, function(e) {

        cm.css({
                display: "block",
                left: e.pageX,
                top: e.pageY
            });
            bg.show();
            self.setState({selected: e.target});
            return false;
        });


        cm.on("click", "a", function() {
            cm.hide();
            bg.hide();
        });

        bg.click(function(){
            cm.hide();
            bg.hide();
        });
    },
    componentDidMount(){
        this.__setEvents();
    },
    componentDidUpdate(){
        this.__setEvents();
    },
    click(e){
        let id = $(e.currentTarget).data('i');

        this.props.items[id].onClick(this.state.selected);
    },
    render(){
        return(
            <span>
                <div className="context-menu-background">&nbsp;</div>
                <div className="react-contextmenu dropdown clearfix">
                    <ul style={{position: 'fixed', top: 0, left: 0}} className="dropdown-menu react-contextmenu-drop" role="menu">
                        {this.props.items.map((item, i)=>{
                            return <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);" data-i={i} onClick={this.click}>{item.name}</a></li>
                        })}
                    </ul>
                </div>
            </span>
        );
    }
});

export default {ContextMenu};

