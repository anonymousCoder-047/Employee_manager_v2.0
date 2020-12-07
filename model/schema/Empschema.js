
const mongoose = require('mongoose')

module.exports = new mongoose.Schema({
    emp_id: String,
    emp_acct: Number,
    emp_name: String,
    emp_phone: Number,
    emp_email: String,
    emp_gender: String,
    emp_dob: String,
    emp_join_date: String,
    emp_blood_group: String,
    emp_address: String,
    emp_counter: String,
    emp_job_role: String,
    emp_salary: Number,
    emp_pay_method: String,
    emp_incentive: String,
    emp_gr_amt: Number,
    emp_tax_amt: Number,
    emp_absent: Number,
    emp_gr_value: Number,
    emp_advance: Number,
    emp_gr_total: Number,
    emp_pf_amt: Number,
    emp_pf_rate: Number,
    emp_after_pf: Number,
    emp_esi_amt: Number,
    emp_esic_rate: Number,
    emp_total: Number,
    emp_pay_status: {
        type: String,
        default: "pending",
    }
});

