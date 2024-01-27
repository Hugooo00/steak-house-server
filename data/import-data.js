const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Menu = require('../model/menuModel');

// 1: connect databas
dotenv.config({ path: './.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

// 2: Read JSON file
const menu = JSON.parse(fs.readFileSync(`${__dirname}/menu.json`, 'utf-8'));

// 3.1: Import the data into the database
const importData = async () => {
  try {
    await Menu.create(menu);
    console.log('Data sucessfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// 3.2: Delete all data from database
const deleteData = async () => {
  try {
    await Menu.deleteMany();
    console.log('Data sucessfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// 4: using terminal to import or delete file
//  import data : node data/import-data.js --import
//  delete data : node data/import-data.js --delete
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
