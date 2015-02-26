const TableStoreMixin = {
    init: function () {
        this.__list = [];
        this.__page = 0;
        this.__page_size = 5;
        this.__max_page = 0;
        this.__count = 0;
    },
    onLoadSuccess: function (data, page = 0) {
        this.__list = $.merge(this.__list, data.results);
        this.__page = page;
        this.__count = data.count;
        this.__max_page = Math.ceil(this.__count / this.__page_size);

        this.trigger();
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
    }
};

export default {TableStoreMixin}
