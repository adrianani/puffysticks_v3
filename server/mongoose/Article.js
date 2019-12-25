let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    similarWork: {
        type: Boolean,
        default: false,
    },
    demo: {
        type: String,
        default: '',
    },
    categories: {
        type:Array,
        default: [],
    },
}, {collection: 'articles'});

module.exports = mongoose.model('Article', Schema);