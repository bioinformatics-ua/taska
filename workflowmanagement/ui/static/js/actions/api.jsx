class Loader{
    constructor(options) {
    }

    load(url, callback, unsuccessful_callback=null, type="GET", serialized={}){
      $.ajax({
            url: url,
            type: type,
            data: serialized,
            dataType: 'json',
            success: function(data) {
              callback(data);
            }.bind(this),
            error: function(xhr, status, err) {
                if(unsuccessful_callback != null)
                    unsuccessful_callback();

                console.error(`Unable to load ${url}`);
            }.bind(this)
      });
    }
}

class ListLoader extends Loader{
    constructor(options) {
        this.__loaded = {};
        this.model = options.model;
        this.dontrepeat = options.dontrepeat || false;

    }

    load(callback, state){
        if(!this.dontrepeat || this.__loaded[state.currentPage] === undefined){
                this.__loaded[state.currentPage] = true;

                let order = (state.externalSortAscending)? '':'-';

                super.load(
                    `api/${this.model}/?page=${state.currentPage+1}&ordering=${order}${state.externalSortColumn}`,
                    callback
                    );
        }
    }
}

class DetailLoader extends Loader{
    constructor(options) {
        this.model = options.model;
        this.hash = options.hash;
    }
    load(callback){
        super.load(`api/${this.model}/${this.hash}/`, callback);
    }
}

class Login extends Loader{
  constructor(options){
    this.data = {
      csrfmiddlewaretoken: Django.csrf_token(),
      username: options.username,
      password: options.password,
      remember: options.remember
    }
  }

  // Check if user is logged in returns a promise
  waitForData(){
    return $.ajax('api/account/me/');
  }

  // Get and csrf token to use on a post form
  authenticate(callback, unsuccessful_callback=null){

    super.load('api/account/login/', callback,
        unsuccessful_callback, "POST", this.data);
  }

  logout(callback, unsuccessful_callback=null){
    super.load('api/account/logout/', callback,
        unsuccessful_callback=unsuccessful_callback);
  }
}

export default {ListLoader, DetailLoader, Login}
