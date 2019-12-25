let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    inMenu: {
        type: Boolean,
        default: false,
    },
    key: {
        type: String,
        require: true,
    }
}, {collection: 'categories'});

module.exports = mongoose.model('Category', Schema);