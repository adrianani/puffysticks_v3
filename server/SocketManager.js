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
    
    /* Lang.create({shortcut: 'en', name: 'english', default: true}, (err, lang) => {
        console.log(lang.id, err);
        db.LangWord.create(
            {key: 'work_with_us_question', string: 'Interested in working with us?', langid: lang._id}, 
            {key: 'contact_us', string: 'get in touch', langid: lang._id}, 
            {key: 'categories', string: 'categories', langid: lang._id},
            {key: 'all', string: 'all', langid: lang._id},
            {key: 'logos', string: 'logos', langid: lang._id},
            {key: 'web_design', string: 'web design', langid: lang._id},
            {key: 'ipb_themes', string: 'ipb design', langid: lang._id},
            {key: 'illustrations_and_drawings', string: 'illustration & drawings', langid: lang._id},
        );
    }); */

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
     * @desc disconnect user
     */
    socket.on('disconnect', () => {
        let userId = sockets[socket.id];
        if(userId === undefined) return;

        socket.leave(userId);

        delete sockets[socket.id];
        
    });
};