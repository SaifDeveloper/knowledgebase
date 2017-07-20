const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

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

app.get('/articles/add',function(req,res){
    res.render('add_article',{
        title: 'Add article'
    });
});

app.get('/articles/:id',function (req,res) {
    Articles.findById(req.params.id,function (err,article) {
        res.render('article',{
            article: article
        });
    });
});

app.get('/articles/edit/:id',function (req,res) {
    Articles.findById(req.params.id,function (err,article) {
        res.render('edit_article',{
            title:'Edit Article',
            article: article
        });
    });
});

app.post('/articles/add',function(req,res) {

    req.checkBody('title','Title is required').notEmpty();
    req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();



    let errors = req.validationErrors();

    if(errors){
        res.render('add_article',{
            title: 'Add article',
            errors:errors
        });
    } else {
        let article = new Articles();
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;

        article.save(function(err){
            if(err){
                console.log(err);

            } else{
                req.flash('success','Article Added');
                res.redirect('/');
            }
        })
    }
});

app.post('/articles/edit/:id',function (req,res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id};

    Articles.update(query,article,function(err){
        if(err){
            console.log(err);

        } else{
            req.flash('success','Article Updated');
            res.redirect('/');
        }
    })
});

app.delete('/article/:id',function (req,res) {
   let query ={_id:req.params.id};

   Articles.remove(query,function (err) {
       if(err){
           console.log(err);
       }
       res.send('Success');
   });
});



app.listen(3000,function(){
    console.log('Server started on port 3000...');
});
