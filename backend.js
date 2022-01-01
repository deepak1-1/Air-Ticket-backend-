const express = require('express');
const port = 4000;
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = new require('connect-mongo')(session); // npm install connect-mongo@3.1.2
const cors = require("cors");
const indexRouter = require('./routes/index.js');
const adminRouter = require('./routes/admin.js');
const cookieParser = require('cookie-parser');
const auth = require('./auth/authentication');

const app = express();

const db = mongoose.connection;

// app.use(session({
//     secret: "sdjfhkdfjdkjfsdfsd3874bfsdfsdfj",
//     resave: false,
//     saveUninitialized: true,
//     store: new MongoStore({
//         mongooseConnection: db
//     })
// }))


// connection to database
const dbURI = 'mongodb://localhost:27017/Air_ticket'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result)=>{

        //listen over requests
        app.listen(port, () => {
			console.log("Express App listening at Port: "+port);
		})
    })
    .catch(err => {console.log(err)});



// middle-ware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors());

// public
app.use(express.static('public'));

app.use('', indexRouter);

app.use('/admin',  adminRouter);

// app.get('/admin-login-try', (req, res)=>{
//     console.log(req.body)
// })