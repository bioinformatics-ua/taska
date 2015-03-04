const TableActionsMixin = [
];

const DetailActionsMixin = {
    'loadDetailSuccess': {},
    'loadDetail': {asyncResult: true},
    'loadDetailIfNecessary': {asyncResult: true},
    'unloadDetail': {}
};

export default {TableActionsMixin, DetailActionsMixin}
