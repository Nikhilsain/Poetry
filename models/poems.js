var mongoose = require("mongoose");
var poetrySchema = new mongoose.Schema({
    poem : String,
    bgtheme : String,
    likes:Number,
    comments:[
        {
          type:  mongoose.Schema.Types.ObjectId,
          ref : "Comment",
        }
    ]
});

module.exports = mongoose.model("Poem", poetrySchema);