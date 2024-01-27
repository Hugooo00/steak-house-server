const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  // console.log(con.connection);
  console.log('Database connection successfully');
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`The APP is running on port ${port}`);
});
