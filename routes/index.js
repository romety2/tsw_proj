/* jshint node: true, esnext: true */

var temp;
/* nowe zawody */
var zwNZak;
var zaw;
var fkLS;
var fkGr;

require('../models/startingList');

exports.index = (req, res) => {
    res.render('index', { user : req.user, login: req.isAuthenticated() });    
};

exports.kontakt = (req, res) =>  {
    res.render('pages/kontakt', { user : req.user, login: req.isAuthenticated() });    
};

exports.zgloszenie = (req, res) =>  {
    res.render('pages/zgloszenie', { user : req.user, login: req.isAuthenticated() });    
};

exports.pobierzZg = (req, res) =>  {
    res.download(__dirname + '/../public/file/zgloszenie.pdf');
};

exports.regulamin = (req, res) =>  {
    openPDF("/../public/file/regulamin.pdf", res);
};

exports.logowanie = (req, res) =>  {
    res.render('pages/logowanie', { user : req.user, login: req.isAuthenticated() });
};

exports.zaloguj = (req, res) =>  {
    res.redirect('/');
};

exports.wyloguj = (req, res) =>  {
    req.logout();
    res.redirect('/');
};

exports.zawody = (req, res) =>  {
    readZwNZak('../models/competition.js');
    readAllZaw('../models/player.js');
    res.render('pages/zawody', { user : req.user, login: req.isAuthenticated() });   
};

exports.grupy = (req, res) =>  {
    readZwNZak('../models/competition.js');
    readAllZaw('../models/player.js');
    res.render('pages/grupy', { user : req.user, login: req.isAuthenticated() }); 
};

exports.zawodnicy = (req, res) =>  {
    readAll('../models/player.js');
    res.render('pages/zawodnicy', { user : req.user, login: req.isAuthenticated() });   
};

exports.uzytkownicy = (req, res) =>  {
    readAll('../models/user.js');
    res.render('pages/uzytkownicy', { user : req.user, login: req.isAuthenticated() });   
};

exports.dodajZaw = (req, res) => {
    create(req.body, '../models/player.js');
    res.redirect('/zawodnicy');
};

exports.dodajUz = (req, res) => {
    createUser(req.body, '../models/user.js', '/uzytkownicy', req, res);
};

exports.dodajLS = (req, res) => {
    create(req.body, '../models/startingList.js');
    addLS('../models/startingList.js', '../models/competition.js');
};

exports.dodajGr = (req, res) => {
    create(req.body, '../models/group.js');
    addGr('../models/group.js', '../models/competition.js');
};


exports.pobierzW = (req, res) =>  {
    res.json(pob());
};

exports.pobierzZwNDDZaw = (req, res) =>  {
    res.json(pobZwNDDZaw());
};

exports.pobierzWZaw = (req, res) =>  {
    res.json(pobZaw());
};

exports.pobierzZaw = (req, res) =>  {
    res.json(read(req.params.id)||readZaw(req.params.id));
};

exports.pobierzUz = (req, res) =>  {
    res.json(read(req.params.id));
};

exports.pobierzLSZwNZak = (req, res) => {
    res.json(pobLSZwNZak());
};

exports.pobierzGrupyZwNZak = (req, res) => {
    res.json(pobGrZwNZak());
};

exports.pobierzZwNZak = (req, res) =>  {
    res.json(pobZwNZak());
};

exports.pobierzGrZwNZak= (req, res) =>  {
    res.json(pobGrZwNZak());
};

exports.edytujZw =(req, res) => {
    updateColumn(req.body.dana, req.params.pole, '../models/competition.js');
};

exports.edytujZaw = (req, res) =>  {
    update(req.params.id, req.body, '../models/player.js');
    res.redirect('/zawodnicy');
};

exports.edytujUz = (req, res) =>  {
    update(req.params.id, req.body, '../models/user.js');
    res.redirect('/uzytkownicy');
};

exports.usunZaw = (req, res) =>  {
    delete2(req.params.id, '../models/player.js');
    res.redirect('/zawodnicy');
};

exports.usunUz = (req, res) =>  {
    delete2(req.params.id, '../models/user.js');
    res.redirect('/uzytkownicy');
};

exports.usunLS = (req, res) =>  {
    delete2(req.params.id, '../models/startingList.js');
    deleteLS('../models/startingList.js', req.params.id);
};

exports.zmienZawGrupa = (req, res) =>  {
    updateStatusZwNZak('dzielenie', '../models/competition.js');
    res.redirect('/grupy');
};

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

var readZaw = (id) => {
    var underscore = require('underscore');
    return underscore.find(zaw, (z) => { return z._id.toString() === id; });
};

var readAll = (schema) => {
    var O = require(schema);
    O.find((err, o) => {
        temp = o;
    });
};

var readAllZaw = (schema) => {
    var O = require(schema);
    O.find((err, o) => {
        zaw = o;
    });
};

var getFKZwNZak = (schema, pLS, pGr) => {
    var O = require(schema);
    if(zwNZak.etap === 'tworzenie')
    {
        O.findOne({etap: 'tworzenie'}).populate(pLS).exec((err, o) => {
            fkLS = o.ls;
        });
        O.findOne({etap: 'tworzenie'}).populate(pGr).exec((err, o) => {
            fkGr = o.grupy;
        });
    }
    else if(zwNZak.etap === 'dzielenie')
    {
        O.findOne({etap: 'dzielenie'}).populate(pLS).exec((err, o) => {
            fkLS = o.ls;
        });
        O.findOne({etap: 'dzielenie'}).populate(pGr).exec((err, o) => {
            fkGr = o.grupy;
        });
    }
};

var update = (id, object, schema) => {
    var O = require(schema);
    O.update({_id: id}, {$set: object}, () => {});    
};

var delete2 = (id, schema) => {
    var O = require(schema);
    O.remove(O.find({_id: id})).exec();
};

var addLS = (schema, schema2) => {
    var O = require(schema);
    var O2 = require(schema2);
    O.find((err, o) => {
        zwNZak.ls.push(o[o.length-1]);
        O2.update({_id: zwNZak._id}, {$set: {ls: zwNZak.ls}}, () => {});    
    });
};

var addGr = (schema, schema2) => {
    var O = require(schema);
    var O2 = require(schema2);
    O.find((err, o) => {
        console.log(zwNZak);
        zwNZak.grupy.push(o[o.length-1]);
        O2.update({_id: zwNZak._id}, {$set: {grupy: zwNZak.grupy}}, () => {});    
    });
};

var deleteLS = (schema, id) => {
    var O = require(schema);
    O.remove(O.find({_zaw: id})).exec();
};

var readZwNZak = (schema) => {
    var O = require(schema);
    O.find((err, o) => {
        var underscore = require('underscore');
        zwNZak = underscore.find(o, () => { return o.etap !== 'zakonczone'; }) || '';
        if(zwNZak === '')
        {
            create({wydarzenie: '', opis: '', zakres: '10', rodzaj: 'c', etap: 'tworzenie'}, '../models/competition.js');
            zwNZak = {wydarzenie: '', opis: '', zakres: '10', rodzaj: 'c', etap: 'tworzenie', ls: []};
            fkLS = [];
        }
        else
        {
            getFKZwNZak('../models/competition.js' ,'ls', 'grupy');
        }
    });
};

var createUser = (object, schema, redirect, req, res) => {
    var User = require(schema);
    User.register(new User({imie : object.imie, nazwisko: object.nazwisko, username: object.username, role: object.role}), object.password, (err, user) => {
        if (err)
            return res.render('pages/uzytkownicy', { user : user });
    res.redirect(redirect);
    });
};

var updateColumn = (value, poleID, schema) => {
    var O = require(schema);
    if(poleID==="wydarzenieZ")
        O.update({_id: zwNZak._id}, {$set: {wydarzenie: value}}, () => {});  
    else if(poleID==="opisZ")
        O.update({_id: zwNZak._id}, {$set: {opis: value}}, () => {});  
    else if(poleID==="radio1Z")
        O.update({_id: zwNZak._id}, {$set: {zakres: value}}, () => {});  
    else if(poleID==="radio2Z")
        O.update({_id: zwNZak._id}, {$set: {zakres: value}}, () => {});  
    else if(poleID==="radio1R")
        O.update({_id: zwNZak._id}, {$set: {rodzaj: value}}, () => {});  
    else if(poleID==="radio2R")
        O.update({_id: zwNZak._id}, {$set: {rodzaj: value}}, () => {});
};

var updateStatusZwNZak = (etap, schema) => {
    var O = require(schema);
    O.update({_id: zwNZak._id}, {$set: {etap: etap}}, () => {});    
};

var pob = () => {
    var underscore = require("underscore");
    return underscore.sortBy(temp, temp.nazwa || temp.username);
};

var pobZaw = () => {
    var underscore = require("underscore");
    return underscore.sortBy(zaw, zaw.nazwa);
};

var pobZwNZak = () => {
    return zwNZak;
};

var pobLSZwNZak = () => {
    var underscore = require("underscore");
    if(typeof fkLS !== 'undefined')
        return underscore.sortBy(fkLS, fkLS.nrStartowy);
    else
        return {} ;
};

var pobGrZwNZak = () => {
    var underscore = require("underscore");
    if(typeof fkGr !== 'undefined')
        return underscore.sortBy(fkGr, fkGr.nazwa);
    else
        return {} ;
};

var pobZwNDDZaw = () => {
    var underscore = require("underscore");
    var pm;
    if(typeof fkLS !== 'undefined')
        {   
            pm = underscore.keys(underscore.indexBy(fkLS, "_zaw"));
            return underscore.sortBy(underscore.filter(zaw, (z) => { return pm.indexOf(z._id.toString()) === -1; }), zaw.nazwa);
        }
    else
        return underscore.sortBy(zaw, zaw.nazwa); 
};