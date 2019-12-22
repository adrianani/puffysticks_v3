import {createSchema, Type, typedModel} from 'ts-mongoose';

let Schema = createSchema({
        key: Type.string({required: true}),
        string: Type.string({required: true}),
        langid: Type.objectId({required: true}),
        articleid: Type.objectId(),
    }, {collection: 'lang_words'}),
    Model = typedModel( 'LangWord', Schema);

export default Model;