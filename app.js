// jshint node : true
"use strict";

const EXPRESS = require("express"),
      MONGOOSE = require("mongoose"), // middleware to connect node app & mongoDB | Elegant MongoDB object modeling for Node.js
      BODY_PARSER = require("body-parser"),
      SESSION = require("express-session"),
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
                  render_page: "./home",
                  page_title: "Home Page",
                  all_articles: all_articles,
                  errors: undefined,
            };
            res.render("template", renderVar);
      });
});

const article_route = require('./routes/article');
APP.use('/article', article_route);


const users_route = require('./routes/users');
APP.use('/users', users_route);

const admin_route = require('./routes/admins');
APP.use('/admins', admin_route);



// ? GET
APP.get('*', (req, res) => {
      let renderVar = {
            render_page: "./page404",
            page_title: "404",
            errors: "404",
      };
      res.render("template", renderVar);
});


// ? ------------------------       upcoming     ----------------------------



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