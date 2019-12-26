let mongoose    = require('mongoose'),
    bcrypt      = require('bcryptjs');

let Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    hash: {
        type: String,
        select: false,
    },
}, {collection: 'accounts'});

Schema.pre('save', function (next) {
    if(!this.isModified('password')) return next();
    
    bcrypt.genSalt(10, (err, salt) => {
        if(err) return next(err);
        bcrypt.hash(this.password, salt, (err, hash) => {
            if(err) return next(err);
            this.password = hash;
            // generate unique hash for account
            bcrypt.genSalt(5, (err, hashSalt) => {
                if(err) return next(err);

                bcrypt.hash(Date.now.toString(), hashSalt, (err, hashHash) => {
                    if(err) return next(err);
                    this.hash = hashHash;

                    next();
                });
            });
        });
    });
});

Schema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('Account', Schema);