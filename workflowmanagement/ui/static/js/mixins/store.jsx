const TableStoreMixin = {
    init: function () {
        this.__list = [];
        this.__page = 0;
        this.__page_size = 5;
        this.__max_page = 0;
        this.__count = 0;
        this.__sortcolumn = null;
        this.__sortascending = true;
    },
    onLoadSuccess: function (data) {
        if(this.merge)
            this.__list = $.merge(this.__list, data.results);
        else
            this.__list = data.results;

        this.__count = data.count;
        this.__max_page = Math.ceil(this.__count / this.__page_size);

        this.trigger();
    },
    updatePaginator: function(state){
        this.__page = state.currentPage;
        this.__sortcolumn = state.externalSortColumn;
        this.__sortascending = state.externalSortAscending;
    },
    getList: function(){
        return this.__list;
    },
    getPage: function(){
        return this.__page;
    },
    getPageSize: function(){
        return this.__page_size;
    },
    getMaxPage: function(){
        return this.__max_page;
    },
    getSortColumn: function(){
        return this.__sortcolumn;
    },
    getSortAscending: function(){
        return this.__sortascending;
    }
};
class DetailStoreMixin{
    // Factory that returns a DetailStoreMixin already setup
    static factory(loader, identificator, Actions){
        if(loader == undefined || identificator == undefined || Actions == undefined){
            throw "You must specify a loader, a identificator and an Action source, when using the DetailStoreMixin";
        }
        return {
            init() {
                this.__detaildata = {};
                this.__loaded = false;
                this.__failed = false;

                this.__identificator = identificator;
                this.__Actions = Actions;
            },
            getDetail(){
                return this.__detaildata;
            },
            getDetailFailed(){
                return this.__failed;
            },
            onLoadDetail(hash) {
                loader.load(hash).then(
                    data => {
                        this.__Actions.loadDetailSuccess(data);
                        this.__Actions.loadDetail.completed(data);
                    }
                );
            },
            onPostDetail(hash, serialized){
                loader.put(hash, serialized).then(
                    data => {
                        this.__Actions.loadDetailSuccess(data);
                        this.__Actions.postDetail.completed(data);
                    }
                );
            },
            onLoadDetailIfNecessary(hash) {
                if(this.loaded === hash){
                    this.__Actions.loadDetailIfNecessary.completed(this.__detaildata);

                } else {
                    this.__Actions.loadDetail.triggerPromise(hash).then(
                        // success callback
                       data => {
                            this.__Actions.loadDetailIfNecessary.completed(data);
                       }
                    );
                }
            },
            onLoadDetailSuccess(data) {
                this.__detaildata = data;
                let ident = data[this.__identificator];
                if(ident != undefined){
                    this.__loaded = ident;
                }
                this.trigger();
            },
            onUnloadDetail(){
                this.__detaildata = {};
                this.__loaded = false;
            }
        }
    }
}


export default {TableStoreMixin, DetailStoreMixin}
