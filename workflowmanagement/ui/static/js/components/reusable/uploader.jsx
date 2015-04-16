'use strict';

import Router from 'react-router';
import React from 'react';
import {RouteHandler, Link} from 'react-router';

import Griddle from 'griddle-react';

require('filedrop');
import checksum from 'json-checksum';

const FileTitle = React.createClass({
    render(){
        let row = this.props.rowData;

        return  <small>
                    <a  target="_blank"
                        href={`api/resource/${row.hash}/download/`}>
                        {row.name}
                    </a>
                </small>;
    }
});

const FileSize = React.createClass({
    /* Concept by http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript */
    bytesToSize(bytes) {
       if(bytes == 0) return '0 Byte';
       var k = 1000;
       var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
       var i = Math.floor(Math.log(bytes) / Math.log(k));
       return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    render(){
        let row = this.props.rowData;

        return <small>{this.bytesToSize(row.size)}</small>;
    }
});

const FileStatus = React.createClass({
    render(){
        let row = this.props.rowData;
        switch(row.status){
            case 'Waiting':
                return <i title="Waiting for upload" className="fa fa-clock-o"></i>;
            case 'Uploading':
                return <i title="Uploading file" className="fa fa-upload text-primary"></i>;
            case 'Finished':
                return <i title="Finished uploading" className="fa fa-check-circle text-success"></i>;
            case 'Error':
                return <i title="Error while uploading" className="fa fa-times text-danger"></i>;
        }
        return <small>{row.status}</small>;
    }
});

const FileProgress = React.createClass({
    render(){
        let row = this.props.rowData;

        return <center><div style={{marginBottom: 0}} className="progress">
              <div title={`${row.progress}% Complete`} className="progress-bar progress-bar-success progress-bar-striped" role="progressbar"
                aria-valuenow={row.progress} aria-valuemin="0"
                aria-valuemax="100" style={{width: `${row.progress}%`}}>
                <span className="sr-only">{row.progress}% Complete</span>
              </div>
            </div></center>;
    }
});

const Uploader = React.createClass({
    getInitialState(){
        return {
            uploads: {}
        };
    },
    getupload(name){
        try{
            return this.state.uploads[checksum(name)];
        } catch(err){
            return undefined;
        }
    },
    changeupload(uprow){
        let tmp = this.state.uploads;

        tmp[checksum(uprow.name)] = uprow;

        this.setState({
            uploads: tmp
        });

        if(this.props.done)
            this.props.done(this.flatUploads().filter(
                    value => value.hash != undefined
                )
            );

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
                name: decodeURI(file.name),
                size: file.size,
                status: 'Waiting',
                progress: 0
            });

             // Update progress when browser reports it:
            file.event('progress', function (current, total) {
                var width = Math.round(current / total * 100, 2);

                let entry = self.getupload(file.name);
                if(entry){
                    entry.progress = width;
                    entry.status = "Uploading";
                    self.changeupload(entry)
                }
            })
            file.event('done', function (xhr) {
                let entry = self.getupload(file.name);
                if(entry){
                    let response = JSON.parse(xhr.response);

                    entry.status = "Finished";
                    entry.progress = 100;
                    entry.hash = response.hash;

                    self.changeupload(entry);
                }
            });

            file.event('error', function (e, xhr) {
                let entry = self.getupload(entry.name);
                if(entry){
                    entry.status = "Error";

                    self.changeupload(entry);
                }
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
    componentWillMount(){
        if(this.props.uploads){
            let map = {};
            for(let upload of this.props.uploads){
                map[checksum(upload.name)] = upload;
            }
            this.setState({uploads: map});
        }
    },
    componentDidMount(){
        this.__initUploader();
    },
    componentDidUpdate(){
        //this.__initUploader();
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
                },
            metadata: [
                {
                  "columnName": "name",
                  "order": 1,
                  "locked": false,
                  "visible": true,
                  "customComponent": FileTitle,
                  "displayName": "Name"
                },
                {
                  "columnName": "size",
                  "order": 2,
                  "locked": false,
                  "visible": true,
                  "customComponent": FileSize,
                  "displayName": "Size",
                  "cssClassName": "sizeRow"
                },
                {
                  "columnName": "status",
                  "order": 3,
                  "locked": false,
                  "visible": true,
                  "customComponent": FileStatus,
                  "displayName": "Status",
                  "cssClassName": "statusRow"
                },
                {
                  "columnName": "progress",
                  "order": 3,
                  "locked": false,
                  "visible": true,
                  "customComponent": FileProgress,
                  "displayName": "Progress",
                  "cssClassName": "progressRow"
                }
            ],
            done: undefined
        };
    },
    render(){
        console.log('RENDERING');
        return (
            <span>
            <fieldset id="fuploader">
                <p className="lead">Drop files here, or click to browse...</p>
            </fieldset>
            <Griddle
                  {...this.props.tableSettings}
                  results={this.flatUploads()}
                  columnMetadata={this.props.metadata}
                  columns={["name", "size", "status", "progress"]}/>
            </span>
        );
    }
});

export default Uploader;
