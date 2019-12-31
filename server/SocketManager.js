const sharp = require('sharp');
const fs = require('fs');
let db = require('./mongoose'),
    SocketIOFile = require('socket.io-file'),
    // fn
    error = (message = 'unexpected_server_error', type = 'error') => {
        return {message, type};
    },
    // vars
    sockets = {};

let mongoose = require('mongoose');

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
    socket.on('get lang words', async ({keys, langid, articleid}, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            if(langid === undefined) {
                langid = await db.Lang.find({default: true});
            }
            let langWords = await db.LangWord.find(
                { 
                    key: { $in: keys },
                    langid: langid,
                    articleid: articleid,
                }, 
                {
                    '_id': 0, 
                    'string': 1, 
                    'key': 1
                }
            );

            if(langWords.length == 0) {
                success = false;
                errors.push('Unknown lang key');
            } else {
                langWords.forEach(value => {
                    res[value.key] = value.string;
                });
            }

        } catch(e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    socket.on(`get dictionary`, async ({langId}, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            if(langId === undefined) {
                langId = await db.Lang.find({default: true});
            }
            let langWords = await db.LangWord.find({langid: langId}).exec();

            if(langWords.length === 0) {
                success = false;
                errors.push(error('language_words_missing'))
            } else {
                langWords.forEach(value => {
                    res[value.key] = value.string;
                });
            }

        } catch(e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});

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
    socket.on('get lang word', async ({wordId}, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let word = wordId ? await db.LangWord.findById(wordId) : new db.LangWord();
            res = {word};
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({success, res, errors});
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
    socket.on('post lang word', async ({word}, cb ) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let newWord = await db.LangWord.exists({_id: word._id});

            if(!newWord) {
                langs = await db.Lang.find();

                langs.forEach(lang => {
                    db.LangWord.create({...word, langid: lang.id});
                });
            } else {
                res = {word: await db.LangWord.findOneAndUpdate({_id: word._id}, word, {new : true})};
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    // TODO: Handle images
    socket.on('post new article', async ({images, text, categories, similarWork, demo}, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let article = new db.Article({
                similarWork,
                categories,
                demo,
            });
            res = {article, langs: {}};
            await Promise.all(
                Object.keys(text).map( async (langid) => {
                    let {title, desc} = text[langid];
                    res.langs[langid] = await db.LangWord.create([{key: `article_title_${article.id}`, string: title, langid},{key: `article_desc_${article.id}`, string: desc, langid}]);
                })
            );
            console.log(res.langs);
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
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
    socket.on('login with name and password', async ({name, password}, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let account = await db.Account.findOne({
                name: name
            }, {password: 1, hash: 1});

            if(!account) {
                success = false;
                errors.push(error('invalid_account'));
            } else {
                if(account.validPassword(password)) {
                res = {id: account.id, hash: account.hash}; 
                } else {
                    success = false;
                    errors.push(error('invalid_account'));
                }
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
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
    socket.on('register socket', async ({userId, userHash}, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let user = await db.Account.findOne({_id: userId, hash: userHash});
            if(!user) throw Error('Wrong user data');

            socket.join(userId);
            sockets[socket.id] = userId;
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
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
    socket.on('get user info', async ({userId}, cb) => {
        let success = true,
            res = {},
            errors = [];

        try {
            let user = await db.Account.findOne({_id: userId});

            if(!user) {
                success = false;
            } else {
                res = {user};
            }
            
            socket.join(userId);
            sockets[socket.id] = userId;
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    /**
     * @callback cb expects {success, res : {languages : [], defaultLanguage : ObjectId}, errors}
     */

    socket.on(`get all languages`, async cb => {
        let success = true,
            res = {},
            errors = [];
        
        try {
            let languages = await db.Lang.find({}).sort({default: -1});
            res = {languages: languages, defaultLanguage: languages[0].id};
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});

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
    socket.on(`get lang words page`, async ({search, itemsPerPage, currentPage, selectedLanguage}, cb) => {
        
        let success = true,
            res = {},
            errors = [];
        
        try {
            let regxp = new RegExp(search, 'i'),
                filter = selectedLanguage ? {$or: [{key: regxp}, {string: regxp}], $and: [{key: {$not: new RegExp('article_title_|article_desc_|category_title_', 'i')}}], langid: selectedLanguage} : {$or: [{key: regxp}, {string: regxp}], $and: [{key: {$not: new RegExp('article_title_|article_desc_', 'i')}}]},
                items = await db.LangWord.find(filter).limit(itemsPerPage).skip(currentPage * itemsPerPage),
                count = await db.LangWord.find(filter).countDocuments();
                res = {items, count};
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    /**
     * @param number itemsPerPage - how many items should one page have
     * @param number currentPage - the current page (starts from 0)
     * 
     * @callback cb expects {success, res : {items : [], count : Number}, errors}
     * count - the total number of documents matching the search criteria
     */
    socket.on(`get lang page`, async ({itemsPerPage, currentPage}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            res = {items: await db.Lang.find().limit(itemsPerPage).skip(currentPage), count: await db.Lang.estimatedDocumentCount()};
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    /**
     * @param array words - arrays with words to be saved
     */
    socket.on(`post words`, async ({words}, cb) => {
        
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

        cb({success, res, errors});
    });

    /**
     * @param array words - arrays with words to be updated
     */
    socket.on(`put words`, async ({words}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            await Promise.all(
                words.map( async (word) => {
                   await db.LangWord.update({_id: word._id}, word);
                })
            );
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    socket.on('duplicate language', async({langid}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            let lang = await db.Lang.findById(langid),
                langWords = await db.LangWord.find({langid}),
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
                langWords.map( async(word) => {
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
        cb({success, res, errors});
    });

    /**
     * @desc get lang based on id
     */
    socket.on(`get language`, async ({langId}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            res = {lang: await db.Lang.findById(langId)}
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    /**
     * @desc update language
     * @param object lang - data to save
     * @param string baseLang - id of language to save the data to.
     */
    socket.on(`post language`, async ({lang, baseLang}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            let newLang = new db.Lang(lang),
                baseWords = await db.LangWord.find({langid: baseLang});
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
        cb({success, res, errors});
    });

    /**
     * @desc edit language
     */
    socket.on(`put language`, async ({lang}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            await db.Lang.updateOne({_id: lang._id}, lang);
            io.emit('refresh lang page');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({success, res, errors});
    });

    socket.on('delete language', async({langid}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            let lang = await db.Lang.findById(langid);
            // make sure the default language can't be deleted.
            if(lang.default) {
                success = false;
                errors.push(error('delete_default_lang'));
            } else {
                await db.Lang.findByIdAndDelete(langid);
                await db.LangWord.deleteMany({langid});
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        io.emit('refresh lang page');
        cb({success, res, errors});
    });

    socket.on(`delete word`, async ({wordId}, cb) => {
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            let word    = await db.LangWord.findById(wordId),
                {key}     = word;
            await db.LangWord.deleteMany({key});
            io.emit('refresh lang words page');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({success, res, errors});
    })

    socket.on(`get social links`, async cb => {
       //TODO
       /*
       get social links
       cb expects {success, res : {socialLinks}, errors}
        */
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            let socialLinks = await db.SocialLink.find();
            res = {socialLinks};
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    socket.on(`get social link`, async ({linkId}, cb) => {
       //TODO
       /*
       get social link based on linkId
       cb expects {success, res : {socialLink}, errors}
        */
        
        let success = true,
        res = {},
        errors = [];
        
        try {
            let socialLink = await db.SocialLink.findById(linkId);
            res = {socialLink};
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        
        cb({success, res, errors});
    });

    socket.on(`post social link`, async ({socialLink}, cb) => {
       //TODO
       /*
       add a new social link
       socialLink : {name, url, icon}
       cb expects : {success, errors}
       if successful it should also emit `refresh social links`
        */
        
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
        
        cb({success, res, errors});
    });

    socket.on(`put social link`, async ({socialLink}, cb) => {
       //TODO
       /*
       edit a social link
       socialLink : {name, url, icon}
       cb expects : {success, errors}
       if successful it should also emit `refresh social links`
        */
        let success = true,
        res = {},
        errors = [];
        
        try {
            await db.SocialLink.updateOne({_id: socialLink._id}, socialLink);
            io.emit('refresh social links');
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
        cb({success, res, errors});
    });

    socket.on(`delete social link`, async ({linkId}, cb) => {
        
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
        cb({success, res, errors});
    });

    socket.on(`get categories page`, async ({search, itemsPerPage, currentPage, selectedLanguage}, cb) => {        
        let success = true,
        res = {},
        errors = [];
        
        try {
            let string = new RegExp(search, 'i'),
                skip = currentPage * itemsPerPage;
            if(!selectedLanguage) {
                let defaultLanguage = await db.Lang.findOne({default: true});
                selectedLanguage = defaultLanguage.id;
            }
            res = await db.LangWord.aggregate([
                    {
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
                            count: {$sum: 1},
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
                ]);
            res = res[0];
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }

        cb({success, res, errors});
    });

    socket.on(`post category`, async ({category}, cb) => {
       let success = true,
       res = {},
       errors = [];
       
       try {
            let newCategory = new db.Category();
            await newCategory.save();
            await Promise.all(
                Object.keys(category).map(async langid => {
                    if(await db.Lang.exists({_id: langid})) {
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
       } catch (e) {
           console.log(e);
           success = false;
           errors.push(error());
       }

       cb({success, res, errors}); 
    });

    socket.on(`put category`, async ({category, categoryId}, cb) => {
        let success = true,
        res = {},
        errors = [];
        
        try {
            if(db.Category.exists({_id: categoryId})) {
                await Promise.all(
                    Object.keys(category).map(async langid => {
                        if(await db.Lang.exists({_id: langid})) {
                            await db.LangWord.findOneAndUpdate({key: `category_title_${categoryId}`, langid}, {string: category[langid]});
                        }
                    })
                );
                io.emit('referesh categories page');
            } else {
                success = false,
                errors.push(error('unknown_category'));
            }
        } catch (e) {
            console.log(e);
            success = false;
            errors.push(error());
        }
 
        cb({success, res, errors}); 
    });

    socket.on(`delete category`, async ({categoryId}, cb) => {
        
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
        cb({success, res, errors});
    });

    /**
     * @desc disconnect user
     */
    socket.on('disconnect', () => {
        let userId = sockets[socket.id];
        if(userId === undefined) return;

        socket.leave(userId);

        delete sockets[socket.id];
        
    });

    // image upload test/example
    let uploader = new SocketIOFile(socket, {
       uploadDir : "data/temp",
       accepts : ['image/png'],
        maxFileSize : 4194304,
        chunkSize : 10240,
        transmissionDelay : 0,
        overwrite : true
    });

    uploader.on('start', (fileInfo) => {
        console.log('Start uploading');
        console.log(fileInfo);
    });

    uploader.on('stream', (fileInfo) => {
        console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
    });

    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.');
        console.log(fileInfo);
        sharp(fileInfo.uploadDir)
            .resize(250)
            .toFile(`dist/imgs/${fileInfo.name}`,  (err, info) => {
                if (err) throw err;
                console.log({info});
                fs.unlink(fileInfo.uploadDir, (err) => {
                    console.log(err);
                });
                let newImage = new db.Image();
                newImage.articleId = fileInfo.data.articleId;
                newImage.url = `imgs/${fileInfo.name}`;
                newImage.save(() => {
                    io.to(uploader.socket.id).emit(`image uploaded`, {newImage});
                });
            });
    });

    uploader.on('error', (err) => {
        console.log('Error!', err);
    });

    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo);
    });


    socket.on(`get articles page`, ({search, itemsPerPage, currentPage, selectedLanguage}, cb) => {
        //TODO
        /*
        cb expects ({success, res : {items, count}, errors}
        selectedLanguage can be undefined
         */
    });

    socket.on(`get article`, ({articleId}, cb) => {
        //TODO
        /*
        get article by articleId
        cb expects {success, res : {article}, errors}
         */
    });

    socket.on(`delete article`, ({articleId}, cb) => {
       //TODO
       /*
       delete article
       cb expects {success, errors}

       if successful it should also emit `refresh articles page`
        */
    });

    socket.on(`post article`, ({article}, cb) => {
        //TODO
        /*
        add new article
        article : {
            _id,
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
    });

    socket.on(`put article`, ({article}, cb) => {
        //TODO
        /*
        edit article
        article : {
            _id,
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
    });

    socket.on(`get all categories`, async cb => {
       try {
           let categories = await db.Category.find().exec();
           cb({
               success : true,
               res : {categories}
           })
       } catch (e) {
           console.log(e);
       }
    });

    socket.on(`get word in all languages`, async ({keys}, cb) => {
       try {
           let words = await db.LangWord.find({key : {$in : keys}}).exec();
           cb({
               success : true,
               res : {words}
           });
       } catch (e) {
           console.log(e);
       }
    });
};