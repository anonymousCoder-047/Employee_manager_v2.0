
const express = require('express')
const app = express.Router()
const mongoose = require('mongoose')
const sendmail = require('sendmail')()
const accountSid = 'AC9cd5e19bd9f99982d49a75fa5128e161'; 
const authToken = '88318e29eecaa1fe234c28bd61aff161'; 
const client = require('twilio')(accountSid, authToken); 

const usrSchema = require('../model/schema/Userschema')
const empSchema = require('../model/schema/Empschema')
const attendanceSchema = require('../model/schema/AttendanceSchema')
const transactionSchema = require('../model/schema/TransactionSchema')

const Usr = mongoose.model('signup', usrSchema, 'signup')
const Emp = mongoose.model('employees', empSchema, 'employees')
const Attendance = mongoose.model('attendance', attendanceSchema, 'attendance')
const Transaction = mongoose.model('transaction', transactionSchema)

app.get('/', (req, res) => {
    if( !req.session.user ) {
        message = true,
        msg = 'Please Login'
        res.render('login', { 'message': message, 'msg': msg, 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    } else {
        Emp.find({ emp_gender:/^male$/i }, (err, male) => {
            Emp.find({ emp_gender:/^female$/i }, (err, female) => {
                Usr.findOne({ _id: req.session.empId }, (err, usr) => {
                    if( usr.is_Admin === 'true' ) {
                        res.render('attendance', { 'message':true, 'msg':"Add Attendance", 'is_Loggedin': true, 'is_Admin': true, 'is_Manager': false, 'male':male, 'female':female })
                    } else if( usr.is_Manager === 'true' ) {
                        res.render('attendance', { 'message':true, 'msg':"Add Attendance", 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': true, 'male':male, 'female':female })
                    } else {
                        res.render('home', { 'is_Loggedin': true, 'is_Admin': false, 'is_Manager': false })
                    }
                })
            })
        })
    }
})

app.get('/get_attendance', (req, res) => {
    Attendance.find((err, attendance) => {
        res.send(attendance)
    })
}) 

app.post('/', (req, res) => {
    let attendance;
    let transaction;
    let emp_gr_salary;
    mongoose.model('attendance', attendanceSchema).countDocuments((err, c) => {
        if(c > 0) {
            Emp.findOne({ emp_id:req.body.emp_id }, (err, empData) => {
                Attendance.findOne({ emp_id:req.body.emp_id }, (err, attend) => {
                    if(!attend) {
                        Emp.findOne({ emp_id:req.body.emp_id }, (err, empData) => {
                            if(parseInt(req.body.present) >= 0 ) {
                                attendance = new Attendance({
                                    emp_id:req.body.emp_id,
                                    emp_name:req.body.emp_name,
                                    year:new Date().getFullYear(),
                                    month:req.body.month,
                                    day:req.body.day,
                                    date:new Date().getDate(),
                                    fn_time:req.body.fn_time,
                                    an_time:req.body.an_time,
                                    total_leaves:req.body.present,
                                    total_present:(30 - req.body.present) 
                                })
                                transaction = new Transaction({
                                    transaction_id:'AHM_'+Math.floor(Math.random(1000)*1000),
                                    emp_id:req.body.emp_id,
                                    emp_name:req.body.emp_name,
                                    year:new Date().getFullYear(),
                                    month:new Date().getMonth(),
                                    day:new Date().getDay(),
                                    date:new Date().getDate(),
                                    time:new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds(),
                                    total_leaves:req.body.present,
                                    total_present:(30 - req.body.present),
                                    status:'success' 
                                })
                                transaction.save((err, trans) => {
                                    client.messages.create({ 
                                        body: `Your Attendance for ${trans.date}-${trans.month}-${trans.year} is ${30 - req.body.present} days. Credited Salary is ${empData.emp_gr_total}`, 
                                        from: `whatsapp:+14155238886`,       
                                        to: `whatsapp:+91${empData.emp_phone}` 
                                    }) 
                                    .then(message => console.log('Successfull')) 
                                    .done();
                                    sendmail({
                                        from: 'info@anfalhypermarket.com',
                                        to: empData.emp_email,
                                        subject: `Hurray! your Salary has been Credited to your Account on ${trans.date}-${trans.month}-${trans.year} at ${trans.time}`,
                                        html: `<table align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0;margin-left:auto;margin-right:auto;margin-top:20px;text-align:left;width:320px" width="320">
                                        <tbody>
                                        <tr>
                                            <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="320">
                                            <table bgcolor="#ebebeb" border="0" cellpadding="0" cellspacing="0" style="background:#ebebeb;border-collapse:collapse;border-spacing:0;border:0;width:320px" width="320">
                                                <tbody>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="6" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;color:#363636;font-size:11px;line-height:16px;padding:0;text-align:center"><span class="il"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="6" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0">
                                                <tbody>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;overflow:hidden;padding:0;width:320px" valign="top" width="320">
                                                    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0">
                                                        <tbody>
                                                        <tr>
                                                            <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" height="3" src="https://ci4.googleusercontent.com/proxy/GWhj4SAs8YYRjSx_tVCK5C1hQlz7AcfsWvz-vEp9BBGru1TseeO2M-f8YHByG_CuGsmtFVUYkmdNLErjWP7EaukcMeOcs4aCNSCPu-bAJVAdo4fbxFMgw-JmW7LnR-vPg5vZbCx9BN6eYotiEG98Vupk6wmFBQDGrw4hQcBqI28E9m32Lt26J_Nf7ZnMImGG8Y_qWb3ht915yGZI_qIVqMPGRAJZpfpC679iiko_kyHPpKAWaVOwALwRlRL5V99rPsF-N82gt_nGkyU3J3Dq3Gc4OXZzndPqqjpTtBcN5rD8XdXPau8An4rTEjyKq5RaK3hVu_kFebOs9w19Y5FAsy2hWvJbFn9herYRCXSawwdvcUJRACeHHQZWhtkiUr0TG5Jp5ED7xEZO9h-2upypLIwYAYC5cCFrBQr7X4n-NeqUunceld-B72SukpTXC9hhXlmY7QpIUpM4Aw=s0-d-e1-ft#https://d2isyty7gbnm74.cloudfront.net/yiUkp5VW7HW2dH1o8gYhPAiGBOU=/fit-in/640x6/filters:fill(43505e):watermark(https://d3g64w74of3jgu.cloudfront.net/assets/receipt-top-edge-mask-e6bbaf30c69e83509da5153571bd94ca.png,0,0,0):quality(100)/https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="border:0;display:block" width="320" class="CToWUd"></td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td align="center" bgcolor="#43505e" style="background:#43505e;border-collapse:collapse;font-size:0;line-height:0;padding:0;width:320px" valign="middle" width="320">
                                                            <table cellpadding="0" cellspacing="0" height="100%" style="border-collapse:collapse;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td colspan="1" height="35" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="border-collapse:collapse;color:white;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:30px;padding:0 36px;width:100%"
                                                                    width="100%">
                                                                    <div align="center" style="min-height:80px;margin-bottom:5px;text-align:center;vertical-align:middle;width:80px"><p>${empData.emp_name}</p></div><span style="color:white;font-size:20px;line-height:26px;margin:0"><span class="il">PAYMENT RECIEPT</span>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="1" height="21" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" height="8" style="border-collapse:collapse;font-size:0;height:8px;line-height:0;padding:0" valign="bottom">
                                                                    <div style="border-bottom-color:#546476;border-bottom-style:solid;border-left-color:transparent;border-left-style:solid;border-right-color:transparent;border-right-style:solid;border-width:0 8px 8px;min-height:0;vertical-align:bottom;width:0"></div>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="white" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                                <tbody>
                                                <tr>
                                                    <td colspan="1" height="24" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:0;font-weight:normal;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:30px;padding:0">
                                                    <div align="center" style="color:#363636;font-family:SQMarket-Medium,HelveticaNeue-Medium,Helvetica-Bold,Helvetica,Arial,sans-serif;font-size:64px;font-weight:500;line-height:72px;text-align:center;white-space:nowrap"><span style="font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:26px;line-height:1;vertical-align:super;"></span><i class="fa fa-inr"></i> ${empData.emp_gr_total}</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="28" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:0;font-weight:normal;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="white" border="0" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                                <tbody>
                                                <tr>
                                                    <td bgcolor="#ffffff" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                    style="font-size:0;line-height:0" width="20" class="CToWUd"></td>
                                                    <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0">
                                                    <table bgcolor="white" border="0" cellpadding="0" cellspacing="0" style="background:white;border-collapse:separate;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="10" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" valign="top" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Salary</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" valign="top" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${empData.emp_salary}</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Bonus</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${empData.emp_incentive}</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Attendance</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${ (30 - (empData.emp_absent ? empData.emp_absent : 0)) }</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Total</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${empData.emp_gr_total}</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="22" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    </td>
                                                    <td bgcolor="#ffffff" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                    style="font-size:0;line-height:0" width="20" class="CToWUd"></td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="white" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                                <tbody>
                                                
                                                    <td colspan="1" height="15" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="15" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0" width="320">
                                                <tbody>
                                                <tr>
                                                    <td bgcolor="#e0e0e0" colspan="2" height="1" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            
                                            <table bgcolor="#ebebeb" cellpadding="0" cellspacing="0" style="background-color:#ebebeb!important;border-collapse:collapse;border-spacing:0;border:0">
                                                <tbody>
                                                <tr>
                                                    <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="Receipt bottom edge" height="3" src="https://ci3.googleusercontent.com/proxy/6woRqkcsgzv5OzSLz6G0xZX62BVYy6PPY4a9OSCzC5paiLDpNhRusANuRaX56gBUWXE5LXYIDBgslede_UM-7LB292LWY_wjFRS6ZdvcjKZP1sB_XaE7aQwrUwU861mmhk-81bYvQEmI2kWuSiRu9wm8WHLIHDBh74sL=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/receipt-bottom-edge-03756aff54ee465372ab1db0a5916aa6.png"
                                                    style="border:0;display:block" width="320" class="CToWUd"></td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="#ebebeb" cellpadding="0" cellspacing="0" style="background:#ebebeb;border-collapse:collapse;border-spacing:0;border:0;width:320px" width="320">
                                                <tbody>
                                                <tr>
                                                    <td colspan="1" height="30" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top">
                                                    <div style="color:#a0a0a0;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:11px;font-weight:normal;line-height:16px;margin:0;padding:0"><a href="mailto:info@anfalhypermarket.com">Have a question?</a></div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="10" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top">               
                                                    <div style="color:#a0a0a0;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:11px;font-weight:normal;line-height:16px;margin:0;padding:0"><a href="http://anfalhypermarket.com"
                                                        style="color:#a0a0a0;text-decoration:underline!important" target="_blank">End</a></div>
                                                    </td>
                                                </tr>       
                                                </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>`,
                                    smtpPort: 587,
                                    smtpHost: 'smtp.hostinger.in',
                                      }, function(err, reply) {
                                        console.log('successfull');
                                    });
                                    attendance.save((err, doc) => {
                                        if(empData.emp_pay_method.toLowerCase() === 'cash') {
                                            emp_gr_salary = cal_emp_cash_salary(req.body.present, empData.emp_pay_method, empData.emp_salary);
                                        } else {
                                            emp_gr_salary = cal_emp_pf_salary(req.body.present, empData.emp_pay_method, empData.emp_salary, empData.emp_pf_amt, empData.emp_esi_amt);
                                        }
                                        Emp.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                                            $set: {
                                                "emp_gr_total":emp_gr_salary,
                                                "emp_absent": req.body.present
                                            }
                                        },(err, emp) => {
                                            Usr.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                                                $set: {
                                                    'salary': emp.emp_salary,
                                                    'bonus': (emp.emp_salary)/30*2,
                                                    'last_payment': emp_gr_salary,
                                                    'email': emp.emp_email,
                                                    'total_leaves': req.body.present,
                                                    'attendance': (30 - req.body.present)
                                                }
                                            }, (err, usr) => {
                                                res.status(200)
                                            })
                                        })
                                    })
                                })
                            } else {
                                res.send('sorry you have exceeded the value!')
                            }
                        })
                    } else {
                        Attendance.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                            $set: {
                                "emp_id":req.body.emp_id,
                                "year":req.body.year,
                                "month":req.body.month,
                                "day":req.body.day,
                                "date":req.body.date,
                                "fn_time":req.body.fn_time,
                                "an_time":req.body.an_time,
                                "total_leaves":req.body.present,
                                "total_present":(30-req.body.present)
                            }
                        },(err, doc) => {
                            Emp.findOne({ emp_id:req.body.emp_id }, (err, emp_Data) => {
                                Transaction.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                                    $set: {
                                        transaction_id:'AHM_'+Math.floor(Math.random(1000)*1000),
                                        emp_id:req.body.emp_id,
                                        emp_name:req.body.emp_name,
                                        year:new Date().getFullYear(),
                                        month:new Date().getMonth(),
                                        day:req.body.day,
                                        date:new Date().getDate(),
                                        time:new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds(),
                                        total_leaves:req.body.present,
                                        total_present:(30 - req.body.present),
                                        status:'success' 
                                    }
                                }, (err, trans) => {
                                    client.messages.create({ 
                                        body: `Your Attendance for ${trans.date}-${trans.month}-${trans.year} is ${30 - req.body.present} days. Credited Salary is ${emp_Data.emp_gr_total}`, 
                                        from: `whatsapp:+14155238886`,       
                                        to: `whatsapp:+91${emp_Data.emp_phone}` 
                                    }) 
                                    .then(message => console.log('Successfull')) 
                                    .done();

                                    // Acknowledgment email to client and admin... 
                                    sendmail({
                                        from: 'info@anfalhypermarket.com',
                                        to: emp_Data.emp_email,
                                        subject: `Hurray! your Salary has been Credited to your Account on ${trans.date}-${trans.month}-${trans.year} at ${trans.time}`,
                                        html: `<table align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0;margin-left:auto;margin-right:auto;margin-top:20px;text-align:left;width:320px" width="320">
                                        <tbody>
                                        <tr>
                                            <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="320">
                                            <table bgcolor="#ebebeb" border="0" cellpadding="0" cellspacing="0" style="background:#ebebeb;border-collapse:collapse;border-spacing:0;border:0;width:320px" width="320">
                                                <tbody>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="6" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;color:#363636;font-size:11px;line-height:16px;padding:0;text-align:center"><span class="il"></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="6" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0">
                                                <tbody>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;overflow:hidden;padding:0;width:320px" valign="top" width="320">
                                                    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0">
                                                        <tbody>
                                                        <tr>
                                                            <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" height="3" src="https://ci4.googleusercontent.com/proxy/GWhj4SAs8YYRjSx_tVCK5C1hQlz7AcfsWvz-vEp9BBGru1TseeO2M-f8YHByG_CuGsmtFVUYkmdNLErjWP7EaukcMeOcs4aCNSCPu-bAJVAdo4fbxFMgw-JmW7LnR-vPg5vZbCx9BN6eYotiEG98Vupk6wmFBQDGrw4hQcBqI28E9m32Lt26J_Nf7ZnMImGG8Y_qWb3ht915yGZI_qIVqMPGRAJZpfpC679iiko_kyHPpKAWaVOwALwRlRL5V99rPsF-N82gt_nGkyU3J3Dq3Gc4OXZzndPqqjpTtBcN5rD8XdXPau8An4rTEjyKq5RaK3hVu_kFebOs9w19Y5FAsy2hWvJbFn9herYRCXSawwdvcUJRACeHHQZWhtkiUr0TG5Jp5ED7xEZO9h-2upypLIwYAYC5cCFrBQr7X4n-NeqUunceld-B72SukpTXC9hhXlmY7QpIUpM4Aw=s0-d-e1-ft#https://d2isyty7gbnm74.cloudfront.net/yiUkp5VW7HW2dH1o8gYhPAiGBOU=/fit-in/640x6/filters:fill(43505e):watermark(https://d3g64w74of3jgu.cloudfront.net/assets/receipt-top-edge-mask-e6bbaf30c69e83509da5153571bd94ca.png,0,0,0):quality(100)/https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="border:0;display:block" width="320" class="CToWUd"></td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td align="center" bgcolor="#43505e" style="background:#43505e;border-collapse:collapse;font-size:0;line-height:0;padding:0;width:320px" valign="middle" width="320">
                                                            <table cellpadding="0" cellspacing="0" height="100%" style="border-collapse:collapse;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td colspan="1" height="35" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="border-collapse:collapse;color:white;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:30px;padding:0 36px;width:100%"
                                                                    width="100%">
                                                                    <div align="center" style="min-height:80px;margin-bottom:5px;text-align:center;vertical-align:middle;width:80px"><p>${emp_Data.emp_name}</p></div><span style="color:white;font-size:20px;line-height:26px;margin:0"><span class="il">PAYMENT RECIEPT</span>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="1" height="21" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" height="8" style="border-collapse:collapse;font-size:0;height:8px;line-height:0;padding:0" valign="bottom">
                                                                    <div style="border-bottom-color:#546476;border-bottom-style:solid;border-left-color:transparent;border-left-style:solid;border-right-color:transparent;border-right-style:solid;border-width:0 8px 8px;min-height:0;vertical-align:bottom;width:0"></div>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="white" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                                <tbody>
                                                <tr>
                                                    <td colspan="1" height="24" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:0;font-weight:normal;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:30px;padding:0">
                                                    <div align="center" style="color:#363636;font-family:SQMarket-Medium,HelveticaNeue-Medium,Helvetica-Bold,Helvetica,Arial,sans-serif;font-size:64px;font-weight:500;line-height:72px;text-align:center;white-space:nowrap"><span style="font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:26px;line-height:1;vertical-align:super;"></span><i class="fa fa-inr"></i> ${emp_Data.emp_gr_total}</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="28" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:0;font-weight:normal;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="white" border="0" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                                <tbody>
                                                <tr>
                                                    <td bgcolor="#ffffff" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                    style="font-size:0;line-height:0" width="20" class="CToWUd"></td>
                                                    <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0">
                                                    <table bgcolor="white" border="0" cellpadding="0" cellspacing="0" style="background:white;border-collapse:separate;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                                        <tbody>
                                                        <tr>
                                                            <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="10" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" valign="top" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Salary</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" valign="top" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${emp_Data.emp_salary}</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Bonus</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${emp_Data.emp_incentive}</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Attendance</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${ (30 - (emp_Data.emp_absent ? emp_Data.emp_absent : 0)) }</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                            style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Total</div>
                                                            </td>
                                                            <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                            <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${emp_Data.emp_gr_total}</div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" height="22" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    </td>
                                                    <td bgcolor="#ffffff" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                    style="font-size:0;line-height:0" width="20" class="CToWUd"></td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="white" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                                <tbody>
                                                
                                                    <td colspan="1" height="15" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="15" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0" width="320">
                                                <tbody>
                                                <tr>
                                                    <td bgcolor="#e0e0e0" colspan="2" height="1" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"> </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            
                                            <table bgcolor="#ebebeb" cellpadding="0" cellspacing="0" style="background-color:#ebebeb!important;border-collapse:collapse;border-spacing:0;border:0">
                                                <tbody>
                                                <tr>
                                                    <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="Receipt bottom edge" height="3" src="https://ci3.googleusercontent.com/proxy/6woRqkcsgzv5OzSLz6G0xZX62BVYy6PPY4a9OSCzC5paiLDpNhRusANuRaX56gBUWXE5LXYIDBgslede_UM-7LB292LWY_wjFRS6ZdvcjKZP1sB_XaE7aQwrUwU861mmhk-81bYvQEmI2kWuSiRu9wm8WHLIHDBh74sL=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/receipt-bottom-edge-03756aff54ee465372ab1db0a5916aa6.png"
                                                    style="border:0;display:block" width="320" class="CToWUd"></td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <table bgcolor="#ebebeb" cellpadding="0" cellspacing="0" style="background:#ebebeb;border-collapse:collapse;border-spacing:0;border:0;width:320px" width="320">
                                                <tbody>
                                                <tr>
                                                    <td colspan="1" height="30" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top">
                                                    <div style="color:#a0a0a0;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:11px;font-weight:normal;line-height:16px;margin:0;padding:0"><a href="mailto:info@anfalhypermarket.com">Have a question?</a></div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="1" height="10" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top">               
                                                    <div style="color:#a0a0a0;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:11px;font-weight:normal;line-height:16px;margin:0;padding:0"><a href="http://anfalhypermarket.com"
                                                        style="color:#a0a0a0;text-decoration:underline!important" target="_blank">End</a></div>
                                                    </td>
                                                </tr>       
                                                </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>`,
                                      }, function(err, reply) {
                                        console.log('successfull');
                                    });
                                })

                                if(emp_Data.emp_pay_method.toLowerCase() === 'cash') {
                                    emp_gr_salary = cal_emp_cash_salary(req.body.present, emp_Data.emp_pay_method, emp_Data.emp_salary);
                                } else {
                                    emp_gr_salary = cal_emp_pf_salary(req.body.present, emp_Data.emp_pay_method, emp_Data.emp_salary, emp_Data.emp_pf_amt, emp_Data.emp_esi_amt);
                                }
                                Emp.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                                    $set: {
                                        "emp_gr_total":emp_gr_salary,
                                        "emp_absent": req.body.present
                                    }
                                }, (err, emp) => {
                                    Usr.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                                        $set: {
                                            'salary': emp.emp_salary,
                                            'bonus': (emp.emp_salary)/30*2,
                                            'phone': emp.emp_phone,
                                            'last_payment': emp_gr_salary,
                                            'email': emp.emp_email,
                                            'total_leaves': req.body.present,
                                            'attendance': (30 - req.body.present)
                                        }
                                    }, (err, usr) => {
                                        res.send(doc)
                                    })
                                })
                            })
                        })
                    }
                })
            })
        } else {
            Emp.findOne({ emp_id:req.body.emp_id }, (err, empData) => {
                if(parseInt(req.body.present) >= 0 ) {
                    attendance = new Attendance({
                        emp_id:req.body.emp_id,
                        emp_name:req.body.emp_name,
                        year:new Date().getFullYear(),
                        month:req.body.month,
                        day:req.body.day,
                        date:new Date().getDate(),
                        fn_time:req.body.fn_time,
                        an_time:req.body.an_time,
                        total_leaves:req.body.present,
                        total_present:(30 - req.body.present) 
                    })
                    transaction = new Transaction({
                        transaction_id:'AHM_'+Math.floor(Math.random(1000)*1000),
                        emp_id:req.body.emp_id,
                        emp_name:req.body.emp_name,
                        year:new Date().getFullYear(),
                        month:new Date().getMonth(),
                        day:req.body.day,
                        date:new Date().getDate(),
                        time:new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds(),
                        total_leaves:req.body.present,
                        total_present:(30 - req.body.present),
                        status:'success' 
                    })
                    transaction.save((err, trans) => {
                        client.messages.create({ 
                            body: `Your Attendance for ${trans.date}-${trans.month}-${trans.year} is ${30 - req.body.present} days. Credited Salary is ${empData.emp_gr_total}`, 
                            from: `whatsapp:+14155238886`,       
                            to: `whatsapp:+91${empData.emp_phone}` 
                        }) 
                        .then(message => console.log('Successfull')) 
                        .done();
                        sendmail({
                            from: 'info@anfalhypermarket.com',
                            to: empData.emp_email,
                            subject: `Hurray! your Salary has been Credited to your Account on ${trans.date}-${trans.month}-${trans.year} at ${trans.time}`,
                            html: `<table align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0;margin-left:auto;margin-right:auto;margin-top:20px;text-align:left;width:320px" width="320">
                            <tbody>
                            <tr>
                                <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="320">
                                <table bgcolor="#ebebeb" border="0" cellpadding="0" cellspacing="0" style="background:#ebebeb;border-collapse:collapse;border-spacing:0;border:0;width:320px" width="320">
                                    <tbody>
                                    <tr>
                                        <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top"></td>
                                    </tr>
                                    <tr>
                                        <td colspan="1" height="6" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="border-collapse:collapse;color:#363636;font-size:11px;line-height:16px;padding:0;text-align:center"><span class="il"></td>
                                    </tr>
                                    <tr>
                                        <td colspan="1" height="6" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0">
                                    <tbody>
                                    <tr>
                                        <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;overflow:hidden;padding:0;width:320px" valign="top" width="320">
                                        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0">
                                            <tbody>
                                            <tr>
                                                <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" height="3" src="https://ci4.googleusercontent.com/proxy/GWhj4SAs8YYRjSx_tVCK5C1hQlz7AcfsWvz-vEp9BBGru1TseeO2M-f8YHByG_CuGsmtFVUYkmdNLErjWP7EaukcMeOcs4aCNSCPu-bAJVAdo4fbxFMgw-JmW7LnR-vPg5vZbCx9BN6eYotiEG98Vupk6wmFBQDGrw4hQcBqI28E9m32Lt26J_Nf7ZnMImGG8Y_qWb3ht915yGZI_qIVqMPGRAJZpfpC679iiko_kyHPpKAWaVOwALwRlRL5V99rPsF-N82gt_nGkyU3J3Dq3Gc4OXZzndPqqjpTtBcN5rD8XdXPau8An4rTEjyKq5RaK3hVu_kFebOs9w19Y5FAsy2hWvJbFn9herYRCXSawwdvcUJRACeHHQZWhtkiUr0TG5Jp5ED7xEZO9h-2upypLIwYAYC5cCFrBQr7X4n-NeqUunceld-B72SukpTXC9hhXlmY7QpIUpM4Aw=s0-d-e1-ft#https://d2isyty7gbnm74.cloudfront.net/yiUkp5VW7HW2dH1o8gYhPAiGBOU=/fit-in/640x6/filters:fill(43505e):watermark(https://d3g64w74of3jgu.cloudfront.net/assets/receipt-top-edge-mask-e6bbaf30c69e83509da5153571bd94ca.png,0,0,0):quality(100)/https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                style="border:0;display:block" width="320" class="CToWUd"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                            <tbody>
                                            <tr>
                                                <td align="center" bgcolor="#43505e" style="background:#43505e;border-collapse:collapse;font-size:0;line-height:0;padding:0;width:320px" valign="middle" width="320">
                                                <table cellpadding="0" cellspacing="0" height="100%" style="border-collapse:collapse;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td colspan="1" height="35" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="center" style="border-collapse:collapse;color:white;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:30px;padding:0 36px;width:100%"
                                                        width="100%">
                                                        <div align="center" style="min-height:80px;margin-bottom:5px;text-align:center;vertical-align:middle;width:80px"><p>${empData.emp_name}</p></div><span style="color:white;font-size:20px;line-height:26px;margin:0"><span class="il">PAYMENT RECIEPT</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="1" height="21" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="center" height="8" style="border-collapse:collapse;font-size:0;height:8px;line-height:0;padding:0" valign="bottom">
                                                        <div style="border-bottom-color:#546476;border-bottom-style:solid;border-left-color:transparent;border-left-style:solid;border-right-color:transparent;border-right-style:solid;border-width:0 8px 8px;min-height:0;vertical-align:bottom;width:0"></div>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table bgcolor="white" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                    <tbody>
                                    <tr>
                                        <td colspan="1" height="24" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:0;font-weight:normal;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:30px;padding:0">
                                        <div align="center" style="color:#363636;font-family:SQMarket-Medium,HelveticaNeue-Medium,Helvetica-Bold,Helvetica,Arial,sans-serif;font-size:64px;font-weight:500;line-height:72px;text-align:center;white-space:nowrap"><span style="font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:26px;line-height:1;vertical-align:super;"></span><i class="fa fa-inr"></i> ${empData.emp_gr_total}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="1" height="28" style="border-collapse:collapse;color:#363636;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:0;font-weight:normal;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table bgcolor="white" border="0" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;width:100%" width="100%">
                                    <tbody>
                                    <tr>
                                        <td bgcolor="#ffffff" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                        style="font-size:0;line-height:0" width="20" class="CToWUd"></td>
                                        <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0">
                                        <table bgcolor="white" border="0" cellpadding="0" cellspacing="0" style="background:white;border-collapse:separate;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                            <tbody>
                                            <tr>
                                                <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top"></td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="1" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="10" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" valign="top" width="207">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Salary</div>
                                                </td>
                                                <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" valign="top" width="88">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${empData.emp_salary}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Bonus</div>
                                                </td>
                                                <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${empData.emp_incentive}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Attendance</div>
                                                </td>
                                                <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${ (30 - (empData.emp_absent ? empData.emp_absent : 0)) }</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="1" style="border-collapse:collapse;border-top-color:#e0e1e2;border-top-style:dashed;border-top-width:1px;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                                style="font-size:0;line-height:0" width="1" class="CToWUd"></td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="11" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                            </tr>
                                            <tr>
                                                <td align="left" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:207px" width="207">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0;width:207px">Total</div>
                                                </td>
                                                <td align="right" style="border-collapse:collapse;font-size:0;line-height:0;padding:0;width:88px" width="88">
                                                <div style="color:#363636;font-family:SQMarket-Regular,HelveticaNeue,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:normal;line-height:24px;margin:0;padding:0"><span><i class="fa fa-inr"></i></span> ${empData.emp_gr_total}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" height="22" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        </td>
                                        <td bgcolor="#ffffff" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="" border="0" height="1" src="https://ci4.googleusercontent.com/proxy/QoQHcFtSHZQ36-hElJaHREN5X2kwMc2IZoVtPkLYU6uqsP4YJ_8RNnIhex6jeOIE_1LEfctTenZ7JngQltAsIdSN-PGXE-PIp-g3Jfqf3KW4aA4wwLzeuj662n7NZymqcXWNGMgTX3PnDWh395E=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/spacer-239465b1c71b79ae1c276e8ef6c73207.png"
                                        style="font-size:0;line-height:0" width="20" class="CToWUd"></td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table bgcolor="white" cellpadding="0" cellspacing="0" style="background:white;border-collapse:collapse;border-spacing:0;border:0;table-layout:fixed;width:100%;word-wrap:break-word" width="100%">
                                    <tbody>
                                    
                                        <td colspan="1" height="15" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    <tr>
                                    </tr>
                                    <tr>
                                        <td colspan="1" height="15" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0;border:0" width="320">
                                    <tbody>
                                    <tr>
                                        <td bgcolor="#e0e0e0" colspan="2" height="1" style="border-collapse:collapse;font-size:0;line-height:0;padding:0"> </td>
                                    </tr>
                                    </tbody>
                                </table>
                                
                                <table bgcolor="#ebebeb" cellpadding="0" cellspacing="0" style="background-color:#ebebeb!important;border-collapse:collapse;border-spacing:0;border:0">
                                    <tbody>
                                    <tr>
                                        <td style="border-collapse:collapse;font-size:0;line-height:0;padding:0"><img alt="Receipt bottom edge" height="3" src="https://ci3.googleusercontent.com/proxy/6woRqkcsgzv5OzSLz6G0xZX62BVYy6PPY4a9OSCzC5paiLDpNhRusANuRaX56gBUWXE5LXYIDBgslede_UM-7LB292LWY_wjFRS6ZdvcjKZP1sB_XaE7aQwrUwU861mmhk-81bYvQEmI2kWuSiRu9wm8WHLIHDBh74sL=s0-d-e1-ft#https://d3g64w74of3jgu.cloudfront.net/assets/receipt-bottom-edge-03756aff54ee465372ab1db0a5916aa6.png"
                                        style="border:0;display:block" width="320" class="CToWUd"></td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table bgcolor="#ebebeb" cellpadding="0" cellspacing="0" style="background:#ebebeb;border-collapse:collapse;border-spacing:0;border:0;width:320px" width="320">
                                    <tbody>
                                    <tr>
                                        <td colspan="1" height="30" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top">
                                        <div style="color:#a0a0a0;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:11px;font-weight:normal;line-height:16px;margin:0;padding:0"><a href="mailto:info@anfalhypermarket.com">Have a question?</a></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="1" height="10" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" width="100%"> </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="border-collapse:collapse;font-size:0;line-height:0;padding:0" valign="top">               
                                        <div style="color:#a0a0a0;font-family:SQMarket-Regular,HelveticaNeue,Helvetica,Arial,sans-serif;font-size:11px;font-weight:normal;line-height:16px;margin:0;padding:0"><a href="http://anfalhypermarket.com"
                                            style="color:#a0a0a0;text-decoration:underline!important" target="_blank">End</a></div>
                                        </td>
                                    </tr>       
                                    </tbody>
                                </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>`,
                          }, function(err, reply) {
                            console.log('successfull');
                        });
                        attendance.save((err, doc) => {
                            if(empData.emp_pay_method.toLowerCase() === 'cash') {
                                emp_gr_salary = cal_emp_cash_salary(req.body.present, empData.emp_pay_method, empData.emp_salary);
                            } else {
                                emp_gr_salary = cal_emp_pf_salary(req.body.present, empData.emp_pay_method, empData.emp_salary, empData.emp_pf_amt, empData.emp_esi_amt);
                            }
                            Emp.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                                $set: {
                                    "emp_gr_total":emp_gr_salary,
                                    "emp_absent": req.body.present
                                }
                            },(err, emp) => {
                                Usr.findOneAndUpdate({ emp_id:req.body.emp_id }, {
                                    $set: {
                                        'salary': emp.emp_salary,
                                        'bonus': (emp.emp_salary)/30*2,
                                        'last_payment': emp_gr_salary,
                                        'email': emp.emp_email,
                                        'total_leaves': req.body.present,
                                        'attendance': (30 - req.body.present)
                                    }
                                }, (err, usr) => {
                                    res.send(doc)
                                })
                            })
                        })
                    })
                } else {
                    res.send('sorry you have exceeded the value!')
                }
            })
        }
    })
})

function cal_emp_cash_salary(absent, pay_method, salary) {
    let emp_absent = 30 - absent;
    let ttl_days = 30;
    let bonus_days = ttl_days+2;
    let emp_cash_salary;
    let c_l_salary;
    let c_salary;
    
    if( pay_method.toUpperCase() ==='CASH' && absent === '1' ) {
        c_salary = Math.round((salary/ttl_days)*ttl_days+(salary/ttl_days))
        emp_cash_salary = c_salary

        return emp_cash_salary
    } else if( pay_method.toUpperCase() ==='CASH' && absent === '2' ) {
        c_salary = Math.round((salary/ttl_days)*ttl_days)
        emp_cash_salary = c_salary

        return emp_cash_salary
    } else if ( pay_method.toUpperCase() ==='CASH' && absent > '15' ) {
        c_l_salary = Math.round(((salary/ttl_days)*emp_absent))
        emp_cash_salary = c_l_salary

        return emp_cash_salary
    } else if( pay_method.toUpperCase() ==='CASH' && absent <= '15' ) {
        c_salary = Math.round((((salary/ttl_days)*bonus_days/ttl_days)*emp_absent))
        emp_cash_salary = c_salary

        return emp_cash_salary
    } 
}

function cal_emp_pf_salary(absent, pay_method, salary, pf, esic) {
    let emp_absent = 30 - absent;
    let ttl_days = 30;
    let bonus_days = ttl_days+2;
    let emp_pf_salary;
    let pf_l_salary;
    let pf_salary;
    
    if( pay_method.toUpperCase() ==='PF' && absent === '1' ) {
        pf_salary = Math.round(((salary/ttl_days)*ttl_days)-(pf+esic)+(salary/ttl_days))
        emp_pf_salary = pf_salary

        return emp_pf_salary
    } else if( pay_method.toUpperCase() ==='PF' && absent === '2' ) {
        pf_salary = Math.round(((salary/ttl_days)*ttl_days)-(pf+esic))
        emp_pf_salary = pf_salary

        return emp_pf_salary
    } else if ( pay_method.toUpperCase() ==='PF' && absent > '15' ) {
        pf_l_salary = Math.round(((salary/ttl_days)*emp_absent)-(pf+esic))
        emp_pf_salary = pf_l_salary

        return emp_pf_salary
    } else if( pay_method.toUpperCase() ==='PF' && absent <= '15' ) {
        pf_salary = Math.round(((((salary/ttl_days)*bonus_days)/ttl_days)*emp_absent)-(pf+esic))
        emp_pf_salary = pf_salary

        return emp_pf_salary
    } 
}

module.exports = app