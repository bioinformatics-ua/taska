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
      this.tableAction(index);
    },
    //this will handle how the data is sorted
    sortData: function(sort, sortAscending, data){
    },
    //this changes whether data is sorted in ascending or descending order
    changeSortDirection: function(sort, sortAscending){
    },
    //this method handles the filtering of the data
    setFilter: function(filter){
    },
    //this method handles determining the page size
    setPageSize: function(size){
    },
    //this method handles change sort field
    changeSort: function(sort){
    }
};

export default {TableComponentMixin}
