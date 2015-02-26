class ListLoader{
    constructor(options) {
        this.__loaded = {};
        this.model = options.model;
    }

    load(callback, page){
        if(this.__loaded[page] === undefined){
                this.__loaded[page] = true;
                $.ajax({
                  url: `api/${this.model}/?page=${page+1}`,
                  dataType: 'json',
                  success: function(data) {

                    callback(data, page);

                  }.bind(this),
                  error: function(xhr, status, err) {
                    console.error(status, err.toString());
                  }.bind(this)
                });
        }
    }
}

class DetailLoader{
    constructor(options) {
        this.model = options.model;
        this.hash = options.hash;
    }
    load(callback){
        console.log(`api/${this.model}/${this.hash}/`);
            $.ajax({
                  url: `api/${this.model}/${this.hash}/`,
                  dataType: 'json',
                  success: function(data) {
                    callback(data);
                  }.bind(this),
                  error: function(xhr, status, err) {
                    console.error(`Unable to load "api/${this.model}/${this.hash}/"`);
                  }.bind(this)
            });
    }
}

export default {ListLoader, DetailLoader}
