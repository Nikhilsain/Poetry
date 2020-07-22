var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username:String,
    password:String,

    posts:[
        {
         type: mongoose.Schema.Types.ObjectId,
         ref : "Poem",
        }
    ],
    img: 
    { 
        data: Buffer, 
        contentType: String 
    } 
})
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);