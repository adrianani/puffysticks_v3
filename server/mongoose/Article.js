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
    category: mongoose.SchemaTypes.ObjectId,
}, {collection: 'articles'});

module.exports = mongoose.model('Article', Schema);