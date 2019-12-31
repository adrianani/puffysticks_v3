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

Schema.pre('save', async function(next) {
    if(this.default === true) {
        await mongoose.model('Lang').findOneAndUpdate({default: true}, {default: false});
    }
    next();
});

Schema.pre('updateOne', async function(next) {
    if(this._update.default === true) {
        await mongoose.model('Lang').findOneAndUpdate({default: true}, {default: false});
    }
    next();
});

module.exports = mongoose.model('Lang', Schema);