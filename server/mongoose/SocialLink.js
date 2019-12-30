let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    }
}, {collection: 'social_links'});

module.exports = mongoose.model('SocialLink', Schema);