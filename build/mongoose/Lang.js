"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_mongoose_1 = require("ts-mongoose");
var Schema = ts_mongoose_1.createSchema({
    shortcut: ts_mongoose_1.Type.string({ required: true }),
    name: ts_mongoose_1.Type.string({ required: true }),
    default: ts_mongoose_1.Type.boolean({ default: false }),
}, { collection: 'langs' }), Model = ts_mongoose_1.typedModel('Lang', Schema);
exports.default = Model;
