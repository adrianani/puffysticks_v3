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
    categories: Array,
    thumbnail: mongoose.SchemaTypes.ObjectId,
    slug: String,
}, {collection: 'articles'});

Schema.pre('save', function (next) {
    if(this.isNew) {
        this.set('slug', Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5));
    }
    next();
});

module.exports = mongoose.model('Article', Schema);