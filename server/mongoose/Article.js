let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
    similarWork: {
        type: Boolean,
        default: false,
        
    } 
}, {collection: 'langs'});

module.exports = mongoose.model('Lang', Schema);