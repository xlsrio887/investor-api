const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 10000;
const SECRET_KEY = "supersecretkey";

app.use(cors());
app.use(bodyParser.json());

let investors = []; // Тут временно храним инвесторов (можно заменить на базу данных)

// ======================== 1. Регистрация ========================
app.post("/register", (req, res) => {
  const { email, privateKey } = req.body;
  if (investors.find(user => user.email === email)) {
    return res.status(400).json({ message: "Этот email уже зарегистрирован" });
  }

  const newUser = { 
    email, 
    privateKey, 
    balance: 1000, 
    tvl: 5000, 
    yield: 7.5, 
    pools: ["SOL/USDC", "ETH/USDC"] 
  };
  investors.push(newUser);

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ token, user: newUser });
});

// ======================== 2. Вход ========================
app.post("/login", (req, res) => {
  const { email, privateKey } = req.body;
  const user = investors.find(user => user.email === email && user.privateKey === privateKey);

  if (!user) {
    return res.status(401).json({ message: "Неверные данные" });
  }

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ token, user });
});

// ======================== 3. Получение данных пользователя ========================
app.get("/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Не авторизован" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = investors.find(user => user.email === decoded.email);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Токен недействителен" });
  }
});

// ======================== 4. Запуск сервера ========================
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
