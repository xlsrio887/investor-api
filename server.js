const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
const PORT = 10000;
const SECRET_KEY = "supersecretkey";

app.use(cors());
app.use(bodyParser.json());

let investors = [
  {
    email: "test@example.com",
    username: "Investor123",
    privateKey: "random_private_key",
    balance: 1000,
    tvl: 5000,
    yield: 7.5,
    pools: [
      {
        name: "SOL/USDC",
        hash: "0x123abc456def",
        amount: 2500
      }
    ]
  }
];

// **🔹 Регистрация**
app.post("/register", (req, res) => {
  const { email, privateKey, username } = req.body;

  if (investors.find(user => user.email === email)) {
    return res.status(400).json({ message: "Этот email уже зарегистрирован" });
  }

  const newUser = {
    email,
    username,
    privateKey,
    balance: 1000,
    tvl: 5000,
    yield: 7.5,
    pools: [
      {
        name: "SOL/USDC",
        hash: "0x123abc456def",
        amount: 2500
      }
    ]
  };

  investors.push(newUser);

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ token, user: newUser });
});

// **🔹 Логин**
app.post("/login", (req, res) => {
  const { email, privateKey } = req.body;
  const user = investors.find(user => user.email === email && user.privateKey === privateKey);

  if (!user) {
    return res.status(401).json({ message: "Неверные данные" });
  }

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ token, user });
});

// **🔹 Получение данных пользователя + реальный курс SOL**
app.get("/me", async (req, res) => {
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

    // Получаем курс SOL из Coingecko
    let solPrice = 0;
    try {
      const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      solPrice = response.data.solana.usd;
    } catch (error) {
      console.error("Ошибка получения курса SOL:", error);
    }

    res.json({ ...user, solPrice });
  } catch (err) {
    res.status(401).json({ message: "Токен недействителен" });
  }
});

// **🔹 Запуск сервера**
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
