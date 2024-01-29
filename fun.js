var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var epressSanitizer =require("express-sanitizer");
var mongoose =require("mongoose");
var express = require("express");
const multer = require('multer');
const path = require('path');
var request = require("request");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/User");

mongoose.connect("mongodb+srv://udit:udit@cluster0-fynue.mongodb.net/test?retryWrites=true&w=majority" ,{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

var app = express();
app.use(require("express-session")({
    secret: "Mein hu Udu the ted",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(epressSanitizer());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});

//const storage = multer.diskStorage({
//  destination: './public/uploads/',
  //filename: function(req, file, cb){
    //cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  //}
//});

// Init Upload
//const upload = multer({
  //storage: storage,
  //limits:{fileSize: 1000000},
  //fileFilter: function(req, file, cb){
    //checkFileType(file, cb);
  //}
//}).single('myImage');

// Check File Type
//function checkFileType(file, cb){
  // Allowed ext
  //const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  //const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  //const mimetype = filetypes.test(file.mimetype);

  //if(mimetype && extname){
    //return cb(null,true);
  //} else {
    //cb('Error: Images Only!');
  //}
//}

var blogSchema = new mongoose.Schema({
   title:String,
   image:String,
   body:String,
   description:String,
    created:{type:Date,default:Date.now}
});
var Blog= mongoose.model("blogs", blogSchema);

var workSchema = new mongoose.Schema({
   title1:String,
   image1:String,
   body1:String,
   description1:String,
    created1:{type:Date,default:Date.now}
});

var Work= mongoose.model("works", workSchema);

var teamSchema = new mongoose.Schema({
   title1:String,
   image1:String,
   body1:String,
   description1:String
});
var Team= mongoose.model("teams",teamSchema);


app.get("/",function(req,res){
    res.render("loginhome.ejs");
});

app.get("/services",function(req, res) {
    res.render("services");
});

app.get("/mentalhealthseries",function(req, res) {
    res.render("mentalhealth.ejs");
});

app.get("/mentalhealthseries/show",function(req,res){
    res.render("showmentalhealthseries");
});

app.get("/workshops",function(req,res){
   Work.find({}, function(err,work){
        if(err){
            console.log(err);
        } else{
            res.render("workshops",{work:work});
        }
    });
});

app.get("/workshops/:id",function(req,res){
    Work.findById(req.params.id,function(err,foundWork){
        if(err){
            res.redirect("/workshops");
        } else{
            res.render("showork",{work:foundWork});
        }
    });
});
    
app.get("/ourworkshops",isLoggedIn,function(req,res){
    Work.find({}, function(err,work){
        if(err){
            console.log(err);
        } else{
            res.render("ourworkshops",{work:work});
        }
    });
});

app.get("/ourworkshops/new", function(req,res){
    res.render("newworkshop");
});

app.post("/ourworkshops",function(req,res){
   Work.create(req.body.work, function(err,newWork){
       if(err){
           res.render("newworkshop");
       } else{
           res.redirect("/ourworkshops");
       }
   });
});

app.get("/ourworkshops/:id",function(req,res){
    Work.findById(req.params.id,function(err,foundWork){
        if(err){
            res.redirect("/ourworkshops");
        } else{
            res.render("secret1",{work:foundWork});
        }
    });
});

app.get("/ourworkshops/:id/edit",function(req,res){
    Work.findById(req.params.id,function(err,foundWork){
        if(err){
            res.redirect("/ourworkshops");
        } else{
            res.render("editwork.ejs",{work:foundWork});
        }
    });
});

app.put("/ourworkshops/:id",function(req,res){
    Work.findByIdAndUpdate(req.params.id,req.body.work,function(err,updatedWork){
        if(err){
            res.redirect("/ourworkshops");
        } else{
            res.redirect("/ourworkshops");
        }
    });
});

app.delete("/ourworkshops/:id",function(req,res){
    Work.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/ourworkshops");
        } else{
            res.redirect("/ourworkshops");
        }
    });
});

app.get("/blogs",function(req,res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log(err);
        } else{
            res.render("blogs",{blogs:blogs});
        }
    });
});
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/workshops");
        } else{
            res.render("show",{blog:foundBlog});
        }
    });
});

app.get("/ourblogs",isLoggedIn,function(req,res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log(err);
        } else{
            res.render("ourblogs",{blogs:blogs});
        }
    });
});

app.get("/ourblogs/new", function(req,res){
    res.render("newblogform.ejs");
});

app.post("/ourblogs",function(req,res){
    req.body.blog.body=req.sanitize( req.body.blog.body);
    req.body.blog.description=req.sanitize( req.body.blog.description);
    req.body.blog.title=req.sanitize( req.body.blog.title);
    req.body.blog.image=req.sanitize( req.body.blog.image);
    
   Blog.create(req.body.blog, function(err,newBlog){
       if(err){
           res.render("newblogform");
       } else{
           res.redirect("/ourblogs");
       }
   });
});

app.get("/ourblogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/ourblogs");
        } else{
            res.render("secret",{blog:foundBlog});
        }
    });
});

app.get("/ourblogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/ourblogs");
        } else{
            res.render("edit",{blog:foundBlog});
        }
    });
});

app.put("/ourblogs/:id",function(req,res){
     req.body.blog.body=req.sanitize( req.body.blog.body);
    req.body.blog.description=req.sanitize( req.body.blog.description);
    req.body.blog.title=req.sanitize( req.body.blog.title);
    req.body.blog.image=req.sanitize( req.body.blog.image);
    
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updateBlog){
        if(err){
            res.redirect("/ourblogs");
        } else{
            res.redirect("/ourblogs");
        }
    });
});

app.delete("/ourblogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err,updateBlog){
        if(err){
            res.redirect("/ourblogs");
        } else{
            res.redirect("/ourblogs");
        }
    });
});

app.get("/teams",function(req,res){
    Team.find({}, function(err,teams){
        if(err){
            console.log(err);
        } else{
            res.render("teams",{team:teams});
        }
    });
});

//app.get("/teams/:id",function(req,res){
  //  Team.findById(req.params.id,function(err,foundTeam){
    //    if(err){
      //      res.redirect("/teams");
        //} else{
          //  res.render("showteams",{teams:foundTeam});
        //}
    //});
//});

app.get("/ourteams",isLoggedIn,function(req,res){
    Team.find({}, function(err,teams){
        if(err){
            console.log(err);
        } else{
            res.render("ourteams",{team:teams});
        }
    });
});

app.get("/ourteams/new", function(req,res){
    res.render("newteamform.ejs");
});

app.get("/ourteams/:id",function(req,res){
    Team.findById(req.params.id,function(err,foundTeam){
        if(err){
            res.redirect("/ourteams");
        } else{
            res.render("secret2",{team:foundTeam});
        }
    });
});
app.post("/ourteams",function(req,res){
     req.body.team.body1=req.sanitize( req.body.team.body1);
    req.body.team.description1=req.sanitize( req.body.team.description1);
    req.body.team.title1=req.sanitize( req.body.team.title1);
    req.body.team.image1=req.sanitize( req.body.team.image1);
    
   Team.create(req.body.team, function(err,foundTeam){
       if(err){
           res.render("newteamform");
       } else{
           res.redirect("/ourteams");
       }
   });
});

app.get("/ourteams/:id/edit",function(req,res){
     Team.findById(req.params.id,function(err,foundTeam){
        if(err){
            res.redirect("/ourteams");
        } else{
            res.render("editteam",{team:foundTeam});
        }
    });
});

app.put("/ourteams/:id",function(req,res){
    req.body.team.body1=req.sanitize( req.body.team.body1);
    req.body.team.description1=req.sanitize( req.body.team.description1);
    req.body.team.title1=req.sanitize( req.body.team.title1);
    req.body.team.image1=req.sanitize( req.body.team.image1);
    Team.findByIdAndUpdate(req.params.id,req.body.team,function(err,updateTeam){
        if(err){
            res.redirect("/ourteams");
        } else{
            res.redirect("/ourteams");
        }
    });
});

app.delete("/ourteams/:id",function(req,res){
    Team.findByIdAndRemove(req.params.id,function(err,updatedTeam){
        if(err){
            res.redirect("/ourteams");
        } else{
            res.redirect("/ourteams");
        }
    });
});

app.get("/termsandconditions",function(req, res) {
    res.render("terms&conditions");
});

app.get("/sessions",function(req,res){
    res.render("sessions.ejs");
});

app.get("/register",function(req,res){
    res.render("Registerform.ejs");
});



app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/login"
}), function(req, res){
});

//log out
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

let port = process.env.PORT || 27017;
app.listen(port, function(){
    console.log("Server has started at localhost:" + port);
});
