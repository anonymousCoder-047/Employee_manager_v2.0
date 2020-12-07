
const express = require('express')
const app = express.Router()
const mongoose = require('mongoose')

const empSchema = require('../model/schema/Empschema')
const usrSchema = require('../model/schema/Userschema')

const Usr = mongoose.model('signup', usrSchema, 'signup')
const Emp = mongoose.model('employees', empSchema)

app.get('/', (req, res) => {
    if( !req.session.user ) {
        message = true,
        msg = 'Please Login'
        res.render('login', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    } else {
        Usr.findOne({ _id: req.session.empId }, (err, usr) => {
            if( usr.is_Admin === 'true' ) {
                Emp.find({ emp_pay_method:/^cash$/i }, (err, emp) => {
                    res.render('cash_report', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false, 'emp':emp })
                })
            } else {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
            }
        })
    }
})

module.exports = app