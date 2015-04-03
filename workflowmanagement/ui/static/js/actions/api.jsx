// Adding csrf middleware token to the correct place...
function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", Django.csrf_token());
        }
    }
});

class Loader{
    constructor(options) {
    }

    load(url, callback, unsuccessful_callback=null, type="GET", serialized={}){
      return Promise.resolve($.ajax({
            url: url,
            type: type,
            data: serialized,
            dataType: 'json',
            contentType: "application/json",
            success: function(data) {
              if(callback)
                callback(data);
            }.bind(this),
            error: function(xhr, status, err) {
                if(unsuccessful_callback != null)
                    unsuccessful_callback();
                console.log(xhr);
                console.error(`Unable to load ${url}`);
            }.bind(this)
      }));
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

                return super.load(
                    `api/${this.model}/?page=${state.currentPage+1}&ordering=${order}${state.externalSortColumn}`,
                    callback
                    );
        }
    }
}

class SimpleListLoader extends Loader{
    constructor(options) {
        this.model = options.model;
    }
    load(){
        return super.load(`api/${this.model}/`);
    }
}

class DetailLoader extends Loader{
    constructor(options) {
        this.model = options.model;
    }
    load(hash){
        return super.load(`api/${this.model}/${hash}/`);
    }
    put(hash, serialized){
        return super.load(`api/${this.model}/${hash}/`, null, null, "PATCH", JSON.stringify(serialized));
    }
    post(serialized){
        return super.load(`api/${this.model}/`, null, null, "POST", JSON.stringify(serialized));
    }
    delete(hash){
        return super.load(`api/${this.model}/${hash}/`, null, null, "DELETE");
    }
    method(method, hash, type='GET', data={}){
      return super.load(`api/${this.model}/${hash}/${method}/`, null, null, type, data);
    }
}

class Login extends Loader{
  constructor(options){
    this.data = {
      username: options.username,
      password: options.password,
      remember: options.remember
    }
  }

  // Check if user is logged in returns a promise
  waitForData(){
    return $.ajax('/api/account/me/');
  }

  // Get and csrf token to use on a post form
  authenticate(callback, unsuccessful_callback=null){

    return super.load('api/account/login/', callback,
        unsuccessful_callback, "POST", JSON.stringify(this.data));
  }

  logout(callback, unsuccessful_callback=null){
    return super.load('api/account/logout/', callback,
        unsuccessful_callback=unsuccessful_callback);
  }
}

export default {ListLoader,SimpleListLoader, DetailLoader, Login}
