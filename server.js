const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const SECRET_KEY = "supersecretkey"; 

app.use(cors());
app.use(bodyParser.json());

let investors = [];

app.post("/register", (req, res) => {
  const { email, privateKey } = req.body;
  if (investors.find(user => user.email === email)) {
    return res.status(400).json({ message: "Этот email уже зарегистрирован" });
  }

  const newUser = { email, privateKey, balance: 1000, tvl: 5000, yield: 7.5, pools: ["SOL/USDC", "ETH/USDC"] };
  investors.push(newUser);

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ token, user: newUser });
});

app.post("/login", (req, res) => {
  const { email, privateKey } = req.body;
  const user = investors.find(user => user.email === email && user.privateKey === privateKey);

  if (!user) {
    return res.status(401).json({ message: "Неверные данные" });
  }

  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "24h" });
  res.json({ token, user });
});

app.listen(10000, () => {
  console.log("Сервер запущен на порту 10000");
});
