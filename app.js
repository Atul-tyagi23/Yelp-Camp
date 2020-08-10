
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var Campground = require('./models/campground');
var seedBD = require('./seeds');
 var passport = require('passport');
var User = require('./models/user');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var localStrategy = require('passport-local');

const campground = require('./models/campground');

var campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes = require('./routes/index'),
    reviewRoutes     = require("./routes/reviews")


var app = express();


mongoose.connect('mongodb://localhost:27017/yelp_camp_v9', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log(error.message));
mongoose.set('useCreateIndex', true);
mongoose.set("useFindAndModify", false);


app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));

app.use(flash());
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION 

app.use(require("express-session")({
    secret: "Secrets of Prisons",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();

});

app.use(indexRoutes);
 app.use(campgroundRoutes);
app.use(reviewRoutes);

app.use("/campgrounds/:id/reviews", reviewRoutes);










var port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log('Yelp camp has started');
})