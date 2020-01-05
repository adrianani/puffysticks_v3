let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    slug: String,
}, {collection: 'categories'});

Schema.pre('save', function (next) {
    if(this.isNew) {
        this.set('slug', Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5));
    }
    next();
});

module.exports = mongoose.model('Category', Schema);