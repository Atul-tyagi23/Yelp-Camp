var express = require('express');
var router = express.Router();
var mongoose =  require("mongoose");
var passport =  require('passport');
var User  =   require('../models/user');
var localStrategy =  require('passport-local');




router.get('/', (req, res)=>{
    res.render('landing');

});

// show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'}); 
 });
 
 //show login form
 router.get("/login", function(req, res){
    res.render("login", {page: 'login'}); 
 });

 


// handle sign up logic 

router.post('/register', (req, res)=>{
     var newUser = new User({username: req.body.username});
     if(req.body.adminCode == 'atul2423'){
         newUser.isAdmin = true;

     }
     User.register(newUser, req.body.password, (err, user)=>{
          if(err){
                req.flash("error", err.message);
                return res.redirect("/register");
              }
         else {
             passport.authenticate("local")(req, res, ()=>{
                 req.flash('success', 'Welcome to Yelp-Camp '+user.username );
                 res.redirect('/campgrounds');
             })

         }
     });
});




//handling post logic 

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: 'Invalid entry or Make sure you are Signed up!',
        successFlash: 'Welcome to YelpCamp!'
    }), function(req, res){
});

// logout route 

router.get("/logout", (req, res)=>{
    req.logOut();
    req.flash("success", 'Logged you out !!');
    res.redirect('/campgrounds');
})


 

module.exports = router;
