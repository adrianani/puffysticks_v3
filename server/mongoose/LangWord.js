let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        default: '',
    },
    string: {
        type: String,
        required: true,
        default: '',
    },
    langid: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
}, {collection: 'lang_words'});

Schema.pre('save', async function (next) {
    if(this.isNew && await mongoose.model('LangWord').exists({key: this.key, langid: this.langid})) {
        next(new Error(`key_duplicate${this}`));
    }
    next();
});

module.exports = mongoose.model('LangWord', Schema);