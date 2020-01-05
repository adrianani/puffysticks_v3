let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    ext: {
        type: String,
        required: true,
        default: 'png',
    },
    processed: {
        type: Boolean,
        default: false,
    },
}, {collection: 'images'});

module.exports = mongoose.model('Image', Schema);