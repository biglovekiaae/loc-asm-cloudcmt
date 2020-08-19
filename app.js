const express = require('express');
const engines = require('consolidate');
const app = express();

const port = process.env.PORT || "8000";

var bodyParser = require("body-parser");
const { parse } = require('path');
app.use(bodyParser.urlencoded({ extended: false }));

var publicDir = require('path').join(__dirname, '/public');
app.use(express.static(publicDir));

//npm i handlebars consolidate --save
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://loc:123@cluster0.zvhhy.mongodb.net/test";


app.get('/', async(req, res) => {
    let client = await MongoClient.connect(url, { useUnifiedTopology: true });
    let dbo = client.db("LocPoShop");
    let results = await dbo.collection("products").find({}).toArray();
    res.render('index', { model: results });
})
app.get('/allProduct', async(req, res) => {
    let client = await MongoClient.connect(url, { useUnifiedTopology: true });
    let dbo = client.db("LocPoShop");
    let results = await dbo.collection("products").find({}).toArray();
    res.render('allProduct', { model: results });
})
server = app.listen(port, (err) => {
    if (err) { console.log(err) } else {
        console.log('done');
    }
});
app.get('/delete', async(req, res) => {
    let inputId = req.query.id;
    let client = await MongoClient.connect(url);
    let dbo = client.db("LocPoShop");
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(inputId) };
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/allProduct');
})
app.get('/insert', (req, res) => {
    res.render('Insert.hbs');
})
app.post('/doInsert', async(req, res) => {
    let inputName = req.body.txtName;
    let inputID = req.body.txtID;
    let inputNumber = req.body.txtNumber;
    let inputPrice = req.body.txtPrice;
    let newProduct = { Name: inputName, ID: inputID, Number: inputNumber, Price: inputPrice };
    if (inputName.trim().length == 0) {
        let modelError = { nameError: "No name!", mspError: "NO ID!" };
        res.render('Insert.hbs', { model: modelError });
    } else {
        let client = await MongoClient.connect(url);
        let dbo = client.db("LocPoShop");
        await dbo.collection("products").insertOne(newProduct);
        res.redirect('/allProduct');
    }


})
app.post('/doSearch', async(req, res) => {
    let inputName = req.body.txtName;
    let client = await MongoClient.connect(url);
    let dbo = client.db("LocPoShop");
    // let results = await dbo.collection("Student").find({name:inputName}).toArray();
    let results = await dbo.collection("products").find({ Name: new RegExp(inputName, 'i') }).toArray();
    res.render('allProduct', { model: results });

})
app.get('/update', async function(req, res) {
    let id = req.query.id;
    console.log(id)
    let client = await MongoClient.connect(url, { useUnifiedTopology: true });
    let dbo = client.db("LocPoShop");
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    let results = await dbo.collection("products").find(condition).toArray();
    res.render('update', { model: results });
})
app.post('/doupdate', async(req, res) => {
    let id = req.body.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = { "_id": ObjectID(id) };
    console.log(condition)
    let client = await MongoClient.connect(url, { useUnifiedTopology: true });
    let dbo = client.db("LocPoShop");
    change = {
        $set: {
            Name: req.body.txtName,
            ID: req.body.txtID,
            Number: req.body.txtNumber,
            Price: req.body.txtPrice
        }
    }
    await dbo.collection("products").updateOne(condition, change);
    res.redirect('/allProduct');
})