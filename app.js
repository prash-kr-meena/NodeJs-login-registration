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





APP.use(EXPRESS.static("public"));

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




// ? ---------------------------   ROUTES      ---------------------------

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




APP.get('/articles/add', (req, res) => {

      let renderVar = {
            render_page: "./pages/add_article", // index.ejs
            page_title: "Add Articles"
      };
      res.render("template", renderVar);

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