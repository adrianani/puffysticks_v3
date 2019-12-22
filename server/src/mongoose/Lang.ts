import {createSchema, Type, typedModel} from 'ts-mongoose';

let Schema = createSchema({
        shortcut: Type.string({required: true}),
        name: Type.string({required: true}),
        default: Type.boolean({default: false}),
    }, {collection: 'langs'}),
    Model = typedModel( 'Lang', Schema);

export default Model;