if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')

//Login stuff
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')

//Initialize Express application
const app = express()

//Configure session middleware, enabling session management in this application
app.use(session({
  secret: 'examSystem-secret-key',
  resave: false,
  saveUninitialized: false
}));

//Initialize Passport and session middleware
app.use(passport.initialize())
app.use(passport.session())

//Import User model
const User = require('./models/user')

//Configure passport-local to use the email field as the username field
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if (err) return done(err)
    if (!user) return done(null, false, { message: 'Incorrect email or password.' })
    if (!user.verifyPassword(password)) return done(null, false, { message: 'Incorrect email or password.' })
    return done(null, user)
  });
}));

//Serialize and deserialize user instances to and from the session, for managing user authentication
//This will serialize the user, as in convert into a format that can be stored in the session
passport.serializeUser((user, done) => {
  done(null, user.id)
});
//This will deserialize the user, as in convert back into a user object
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  });
});

//Login stuff ends here

//const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const createRouter = require('./routes/createExams')
const examRouter = require('./routes/exams')
const subjectRouter = require('./routes/subjects')
const questionRouter = require('./routes/questions')
const loginRouter = require('./routes/login')


app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')  
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })) //changed extended from false to true, since apparently it can mess up arrays.

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true , useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/createExams', createRouter)
app.use('/exams', examRouter)
app.use('/subjects', subjectRouter)
app.use('/questions', questionRouter)

app.use('/', loginRouter)


app.listen(process.env.PORT || 3000)