let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    shortcut: {
        type: String,
        required: true,
        default: '',
        unique: true,
    },
    name: {
        type: String,
        required: true,
        default: '',
    },
    default: {
        type: Boolean,
        default: false,
    },
}, {collection: 'langs'});

Schema.methods.defaultLang = async () => {
    return await this.model('LangW').find({default: true});
}

module.exports = mongoose.model('Lang', Schema);