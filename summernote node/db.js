const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'summernote',
  password: 'root',  
  port: 5432
});

module.exports = pool;
