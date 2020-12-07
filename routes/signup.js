
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
                res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': usr.is_Manager })
            } else if( usr.is_Manager === 'true' ) {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
            } else {
                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
            }
        })
    }
}) 

app.post('/', (req, res) => {
    let hash = bcrypt.hashSync(req.body.user_password, 10)
    let newUser = new Usr({
        usr_name: req.body.user_name,
        usr_email: req.body.user_email,
        usr_passwd: hash
    })

    mongoose.model('signup', usrSchema).countDocuments({}, (err,c) => {
        if(c > 0) {
            Usr.findOne({ usr_email:req.body.user_email }, (err, u_data) => {
                message = true
                msg = "User Already Exist"
                if(u_data) res.render('login', { 'messgae': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
                else {
                    isLoggedin = true
                    newUser.save((err, usr) => {
                        if( usr.is_Admin === 'true' ) {
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
                                req.session.emp_id = usr.emp_id 
                                res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': usr.is_Manager })
                            })
                        } else if( usr.is_Manager === 'true' ) {
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
                                req.session.emp_id = usr.emp_id
                                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
                            })
                        } else {
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
                                req.session.emp_id = usr.emp_id
                                res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
                            })
                        }  
                    })
                }
            })
        } else {
            newUser.save((err, usr) => {
                if( usr.is_Admin === 'true' ) {
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
                        req.session.emp_id = usr.emp_id
                        res.render('home', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': usr.is_Manager })
                    })
                } else if( usr.is_Manager === 'true' ) {
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
                        req.session.emp_id = usr.emp_id
                        res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
                    })
                } else {
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
                        req.session.emp_id = usr.emp_id
                        res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true })
                    })
                }
            })
        }
    })
})

module.exports = app;
