const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Listen and handle Uncaught Exception
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('💥 Uncaught Exception!');
  process.exit(1);
});

dotenv.config({ path: './.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  // console.log(con.connection);
  console.log('Database connection successfully');
});

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`The APP is running on port ${port}`);
});

// Listen and handle unhandledRejection event
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('💥 Unhandle Rejection! ');
  server.close(() => {
    process.exit(1);
  });
});
