'use strict';
import Reflux from 'reflux';
import UserGridActions from '../actions/UserGridActions.jsx';

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
        //let url = "";
        console.log(hash);
        console.log(state);
        let self = this;
        loader  = new ListLoader({model: hash, dontrepeat: true});
        loader.load(function(data){
            self.updatePaginator(state);
            UserGridActions.loadSuccess(data);
        }, state);
    },
    dummy(s){},
    init(){
    },
    onCalibrate(){

    }
});