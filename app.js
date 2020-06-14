var express = require("express"),
     app = express(),
     bodyParser = require("body-parser"),
     mongoose = require("mongoose"),
     passport = require("passport"),
     LocalStrategy = require("passport-local"),
     stringify = require('json-stringify-safe'),
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


// app.use(function(req,res,next){
//    res.locals.currentuser = req.user;
//    next();
// });


app.get("/", function(req,res){
    res.render("home",{currentuser:req.user});
    //console.log(currentuser);
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
  //  console.log(req.user.username)

  var strPoetry = req.body.Poem;
  

    var newPoem = {poem:strPoetry,bgtheme:req.body.bgcolor,writer:req.user.username}
    
     
    Poem.create(newPoem,function(err,newPoem){
        if(err){
            console.log(err);
        }
        else{
            req.user.posts.push(newPoem);
            req.user.save();
            
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
             var newcomment = {text:req.body.comment,author:req.user.username}
             //console.log(req.user.username);
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



app.get("/myprofile",isLoggedIn,function(req,res){
    User.findById(req.user.id).populate("posts").exec(function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{

            res.render("Myprofile",{currentuser:foundUser});
        }
    })
})

app.get("/find",function(req,res){
    var name = req.query.finduser;
    

    User.find({username:name}).populate("posts").exec(function(err, users) {
        
       
        
       res.render("showuser",{users:users});
        
        
     });
    
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