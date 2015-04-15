'use strict';

import Router from 'react-router';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import Griddle from 'griddle-react';

require('filedrop');
import checksum from 'json-checksum';

const Uploader = React.createClass({
    getInitialState(){
        return {
            uploads: {}
        };
    },
    changeupload(uprow){
        let tmp = this.state.uploads;

        tmp[checksum(uprow.name)] = uprow;

        this.setState({
            uploads: tmp
        });
    },
    __initUploader(){
        const self=this;

        const destiny = 'api/resource/my/upload/';

        let options = {
            iframe: {
                url: destiny
            },
            multiple: true
        };
        let zone = new FileDrop('fuploader', options);
        zone.event('send', function (files) {
          files.each(function (file) {
            self.changeupload({
                name: file.name,
                size: file.size,
                status: 'Waiting'
            });
            file.event('done', function (xhr) {
              alert('Done uploading ' + this.name + ',' +
                    ' response:\n\n' + xhr.responseText);
            });

            file.event('error', function (e, xhr) {
              alert('Error uploading ' + this.name + ': ' +
                    xhr.status + ', ' + xhr.statusText);
            });
            file.event('xhrSetup', function (xhr, opt) {
              xhr.setRequestHeader("X-CSRFToken", Django.csrf_token());
            });

            file.sendTo(destiny);
          });
        });

        // <iframe> uploads are special - handle them.
        zone.event('iframeDone', function (xhr) {
          alert('Done uploading via <iframe>, response:\n\n' + xhr.responseText);
        });
    },
    componentDidMount(){
        this.__initUploader();
    },
    componentDidUpdate(){
        this.__initUploader();
    },
    flatUploads(){
        return $.map(this.state.uploads, function(key, value) { return key });
    },
    getDefaultProps(){
        return {
            tableSettings:
                {   noDataMessage: '',
                    bodyHeight:375,
                    tableClassName: "table table-bordered table-striped",
                    useGriddleStyles: false,
                    nextClassName: "table-prev",
                    previousClassName: "table-next",
                    sortAscendingComponent: <i className="pull-right fa fa-sort-asc"></i>,
                    sortDescendingComponent: <i className="pull-right fa fa-sort-desc"></i>
                }
        };
    },
    render(){
        return (
            <span>
            <fieldset id="fuploader">
                <p className="lead">Drop files here, or click to browse...</p>
            </fieldset>
            <Griddle
                  {...this.props.tableSettings}
                  results={this.flatUploads()}
                  columns={["name", "size", "status"]}/>
            </span>
        );
    }
});

export default Uploader;
