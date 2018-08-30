// jshint node : true
"use strict";

const express = require("express"),
      path = require("path");

const app = express();
const port = 3000;

// load view-engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
      res.render("index", {
            title: "Hello"
      });
});


app.get('/articles/add', (req, res) => {
      res.render('add_article', {
            title : 'Add article'
      });
});


app.listen(port, function () {
      console.log("server live  : " + port);
});