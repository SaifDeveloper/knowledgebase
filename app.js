const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

db.once('open',function() {
    console.log('Connected to mongodb');
});

db.on('error',function(){
    console.log(err);
});

const app = express();

let Articles = require('./models/article');


app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));


app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,

}));

app.use(require('connect-flash')());

app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        let namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

//Passport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*',function (req,res,next) {
    res.locals.user = req.user || null;
    next();
});


app.get('/',function(req,res){
    Articles.find({},function(err,articles) {
        if(err){
            console.log(err);
        }
        else{
        res.render('index',{
            title: 'Articles',
            articles: articles
           });
}
    });

});

let routes = require('./routes/routes');
app.use('/articles',routes);

let users = require('./routes/user');
app.use('/users',users);

app.listen(3000,function(){
    console.log('Server started on port 3000...');
});
