var mongoose = require("mongoose");
var commentSchema = new mongoose.Schema({
    text: String,
    author:String,
    date:String,
});

module.exports = mongoose.model("Comment",commentSchema);
