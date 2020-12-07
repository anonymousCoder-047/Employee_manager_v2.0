const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser') 
const logger = require('morgan')
const app = express()

const usrSchema = require('./model/schema/Userschema')
const empSchema = require('./model/schema/Empschema')
const Usr = mongoose.model('signup', usrSchema, 'signup')
const Emp = mongoose.model('employees', empSchema)

const login = require('./routes/login')
const signup = require('./routes/signup')
const forget = require('./routes/forget')
const reset = require('./routes/reset')
const otp = require('./routes/otp')
const dashboard = require('./routes/dashboard')
const logout = require('./routes/logout')
const employee_add = require('./routes/newemployee')
const modify_employee = require('./routes/modifyemployee')
const add_user = require('./routes/addUser')
const employees = require('./routes/employees')
const pf_report = require('./routes/pfReport')
const cash_report = require('./routes/cashReport')
const attendance = require('./routes/attendance')
const settings = require('./routes/settings')

mongoose.connect('mongodb://localhost/EMP', 
{
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useCreateIndex: true,
    useFindAndModify: false 
}).then(() => { console.log('connected to MongoDB') })

app.use(logger('dev'))
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

app.use(session({ 
    secret: 'AHM-secret',
    name: 'sid',
    resave: false,
    saveUninitialized: true, 
    store: new MongoStore({ mongooseConnection: mongoose.connection, collection: 'session' }) 
}))

app.use('/login', login)
app.use('/signup', signup)
app.use('/forget', forget)
app.use('/reset', reset)
app.use('/otp', otp)
app.use('/dashboard', dashboard)
app.use('/logout', logout)
app.use('/newEMP', employee_add)
app.use('/modifyEMP', modify_employee)
app.use('/register', add_user)
app.use('/employees', employees)
app.use('/pf_report', pf_report)
app.use('/cash_report', cash_report)
app.use('/attendance', attendance)
app.use('/settings', settings)

app.get('/', (req,res) => {
    if(req.session.user) {
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

        Usr.countDocuments((err, count) => {
            adminData.total_users = count
            Emp.countDocuments((err, count) => {
                adminData.total_employees = count
                Usr.findOne({ _id:req.session.empId }, (err, doc) => {
                    if(doc.is_Admin === 'false') {
                        userData.total_leaves = doc.attendance ? doc.attendance : 0
                        userData.salary = doc.salary
                        userData.bonus = doc.bonus
                        userData.last_payment = doc.last_payment ? doc.last_payment : 0
                        userData.attendance = doc.total_leaves ? (30 - doc.total_leaves) : 0
                        
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
    } else {
        res.render('home', { 'is_Loggedin': false, 'is_Admin': false, 'is_Manager': false })
    }
})

const port = process.env.port || 8080

app.listen( port, () => {
    console.log(`listening on port ${port}`)
})