// jshint node : true
"use strict";

const EXPRESS = require("express");
const ROUTER = EXPRESS.Router();

const Article = require("../models/article");


// ! ============  GET ROUTES ============

// ? GET
ROUTER.get('/add', (req, res) => {
      let renderVar = {
            render_page: "./article_pages/add_article", // index.ejs
            page_title: "Add Articles",
            errors: undefined,
      };
      res.render("template", renderVar);
});


// ? GET
ROUTER.get('/:_id', (req, res) => {
      let article_id = req.params._id;

      Article.findById(article_id, (err, article) => {
            if (err) {
                  throw new Error("ERROR : finding article in DB, So, can't read the article ");
            }

            let renderVar = {
                  render_page: "article_pages/read_article", // looks in views
                  page_title: article.title,
                  article: article,
                  errors: undefined,
            };

            res.render("template", renderVar);
      });
});


// ! ============  POST ROUTES ============


// ? POST
ROUTER.post('/add', (req, res) => {
      // ! validate the changes
      req.checkBody('article_title', 'Article title required').notEmpty();
      req.checkBody('article_author_name', 'Author Name required').notEmpty();
      req.checkBody('article_body', 'Content is required').notEmpty();

      var errors = req.validationErrors();

      if (errors) {
            let renderVar = {
                  render_page: "./article_pages/add_article", // index.ejs
                  page_title: "Add Articles",
                  errors: errors,
            };
            res.render("template", renderVar);
      } else {
            let article = new Article();
            article.title = req.body.article_title;
            article.author = req.body.article_author_name;
            article.body = req.body.article_body;

            article.save((err) => {
                  if (err) {
                        let errorMessage = "Article could NOT be SAVED in database";
                        req.flash("danger", errorMessage);
                        console.log(err);
                  } else {
                        req.flash('success', "Article added");
                  }
                  res.redirect('/');
            });
      }
});


// ? POST
ROUTER.post('/update', (req, res) => {
      let article_id = req.body.article_id; // ! getting _id to update  ---> hidden attribute in html

      // ! validate the changes
      req.checkBody('article_title', 'Article title required').notEmpty();
      req.checkBody('article_author_name', 'Author Name required').notEmpty();
      req.checkBody('article_body', 'Content is required').notEmpty();

      var errors = req.validationErrors();

      if (errors) {
            res.errors = errors; //! CURRENTLY doesn't work righ now, --> resolves to be undefined
            console.log("resolve this errors in the page-error");
            console.log(errors);
            res.redirect("/article/edit/" + article_id);
      } else {
            let article = {};
            article.title = req.body.article_title;
            article.author = req.body.article_author_name;
            article.body = req.body.article_body;

            let query = {
                  _id: article_id
            };

            Article.updateOne(query, article, (err) => {
                  if (err) {
                        let errorMessage = "Article could not be UPDATED in database";
                        throw new Error(errorMessage);
                  }
                  req.flash('success', "Article updated");
                  res.redirect('/article/' + article_id);
            });
      }
});


// ? POST
ROUTER.get('/edit/:_id', (req, res) => {
      let article_id = req.params._id;

      Article.findById(article_id, (err, article) => {
            if (err) {
                  throw new Error("ERROR : finding article in DB, So, can't read the article ");
            }

            let renderVar = {
                  render_page: "./article_pages/edit_article", // index.ejs
                  page_title: "Edit Article",
                  article: article,
                  errors: res.errors
            };

            console.log(renderVar.errors);

            res.render("template", renderVar);
      });

});


// ! ============  DELETE ROUTES ============

// ? DELETE
ROUTER.delete('/:_id', (req, res) => {
      let article_id = req.params._id;
      let query = {
            _id: article_id
      };
      Article.deleteOne(query, function (err) {
            if (err) {
                  throw new Error(`Article could not be deleted`);
            } else {
                  req.flash("danger", "Article deleted");
                  res.send("success");
            }
      });

});




// ? ============  export router ============
module.exports = ROUTER;