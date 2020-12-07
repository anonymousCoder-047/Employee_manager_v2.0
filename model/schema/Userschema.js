
const mongoose = require('mongoose')
module.exports = new mongoose.Schema({
    emp_id: String,
    usr_name: String,
    usr_email: String,
    usr_passwd: String,
    is_Admin: {
        type: String,
        default: false
    },
    is_Manager: {
        type: String,
        default: false
    },
    total_leaves: Number,
    salary: Number,
    bonus: Number,
    last_payment: Number,
    attendance: Number,
    phone: Number
});

