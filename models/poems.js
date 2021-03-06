var mongoose = require("mongoose");
var poetrySchema = new mongoose.Schema({
    poem : String,
    bgtheme : String,
    writer:String,
    likes:Array,
    like:Number,
    comments:[
        {
          type:  mongoose.Schema.Types.ObjectId,
          ref : "Comment",
        }
    ]
});

module.exports = mongoose.model("Poem", poetrySchema);