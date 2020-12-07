
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
        res.render('login', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    } else {
        Usr.findOne({ _id: req.session.empId }, (err, usr) => {
            if( usr.is_Admin === 'true' ) {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false })
            } else if( usr.is_Manager === 'true' ) {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
            } else {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
            }
        })
    }
}) 

app.post('/', (req, res) => {
    Usr.findOne({ usr_email: req.body.user_email }, (err, usr) => {
        if(usr) {
            let result = bcrypt.compareSync(req.body.user_password, usr.usr_passwd)
            if(!result) res.render('login', { 'message': true, 'msg': 'Wrong Password', 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
            else if( usr.is_Admin === 'true' ) {
                req.session.empId = usr._id
                req.session.user = usr.usr_name
                req.session.emp_id = usr.emp_id
                res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false })
            } else if( usr.is_Manager === 'true' ) {
                req.session.empId = usr._id
                req.session.user = usr.usr_name
                req.session.emp_id = usr.emp_id
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
            } else {
                req.session.empId = usr._id
                req.session.user = usr.usr_name
                req.session.emp_id = usr.emp_id
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
            }
        }
        if(!usr) {
            res.render('signup', { 'message': true, 'msg': 'Please Register First', 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
        }
    })
})

module.exports = app;
