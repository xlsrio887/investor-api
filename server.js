const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log('✅ Подключено к базе данных'))
    .catch(err => console.error('Ошибка подключения к БД', err));

app.get('/', (req, res) => res.send('API работает 🚀'));

app.listen(port, () => {
    console.log(`✅ Сервер запущен на порту ${port}`);
});
