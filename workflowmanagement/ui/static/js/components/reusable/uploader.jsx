'use strict';

import Router from 'react-router';
import React from 'react';
import {RouteHandler, Link} from 'react-router';
import {DeleteButton} from './component.jsx'

import Griddle from 'griddle-react';

require('filedrop');
import checksum from 'json-checksum';

const FileTitle = React.createClass({
    render(){
        let row = this.props.rowData;

        return  <small>
                    <a title={`${decodeURI(row.filename)}`} style={{wordBreak: 'break-word'}} target="_blank"
                        href={`api/resource/${row.hash}/download/`}>
                        {decodeURI(row.filename)}
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

const FileManage = React.createClass({
    render(){
        let row = this.props.rowData;

        return <DeleteButton
              success={this.props.metadata.delete}
              identificator = {row.filename}
              title={`Delete '${decodeURI(row.filename)}'`}
              extraCss='btn-xs'
              message={`Are you sure you want to delete '${decodeURI(row.filename)} ?'`}  />
    }
});

const FileProgress = React.createClass({
    render(){
        let row = this.props.rowData;

        return <center>
              <FileStatus rowData={row} /> &nbsp;
              <div className="progress">
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
    getupload(filename){
        try{
            return this.state.uploads[checksum(filename)];
        } catch(err){
            return undefined;
        }
    },
    changeupload(uprow){
        let tmp = this.state.uploads;

        tmp[checksum(uprow.filename)] = uprow;

        this.setState({
            uploads: tmp
        });
        console.log('CHANGE UPLOAD ?'+this.props.done)
        if(this.props.done)
            this.props.done(this.flatUploads().filter(
                    value => value.hash != undefined
                )
            );

    },
    delete(filename){
        let tmp = this.state.uploads;

        try {
            delete tmp[checksum(filename)];
        } catch(err){
            console.log("Can't remove file");
        }
        console.log('GOT HERE');
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

        const destiny = 'api/resource/my/upload/?format=json';

        let options = {
            iframe: {
                url: destiny
            },
            multiple: true
        };
        window.zone = new FileDrop('fuploader', options);
        zone.event('send', function (files) {
          files.each(function (file) {
            self.changeupload({
                filename: decodeURI(file.name),
                size: file.size,
                status: 'Waiting',
                progress: 0,
                manage: ''
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
        zone.event('iframeSetup', function (iframe) {
            let files = $(iframe).find('.fd-file').prop('files');

            for(var i=0;i<files.length;i++){
                let file = files[i];

                self.changeupload({
                    filename: decodeURI(file.name),
                    size: file.size,
                    status: 'Waiting',
                    progress: 0,
                    manage: ''
                });
            }

            $(iframe).append(`<input type="hidden" name="csrfmiddlewaretoken" value="${Django.csrf_token()}" />`);
        });
        zone.event('iframeDone', function (xhr) {
            console.log('IFRAME DONE');
            let files = JSON.parse(xhr.response);
            for(let file of files){
                let entry = self.getupload(file.filename);
                if(entry){
                    entry.status = "Finished";
                    entry.progress = 100;
                    entry.hash = file.hash;

                    self.changeupload(entry);
                }
            }

        });
    },
    componentWillMount(){
        if(this.props.uploads){
            let map = {};
            for(let upload of this.props.uploads){
                map[checksum(upload.filename)] = upload;
            }
            this.setState({uploads: map});
        }
    },
    componentDidMount(){
        if(this.props.editable)
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
                {   noDataMessage: <center>There are no associated resources currently.</center>,
                    bodyHeight:375,
                    tableClassName: "table table-bordered table-striped",
                    useGriddleStyles: false,
                    nextClassName: "table-prev",
                    previousClassName: "table-next",
                    sortAscendingComponent: <i className="pull-right fa fa-sort-asc"></i>,
                    sortDescendingComponent: <i className="pull-right fa fa-sort-desc"></i>
                },
            done: undefined,
            editable: true,
            extraFields: []
        };
    },
    render(){
        let metadata =[
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
                  "order": 4,
                  "locked": false,
                  "visible": true,
                  "customComponent": FileProgress,
                  "displayName": "Progress",
                  "cssClassName": "progressRow"
                },
                {
                  "columnName": "manage",
                  "order": 5,
                  "locked": false,
                  "visible": true,
                  "delete": this.delete,
                  "customComponent": FileManage,
                  "displayName": " ",
                  "cssClassName": "statusRow"
                },
                {
                  "columnName": "date",
                  "order": 5,
                  "locked": false,
                  "visible": true,
                  "displayName": "Date",
                  "cssClassName": "creatorRow"
                },
                {
                  "columnName": "creator",
                  "order": 6,
                  "locked": false,
                  "visible": true,
                  "displayName": "Creator",
                  "cssClassName": "creatorRow"
                },
                {
                  "columnName": "task",
                  "order": 7,
                  "locked": false,
                  "visible": true,
                  "displayName": "Task",
                  "cssClassName": "creatorRow"
                }
            ];
        return (
            <span>
            {this.props.editable ?
                <fieldset id="fuploader">
                    <p>Drop files here, or click to browse...</p>
                </fieldset>
            :''}
            <Griddle
                  {...this.props.tableSettings}
                  results={this.flatUploads()}
                  columnMetadata={metadata}
                  columns={ this.props.editable ?
                    ["name", "size", "progress", "manage"]:
                    ["name", "size", ...this.props.extraFields]
                  }/>
            </span>
        );
    }
});

export default Uploader;
