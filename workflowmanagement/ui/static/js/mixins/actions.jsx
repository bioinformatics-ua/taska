const TableActionsMixin = [
];

const DetailActionsMixin = {
    'loadDetailSuccess': {},
    'loadDetail': {asyncResult: true},
    'loadDetailIfNecessary': {asyncResult: true},
    'unloadDetail': {},
    'postDetail': {asyncResult: true},
    'addDetail': {asyncResult: true},
    'deleteDetail': {asyncResult: true},
    'methodDetail': {asyncResult: true}

};

const ListActionsMixin = {
    'loadSimpleListSuccess': {},
    'loadSimpleList': {asyncResult: true},
    'loadSimpleListIfNecessary': {asyncResult: true},
    'unloadList': {}
};

export default {TableActionsMixin, DetailActionsMixin, ListActionsMixin}
