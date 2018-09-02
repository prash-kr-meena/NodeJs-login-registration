// jshint node : true
"use strict";

const EXPRESS = require("express");
const USER_ROUTER = EXPRESS.Router();
const UserModel = require("../models/user");

// ! ============  GET ROUTES ============


USER_ROUTER.get('/signup', (req, res) => {
      let renderVar = {
            page_title: "signup-form",
            render_page: "./user_pages/user_signup",
            errors: undefined,
      };
      res.render("template", renderVar);
});


USER_ROUTER.get('/login', (req, res) => {
      let renderVar = {
            page_title: "login-form",
            render_page: "./user_pages/user_login",
            errors: undefined,
      };
      res.render("template", renderVar);
});


// ! ============  POST ROUTES ============



// ! ============  DELETE ROUTES ============



// ? ============  export router ============
module.exports = USER_ROUTER;