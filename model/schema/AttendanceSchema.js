
const mongoose = require('mongoose')
module.exports = new mongoose.Schema({
    emp_id: String,
    emp_name: String,
    year: String,
    month: String,
    day: String,
    date: String,
    fn_time: String,
    an_time: String,
    total_leaves: String,
    total_present: String
});

