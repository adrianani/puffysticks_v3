let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    string: {
        type: String,
        required: true,
    },
    langid: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
    },
    articleid: mongoose.SchemaTypes.ObjectId
}, {collection: 'lang_words'});

module.exports = mongoose.model('LangWord', Schema);