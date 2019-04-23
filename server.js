const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcryptjs');
const router = express.Router();
const parser = require('body-parser');
const user = require('./models/data');
const session = require('express-session');

mongoose.connect("mongodb://localhost:27017/mydatabase", { useNewUrlParser: true });

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(parser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "myAuthentication",
    resave: false,
    saveUninitialized: true
}));

app.use(parser.urlencoded({
    extended: true
}));

app.use(router);

router.get('/login', function (req, res) {
    res.render("login");
});

router.get('/logout', function (req, res) {
    if (req.session) {
        req.session.destroy(function (error) {
            console.log("logout " + req.session);
            res.render("message", {
                message: "The user is now logged out"
            });
        });
    }
});

router.get('/registration', function (req, res) {
    console.log("1");
    if (req.session === undefined || req.session.currentUser === undefined) {
        console.log("1");
        return res.render('registration')
    } else {
        console.log("3");
        res.redirect('/profile');
    }
});

router.get('/profile', function (req, res) {
    if (req.session === undefined || req.session.currentUser === undefined) {
        res.redirect('/login');
    } else {
        res.render("profile", {
            username: req.body.username
        });
    }
});

router.post('/register', function (req, res) {
    if (req.session !== undefined && req.session.currentUser !== undefined) {
        res.redirect('/profile');
    } else {
        if (req.body.pwd !== req.body.pwd2) {
            console.log("aftetr not matcing");
            res.render("message", {
                message: "Passwords do not match"
            });
        } else {
            user.findOne({
                "username": req.body.username
            }, function (error, myuser) {
                if (!error) {
                    res.render("message", {
                        message: "User is already registered"
                    });
                }
            });
            var salt = bcrypt.genSaltSync(10);
            var tempPassword = req.body.pwd;
            var hash = bcrypt.hashSync(tempPassword, salt);
            var newUser = {
                "username": req.body.username,
                "password": hash
            };
            user.create(newUser, function (err, users) {
                if (err) {
                    res.render("message", {
                        message: "An error occurred"
                    });
                } else {
                    res.render("message", {
                        message: req.body.username + "is now registered"
                    });
                }
            });
        }
    }
});

router.post('/logged', function (req, res) {
    user.findOne({
        "username": req.body.username
    }, function (error, user) {
        if (user === null) {
            res.render("message", {
                message: "This user is not registered"
            });
        } else {
            if (bcrypt.compareSync(req.body.pwd, user.password)) {
                req.session.currentUser = user._id;
                res.render("profile", {
                    username: req.body.username  
                });
            } else {
                res.render("message", {
                    message: "The password is incorrect"
                });
            }
        }
    });

});

app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/:page', function (req, res) {
    return res.render("message", {
        message: req.params.page.toUpperCase() + " page is not on the server"
    });
});


app.listen(3000);
