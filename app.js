// jshint node : true
"use strict";

const EXPRESS = require("express"),
      MONGOOSE = require("mongoose"), // middleware to connect node app & mongoDB | Elegant MongoDB object modeling for Node.js
      BODY_PARSER = require("body-parser"),
      SESSION = require("express-session"),
      // EXPRESS_VALIDATOR_CHECK = require('express-validator/check'),
      EXPRESS_VALIDATOR = require('express-validator'),
      PATH = require("path");

const APP = EXPRESS();
const PORT = 3000;



//! body parser config
APP.use(BODY_PARSER.json()); // support parsing of application/json type post data

APP.use(BODY_PARSER.urlencoded({ //support parsing of application/x-www-form-urlencoded post data
      extended: true
}));


// ? express-session MIDDLE-WARE
APP.use(SESSION({
      secret: 'keyboard cat',
      resave: true, // changed to true from false
      saveUninitialized: true,
      // cookie: {
      //       secure: true
      // }
}));



//? MIDDLE-WARE   for connect-flash && express-messages -> which requres connect flash as dependency
const CONNECT_FLASH = require('connect-flash');
APP.use(CONNECT_FLASH());

const EXPRESS_MESSAGES = require('express-messages');
APP.use(function (req, res, next) {
      res.locals.messages = EXPRESS_MESSAGES(req, res); //?s  CREATES  a global variable "messages"
      next();
});



// ? express validator MIDDLE-WARE
APP.use(EXPRESS_VALIDATOR());





//? tell express to treate it as a static folder - for static assets
APP.use(EXPRESS.static(PATH.join(__dirname, "public")));

//! load view-engine
APP.set('views', PATH.join(__dirname, 'views'));
APP.set('view engine', 'ejs');




// ! Bring models ;)
const Article = require("./models/article");




// ! connect to mongoDB && Some checks
// Mongoose provides a straight-forward, schema-based solution to model your application data.
//  It includes built-in type casting, validation, query building, business logic hooks and more, out of the box.
MONGOOSE.connect('mongodb://localhost/Authentication_App_DB', {
      useNewUrlParser: true
});
const DB = MONGOOSE.connection;


//? check connection
DB.once('open', () => {
      console.log('Connected to DB :  SUCCESS');
});

// ? check db errors
DB.on('error', (db_err) => {
      console.log("DB ERROR : " + db_err);
});

// ? ---------------------------   ROUTES      ---------------------------

// ? GET
APP.get('/', (req, res) => {
      Article.find({}, (err, all_articles) => {
            if (err) {
                  throw new Error("ERROR : finding article in DB");
            }

            let renderVar = {
                  render_page: "./pages/index",
                  page_title: "Home Page",
                  all_articles: all_articles,
                  errors: undefined,
            };
            res.render("template", renderVar);
      });
});


// ? GET
APP.get('/article/:_id', (req, res) => {
      let article_id = req.params._id;

      Article.findById(article_id, (err, article) => {
            if (err) {
                  throw new Error("ERROR : finding article in DB, So, can't read the article ");
            }

            let renderVar = {
                  render_page: "pages/read_article", // looks in views
                  page_title: article.title,
                  article: article,
                  errors: undefined,
            };

            res.render("template", renderVar);
      });
});

// ? DELETE
APP.delete('/article/:_id', (req, res) => {
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


// ? GET
APP.get('/articles/add', (req, res) => {
      let renderVar = {
            render_page: "./pages/add_article", // index.ejs
            page_title: "Add Articles",
            errors: undefined,
      };
      res.render("template", renderVar);
});

// ? POST
APP.post('/articles/add', (req, res) => {
      // ! validate the changes
      req.checkBody('article_title', 'Article title required').notEmpty() ;
      req.checkBody('article_author_name', 'Author Name required').notEmpty();
      req.checkBody('article_body', 'Content is required').notEmpty();

      var errors = req.validationErrors();

      if (errors) {
            let renderVar = {
                  render_page: "./pages/add_article", // index.ejs
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
APP.post('/articles/update', (req, res) => {
      let article_id = req.body.article_id; // ! getting _id to update  ---> hidden attribute in html

      // ! validate the changes
      req.checkBody('article_title', 'Article title required').notEmpty() ;
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
APP.get('/article/edit/:_id', (req, res) => {
      let article_id = req.params._id;

      Article.findById(article_id, (err, article) => {
            if (err) {
                  throw new Error("ERROR : finding article in DB, So, can't read the article ");
            }

            let renderVar = {
                  render_page: "./pages/edit_article", // index.ejs
                  page_title: "Edit Article",
                  article: article,
                  errors: res.errors
            };

            console.log(renderVar.errors);

            res.render("template", renderVar);
      });

});

// ? ------------------------       upcoming     ----------------------------

APP.get('/signup', (req, res) => {
      res.render("template", {
            page_title: "signup-form",
            render_page: "pages/signup",
            errors: undefined,
      });
});


APP.get('/login', (req, res) => {
      res.render("template", {
            page_title: "login-form",
            render_page: "pages/login",
            errors: undefined,
      });
});


APP.get('/admin/login', (req, res) => {
      res.render("template", {
            page_title: "ADMIN-Login",
            render_page: "pages/admin_login",
            errors: undefined,
      });
});


// ? -------------------------------------------------------------------------



// ! listen
APP.listen(PORT, () => {
      console.log(`Remember :  start mongoDB demon -->   mongod   &&   mongo `);
      console.log(`-- Server live : ${PORT} --`);
});






// * fake data for inserting db
// db.articles.insert({
//       title: "article_7",
//       author: "malini seth",
//       body: "Lorem ipsum reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
// });