
const express = require('express')
const app = express.Router()
const mongoose = require('mongoose')

const usrSchema = require('../model/schema/Userschema')
const empSchema = require('../model/schema/Empschema')

const Usr = mongoose.model('signup', usrSchema, 'signup')
const Emp = mongoose.model('employees', empSchema)

app.get('/', (req, res) => {
    if( !req.session.user ) {
        message = true,
        msg = 'Please Login'
        res.render('login', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    } else {
        let adminData = {
            'total_employees': 0,
            'total_users': 0,
            'pf': 0,
            'non_pf': 0,
            'male_employees': 0,
            'female_employees': 0
        }

        // Total PF Employees...
        Emp.find({ emp_pay_method:/^pf$/i }, (err, doc) => {
          adminData.pf = doc.length;      
        })

        // Total CASH Employees...
        Emp.find({ emp_pay_method:/^cash$/i }, (err, doc) => {
            adminData.non_pf = doc.length;      
        })

        // Count total Employees...
        Usr.countDocuments((err, count) => {
            adminData.total_users = count
            Emp.countDocuments((err, count) => {
                adminData.total_employees = count
                Emp.find((err, doc) => {
                    let data = []
                    doc.forEach( emp => {
                        data.push(emp)
                    }) 
                    Usr.find((err, usrData) => {
                        let usr = []
                        usrData.forEach( u => { usr.push(u) } )
                        res.render('settings', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false, 'admin': adminData, 'user_name':req.session.user, 'emp':data, 'usr':usr })
                    })
                })
            })
        })
    }
})

module.exports = app