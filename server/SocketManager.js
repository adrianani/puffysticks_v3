let db = require('./mongoose'),
    // fn
    error = (message = 'unexpected_server_error', type = 'error') => {
        return {message, type};
    },
    // vars
    sockets = {};

let mongoose = require('mongoose');

module.exports = (socket, io) => {
    console.log(socket.id);

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
    socket.on('get lang words', async ({key, langid, articleid}, cb) => {
        let success = true,
        res = {},
        errors = [];

        try {
            let langWords = await db.LangWord.find(
                { 
                    key: { $in: key },
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
                filter = selectedLanguage ? {$or: [{key: regxp}, {string: regxp}], $and: [{key: {$not: new RegExp('article_title_|article_desc_', 'i')}}], langid: selectedLanguage} : {$or: [{key: regxp}, {string: regxp}], $and: [{key: {$not: new RegExp('article_title_|article_desc_', 'i')}}]},
                items = await db.LangWord.find(filter).limit(itemsPerPage).skip(currentPage * itemsPerPage),
                count = await db.LangWord.find(filter).count();
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
            errors.push(error());
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

    /**
     * @desc disconnect user
     */
    socket.on('disconnect', () => {
        let userId = sockets[socket.id];
        if(userId === undefined) return;

        socket.leave(userId);

        delete sockets[socket.id];
        
    });
};