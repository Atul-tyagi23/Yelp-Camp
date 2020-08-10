var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var mongoose = require("mongoose");
var Review = require("../models/review");


var middleware = require('../middleware')  // Automatically requires content on index .js inside it
mongoose.set("useFindAndModify", false);







// INDEX - show all camgrounds 
router.get('/campgrounds', (req, res) => {
    // Get all campgrounds from data base 
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    
    
    Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
        Campground.count().exec(function (err, count) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {
                campgrounds: allCampgrounds,
                current: pageNumber,
                pages: Math.ceil(count / perPage)
            });
        }


    });

 });



   

});


// NEW : shows form for adding new campground 

// shows the form for get request  


router.get("/campgrounds/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new.ejs");

});



//CREATE - add a campground to DB

router.post('/campgrounds', middleware.isLoggedIn, (req, res) => {

    // get data from form and add it to campground array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;

    var author = {
        id :  req.user._id,
        username: req.user.username
    };
    var newCampground = {
        name: name,
        image: image,
        description: desc,
        author: author,
        price: price
    };

    // Create a new camground and add it to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if (err) {
            console.log(err);
        } else {
            //  Redirect back to campground page 
            req.flash('success', 'Successfully added a campground!');
            res.redirect("/campgrounds"); // default get..
      }
    })
});


// SHOW : shows info about particular campground

router.get("/campgrounds/:id", (req, res) => {

    //Find the campground with provided ID 

    Campground.findById(req.params.id).populate('comments likes').populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec((err, foundCampground) => {
        if (err) {
            console.log(err);
        } else {
            // render the info about that page .
            res.render("campgrounds/show", {
                campground: foundCampground,
                page:'campgrounds'
            });

        }

    });
});



// EDIT CAMPGROUND ROUTE 

router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership,  (req, res)=>{
    Campground.findById(req.params.id, (err, foundCampground)=>{
        res.render('campgrounds/edit', {campground: foundCampground});
    });

});





// UPDATE CAMPGROUND ROUTE

router.put('/campgrounds/:id',middleware.checkCampgroundOwnership, (req, res)=>{

    // find and update the correct campground 
 
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
        if(err){
            res.redirect('/campgrounds');
        }else {
            req.flash('success', 'Successfully updated the campground!');

            res.redirect('/campgrounds/'+ req.params.id);
        }
    } )

    // redirect to show page

});

// DESTROY CAMPGROUND ROUTE
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
      
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            
        }
    });
});


// Campground Like Route
router.post("/campgrounds/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});














module.exports = router;