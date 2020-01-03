let mongoose = require('mongoose');

let Schema = new mongoose.Schema({}, {collection: 'categories'});

module.exports = mongoose.model('Category', Schema);