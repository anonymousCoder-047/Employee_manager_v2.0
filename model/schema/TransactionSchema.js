
const mongoose = require('mongoose')
module.exports = new mongoose.Schema({
    transaction_id: String,
    emp_id: String,
    emp_name: String,
    year: String,
    month: String,
    day: String,
    date: String,
    time: String,
    total_leaves: String,
    total_present: String,
    amount: String,
    status: String
});

