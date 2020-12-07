
const express = require('express')
const app = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const usrSchema = require('../model/schema/Userschema')
const Usr = mongoose.model('signup', usrSchema, 'signup')

app.get('/', (req, res) => {
    if(!req.session.user) {  
        let message = true
        let msg = "Enter your Password"
        res.render('reset', { 'message': message, 'msg': msg, 'id':'garbage-id', 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    } else {
        Usr.findOne({ _id: req.session.empId }, (err, usr) => {
            if( usr.is_Admin === true ) {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false })
            } else if( usr.is_Manager === true ) {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
            } else {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
            }
        })
    }
})

app.post('/', (req, res) => {
    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(req.body.user_confirm_password, salt);
    Usr.findOneAndUpdate({ _id: req.body.db_id }, {
        $set: {
            usr_passwd:hash
        } 
    }, (err, usr) => {
        if( usr.is_Admin === 'true' ) {
            req.session.empId = usr._id
            req.session.user = usr.usr_name
            res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': usr.is_Manager })
        } else if( usr.is_Manager === 'true' ) {
            req.session.empId = usr._id
            req.session.user = usr.usr_name
            res.render('home', { 'is_Loggedin': true, 'is_Admin': usr.is_Admin, 'is_Manager': true })
        } else {
            req.session.empId = usr._id
            req.session.user = usr.usr_name
            res.render('home', { 'is_Loggedin': true, 'is_Admin': usr.is_Admin, 'is_Manager': usr.is_Manager })
        }
    })
}) 

module.exports = app