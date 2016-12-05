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
    'methodDetail': {}

};

const ListActionsMixin = {
    'loadSimpleListSuccess': {},
    'loadSimpleList': {asyncResult: true},
    'loadSimpleListIfNecessary': {asyncResult: true},
    'unloadList': {}
};

export default {TableActionsMixin, DetailActionsMixin, ListActionsMixin}
