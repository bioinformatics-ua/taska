'use strict';
import Router from 'react-router';
import React from 'react/addons';
import Reflux from 'reflux';

import {MyStudiesTable} from './reusable/mystudies.jsx';
import {MyFinishedStudiesTable} from './reusable/myfinishedstudies.jsx';

import UserStore from '../stores/UserStore.jsx';

import {getTableSizeWithTabs} from '../page_settings.jsx';

import Tabs from 'react-simpletabs';

import {Authentication} from '../mixins/component.jsx';


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
              <div className="col-md-6 flex-container flex-row">
                  <div style={{height: pageSize}} className="panel panel-default panel-overflow  griddle-pad">
                    <div className="panel-heading">
                          <center>
                            <i className="fa fa-cogs pull-left"></i>
                            <h3 className="panel-title"> Studies that I participate </h3>
                          </center>
                        </div>
                      <div className="panel-body tasktab-container">
                        <Tabs>
                            <Tabs.Panel title={<span><i className="fa fa-play"></i> &nbsp;Current studies</span>}>
                                <MyStudiesTable />
                            </Tabs.Panel>
                            <Tabs.Panel title={<span><i className="fa fa-check"></i> &nbsp;Finished studies</span>}>
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