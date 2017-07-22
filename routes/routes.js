const express = require('express');
const router = express.Router();

let Articles = require('../models/article');

let User = require('../models/user');

router.get('/add',ensureAuthenticated,function(req,res){
    res.render('add_article',{
        title: 'Add article'
    });
});



router.get('/edit/:id',ensureAuthenticated,function (req,res) {
    Articles.findById(req.params.id,function (err,article) {
        if(article.author != req.user._id){
            req.flash('danger','Not Authorised');
            res.redirect('/');
        }
        res.render('edit_article',{
            title:'Edit Article',
            article: article
        });
    });
});

router.post('/add',function(req,res) {

    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
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
        article.author = req.user._id;
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

router.post('/edit/:id',function (req,res) {
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

router.delete('/:id',function (req,res) {

    if(!req.user._id){
        res.status(500).send();
    }

    let query ={_id:req.params.id};

    Articles.findById(req.params.id,function (err,article) {
       if(article.author != req.user._id){
          res.status(500).send();
       }else {
           Articles.remove(query,function (err) {
               if(err){
                   console.log(err);
               }
               res.send('Success');
           });
       }
    });

});

router.get('/:id',function (req,res) {
    Articles.findById(req.params.id,function (err,article) {
        User.findById(article.author,function (err,user) {
            res.render('article',{
                article: article,
                author: user.name
            });
        });

    });
});

//Access Control
function ensureAuthenticated(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger','Please login');
        res.redirect('/users/login')
    }
}

module.exports = router;