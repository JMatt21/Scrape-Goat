const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({

    title: {
        type: String,
        required: true
    },

    url: {
        type: String,
        required: true
    },

    summary: {
        type: String,
        required: true
    },

    comments: [
        {
            // Store ObjectIds in the array
            type: Schema.Types.ObjectId,
            // The ObjectIds will refer to the ids in the Note model
            ref: "Comment"
        }
    ]
});

// This creates our model from the above schema, using mongoose's model method
const Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
