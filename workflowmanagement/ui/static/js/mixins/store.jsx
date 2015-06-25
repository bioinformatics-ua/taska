const TableStoreMixin = {
    init: function () {
        this.__list = [];
        this.__page = 0;
        this.__page_size = 5;
        this.__max_page = 0;
        this.__count = 0;
        this.__sortcolumn = null;
        this.__sortascending = true;
        this.__current={};
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

        this.__current = state;
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
// http://127.0.0.1:8000/api/account/?page_size=9000
class ListStoreMixin{
    // Factory that returns a DetailStoreMixin already setup
    static factory(loader, Actions){
        if(loader == undefined || Actions == undefined){
            throw "You must specify a loader, a identificator and an Action source, when using the DetailStoreMixin";
        }
        return {
            init() {
                this.__simplelist;
                this.__simplelistfailed = false;

                this.__Actions = Actions;
            },
            getSimpleList(){
                return this.__simplelist;
            },
            getSimpleListFailed(){
                return this.__simplelistfailed;
            },
            onLoadSimpleList(page_size) {
                if(page_size){
                    this.__page_size = page_size;
                }
                loader.load().then(
                    data => {
                        this.__simplelist = data;
                        this.__Actions.loadSimpleList.completed(data);
                    }
                );
            },
            onLoadSimpleListIfNecessary(page_size) {

                if(this.__simplelist && page_size === this.__page_size){
                    this.__Actions.loadSimpleListIfNecessary.completed(this.__simplelist);

                } else {
                    this.__Actions.loadSimpleList.triggerPromise(page_size).then(
                        // success callback
                       data => {
                            this.__Actions.loadSimpleListIfNecessary.completed(data);
                       }
                    );
                }
            },
            onUnloadSimpleList(){
                this.__simplelist = {};
            }
        }
    }
}

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
                ).catch(ex=>{
                    this.__Actions.loadDetail.failed(ex);
                })
            },
            onPostDetail(hash, serialized){
                loader.put(hash, serialized).then(
                    data => {
                        this.__Actions.loadDetailSuccess(data);
                        this.__Actions.postDetail.completed(data);
                    }
                );
            },
            onAddDetail(serialized){
                loader.post(serialized).then(
                    data => {
                        this.__Actions.loadDetailSuccess(data);
                        this.__Actions.addDetail.completed(data);
                    }
                );
            },
            onDeleteDetail(hash){
                loader.delete(hash).then(
                    data => {
                        this.__Actions.deleteDetail.completed(data);
                    }
                );
            },
            onMethodDetail(method, hash, type='GET', data={}){
                return new Promise(function (fulfill, reject){
                    loader.method(method, hash, type, data).then(
                        data => {
                            fulfill(data);
                        }
                    ).catch(ex=>reject(ex));
                });
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
                    ).catch(ex => {
                        this.__Actions.loadDetailIfNecessary.failed(ex);
                    });
                }
            },
            onLoadDetailSuccess(data) {
                this.__detaildata = data;
                let ident = data[this.__identificator];
                if(ident != undefined){
                    this.__loaded = ident;
                }
            },
            onUnloadDetail(){
                this.__detaildata = {};
                this.__loaded = false;
            }
        }
    }
}


export default {TableStoreMixin, DetailStoreMixin, ListStoreMixin}
