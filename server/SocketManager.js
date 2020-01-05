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
            res = {words};
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
                count: searchResult.count || 0,
                items: searchResult.items || {}
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
            res = {categories};
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

    uploader.on('complete', (fileInfo) => {
        let file = path.parse(fileInfo.name),
            image = new db.Image({
                ext: file.ext
            });
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
            if (!selectedLanguage) {
                let defaultLanguage = await db.Lang.findOne({
                    default: true
                });
                selectedLanguage = defaultLanguage.id;
            }
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
                    count: searchResult.count || 0,
                    items: searchResult.items || {}
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
                        _id: mongoose.Types.ObjectId(articleId)
                    }
                }, {
                    $lookup: {
                        from: 'images',
                        let: {
                            id: "$_id",
                            thumb: '$thumbnail'
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: [
                                            '$articleId',
                                            '$$id'
                                        ]
                                    }
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $not: {
                                            $eq: [
                                                '$_id',
                                                '$$thumb'
                                            ]
                                        }
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
                        as: 'images'
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
                    $unwind: {
                        path: '$thumbnail',
                        preserveNullAndEmptyArrays: false
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
                        let: {
                            id: "$_id",
                            thumb: '$thumbnail'
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: [
                                            '$articleId',
                                            '$$id'
                                        ]
                                    }
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $not: {
                                            $eq: [
                                                '$_id',
                                                '$$thumb'
                                            ]
                                        }
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
                        as: 'images'
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
                    $unwind: {
                        path: '$thumbnail',
                        preserveNullAndEmptyArrays: false
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
            articleId = (await db.Article.findByIdAndDelete(articleId, {
                projection: '_id'
            }).exec())._id;
            if (articleId) {
                let images = await db.Image.find({
                        articleId
                    }, '_id ext'),
                    tmpDir = './dist/imgs/temp/',
                    imgsDir = './dist/imgs/';

                images.forEach(image => {
                    if (fs.existsSync(path.resolve(imgsDir, `${image.id}${image.ext}`))) {
                        fs.unlinkSync(path.resolve(imgsDir, `${image.id}${image.ext}`));
                    }

                    if (fs.existsSync(path.resolve(imgsDir, `${image.id}_preview${image.ext}`))) {
                        fs.unlinkSync(path.resolve(imgsDir, `${image.id}_preview${image.ext}`));
                    }

                    if (fs.existsSync(path.resolve(imgsDir, `${image.id}_blurred${image.ext}`))) {
                        fs.unlinkSync(path.resolve(imgsDir, `${image.id}_blurred${image.ext}`));
                    }

                    if (fs.existsSync(path.resolve(tmpDir, `${image.id}${image.ext}`))) {
                        fs.unlinkSync(path.resolve(tmpDir, `${image.id}${image.ext}`));
                    }
                });

                await db.Image.deleteMany({
                    articleId
                });

                io.emit(`refresh articles page`);
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
    create/edit article
    article : {
        _id?,
        category : ObjectId,
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
        edit,
    }, cb) => {

        let success = true,
            res = {},
            errors = [];

        try {
            let {
                similarWork,
                demo,
                categories,
                thumbnail,
                title,
                description,
                images
            } = article,
            newArticle = await db.Article.findById(article._id, '-__v'),
            tmpDir = path.resolve('./dist/imgs/temp/'),
            finalDir = path.resolve('./dist/imgs/');

            newArticle = newArticle || new db.Article();
            newArticle.set('similarWork', similarWork);
            newArticle.set('demo', demo);

            if (categories.length == 0) {
                success = false;
                errors.push(error('error_select_category'))
            } else {
                // process images to reduce size
                await imagemin(['./dist/imgs/temp/*.{jpng,png}'], {
                    destination: './dist/imgs/temp/',
                    plugins: [
                        imageminJpegtran(),
                        imageminPngquant({
                            quality: [0.8, 0.85],
                            strip: true,
                        }),
                    ]
                });

                // check if there is thumbnail set
                if (thumbnail) {

                    // check if image was uploaded and saved into the database
                    let thumbData = await db.Image.findById(thumbnail, '_id ext');
                    if (thumbData && !thumbData.processed) {
                            let thumbFile = sharp(path.resolve(tmpDir, `${thumbData.id}${thumbData.ext}`));
                            
                            // if images is empty create a thumbnail copy so we have something to showoff still
                            if (images.length == 0) {
                                let image = new db.Image({
                                    ext: thumbData.ext,
                                    articleId: newArticle._id,
                                });
                                images.push(image.id);
                                fs.copyFileSync(path.resolve(tmpDir, `${thumbData.id}${thumbData.ext}`), path.resolve(tmpDir, `${image.id}${image.ext}`));
                                await image.save();
                            }

                            // resize thumbnail
                            if ((await thumbFile.metadata()).height > 235) {
                                await thumbFile.resize({
                                    height: 235,
                                    width: 235
                                }).toFile(path.resolve(finalDir, `${thumbData.id}${thumbData.ext}`));

                                // blurred version for lazy loading
                                await thumbFile.blur(60).toFile(path.resolve(finalDir, `${thumbData.id}_blurred${thumbData.ext}`));
                                newArticle.set('thumbnail', thumbData.id);
                                fs.unlinkSync(path.resolve(tmpDir, `${thumbData.id}${thumbData.ext}`));
                                await db.Image.updateOne({_id: thumbnail}, {
                                    processed: true,
                                    articleId: newArticle._id
                                });
                            } else {
                                success = false;
                                errors.push(error('error_thumbnail_too_small'));
                            }
                    } else {
                        success = false;
                        errors.push(error());
                    }
                } else {
                    if (images.length > 1) {
                        success = false;
                        errors.push(error('error_thumbnail_not_selected'));
                    } else {
                        if (images.length == 0) {
                            success = false;
                            errors.push(error('error_article_no_images'));
                            // if there is no thumbnail selected and only one image in the images array, 
                            // make a copy and process it like a thumbnail
                        } else {
                            let image = await db.Image.findById(images[0], '_id ext');
                            if (image && !image.processed) {
                                let newImage = new db.Image({
                                    ext: image.ext,
                                    articleId: newArticle._id,
                                });
                                fs.copyFileSync(path.resolve(tmpDir, `${image.id}${image.ext}`), path.resolve(tmpDir, `${newImage.id}${newImage.ext}`));
                                // process it like a thumbnail
                                let thumbFile = sharp(path.resolve(tmpDir, `${newImage.id}${newImage.ext}`)),
                                    metadata = await thumbFile.metadata();
                                if (metadata.height > 235 || metadata.width > 235) {
                                    await thumbFile.resize({
                                        height: 235,
                                        width: 235
                                    }).toFile(path.resolve(finalDir, `${newImage.id}${newImage.ext}`));
                                    await sharp(path.resolve(finalDir, `${newImage.id}${newImage.ext}`))
                                        .blur(60)
                                        .toFile(path.resolve(finalDir, `${newImage.id}_blurred${newImage.ext}`));
                                    newArticle.set('thumbnail', newImage.id);
                                    newImage.set('processed', true);
                                    await newImage.save();
                                    fs.unlinkSync(path.resolve(tmpDir, `${newImage.id}${newImage.ext}`));
                                    await db.Image.updateOne({_id: images[0]}, {
                                        processed: true,
                                        articleId: newArticle._id
                                    });
                                } else {
                                    success = false;
                                    errors.push(error('error_thumbnail_height_too_small'));
                                }
                            } else {
                                success = false;
                                errors.push(error('error_article_only_image_not_found'));
                            }
                        }
                    }
                }

                if (success) {
                    // process images array
                    await Promise.all(
                        images.map(async id => {
                            let image = await db.Image.findById(id, '_id ext');
                            if (image && !image.processed) {
                                console.log(path.resolve(tmpDir, `${image.id}${image.ext}`));
                                let file = sharp(path.resolve(tmpDir, `${image.id}${image.ext}`)),
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
                                fs.unlinkSync(path.resolve(tmpDir, `${image.id}${image.ext}`));

                                image.set('processed', true);
                                image.set('articleId', newArticle._id);
                                await image.save();
                            }
                        })
                    );
                    let objIdCategories = [];

                    for (let i in categories) {
                        objIdCategories.push(mongoose.Types.ObjectId(categories[i]));
                    }
                    newArticle.set('categories', objIdCategories);

                    // process title & description
                    await Promise.all(
                        Object.keys(title).map(async langid => {
                            if (title[langid]) {
                                let key = `article_title_${newArticle.id}`,
                                    word = db.LangWord.findOne({key});

                                word = word || new db.LangWord({key, langid});
                                word.set('string', title[langid]);
                                await word.save();
                            }
                        })
                    );

                    await Promise.all(
                        Object.keys(description).map(async langid => {
                            if (description[langid]) {
                                let key = `article_description_${newArticle.id}`,
                                    word = db.LangWord.findOne({key});

                                word = word || new db.LangWord({key, langid});
                                word.set('string', description[langid]);
                                await word.save();
                            }
                        })
                    );

                    await newArticle.save();

                    io.emit(`refresh articles page`);
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
                    await db.Image.deleteOne({_id: imageId});
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