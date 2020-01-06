const sharp = require('sharp'),
    fs = require('fs'),
    path = require('path'),
    db = require('./mongoose'),
    SocketIOFile = require('socket.io-file'),
    mongoose = require('mongoose'),
    imagemin = require('imagemin'),
    imageminJpegtran = require('imagemin-jpegtran'),
    imageminPngquant = require('imagemin-pngquant');

let sockets = {};

function error(message = 'unexpected_server_error', type = 'error') {
    return {
        message,
        type
    };
}

module.exports = (socket, io) => {

    /**
     * @desc fetch lang words from database on request
     * @param object
     * @code
        {
            key,        // array with keys of words to be returned 
            langid,     // string
            articleid   // string
        }
     * @endcode
     */
    socket.on('get lang words', async ({
        keys,
        langid,
        articleid
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            if (langid === undefined) {
                langid = await db.Lang.find({
                    default: true
                });
            }
            let langWords = await db.LangWord.find({
                key: {
                    $in: keys
                },
                langid: langid,
                articleid: articleid,
            }, {
                '_id': 0,
                'string': 1,
                'key': 1
            });

            if (langWords.length == 0) {
                success = false;
                errors.push('Unknown lang key');
            } else {
                langWords.forEach(value => {
                    res[value.key] = value.string;
                });
            }

        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`get word in all languages`, async ({
        keys
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let words = await db.LangWord.find({
                key: {
                    $in: keys
                }
            }, '-__v');
            res = {
                words
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`get dictionary`, async ({
        langId
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            if (langId === undefined) {
                langId = (await db.Lang.findOne({
                    default: true
                })).id;
            }
            res = (await db.LangWord.aggregate([{
                $match: {
                    langid: mongoose.Types.ObjectId(langId)
                }
            }, {
                $project: {
                    key: 1,
                    string: 1
                }
            }, {
                $addFields: {
                    array: [{
                        k: '$key',
                        v: '$string'
                    }]
                }
            }, {
                $project: {
                    array: 1
                }
            }, {
                $group: {
                    _id: null,
                    data: {
                        $push: {
                            $arrayToObject: '$array'
                        }
                    }
                }
            }, {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: '$data'
                    }
                }
            }]))[0] || {};
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });

    });

    /**
     * @desc sends a lang word object with data from database if wordId is set, otherwise an empty object to be filled
     * @param object 
     * @code
        {
            wordId  // string
        }
     * @endcode
     */
    socket.on('get lang word', async ({
        wordId
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let word = wordId ? await db.LangWord.findById(wordId) : new db.LangWord();
            res = {
                word
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    })

    /**
     * @desc save lang word, if word._id exists in the database just save changes, else adds new entry to every language
     * @param object
     * @code
        {
            word: {
                _id,    // string - optional
                key,    // string
                string, // string
                langid, // string - optional
            }
        }
     * @endcode
     */
    socket.on('post lang word', async ({
        word
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let newWord = await db.LangWord.exists({
                _id: word._id
            });

            if (!newWord) {
                langs = await db.Lang.find();

                langs.forEach(lang => {
                    db.LangWord.create({
                        ...word,
                        langid: lang.id
                    });
                });
            } else {
                res = {
                    word: await db.LangWord.findOneAndUpdate({
                        _id: word._id
                    }, word, {
                        new: true
                    })
                };
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @desc login with name and password
     * @param object  
     * @code
        {
            name,       // string
            password    // string
        }
     * @endcode
     */
    socket.on('login with name and password', async ({
        name,
        password
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let account = await db.Account.findOne({
                name: name
            }, {
                password: 1,
                hash: 1
            });

            if (!account) {
                success = false;
                errors.push(error('error_invalid_account'));
            } else {
                if (account.validPassword(password)) {
                    res = {
                        id: account.id,
                        hash: account.hash
                    };
                } else {
                    success = false;
                    errors.push(error('error_invalid_account'));
                }
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @desc Save user socket && join into his room
     * 
     * @param object
     * @code
        {
            userId,     // string
            userHash,   // string
        }
     * @endcode
     */
    socket.on('register socket', async ({
        userId,
        userHash
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let user = await db.Account.findOne({
                _id: userId,
                hash: userHash
            });
            if (!user) throw Error('Wrong user data');

            socket.join(userId);
            sockets[socket.id] = userId;
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @desc get user info
     * @param object 
     * @code
        {
            userId // string
        }
     * @endcode
     */
    socket.on('get user info', async ({
        userId
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let user = await db.Account.findOne({
                _id: userId
            });

            if (!user) {
                success = false;
            } else {
                res = {
                    user
                };
            }

            socket.join(userId);
            sockets[socket.id] = userId;
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @callback cb expects {success, res : {languages : [], defaultLanguage : ObjectId}, errors}
     */

    socket.on(`get all languages`, async cb => {
        let success = true,
            res = {},
            errors = [];

        try {
            let languages = await db.Lang.find({}).sort({
                default: -1
            });
            res = {
                languages: languages,
                defaultLanguage: languages[0].id
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });

    });

    /**
     * 
     * @param string search - the string the client searches by (i guess it should match the lang key or the string)
     * @param number itemsPerPage - how many items should one page have
     * @param number currentPage - the current page (starts from 0)
     * @param string selectedLanguage - either the ObjectId of the selected language or `` (in case of an empty string it should query all languages)
     * 
     * @callback cb expects {success, res : {items : [], count : Number}, errors}
     * count - the total number of documents matching the search criteria
     * !the `langid` field should be populated
     */
    socket.on(`get lang words page`, async ({
        search,
        itemsPerPage,
        currentPage,
        selectedLanguage
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let regxp = new RegExp(search, 'i'),
                filter = selectedLanguage ? {
                    $or: [{
                        key: regxp
                    }, {
                        string: regxp
                    }],
                    $and: [{
                        key: {
                            $not: new RegExp('article_title_|article_desc_|category_title_', 'i')
                        }
                    }],
                    langid: selectedLanguage
                } : {
                    $or: [{
                        key: regxp
                    }, {
                        string: regxp
                    }],
                    $and: [{
                        key: {
                            $not: new RegExp('article_title_|article_desc_', 'i')
                        }
                    }]
                },
                items = await db.LangWord.find(filter).limit(itemsPerPage).skip(currentPage * itemsPerPage),
                count = await db.LangWord.find(filter).countDocuments();
            res = {
                items,
                count
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @param number itemsPerPage - how many items should one page have
     * @param number currentPage - the current page (starts from 0)
     * 
     * @callback cb expects {success, res : {items : [], count : Number}, errors}
     * count - the total number of documents matching the search criteria
     */
    socket.on(`get lang page`, async ({
        itemsPerPage,
        currentPage
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            res = {
                items: await db.Lang.find().limit(itemsPerPage).skip(currentPage),
                count: await db.Lang.estimatedDocumentCount()
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @param array words - arrays with words to be saved
     */
    socket.on(`post words`, async ({
        words
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            await db.LangWord.create(words);
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error(e.message === 'key_duplicate' ? e.message : undefined));
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @param array words - arrays with words to be updated
     */
    socket.on(`put words`, async ({
        words
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            await Promise.all(
                words.map(async (word) => {
                    await db.LangWord.update({
                        _id: word._id
                    }, word);
                })
            );
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    socket.on('duplicate language', async ({
        langid
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let lang = await db.Lang.findById(langid),
                langWords = await db.LangWord.find({
                    langid
                }),
                newLang;
            lang = lang.toObject();
            delete lang._id;
            lang = {
                ...lang,
                shortcut: `${lang.shortcut}_copy`,
                name: `${lang.name} copy`,
                default: false,
            };
            newLang = await db.Lang.create(lang);
            await Promise.all(
                langWords.map(async (word) => {
                    let copy = word.toObject();
                    delete copy._id;
                    copy = new db.LangWord({
                        ...copy,
                        langid: newLang._id,
                    });
                    await copy.save();
                })
            );
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        io.emit('refresh lang page');
        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @desc get lang based on id
     */
    socket.on(`get language`, async ({
        langId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            res = {
                lang: await db.Lang.findById(langId)
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @desc update language
     * @param object lang - data to save
     * @param string baseLang - id of language to save the data to.
     */
    socket.on(`post language`, async ({
        lang,
        baseLang
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let newLang = new db.Lang(lang),
                baseWords = await db.LangWord.find({
                    langid: baseLang
                });
            await newLang.save();
            await Promise.all(
                baseWords.map(async (word) => {
                    let copy = word.toObject();
                    delete copy._id;
                    copy = new db.LangWord({
                        ...copy,
                        langid: newLang._id,
                    });
                    await copy.save();
                })
            );

        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        io.emit('refresh lang page');
        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @desc edit language
     */
    socket.on(`put language`, async ({
        lang
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            await db.Lang.updateOne({
                _id: lang._id
            }, lang);
            io.emit('refresh lang page');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    });

    socket.on('delete language', async ({
        langid
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let lang = await db.Lang.findById(langid);
            // make sure the default language can't be deleted.
            if (lang.default) {
                success = false;
                errors.push(error('error_delete_default_lang'));
            } else {
                await db.Lang.findByIdAndDelete(langid);
                await db.LangWord.deleteMany({
                    langid
                });
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        io.emit('refresh lang page');
        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`delete word`, async ({
        wordId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let word = await db.LangWord.findById(wordId),
                {
                    key
                } = word;
            await db.LangWord.deleteMany({
                key
            });
            io.emit('refresh lang words page');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    })


    /*
    get social links
    cb expects {success, res : {socialLinks}, errors}
    */
    socket.on(`get social links`, async cb => {

        let success = true,
            res = {},
            errors = [];

        try {
            let socialLinks = await db.SocialLink.find();
            res = {
                socialLinks
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /*
    get social link based on linkId
    cb expects {success, res : {socialLink}, errors}
    */
    socket.on(`get social link`, async ({
        linkId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let socialLink = await db.SocialLink.findById(linkId);
            res = {
                socialLink
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });


    /*
    add a new social link
    socialLink : {name, url, icon}
    cb expects : {success, errors}
    if successful it should also emit `refresh social links`
    */
    socket.on(`post social link`, async ({
        socialLink
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let link = new db.SocialLink(socialLink);
            await link.save();
            io.emit('refresh social links');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /*
    edit a social link
    socialLink : {name, url, icon}
    cb expects : {success, errors}
    if successful it should also emit `refresh social links`
    */
    socket.on(`put social link`, async ({
        socialLink
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            await db.SocialLink.updateOne({
                _id: socialLink._id
            }, socialLink);
            io.emit('refresh social links');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`delete social link`, async ({
        linkId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            await db.SocialLink.findByIdAndDelete(linkId);
            io.emit('refresh social links');


        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`get categories page`, async ({
        search,
        itemsPerPage,
        currentPage,
        selectedLanguage
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let string = new RegExp(search, 'i'),
                skip = currentPage * itemsPerPage;
            if (!selectedLanguage) {
                selectedLanguage = (await db.Lang.findOne({
                    default: true
                })).id;
            }
            let searchResult = (await db.LangWord.aggregate([{
                    $match: {
                        string,
                        key: new RegExp('category_title_'),
                        langid: mongoose.Types.ObjectId(selectedLanguage),
                    }
                },
                {
                    $project: {
                        catId: {
                            $substr: ['$key', 15, -1]
                        },
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        },
                        items: {
                            $push: '$catId',
                        }
                    }
                },
                {
                    $project: {
                        count: 1,
                        items: {
                            $slice: [
                                '$items',
                                skip,
                                itemsPerPage,
                            ]
                        }
                    }
                }
            ]))[0];

            res = {
                count: searchResult ? searchResult.count : 0,
                items: searchResult ? searchResult.items : {}
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`get all categories`, async cb => {

        let success = true,
            res = {},
            errors = [];

        try {
            let categories = await db.Category.find({}, '-__v').exec();
            res = {
                categories
            };
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`post category`, async ({
        category
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            if (category) {
                let newCategory = new db.Category();
                await newCategory.save();
                await Promise.all(
                    Object.keys(category).map(async langid => {
                        if (await db.Lang.exists({
                                _id: langid
                            })) {
                            let langWord = new db.LangWord({
                                key: `category_title_${newCategory._id}`,
                                string: category[langid],
                                langid,
                            });
                            langWord.save();
                        }
                    })
                );
                io.emit('referesh categories page');
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`put category`, async ({
        category,
        categoryId
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            if (db.Category.exists({
                    _id: categoryId
                })) {
                await Promise.all(
                    Object.keys(category).map(async langid => {
                        if (await db.Lang.exists({
                                _id: langid
                            })) {
                            await db.LangWord.findOneAndUpdate({
                                key: `category_title_${categoryId}`,
                                langid
                            }, {
                                string: category[langid]
                            });
                        }
                    })
                );
                io.emit('referesh categories page');
            } else {
                success = false,
                    errors.push(error('error_unknown_category'));
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`delete category`, async ({
        categoryId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            await db.Category.findByIdAndDelete(linkId);
            io.emit('refresh categories page');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    });

    // image upload test/example
    let uploader = new SocketIOFile(socket, {
        uploadDir: "dist/imgs/temp",
        accepts: ['image/png'],
        maxFileSize: 24194304,
        chunkSize: 1024000,
        transmissionDelay: 0,
        overwrite: true,
    });

    /* uploader.on('start', (fileInfo) => {
        console.log(fileInfo);
    }); */

    /* uploader.on('progress', (fileInfo) => {
        console.log(fileInfo);
    }); */

    uploader.on('complete', (fileInfo) => {
        let file = path.parse(fileInfo.name),
            image = new db.Image({
                ext: file.ext
            });
        /* console.log(fileInfo); */
        image.save(err => {
            if (err) console.log(err);
            fs.rename(
                path.resolve(fileInfo.uploadDir),
                path.resolve('./dist/imgs/temp/', `${image.id}${file.ext}`), err => {
                    if (err) console.log(err);
                    io.to(uploader.socket.id).emit(`image uploaded`, {
                        newImage: image
                    });
                }
            )
        });
    });

    /* uploader.on('saved', (fileInfo) => {
        console.log(fileInfo);
    }); */

    uploader.on('error', (err) => {
        console.log(err);
    });

    /*
    categorySlug - can be undefined (in that case, get all the articles, no matter the category)
    page - the first `page` would be 0
    langId - can be undefined (in that case the default lang should be used)
    cb expects {success, res : {items, count}, errors}
    items : [{title, thumbnail : Image, slug}]
    count - the number of all articles in that category
        */
    socket.on(`get articles page by category slug`, async ({
        categorySlug,
        itemsPerPage,
        page,
        langId
    }, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            langId = langId || (await db.Lang.findOne({
                default: true
            })).id;
            if (await db.Article.estimatedDocumentCount().exec() === 0) {
                res = {
                    items: [],
                    count: 0
                }
            } else {
                let skip = page * itemsPerPage,
                    searchResult = (await db.Category.aggregate([{
                        $match: {
                            slug: categorySlug,
                        }
                    }, {
                        $lookup: {
                            from: 'articles',
                            let: {
                                id: "$_id"
                            },
                            pipeline: [{
                                    $match: {
                                        $expr: {
                                            $in: [
                                                '$$id',
                                                '$categories'
                                            ]
                                        }
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'images',
                                        localField: 'thumbnail',
                                        foreignField: '_id',
                                        as: 'thumbnail'
                                    }
                                },
                                {
                                    $unwind: "$thumbnail"
                                },
                                {
                                    $project: {
                                        title: {
                                            $concat: [
                                                "article_title_",
                                                {
                                                    $toString: '$_id'
                                                }
                                            ]
                                        },
                                        description: {
                                            $concat: [
                                                "article_description_",
                                                {
                                                    $toString: '$_id'
                                                }
                                            ]
                                        },
                                        thumbnail: 1,
                                        slug: 1,
                                        _id: 1,
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'lang_words',
                                        let: {
                                            title: '$title'
                                        },
                                        pipeline: [{
                                            $match: {
                                                $expr: {
                                                    $eq: [
                                                        '$key',
                                                        '$$title'
                                                    ]
                                                },
                                                langid: mongoose.Types.ObjectId(langId)
                                            }
                                        }],
                                        as: 'title'
                                    }
                                },
                                {
                                    $lookup: {
                                        from: 'lang_words',
                                        let: {
                                            description: '$description'
                                        },
                                        pipeline: [{
                                            $match: {
                                                $expr: {
                                                    $eq: [
                                                        '$key',
                                                        '$$description'
                                                    ]
                                                },
                                                langid: mongoose.Types.ObjectId(langId)
                                            }
                                        }],
                                        as: 'description'
                                    }
                                },
                                {
                                    $project: {
                                        slug: 1,
                                        thumbnail: 1,
                                        posted: {
                                            $toDate: "$_id"
                                        },
                                        title: {
                                            $arrayElemAt: ['$title.string', 0]
                                        },
                                        description: {
                                            $arrayElemAt: ['$description.string', 0]
                                        }
                                    }
                                }
                            ],
                            as: 'items'
                        }
                    }, {
                        $project: {
                            _id: 0,
                            items: {
                                $slice: [
                                    '$items',
                                    skip,
                                    itemsPerPage
                                ]
                            },
                            count: {
                                $size: '$items',
                            }
                        }
                    }]))[0];

                res = {
                    count: searchResult ? searchResult.count : 0,
                    items: searchResult ? searchResult.items : {}
                };
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /*
    cb expects ({success, res : {items, count}, errors}
    selectedLanguage can be undefined
    */
    socket.on(`get articles page`, async ({
        search,
        itemsPerPage,
        currentPage,
        selectedLanguage
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let string = new RegExp(search, 'i'),
                skip = currentPage * itemsPerPage;

            selectedLanguage = selectedLanguage || (await db.Lang.findOne({
                default: true
            })).id;
            if (await db.Article.estimatedDocumentCount().exec() === 0) {
                res = {
                    items: [],
                    count: 0
                }
            } else {
                let searchResult = (await db.LangWord.aggregate([{
                    $match: {
                        string,
                        key: /article_title_/,
                        langid: mongoose.Types.ObjectId(selectedLanguage),
                    }
                }, {
                    $project: {
                        _id: 0,
                        articleId: {
                            $toObjectId: {
                                $substr: ['$key', 14, -1]
                            }
                        }
                    }
                }, {
                    $lookup: {
                        from: 'articles',
                        localField: 'articleId',
                        foreignField: '_id',
                        as: 'article',
                    }
                }, {
                    $match: {
                        article: {
                            $ne: []
                        }
                    }
                }, {
                    $facet: {
                        count: [{
                            $count: 'documents'
                        }],
                        items: [{
                            $skip: skip
                        }, {
                            $limit: itemsPerPage
                        }, {
                            $project: {
                                _id: {
                                    $arrayElemAt: ["$article._id", 0]
                                },
                                slug: {
                                    $arrayElemAt: ["$article.slug", 0]
                                },
                                thumbnail: {
                                    $arrayElemAt: ["$article.thumbnail", 0]
                                },
                                title: {
                                    $concat: [
                                        "article_title_",
                                        {
                                            $toString: {
                                                $arrayElemAt: ["$article._id", 0]
                                            }
                                        }
                                    ]
                                },
                                description: {
                                    $concat: [
                                        "article_description_",
                                        {
                                            $toString: {
                                                $arrayElemAt: ["$article._id", 0]
                                            }
                                        }
                                    ]
                                }
                            }
                        }, {
                            $lookup: {
                                from: 'images',
                                let: {
                                    id: "$thumbnail"
                                },
                                pipeline: [{
                                        $match: {
                                            $expr: {
                                                $eq: [
                                                    '$_id',
                                                    '$$id'
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            ext: 1,
                                            processed: true,
                                        }
                                    }
                                ],
                                as: 'thumbnail'
                            }
                        }, {
                            $lookup: {
                                from: 'lang_words',
                                let: {
                                    id: "$title"
                                },
                                pipeline: [{
                                        $match: {
                                            $expr: {
                                                $eq: [
                                                    '$key',
                                                    '$$id'
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            string: 1,
                                        }
                                    }
                                ],
                                as: 'title'
                            }
                        }, {
                            $lookup: {
                                from: 'lang_words',
                                let: {
                                    id: "$description"
                                },
                                pipeline: [{
                                        $match: {
                                            $expr: {
                                                $eq: [
                                                    '$key',
                                                    '$$id'
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            string: 1,
                                        }
                                    }
                                ],
                                as: 'description'
                            }
                        }, {
                            $replaceRoot: {
                                newRoot: {
                                    _id: "$_id",
                                    posted: {
                                        $toDate: "$_id"
                                    },
                                    slug: "$slug",
                                    thumbnail: {
                                        $arrayElemAt: ["$thumbnail", 0]
                                    },
                                    title: {
                                        $arrayElemAt: ["$title.string", 0]
                                    },
                                    description: {
                                        $arrayElemAt: ["$description.string", 0]
                                    }
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                items: {
                                    $push: "$$ROOT"
                                }
                            }
                        }]
                    }
                }, {
                    $project: {
                        count: {
                            $arrayElemAt: ["$count.documents", 0]
                        },
                        items: {
                            $arrayElemAt: ["$items.items", 0]
                        }
                    }
                }]))[0];

                res = {
                    count: searchResult ? searchResult.count : 0,
                    items: searchResult ? searchResult.items : {}
                };
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /*
    get article by articleId
    cb expects {success, res : {article}, errors}
     */
    socket.on(`get article`, async ({
        articleId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            if (articleId) {
                let article = (await db.Article.aggregate([{
                    $match: {
                        _id: mongoose.Types.ObjectId(articleId),
                    }
                }, {
                    $lookup: {
                        from: 'images',
                        localField: 'thumbnail',
                        foreignField: '_id',
                        as: 'thumbnail'
                    }
                }, {
                    $unwind: {
                        path: '$thumbnail',
                        preserveNullAndEmptyArrays: false
                    }
                }, {
                    $lookup: {
                        from: 'images',
                        localField: 'images',
                        foreignField: '_id',
                        as: 'images'
                    }
                }, {
                    $lookup: {
                        from: 'lang_words',
                        let: {
                            id: "$_id"
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: [
                                            '$key',
                                            {
                                                $concat: [
                                                    "article_title_",
                                                    {
                                                        $toString: "$$id"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    string: 1,
                                    langid: 1,
                                }
                            }
                        ],
                        as: 'title'
                    }
                }, {
                    $lookup: {
                        from: 'lang_words',
                        let: {
                            id: "$_id"
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: [
                                            '$key',
                                            {
                                                $concat: [
                                                    "article_description_",
                                                    {
                                                        $toString: "$$id"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    string: 1,
                                    langid: 1,
                                }
                            }
                        ],
                        as: 'description'
                    }
                }, {
                    $project: {
                        similarWork: 1,
                        demo: 1,
                        categories: 1,
                        thumbnail: 1,
                        images: 1,
                        slug: 1,
                        title: {
                            $arrayToObject: {
                                $map: {
                                    input: '$title',
                                    as: 'el',
                                    in: {
                                        k: {
                                            $toString: '$$el.langid'
                                        },
                                        v: '$$el.string'
                                    }
                                }
                            }
                        },
                        description: {
                            $arrayToObject: {
                                $map: {
                                    input: '$description',
                                    as: 'el',
                                    in: {
                                        k: {
                                            $toString: '$$el.langid'
                                        },
                                        v: '$$el.string'
                                    }
                                }
                            }
                        }
                    }
                }]))[0];
                if (article) {
                    res = article;
                } else {
                    success = false;
                    errors.push(error('error_article_not_found'));
                }
            } else {
                res = new db.Article();
                res.save();
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /*
    get article by slug
    cb expects {success, res : {article}, errors}
     */
    socket.on(`get article by slug`, async ({
        slug
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            if (slug) {
                let article = (await db.Article.aggregate([{
                    $match: {
                        slug,
                    }
                }, {
                    $lookup: {
                        from: 'images',
                        localField: 'thumbnail',
                        foreignField: '_id',
                        as: 'thumbnail'
                    }
                }, {
                    $unwind: {
                        path: '$thumbnail',
                        preserveNullAndEmptyArrays: false
                    }
                }, {
                    $lookup: {
                        from: 'images',
                        localField: 'images',
                        foreignField: '_id',
                        as: 'images'
                    }
                }, {
                    $lookup: {
                        from: 'lang_words',
                        let: {
                            id: "$_id"
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: [
                                            '$key',
                                            {
                                                $concat: [
                                                    "article_title_",
                                                    {
                                                        $toString: "$$id"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    string: 1,
                                    langid: 1,
                                }
                            }
                        ],
                        as: 'title'
                    }
                }, {
                    $lookup: {
                        from: 'lang_words',
                        let: {
                            id: "$_id"
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: [
                                            '$key',
                                            {
                                                $concat: [
                                                    "article_description_",
                                                    {
                                                        $toString: "$$id"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    string: 1,
                                    langid: 1,
                                }
                            }
                        ],
                        as: 'description'
                    }
                }, {
                    $project: {
                        similarWork: 1,
                        demo: 1,
                        categories: 1,
                        thumbnail: 1,
                        images: 1,
                        slug: 1,
                        title: {
                            $arrayToObject: {
                                $map: {
                                    input: '$title',
                                    as: 'el',
                                    in: {
                                        k: {
                                            $toString: '$$el.langid'
                                        },
                                        v: '$$el.string'
                                    }
                                }
                            }
                        },
                        description: {
                            $arrayToObject: {
                                $map: {
                                    input: '$description',
                                    as: 'el',
                                    in: {
                                        k: {
                                            $toString: '$$el.langid'
                                        },
                                        v: '$$el.string'
                                    }
                                }
                            }
                        }
                    }
                }]))[0];

                if (article) {
                    res = article;
                } else {
                    success = false;
                    errors.push(error('error_article_not_found'));
                }
            } else {
                success = false;
                errors.push(error('error_article_not_found'));
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({
            success,
            res,
            errors
        });
    });

    /*
    delete article
    cb expects {success, errors}

    if successful it should also emit `refresh articles page`
    */
    socket.on(`delete article`, async ({
        articleId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let article = (await db.Article.aggregate([{
                $match: {
                    _id: mongoose.Types.ObjectId(articleId),
                }
            }, {
                $lookup: {
                    from: 'images',
                    localField: 'images',
                    foreignField: '_id',
                    as: 'images'
                }
            }, {
                $lookup: {
                    from: 'images',
                    localField: 'thumbnail',
                    foreignField: '_id',
                    as: 'thumbnail'
                }
            }, {
                $unwind: '$thumbnail'
            }, {
                $project: {
                    images: 1,
                    thumbnail: 1,
                }
            }]))[0];
            if (article) {
                let {
                        thumbnail,
                        images
                    } = article
                    bulkWrite = [];
                fs.unlink(path.join('./dist/imgs/', `${thumbnail._id}${thumbnail.ext}`), err => {
                    if(err) console.log(err);
                });
                bulkWrite.push({
                    deleteOne: {
                        filter: {
                            _id: thumbnail._id,
                        }
                    }
                });
                images.forEach(image => {
                    fs.unlink(path.join('./dist/imgs/', `${image._id}${image.ext}`), err => {
                        if(err) console.log(err);
                    });
                    fs.unlink(path.join('./dist/imgs/', `${image._id}_preview${image.ext}`), err => {
                        if(err) console.log(err);
                    });
                    bulkWrite.push({
                        deleteOne: {
                            filter: {
                                _id: image._id,
                            }
                        }
                    });
                });

                await db.Image.bulkWrite(bulkWrite);
                await db.Article.deleteOne({_id: articleId});
                io.emit(`refresh articles page`);
            } else {
                success = true;
                errors.push('error_article_delete_not_found');
            }

        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });

    });

    /*
    create/edit article
    article : {
        _id?,
        categories: [ObjectId],
        similarWork,
        demo,
        title : {langId, string},
        description : {langId, string},
        thumbnail : ObjectId,
        images : [ObjectId]
    }
    (!) the thumbnail is not included in the images array (!)
    if successful it should also emit `refresh articles page`
        */
    socket.on(`post article`, async ({
        article,
    }, cb) => {

        let success = true,
            res = {},
            errors = [],
            {
                _id,
                categories,
                demo,
                title,
                description,
                thumbnail,
                images,
            } = article;

        // demo must be an empty tring or a string with a valid url that start with http(s)://
        if (demo && !/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#%[\]@!\$&'\(\)\*\+,;=.]+$/.test(demo)) {
            errors.push(error('error_article_demo_invalid_url'));
        }
        // user must select at least one category
        if (categories.length == 0) {
            errors.push(error('error_article_no_categories'));
        }
        // user must select a thumbnail
        if (!thumbnail) {
            errors.push(error('error_article_no_thumbnail'));
        }
        // user must upload at least one image even if it's the thumbnail
        if (images.length == 0 && !thumbnail) {
            errors.push(error('error_article_no_images'));
        }
        // default language title is a must
        if (!title[(await db.Lang.findOne({
                default: true
            })).id]) {
            errors.push(error('error_article_default_lang_title'));
        }

        if (errors.length != 0) {
            success = false;
        } else {
            try {
                let finalDir = path.resolve('./dist/imgs/'),
                    cmpDir = path.resolve('./dist/imgs/compr/'),
                    bulkWrite = [];

                delete article.title;
                delete article.description;

                article = new db.Article(article);
                // compress all images
                let cmpImages = await imagemin(['./dist/imgs/temp/*.{jpg,png}'], {
                    destination: './dist/imgs/compr',
                    plugins: [
                        imageminJpegtran(),
                        imageminPngquant({
                            quality: [0.8, 0.85],
                            strip: true,
                        }),
                    ]
                });

                cmpImages.forEach(image => {
                    fs.unlink(path.resolve(image.sourcePath), err => {
                        if(err) console.log(err);
                    })
                });

                if (thumbnail) {
                    thumbnail = await db.Image.findById(thumbnail);

                    if (!thumbnail.processed) {
                        let thumbnailName = `${thumbnail.id}${thumbnail.ext}`,
                            sharpFile = sharp(path.resolve(cmpDir, thumbnailName)),
                            fileMeta = await sharpFile.metadata();
                        // process thumbnail
                        if (fileMeta.width > 235 || fileMeta.height > 235) {

                            // create a copy of the thumbnail to have something to show off
                            if (images.length == 0) {
                                let image = new db.Image({
                                    ext: thumbnail.ext,
                                });
                                images.push(image.id);
                                fs.copyFileSync(path.resolve(cmpDir, thumbnailName), path.resolve(cmpDir, `${image.id}${image.ext}`));
                                await image.save();
                            }

                            await sharpFile.resize({
                                height: 235,
                                width: 235,
                            }).toFile(path.resolve(finalDir, thumbnailName));

                            fs.unlink(path.resolve(cmpDir, thumbnailName), err => {
                                if (err) console.log(err);
                            });

                            bulkWrite.push({
                                updateOne: {
                                    filter: {
                                        _id: thumbnail._id
                                    },
                                    update: {
                                        processed: true,
                                    },
                                }
                            });
                        } else {
                            errors.push(error('error_article_thumbnail_too_small'));
                        }
                    }
                }
                if (errors.length == 0) {
                    article.images = [...images];
                    // process images array
                    await Promise.all(
                        images.map(async id => {

                            let image = await db.Image.findById(id);
                            if (image && !image.processed) {
                                let file = sharp(path.resolve(cmpDir, `${image.id}${image.ext}`)),
                                    metadata = await file.metadata();
                                await file.toFile(path.resolve(finalDir, `${image.id}${image.ext}`));
                                if (metadata.height > 150 || metadata.width > 150) {
                                    await file.resize({
                                        width: 150,
                                        height: 150
                                    }).toFile(path.resolve(finalDir, `${image.id}_preview${image.ext}`));
                                } else {
                                    await file.toFile(path.resolve(finalDir, `${image.id}_preview${image.ext}`));
                                }

                                fs.unlink(path.resolve(cmpDir, `${image.id}${image.ext}`), err => {
                                    if(err) console.log(err);
                                });

                                bulkWrite.push({
                                    updateOne: {
                                        filter: {
                                            _id: image._id,
                                        },
                                        update: {
                                            processed: true,
                                        }
                                    }
                                });
                            }
                        })
                    );
                    if (bulkWrite.length) {
                        await db.Image.bulkWrite(bulkWrite);
                        bulkWrite = [];
                    }
                    // process title & description
                    await Promise.all(
                        Object.keys(title).map(async langid => {
                            if (title[langid]) {
                                let key = `article_title_${article.id}`,
                                    word = await db.LangWord.findOne({
                                        langid,
                                        key
                                    }, '_id');

                                if (word) {
                                    bulkWrite.push({
                                        updateOne: {
                                            filter: {
                                                _id: word._id,
                                            },
                                            update: {
                                                string: title[langid]
                                            }
                                        }
                                    });
                                } else {
                                    bulkWrite.push({
                                        insertOne: {
                                            document: new db.LangWord({
                                                key,
                                                langid,
                                                string: title[langid],
                                            }),
                                        }
                                    });
                                }
                            }
                        })
                    );
                    await Promise.all(
                        Object.keys(description).map(async langid => {
                            if (description[langid]) {
                                let key = `article_description_${article.id}`,
                                    word = await db.LangWord.findOne({
                                        langid,
                                        key
                                    }, '_id');

                                if (word) {
                                    bulkWrite.push({
                                        updateOne: {
                                            filter: {
                                                _id: word._id,
                                            },
                                            update: {
                                                string: description[langid]
                                            }
                                        }
                                    });
                                } else {
                                    bulkWrite.push({
                                        insertOne: {
                                            document: new db.LangWord({
                                                key,
                                                langid,
                                                string: description[langid],
                                            }),
                                        }
                                    });
                                }
                            }
                        })
                    );

                    if (bulkWrite.length) {
                        await db.LangWord.bulkWrite(bulkWrite);
                    }
                    if (await db.Article.findById(article._id)) {
                        await db.Article.findByIdAndUpdate(_id.toString(), article);
                    } else {
                        await article.save();
                    }
                }

                if (errors.length != 0) {
                    success = false;
                }

            } catch (e) {
                console.log(e);
                success = false;
                errors.push(error());
            }
        }

        cb({
            success,
            res,
            errors
        });
    });

    socket.on(`delete image`, async ({
        imageId
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let image = await db.Image.findById(imageId, '_id ext processed');
            if (image) {
                if (!image.processed) {
                    let file = path.resolve('./dist/imgs/temp/', `${image.id}${image.ext}`);
                    await db.Image.deleteOne({
                        _id: imageId
                    });
                    if (fs.existsSync(file)) {
                        fs.unlink(file, err => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                } else {
                    image.set('articleId', undefined);
                }
            } else {
                success = false;
                errors.push(error('error_image_not_found'));
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({
            success,
            res,
            errors
        });
    });

    /**
     * @desc disconnect user
     */
    socket.on('disconnect', () => {
        let userId = sockets[socket.id];
        if (userId === undefined) return;

        socket.leave(userId);

        delete sockets[socket.id];

    });
};