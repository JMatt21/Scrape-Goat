var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require('path');
var cheerio = require("cheerio");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Helper Functions
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// HTML Routes

app.get("/", (req, res) => {
    db.Article.find({})
        .populate("comments")
        .then(function (data) {
            // res.json(data);
            res.render("index", { article: data });
        });
});

app.get("/saved", (req, res) => {
    db.Article.find({ isSaved: true })
        .populate("comments")
        .then(function (data) {
            res.render("index", { article: data })
        })
});

app.get("/search", (req, res) => {
    const searchTerm = req.query.searchTerm;
    console.log(`Searching for: ${searchTerm}`);
    db.Article.find({ title: { $regex: `.*${searchTerm}.*` } })
        .populate("comments")
        .then(function (data) {
            console.log(data);
            res.render("index", { article: data })
        })
});

// API Routes
app.get("/scrape", (req, res) => {
    // let results = [];
    request("https://www.nytimes.com/search?query=goats", function (err, response, html) {

        $ = cheerio.load(html);

        $("li.SearchResults-item--3k02W").each(function (i, element) {

            const title = $(element).children().children().children('a').children('h4').text();
            const summary = $(element).children().children().children('a').children('p').text();
            const url = $(element).children().children().children('a').attr("href");

            // For whatever reason, I can't scrape the date off the search query but it included in the url in a /YYYY/MM/DD
            // const date = url.split
            db.Article.findOne({ title: title })
                .then((dbArticle) => {
                    if (!dbArticle) {
                        db.Article.create({
                            title: title,
                            summary: summary,
                            url: url,
                            // date: date
                        }).then(function (data) {
                            console.log(data);
                        }).catch(function (err) {
                            res.json(err)
                        });
                    } else {
                        console.log(`${title} already exists. Not adding.`);
                    }
                });
        });
        // I couldn't find a way to do the response after the .each method was finished
        res.send("It worked c:");
    });
});

app.get("/api/articles", (req, res) => {
    db.Article.find({})
        .then(function(dbArticles){
            res.json(dbArticles);
        });
});

app.get("/api/comments", (req, res) => {
    db.UserComment.find({})
        .then(function(dbUserComments){
            res.json(dbUserComments);
        });
});

app.post("/comment/:articleid", function (req, res) {
    const articleId = req.params.articleid;
    db.UserComment.create(req.body)
        .then(function (dbUserComment) {
            res.json(dbUserComment);
            return db.Article.findOneAndUpdate({ _id: articleId.toObjectId() }, { $push: { comments: dbUserComment._id } }, { new: true });
        });
});

app.post("/save-article/:articleid", function (req, res) {
    const articleId = req.params.articleid;
    const saveStatus = req.body.isSaved;
    db.Article.findOneAndUpdate({ _id: articleId.toObjectId() }, { $set: { isSaved: saveStatus } })
        .then(function (dbArticle) {
            res.json(!dbArticle.isSaved);
            // For some reason, isSaved of dbArticle is the isSaved before the update.
        })
});

app.delete("/delete-comment/:commentid", function (req, res) {
    const commmentId = req.params.commentid;

    db.UserComment.findOneAndRemove({ _id: commmentId.toObjectId() })
        .then(function (dbComment) {
            res.json(`${dbComment._id} was removed.`)
        });
});

// Helper Functions








// Server Startup

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

