
const express = require('express')
const app = express.Router()
const mongoose = require('mongoose')
const usrSchema = require('../model/schema/Userschema')
const Usr = mongoose.model('signup', usrSchema, 'signup')
let client_otp = require('../public/assets/js/otp')

app.get('/', (req, res) => {
    if(!req.session.user) {  
        let message = true
        let msg = "Enter your OTP"
        res.render('otp', { 'message': message, 'msg': msg, 'id':'garbage-id', 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
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
    if( client_otp === req.body.clientOtp ) {
        Usr.findOne({ _id: req.body.db_id }, (err, usr) => {
            res.render('reset', { 'message': true, 'msg': 'Enter your password', 'id':usr._id, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
        })
    } else {
        res.render('otp', { 'message': true, 'msg': 'Wrong OTP', 'id':req.body.db_id, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    }
}) 

module.exports = app