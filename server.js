const dotenv = require('dotenv');
const mongoose = require('mongoose');
const mysql = require('mysql')

dotenv.config({ path: './config.env' });


process.env.NODE_ENV = process.env.NODE_ENV.toUpperCase();


// mongoose
// .connect(process.env.MONGODB_URI, {
// 	useNewUrlParser: true,
// 	useCreateIndex: true,
// 	useFindAndModify: true,
// 	useUnifiedTopology: true,
// })
// .then(() => {
// 	console.log('MongoDb Connection has been established successfully.');
// });


globalThis.mysqlConnection = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD
})
mysqlConnection.connect((err) => {
	if(err) console.log('MySQL not connected', err)
	else console.log(`MySQL Connection has been established successfully.`)
})


const app = require('./app');

//Server Startup
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`App is runnning in ${process.env.NODE_ENV} environment on port ${port}`);
});


process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message, err.stack);
  console.log('UNHANDLED REJECTION! Shutting down ...!!');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message, err.stack);
  console.log('UNCAUGHT REJECTION! Shutting down ...!!');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal recieved, shutting down gracefully');
  server.close(() => {
    console.log('Processs terminated !!!');
  });
});

//It is throwing sync/uncaught exception which is handled above middleware.
//console.log(x);
