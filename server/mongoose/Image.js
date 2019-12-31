let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    url: {
        type: String,
        default: '',
    },
    // articleId: mongoose.SchemaTypes.ObjectId,
    articleId: String,
}, {collection: 'images'});

module.exports = mongoose.model('Image', Schema);