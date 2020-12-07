
const express = require('express')
const app = express.Router()

app.get('/', (req, res) => {
    if(req.session.user) {  
        req.session.destroy((err) => {
            message = true,
            msg = 'Login Again'
            res.render('login', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
        })
    } else {
        message = true,
        msg = 'Login Again'
        res.render('login', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    }
}) 

module.exports = app