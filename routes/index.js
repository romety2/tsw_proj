/* jshint node: true, esnext: true */

exports.index = (req, res) => {
    res.render('index');    
};

exports.kontakt = (req, res) =>  {
    res.render('pages/kontakt');    
};

exports.zgloszenie = (req, res) =>  {
    res.render('pages/zgloszenie');    
};

exports.pobierzZg = (req, res) =>  {
    res.download(__dirname + '/../public/file/zgloszenie.pdf');
};

exports.regulamin = (req, res) =>  {
    openPDF("/../public/file/regulamin.pdf", res);
};

exports.zawodnicy = (req, res) =>  {
    readAll('../models/player.js');
    res.render('pages/zawodnicy');   
};

exports.dodajZaw = (req, res) => {
    create(req.body, '../models/player.js');
    res.redirect('/zawodnicy');
};

exports.pobierzWZaw = (req, res) =>  {
    res.json(pob());
};

exports.pobierzZaw = (req, res) =>  {
    res.json(read(req.params.id));
};

exports.edytujZaw = (req, res) =>  {
    update(req.params.id, '../models/player.js');
    res.redirect('/zawodnicy');
};

exports.usunZaw = (req, res) =>  {
    delete2(req.params.id, '../models/player.js');
    res.redirect('/zawodnicy');
};

var temp;

var openPDF = (fp, res) => {
    var fs = require('fs');
    var filePath = fp;
    fs.readFile(__dirname + filePath ,  (err,data) => {
        res.contentType("application/pdf");
        res.send(data);
    });
};

var create = (object, schema) => {
    var O = require(schema);
    var o = new O(object);
    o.save();
};

var read = (id) => {
    var underscore = require('underscore');
    return underscore.find(temp, (t) => { return t._id.toString() === id; });
};

var readAll = (schema) => {
    var O = require(schema);
    O.find((err, o) => {
        temp = o;
    });
};

var update = (object, schema) => {
    var O = require(schema);
    var o = new O(object);
    o.save();
};

var delete2 = (id, schema) => {
    var O = require(schema);
    O.remove(O.find({_id: id})).exec();
};

var pob = () =>
{
    return temp;
};