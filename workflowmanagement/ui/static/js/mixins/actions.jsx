const TableActionsMixin = [
];

const DetailActionsMixin = {
    'loadDetailSuccess': {},
    'loadDetail': {asyncResult: true},
    'loadDetailIfNecessary': {asyncResult: true},
    'unloadDetail': {},
    'postDetail': {asyncResult: true}
};

export default {TableActionsMixin, DetailActionsMixin}
