let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        default: '',
        unique: true,
    },
    string: {
        type: String,
        required: true,
        default: '',
    },
    langid: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
    },
    articleid: mongoose.SchemaTypes.ObjectId
}, {collection: 'lang_words'});

module.exports = mongoose.model('LangWord', Schema);