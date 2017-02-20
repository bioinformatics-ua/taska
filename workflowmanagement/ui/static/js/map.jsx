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


const singleStateColor = function(ptask, taskStatus){
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
        case 4://Running or Overdue
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
        case 5://Finished
            return {
                  backgroundColor: 'rgb(92, 184, 92)',
                  border: 0,
                  color: 'white',
                  fontSize: '100%'
            };
        case 6://Canceled
            return {
                backgroundColor: 'grey',
                border: 0,
                color: 'white',
                fontSize: '100%'
            };
        case 7://Overdue
            return {
                backgroundColor: 'rgb(240, 173, 78)',
                border: 0,
                color: 'white',
                fontSize: '100%'
            };
        case 8://Improving
            break;
    }

    return {};
};

const stateTaskDesc = function(ptask){
        if(ptask) {
            switch (ptask.status) {
                case 1:
                    return 'Waiting';
                case 2:
                    let end = moment(ptask.deadline);
                    let now = moment();

                    if (now.isBefore(end)) {
                        return 'Running';
                    } else {
                        return 'Overdue';
                    }
                case 3:
                    return 'Finished';
                case 4:
                    return 'Canceled';
                case 5:
                    return 'Overdue';
                case 7:
                    return 'Waiting for answer';
                case 8:
                    return "Rejected";
                default:
                    console.log("Task status: ");
                    console.log(ptask.status);
            }

        }
        return 'Waiting';
    };

const stateUserTaskDesc = function(ptask, user){
        if(ptask) {
            if (user) {
                switch (user.status) {
                    case 1:
                        if(ptask.status == 7)
                            return 'Waiting for answer';
                        return 'Waiting';
                    case 2:
                        return 'Accepted';
                    case 3:
                        return 'Rejected';
                    case 4:
                        let end = moment(ptask.deadline);
                        let now = moment();

                        if (now.isBefore(end)) {
                            return 'Running';
                        } else {
                            return 'Overdue';
                        }
                    case 5:
                        return 'Finished';
                    case 6:
                        return 'Canceled';
                    case 7:
                        return 'Overdue';
                    case 8:
                        return 'Improving';
                    default:
                        console.log("Task status: ");
                        console.log(ptask.status);
                }

            }
        }
        return 'Waiting !';
    };

// Map that represents task relations with respective results
const depmap = {
    'tasks.SimpleTask': 'result.SimpleResult',
    'form.FormTask': 'form.FormResult'
};



export default {stateColor, singleStateColor, stateTaskDesc, stateUserTaskDesc, depmap};
