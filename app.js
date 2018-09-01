// jshint node : true
"use strict";

const EXPRESS = require("express"),
      MONGOOSE = require("mongoose"), // middleware to connect node app & mongoDB | Elegant MongoDB object modeling for Node.js
      BODY_PARSER = require("body-parser"),
      PATH = require("path");

const APP = EXPRESS();
const PORT = 3000;



//! body parser config
// support parsing of application/json type post data
APP.use(BODY_PARSER.json());

//support parsing of application/x-www-form-urlencoded post data
APP.use(BODY_PARSER.urlencoded({
      extended: true
}));




//? tell express to treate it as a static folder - for static assets
APP.use(EXPRESS.static(PATH.join(__dirname, "public")));

//! load view-engine
APP.set('views', PATH.join(__dirname, 'views'));
APP.set('view engine', 'ejs');




// ! Bring MODLES ;)
const Article = require("./modles/article");




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


// ? ---------------------------   HTML-SNIPPETS      ---------------------------

let success = `<div class="alert alert-success alert-dismissible">
		<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
		<strong>Success!</strong>. </div>`;


let danger = `<div class="alert alert-danger alert-dismissible">
		<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
		<strong>Danger!</strong>. </div>`;




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
                  all_articles: all_articles
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
                  article: article
            };

            res.render("template", renderVar);
      });
});

// ? DELETE
APP.delete('/article/:_id', (req, res) => {
      console.log("hit");
      let article_id = req.params._id;
      let query = {
            _id: article_id
      };
      Article.remove(query, function (err) {
            if (err) {
                  throw new Error(`Article could not be deleted`);
            } else {
                  res.send("success");
            }
      });
});


// ? GET
APP.get('/articles/add', (req, res) => {
      let renderVar = {
            render_page: "./pages/add_article", // index.ejs
            page_title: "Add Articles"
      };
      res.render("template", renderVar);
});

// ? POST
APP.post('/articles/add', (req, res) => {
      let article = new Article();
      article.title = req.body.article_title;
      article.author = req.body.article_author_name;
      article.body = req.body.article_body;

      article.save((err) => {
            if (err) {
                  let errorMessage = "Article could not be SAVED in database";
                  throw new Error(errorMessage);
            }
            res.redirect('/');
      });
});


// ? POST
APP.post('/articles/update', (req, res) => {
      let article = {};
      article.title = req.body.article_title;
      article.author = req.body.article_author_name;
      article.body = req.body.article_body;

      let article_id = req.body.article_id; // ! getting _id to update

      let query = {
            _id: article_id
      };

      Article.update(query, article, (err) => {
            if (err) {
                  let errorMessage = "Article could not be UPDATED in database";
                  throw new Error(errorMessage);
            }
            res.redirect('/article/' + article_id);
            // res.redirect('/');
      });
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
                  article: article
            };

            res.render("template", renderVar);
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