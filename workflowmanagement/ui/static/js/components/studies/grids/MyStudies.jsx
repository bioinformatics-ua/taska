'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';
import {Link} from 'react-router';

import {MyStudiesTable} from './mystudies.jsx';
import {MyFinishedStudiesTable} from './myfinishedstudies.jsx';

import UserStore from '../../../stores/UserStore.jsx';

import {getTableSizeWithTabs} from '../../../page_settings.jsx';

import Tabs from 'react-simpletabs';

import {Authentication} from '../../../mixins/component.jsx';


export default React.createClass({
  displayName: "My Studies",
  mixins: [Authentication],
  render: function () {
    return <LoggedInHome />;
  }
});

const LoggedInHome = React.createClass({
  __getState(){
    return {
        user: UserStore.getUser()
    }
  },
  getInitialState(){
    return this.__getState();
  },
  render: function(){
    let pageSize = getTableSizeWithTabs() +'px';
    return (<span>
          <div className="row flex-container">
              <div className="col-md-12 flex-container flex-row">
                  <div style={{height: pageSize}} className="panel panel-default panel-overflow">
                    <div className="panel-heading">
                          <center>
                            <i className="fa fa-cogs pull-left"></i>
                            <h3 className="panel-title"> My Studies </h3>
                          </center>

                        <Link style={{position: 'absolute', right: '10px', top: '7px', zIndex: 1002}} to="StudyTemplates" params={{object: 'add', mode: 'edit'}} className="pull-right btn btn-xs btn-success"><i className="fa fa-plus"></i> Create study</Link>
                        </div>
                      <div className="panel-body tasktab-container">
                        <Tabs>
                            <Tabs.Panel title={<span><i className="fa fa-play"></i> &nbsp;Current studies</span>}>
                                <MyStudiesTable />
                            </Tabs.Panel>
                            <Tabs.Panel title={<span><i className="fa fa-check"></i> &nbsp;Completed studies</span>}>
                                <MyFinishedStudiesTable />
                            </Tabs.Panel>
                        </Tabs>
                      </div>
                  </div>
              </div>
          </div>

      </span>);
  }
})