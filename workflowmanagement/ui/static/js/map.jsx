'use strict';
import moment from 'moment';

const stateColor = function(ptask){
    switch(ptask.status){
        case 1:
            return {
                border: '1px solid #ccc',
                color: 'black',
                backgroundColor: 'white',
                fontSize: '100%'
            };
        case 2:
            let end = moment(ptask.deadline);
            let now = moment();

            if(now.isBefore(end)){
                return {
                      backgroundColor: '#337ab7',
                      border: 0,
                      color: 'white',
                      fontSize: '100%'
                };
            } else {
                return {
                    backgroundColor: 'rgb(240, 173, 78)',
                    border: 0,
                    color: 'white',
                    fontSize: '100%'
                };
            }
        case 3:
            return {
                  backgroundColor: 'rgb(92, 184, 92)',
                  border: 0,
                  color: 'white',
                  fontSize: '100%'
            };
        case 4:
            return {
                backgroundColor: 'grey',
                border: 0,
                color: 'white',
                fontSize: '100%'
            };
        case 5:
            return {
                backgroundColor: 'rgb(240, 173, 78)',
                border: 0,
                color: 'white',
                fontSize: '100%'
            };

        case 7:
            return {
                border: '1px solid #ccc',
                color: 'black',
                backgroundColor: 'white',
                fontSize: '100%'
            };
        case 8:
            return {
                border: '1px solid #ccc',
                color: 'black',
                backgroundColor: 'rgb(215, 25, 28)',
                fontSize: '100%'
            };
    }

    return {};
};


const singleStateColor = function(taskStatus){
    switch(taskStatus){
        case 1://Waiting
            return {
                border: '1px solid #ccc',
                color: 'black',
                backgroundColor: 'white',
                fontSize: '100%'
            };
        case 2://Accepted
            return {
                border: '1px solid #ccc',
                color: 'white',
                backgroundColor: '#436600',
                fontSize: '100%'
            };
        case 3://Rejected
            return {
                border: '1px solid #ccc',
                color: 'black',
                backgroundColor: "tomato",//'rgb(215, 25, 28)',
                fontSize: '100%'
            };
    }

    return {};
};

// Map that represents task relations with respective results
const depmap = {
    'tasks.SimpleTask': 'result.SimpleResult',
    'form.FormTask': 'form.FormResult'
};



export default {stateColor, singleStateColor, depmap};
