//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/views/date.js");
const mongoose = require("mongoose");

console.log(date());

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-aadil:admin123@cluster0.00ofi.mongodb.net/todolistDB?retryWrites=true&w=majority/todolistDB",{useNewUrlParser: true});

const itemSchema = mongoose.Schema({name: String});

const Item = mongoose.model("Item",itemSchema);

const wakeUp = new Item({name: "wake up"});

const breakfast = new Item({name: "make breakfast"});

const work = new Item({name: "go to work"});

const defaultArray = [wakeUp, breakfast, work];



let day = date();

app.get("/", function(req, res) {



  Item.find(function(err, items){
    if(items.length===0){
      Item.insertMany(defaultArray,function(err){
        if(err){
          console.log(err);

        }
        else{
          console.log("sucessfully inserted to the database");

        }
      });
        res.redirect("/");
    }

    else{
    res.render("list", {listTitle: day, nextItem: items});
  }
  });



});


app.post("/", function(req,res){
  let itemName = req.body.extra;
  let listName = req.body.list;



  const item = new Item({
    name: itemName
  });

  if(listName === day){
    item.save();

    res.redirect("/");

  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();

      res.redirect("/"+listName);
    });
  }



  // if(req.body.list==="workList"){
  //   workList.push(newItem);
  //   res.redirect("/work");
  //
  // }
  // else{
  //   Item.push(newItem);
  //   res.redirect("/");
  //
  // }
  // Item.push(newItem);
  // res.redirect("/");
  //res.send(extra);
});


// todelete from the list
app.post("/delete",function(req,res){
  const checkedItem = req.body.checkedItem;
  const listName = req.body.listName;
  if(listName=== day){
    Item.deleteOne({_id: checkedItem},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("deleted");
      }
      res.redirect("/");
    });

  }
  else{
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }

    });


  }


});



const listSchema={
  name: String,
  items: [itemSchema]
};

const List=mongoose.model("list",listSchema);


app.get("/:topic",function(req,res){
  const customName= req.params.topic;
  List.findOne({name: customName},function(err,foundList){
    if(!foundList){
      const list = new List({
        name: customName,
        items: defaultArray
      });
      list.save();
      res.redirect("/"+customName);

    }
    else{
      res.render("list",{listTitle: foundList.name,nextItem: foundList.items});
    }
  });

});
app.post("/work",function(req,res){
  let newItem = req.body.extra;
  // workList.push(newItem);
  // res.redirect("/work");
});

app.get("/about", function(req,res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("server started");
});
