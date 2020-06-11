var express = require("express"),
     app = express(),
     bodyParser = require("body-parser"),
     mongoose = require("mongoose"),
     passport = require("passport"),
     LocalStrategy = require("passport-local"),
     Poem     =  require("./models/poems"),    
     Comment = require("./models/comments"),
     User   = require("./models/user");


mongoose.connect("mongodb://localhost:27017/Poetry" ,{useNewUrlParser:true, useUnifiedTopology: true });

app.use(express.static("public"));    
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/views/partials"))
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

//======================
//passport configuration

app.use(require("express-session")({
    secret:"hii there this is i",
    resave:false,
    saveUninitialized:false,
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Poem.create({
//     poem:"Johny Johny yes papa"
//        },function(err,poem){
//            if(err)
//            {
//                console.log(err);
//            }
//            else
//            {    console.log("New Poem");
//                console.log(poem)
//            }
//        })

app.get("/", function(req,res){
    res.render("home",{currentuser:req.user});
});

app.get("/poetry",function(req,res){
    Poem.find({},function(err,Poems){
        if(err){
            console.log(err);
        }
        else{
            res.render("poetry",{Poems:Poems,currentuser:req.user});
        }
    })
   
});

app.post("/poetry",isLoggedIn,function(req,res){
    var newPoem = {poem:req.body.Poem,bgtheme:req.body.bgcolor}
    
  console.log(req.body.bgcolor);
    Poem.create(newPoem,function(err,newPoem){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/poetry");
        }
    })
})



app.get("/poetry/new",isLoggedIn, function(req,res){
    res.render("new")
});

app.get("/poetry/:id",function(req,res){

    Poem.findById(req.params.id).populate("comments").exec(function(err,foundPoem){
        if(err){
            console.log(err);
        }
        else{
            res.render("show",{Poem:foundPoem});
        }
    })
})

app.post("/poetry/:id/comments" ,isLoggedIn, function(req,res){
     Poem.findById(req.params.id, function(err,foundpoem){
         if(err){
             console.log(err);
         }
         else{
             //res.send("hello")
             //console.log(req.body.comment)
             var newcomment = {text:req.body.comment}
             Comment.create(newcomment,function(err,Newcomment){
                 if(err){
                     console.log(err);
                 }
                 else{
                     
                        foundpoem.comments.push(Newcomment);
                     foundpoem.save();
                    
                     res.redirect("/poetry/" + foundpoem._id)
                 }
             })
         }
     })

})

app.get("/register",function(req,res){
    res.render("register")
})
app.post("/register",function(req,res){
   var newUser = new User({username:req.body.username});
   User.register(newUser,req.body.password,function(err,user){
       if(err){
           console.log(err);
           return res.render("register");
       }
       else{
           passport.authenticate("local")(req,res,function(){
               res.redirect("/")
           })
       }
   })

})
app.get("/login",function(req,res){
    res.render("login");

})
app.post("/login",passport.authenticate("local",{
      successRedirect:"/",
      failureRedirect:"/login",
}) ,function(req,res){

})
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/")
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
         return next();
    }
    res.redirect("/login")
}
app.listen(3000,function(){
    console.log("this server strats");
});