
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

        let userData = {
            'total_leaves': 0,
            'salary': 0,
            'bonus': 0,
            'last_payment': 0,
            'attendance': 0,
            'phone': 9874563210,
            'email': 'asd@asd.com'
        }

        // Total PF Employees...
        Emp.find({ emp_pay_method:/^pf$/i }, (err, doc) => {
          adminData.pf = doc.length;      
        })

        // Total CASH Employees...
        Emp.find({ emp_pay_method:/^cash$/i }, (err, doc) => {
            adminData.non_pf = doc.length;      
        })

        // Total Male Employees...
        Emp.find({ emp_gender:/^male$/i }, (err, doc) => {
            adminData.male_employees = doc.length;      
        })

        // Total Female Employees...
        Emp.find({ emp_gender:/^female$/i }, (err, doc) => {
              adminData.female_employees = doc.length;      
        })

        // Count total Employees...
        Usr.countDocuments((err, count) => {
            adminData.total_users = count
            Emp.countDocuments((err, count) => {
                adminData.total_employees = count
                Emp.findOne({ emp_id:req.session.emp_id }, (err, emp) => {
                    Usr.findOne({ _id:req.session.empId }, (err, doc) => {
                        if(doc.is_Admin === 'false' && doc.is_Manager === 'true') {
                            userData.total_leaves = doc.total_leaves ? doc.total_leaves : 0
                            userData.salary = emp.emp_salary ? emp.emp_salary : 0
                            userData.bonus = emp.emp_incentive ? emp.emp_incentive : 0
                            userData.last_payment = emp.emp_gr_total ? emp.emp_gr_total : 0
                            userData.attendance = doc.attendance ? doc.attendance : 0 
                            userData.phone = emp.emp_phone ? emp.emp_phone : '9001257890'
                            userData.email = emp.emp_email ? emp.emp_email : 'saviour@codendebug.co'
                            
                            res.render('dashboard', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true, 'usr': userData, 'user_name': doc.usr_name })
                        } else if(doc.is_Admin === 'false' && doc.is_Manager === 'false') {
                            userData.total_leaves = doc.total_leaves ? doc.total_leaves : 0
                            userData.salary = emp.emp_salary ? emp.emp_salary : 0
                            userData.bonus = emp.emp_incentive ? emp.emp_incentive : 0
                            userData.last_payment = emp.emp_gr_total ? emp.emp_gr_total : 0
                            userData.attendance = doc.attendance ? doc.attendance : 0
                            userData.phone = emp.emp_phone ? emp.emp_phone : '9001257890'
                            userData.email = emp.emp_email ? emp.emp_email : 'saviour@codendebug.co'
                            
                            res.render('dashboard', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false, 'usr': userData, 'user_name': doc.usr_name })
                        } else {
                            Emp.find((err, doc) => {
                                let data = []
                                doc.forEach( emp => {
                                    data.push(emp)
                                })
                                res.render('dashboard', { 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false, 'admin': adminData, 'user_name':req.session.user, 'emp':data })
                            })
                        }
                    })
                })
            })
        })
    }
})

module.exports = app