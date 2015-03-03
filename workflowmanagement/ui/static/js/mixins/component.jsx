import React from 'react';
import UserStore from '../stores/UserStore.jsx';
import {Login} from '../actions/api.jsx'
import UserActions from '../actions/UserActions.jsx';

const Authentication = {
    statics: {
        willTransitionTo: function (transition, params, query, callback) {
            var nextPath = transition.path;

            UserActions.loadIfNecessary((user_data) => {
                if(user_data.email === undefined)
                    transition.redirect('/login',{}, {'nextPath' : nextPath });

                callback();
            });
        }
    }
};

const CheckLog = {
    statics: {
        willTransitionTo: function (transition, params, query, callback) {
            var nextPath = transition.path;
            UserActions.loadIfNecessary((user_data) => {
                if(user_data.email != undefined)
                    transition.redirect('/');

                callback();
            });
        }
    }
};


const TableComponentMixin = {
    componentDidMount: function() {
        this.setPage(0);
    },
    getState: function(){
      return {
            entries: this.tableStore.getList(),
            currentPage: this.tableStore.getPage(),
            maxPages: this.tableStore.getMaxPage(),
            externalResultsPerPage: this.tableStore.getPageSize(),
            externalSortColumn: this.tableStore.getSortColumn(),
            externalSortAscending: this.tableStore.getSortAscending()
      }
    },
    getInitialState: function() {
        return this.getState();
    },
    //what page is currently viewed
    setPage: function(index){
      console.log(`Set page ${index}`);
      this.tableAction($.extend(this.getState(), {currentPage: index}));
    },
    //this will handle how the data is sorted
    sortData: function(sort, sortAscending, data){
        console.log(`sortData`);
        console.log(sort);
        console.log(sortAscending);
        console.log(data);
    },
    //this method handles the filtering of the data
    setFilter: function(filter){
        console.log('setFilter');
    },
    //this method handles determining the page size
    setPageSize: function(size){
        console.log('setPageSize');
    },
    //this method handles change sort field
    changeSort: function(sort){
        console.log(`Sort by ${sort} ${this.state.externalSortAscending}`);

        let order = this.state.externalSortAscending;
        order = (this.state.externalSortColumn === sort)? !order:true;

        this.tableAction(
            $.extend(this.getState(), {
                externalSortColumn: sort,
                externalSortAscending: order
            })
        );

    },
    commonTableSettings: function(){
        return {
            useExternal: true,
            externalSetPage: this.setPage,
            externalChangeSort: this.changeSort,
            externalSetFilter: this.setFilter,
            externalSetPageSize:this.setPageSize,
            externalMaxPage:this.state.maxPages,
            externalCurrentPage:this.state.currentPage,
            resultsPerPage:this.state.externalResultsPerPage,
            externalSortColumn:this.state.externalSortColumn,
            externalSortAscending:this.state.externalSortAscending,
            bodyHeight:375,
            tableClassName: "table table-striped",
            results: this.state.entries,
            useGriddleStyles: false,
            nextClassName: "table-prev",
            previousClassName: "table-next",
            sortAscendingComponent: <i className="pull-right fa fa-sort-asc"></i>,
            sortDescendingComponent: <i className="pull-right fa fa-sort-desc"></i>
        }
    }
};

export default {Authentication, CheckLog, TableComponentMixin}


