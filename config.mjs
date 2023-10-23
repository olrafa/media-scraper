import dotenv from "dotenv";
import pkg from "pg";
const { Client } = pkg;

dotenv.config();

export const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_CA?.toString(),
  },
});
client.connect(function (err) {
  if (err) throw err;
  client.query("SELECT VERSION()", [], function (err, result) {
    if (err) throw err;

    console.log(result.rows[0].version);
  });
});
