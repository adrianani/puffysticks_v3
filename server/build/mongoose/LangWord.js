"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_mongoose_1 = require("ts-mongoose");
var Schema = ts_mongoose_1.createSchema({
    key: ts_mongoose_1.Type.string({ required: true }),
    string: ts_mongoose_1.Type.string({ required: true }),
    langid: ts_mongoose_1.Type.objectId({ required: true }),
    articleid: ts_mongoose_1.Type.objectId(),
}, { collection: 'lang_words' }), Model = ts_mongoose_1.typedModel('LangWord', Schema);
exports.default = Model;
