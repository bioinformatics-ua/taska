'use strict';
import Reflux from 'reflux';
import UserGridActions from '../actions/UserGridActions.jsx';
import StateActions from '../actions/StateActions.jsx';

import ResultStore from './ResultStore.jsx';

import {depmap} from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';
import {ListLoader} from '../actions/api.jsx'

let loader;


export default Reflux.createStore({
    merge: true,
    mixins: [TableStoreMixin],
    listenables: [UserGridActions],
    load: function (state, hash) {//I used hash, but it is not a hash. it is an url
        let url = hash;
        StateActions.loadingStart();
        //Remove the last / if exists because the listloader will add it to add the parameters(page and order)
        if(url.endsWith("/"))
            url = url.slice(0, -1);

        let self = this;
        loader  = new ListLoader({model: 'account/externalservice/getUsers/?url='+url, dontrepeat: true});
        loader.load(function(data){
            self.updatePaginator(state);
            UserGridActions.loadSuccess(data);
            StateActions.loadingEnd();
        }, state);
    },
    dummy(s){},
    init(){
    },
    onCalibrate(){

    }
});