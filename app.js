const express = require('express');

const morgan = require('morgan');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const helmet = require('helmet');

// routers
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/user');

const mysqlSnippet = require('./helpers/mysqlWrapper');
const { MongoDBStore } = require('connect-mongodb-session');
globalThis.mysqlConnect = new mysqlSnippet(mysqlConnection);


const app = express();

app.enable('trust proxy');


//Serving static files
app.use(express.static(__dirname + '/public'));

// Session
const store = new MongoDBStore({
	uri: process.env.MONGODB_URI,
	collection: 'mySessions'
})

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: store
}))

// 1) Global Middlewares

//Allowing cross origin requrests by using cors
app.use(cors());

app.options('*', cors());

//Set Security Http Headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'DEVELOPMENT') {
	console.log('Logging enabled');
  app.use(morgan('dev'));
}

//Limit requests from same IP.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour.',
});

app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


//Data sanitization against XSS.
app.use(xss());


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/', indexRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', usersRouter);


//ssl verification
const fileName = "";
app.get('/.well-known/pki-validation/'+fileName, (req, res) => {
	res.sendFile(__dirname + "/views/"+fileName);
})


app.all('*', (req, res, next) => {
  res.sendStatus(404);
});


module.exports = app;
