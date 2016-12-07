'use strict';
import Reflux from 'reflux';
import ResultActions from '../actions/ResultActions.jsx';
import StateActions from '../actions/StateActions.jsx';
import {depmap} from '../map.jsx';

import {TableStoreMixin, DetailStoreMixin} from '../mixins/store.jsx';

import {ListLoader, DetailLoader} from '../actions/api.jsx'

let loader = new ListLoader({model: 'result'});

export default Reflux.createStore({
    mixins: [TableStoreMixin,
        DetailStoreMixin.factory(
            new DetailLoader({model: 'result'}),
            'hash',
            ResultActions
        )
    ],
    listenables: [ResultActions],
    load: function (state) {
        let self = this;
        loader.load(function(data){
            self.updatePaginator(state);
            ResultActions.loadSuccess(data);
        }, state);
    },
    init(){
        this.__missing=[];
    },
    onDeleteResult(hash){
        ResultActions.deleteDetail.triggerPromise(hash).then(
            (result) => {
                this.load(this.__current);
            }
        );
    },
    onCalibrate(data){
            this.__detaildata = {
                hash: data.hash || undefined,
                task: data.processtask.task,
                process: data.processtask.process,
                type: depmap[data.processtask.parent.type]
            };
    },
    getAnswer(){
        return this.__detaildata || {};
    },
    onUnloadAnswer(){
        this.__detaildata = {};
    },
    onSetAnswer(prop, val){
        this.__detaildata[prop] = val;
        StateActions.waitSave()
        //this.trigger();
    },
    answerSubmitted(){
        return this.__rsubmitted || false;
    },
    answerSaved(){
        return this.__rfinished || false;
    },
    onSubmitAnswer(){
        StateActions.alert(
        {
            'title':'Submit Answer',
            'message': 'This will finalize your work on this task, and submit it for the study manager. Are you sure you want to submit this answer?',
            onConfirm: (context)=>{
                var self = this;
                StateActions.loadingStart();

                if(this.__detaildata.hash){

                    ResultActions.postDetail.triggerPromise(this.__detaildata.hash, this.__detaildata).then(
                            (answer) => {

                                StateActions.save();

                                self.onMethodDetail('submit', answer.hash).then(
                                        (answer) => {
                                            StateActions.loadingEnd();
                                            StateActions.save();
                                            StateActions.dismissAlert();
                                            this.__rsubmitted = true;

                                            this.__detaildata = answer;
                                            this.trigger();
                                        }
                                );

                            }
                    );

                }
            }
        });

    },
    onSaveAnswer(){
        StateActions.loadingStart();

        this.__rsubmitted = false;

        if(this.__detaildata.hash){
            ResultActions.postDetail.triggerPromise(this.__detaildata.hash, this.__detaildata).then(
                    (answer) => {
                        StateActions.loadingEnd();
                        StateActions.save();
                        this.trigger();
                    }
            );
        } else {
            ResultActions.addDetail.triggerPromise(this.__detaildata).then(
                (answer) => {
                    StateActions.loadingEnd();
                    StateActions.save();
                    StateActions.save(true, ()=>{
                        this.__rfinished = answer;
                        this.trigger();
                    });
                }
            );
        }
    }
});
