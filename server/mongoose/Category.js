let mongoose = require('mongoose');

let Schema = new mongoose.Schema({}, {collection: 'category'});

module.exports = mongoose.model('Category', Schema);