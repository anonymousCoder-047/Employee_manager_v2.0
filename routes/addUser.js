
const express = require('express')
const app = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const usrSchema = require('../model/schema/Userschema')
const Usr = mongoose.model('signup', usrSchema, 'signup')

app.get('/', (req, res) => {
    if( !req.session.user ) {
        message = true,
        msg = 'Please Login'
        res.render('signup', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    } else {
        Usr.findOne({ _id: req.session.empId }, (err, usr) => {
            if( usr.is_Admin === 'true' ) {
                message = true,
                msg = 'Add New User'
                res.render('newuser', { 'message': message, 'msg': msg, 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false })
            } else {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
            }
        })
    }
}) 

app.post('/', (req, res) => {
    let newUser;
    let hash = bcrypt.hashSync(req.body.usr_password, 10)
    if( req.body.usr_role === 'admin' ) {
        newUser = new Usr({
            usr_name: req.body.usr_name,
            usr_email: req.body.usr_email,
            usr_passwd: hash,
            is_Admin:'true'
        })
    } else if( req.body.usr_role === 'manager' ) {
        newUser = new Usr({
            usr_name: req.body.usr_name,
            usr_email: req.body.usr_email,
            usr_passwd: hash,
            is_Manager:'true'
        })
    }

    Usr.findOne({ usr_name:req.body.usr_name, usr_email:req.body.usr_email }, (err, usr) => {
        if(usr) {
            Usr.findOne({ _id: req.session.empId }, (err, usr) => {
                if( usr.is_Admin === 'true' ) {
                    message = true,
                    msg = 'User Already Exsist!'
                    res.render('newuser', { 'message': message, 'msg': msg, 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false })
                } else {
                    res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
                }
            })
        } else {
            newUser.save((err, usr) => {
                Usr.findOneAndUpdate({ _id:usr._id }, {
                    $set: {
                        "total_leaves": 0,
                        "salary": 0,
                        "bonus": 0,
                        "last_payment": 0,
                        "attendance": 0,
                        "phone": 0
                    }
                }, (err, usr) => {
                    req.session.empId = usr._id
                    req.session.user = usr.usr_name
                    Usr.findOne({ _id: req.session.empId }, (err, usr) => {
                        if( usr.is_Admin === 'true' ) {
                            res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false })
                        } else if( usr.is_Manager === 'true' ) {
                            res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
                        } else {
                            res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
                        }
                    })
                })
            })
        }
    })
})

module.exports = app;
