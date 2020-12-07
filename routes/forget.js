
const express = require('express')
const app = express.Router()
const mongoose = require('mongoose')
const sendmail = require('sendmail')()
let client_otp = require('../public/assets/js/otp')

const usrSchema = require('../model/schema/Userschema')
const Usr = mongoose.model('signup', usrSchema, 'signup')

app.get('/', (req, res) => {
    if(!req.session.user) {  
        let message = true
        let msg = "Enter your Email"
        res.render('forget', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
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
    Usr.findOne({ usr_email: req.body.user_mail }, (err, usr) => {
        if(usr) {
            let message = true
            let msg = 'OTP Sent Successfully'
            sendmail({
                from: 'info@anfalhypermarket.com',
                to: req.body.user_mail,
                subject: 'OTP to reset password',
                html: `your OTP for reset password is ${client_otp}. Please Do not Share your OTP with anyone, even to our Executive`,
              }, function(err, reply) {
                console.log(err && err.stack);
                console.dir(reply);
            });
            res.render('otp', { 'message': message, 'msg': msg, 'id':usr._id, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
        } if(!usr) {
            res.render('forget', { 'message': true, 'msg': 'No Such Email Found', 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
        }
    })
}) 

module.exports = app