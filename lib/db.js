const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = {
  query: async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows;
  },
  get: async (text, params) => {
    const rows = await module.exports.query(text, params);
    return rows[0] || null;
  }
};
