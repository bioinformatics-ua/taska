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
    'loadListSuccess': {},
    'loadList': {asyncResult: true},
    'loadListIfNecessary': {asyncResult: true},
    'unloadList': {}
};

export default {TableActionsMixin, DetailActionsMixin, ListActionsMixin}
