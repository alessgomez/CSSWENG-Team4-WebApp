require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
// const flash = require('connect-flash')
const MongoStore = require('connect-mongo')
const exphbs = require("express-handlebars")
const cors = require('cors')

app.set("view engine", "hbs")
app.engine("hbs", exphbs.engine({extname: "hbs"}))
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

app.use(cors({
    origin: '*',
    methods: '*'
}));

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(session({
    secret: 'swsiportalssecret',
    store: MongoStore.create({mongoUrl: process.env.DATABASE_URL}),
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, maxAge: 1000*60*60*24*21}
}))

/*app.use(flash());

app.use((req, res, next) => {
    res.locals.error_msg= req.flash('error_msg');
    next();
});*/

app.use(express.json())

//client applications
const applicationRouter = require('./routes/applications')
app.use('/applications', applicationRouter)

//admin dashboard
const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter)

/*
Handlebars.registerHelper('switch', function(value, options) {
    this.switch_value = value;
    this.switch_break = false;
    return options.fn(this);
    });

    Handlebars.registerHelper('case', function(value, options) {
    if (value == this.switch_value) {
        this.switch_break = true;
        return options.fn(this);
    }
    });
*/
    
app.listen(3000, () => console.log('Server Started'))