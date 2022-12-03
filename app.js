const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://Frost:qA8CssSl1vzPeyON@cluster1.a5iscbd.mongodb.net/todolistDB', {useNewUrlParser: true});

const itemSchema = ({
    name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
   name:"Welcome to your list",
});

const item2 = new Item ({
    name:"Do Stuff",
});

const item3 = new Item ({
    name:"Like and subscribe",
});

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get('/', function(req, res){
    Item.find({}, function(err, founditems) {
        if (founditems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Successfully saved to DataBase");
         }
    });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newItems: founditems});
        }
    });
});

app.get("/:customlistName", function(req, res){
    const customListName = _.capitalize(req.params.customlistName);

    List.findOne({name:customListName}, function(err, results){
        if(!err) {
            if(!results) {
                const list = new List({
                   name:customListName,
                   items:defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {
                   listTitle:results.name, newItems:results.items
                });
            }
        }
    });
});

app.post('/', function(req, res) {

    const itemName = req.body.item;
    const listName = req.body.list;

    const item = new Item({
        name:itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err, foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+listName);
        });
    }
});

app.post('/delete', function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully removed");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, foundlist){
            if (!err) {
                res.redirect("/"+listName);
            }
        });
    }
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

//mongo Atlas username = Frost
//mongo atlas password = qA8CssSl1vzPeyON